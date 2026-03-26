import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { backendUrl } from "../../utils/constants";
import useHttp from "../../services/UseHttp";
import LoadingSpinner from "../../components/LoadingScreen";
import AlertBox from "../../components/AlertBox";
import { eachDayOfInterval, format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCheckCircle, faCalendarDay, faBriefcase, faTrash, faHandPointer, faChurch, faCommentDots } from "@fortawesome/free-solid-svg-icons";
import { Task, SpecialEvent, User, Obstacle, ObstacleStatus, obstacleStatusTranslation, TaskSection } from "../../models/Interfaces";

function SpecialEventObstacleForm() {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();

    // --- STANY BAZOWE ---
    const [event, setEvent] = useState<SpecialEvent | null>(null);
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [sections, setSections] = useState<TaskSection[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [myObstacles, setMyObstacles] = useState<Obstacle[]>([]);

    // --- SEKCJA 1: PORY DNIA I OFICJA OGÓLNE ---
    const [selectedMatrix, setSelectedMatrix] = useState<Record<string, number[]>>({}); // data -> ID sekcji
    const [isSpecificTask, setIsSpecificTask] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);

    // --- SEKCJA 2: TACE I KOMUNIE ---
    const [selectedCollectionMatrix, setSelectedCollectionMatrix] = useState<Record<string, number[]>>({}); // data -> ID taska

    // --- SEKCJA 3: OPIS ---
    const [description, setDescription] = useState<string>("");
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // --- HOOKI HTTP ---
    const { request: requestEvent, loading: loadingEvent, error: errorEvent } = useHttp();
    const { request: requestTasks, loading: loadingTasks } = useHttp();
    const { request: requestSections, loading: loadingSections } = useHttp();
    const { request: requestCurrentUser, loading: loadingUser } = useHttp();
    const { request: requestMyObstacles, loading: loadingMyObstacles } = useHttp();
    const { request: submitRequest, loading: submitLoading, error: submitError } = useHttp();
    const { request: deleteObstacleRequest } = useHttp();

    // 0. Inicjalizacja danych bazowych
    useEffect(() => {
        requestCurrentUser(null, (data: User) => setCurrentUser(data), false, `${backendUrl}/api/users/current`, 'GET');
        requestEvent(null, (data: SpecialEvent) => setEvent(data), false, `${backendUrl}/api/special-events/${eventId}`, 'GET');
        requestSections(null, (data: TaskSection[]) => setSections(data), false, `${backendUrl}/api/task-sections`, 'GET');
    }, [eventId, requestCurrentUser, requestEvent, requestSections]);

    // 1. Pobierz zadania
    useEffect(() => {
        if (!eventId) return;
        const fetchTasks = async () => {
            let stdTasks: Task[] = [];
            let spcTasks: Task[] = [];
            await new Promise<void>(resolve => {
                requestTasks(null, (data: Task[]) => { stdTasks = data; resolve(); }, false, `${backendUrl}/api/tasks`, 'GET');
            });
            await new Promise<void>(resolve => {
                requestTasks(null, (data: Task[]) => { spcTasks = data; resolve(); }, false, `${backendUrl}/api/special-events/${eventId}/tasks`, 'GET');
            });
            const combined = [...stdTasks, ...spcTasks].sort((a, b) => a.name.localeCompare(b.name));
            setAllTasks(combined);
        };
        fetchTasks();
    }, [eventId, requestTasks]);

    // 2. Pobieranie własnych przeszkód
    const fetchMyObstacles = () => {
        if (!event) return;
        requestMyObstacles(null, (data: Obstacle[]) => {
            const eventStart = new Date(event.startDate);
            const eventEnd = new Date(event.endDate);
            const filteredObstacles = data.filter(obs => {
                const obsStart = new Date(obs.fromDate);
                const obsEnd = new Date(obs.toDate);
                return obsStart <= eventEnd && obsEnd >= eventStart;
            });
            filteredObstacles.sort((a, b) => b.id - a.id);
            setMyObstacles(filteredObstacles);
        }, false, `${backendUrl}/api/obstacles/users/current`, 'GET');
    };

    useEffect(() => {
        if (event) fetchMyObstacles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [event]);


    // --- FILTRACJA ZADAŃ (OGÓLNE vs TACE/KOMUNIE) ---

    // 1. Zadania ogólne (bez Tac i Komunii)
    const generalTasks = allTasks.filter(t => {
        const cat = t.supervisorRole.name;
        // Odrzucamy DOKŁADNIE te dwie kategorie, a "Dziekan komunijny" zostaje w ogólnych!
        return cat !== "Tacowy" && cat !== "Komunijny";
    });

    const generalCategories = Array.from(new Set(generalTasks.map(t => t.supervisorRole.name))).sort();
    const tasksInGeneralCategory = generalTasks.filter(t => t.supervisorRole.name === selectedCategory);

    // 2. Tace i Komunie (Ścisłe dopasowanie roli i kategorii + naturalne sortowanie)
    const collectionTasks = allTasks.filter(t => {
        if (!currentUser) return false;

        const userRoleNames = currentUser.roles?.map(r => r.name) || [];
        const category = t.supervisorRole.name;

        // Ścisłe dopasowanie kategorii zadania
        const isTaceTask = category === "Dziekan Tacowy";
        const isKomunieTask = category === "Dziekan komunijny";

        // Ścisłe dopasowanie roli użytkownika
        const userHasTaceRole = userRoleNames.includes("Tacowy");
        const userHasKomunieRole = userRoleNames.includes("Komunijny");

        if (isTaceTask && userHasTaceRole) return true;
        if (isKomunieTask && userHasKomunieRole) return true;

        return false;
    }).sort((a, b) => {
        // Magia sortowania naturalnego: T9 będzie przed T10
        return a.nameAbbrev.localeCompare(b.nameAbbrev, undefined, { numeric: true, sensitivity: 'base' });
    });


    // --- LOGIKA MACIERZY OGÓLNEJ (SEKCJA 1) ---
    const toggleCell = (dateStr: string, sectionId: number) => {
        setSelectedMatrix(prev => {
            const newMatrix = { ...prev };
            const currentDaySections = newMatrix[dateStr] || [];
            if (currentDaySections.includes(sectionId)) {
                newMatrix[dateStr] = currentDaySections.filter(id => id !== sectionId);
                if (newMatrix[dateStr].length === 0) delete newMatrix[dateStr];
            } else {
                newMatrix[dateStr] = [...currentDaySections, sectionId];
            }
            return newMatrix;
        });
    };

    const toggleWholeDay = (dateStr: string) => {
        setSelectedMatrix(prev => {
            const newMatrix = { ...prev };
            const allSectionIds = sections.map(s => s.id);
            const currentDaySections = newMatrix[dateStr] || [];
            if (currentDaySections.length === allSectionIds.length) {
                delete newMatrix[dateStr];
            } else {
                newMatrix[dateStr] = allSectionIds;
            }
            return newMatrix;
        });
    };

    // --- LOGIKA FORMULARZA KONKRETNEGO OFICJUM (SEKCJA 1a) ---
    const handleTaskSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (!val) return;

        if (val === "ALL_IN_CATEGORY") {
            const newTasks = tasksInGeneralCategory.filter(t => !selectedTasks.find(st => st.id === t.id));
            setSelectedTasks(prev => [...prev, ...newTasks]);
        } else {
            const taskId = Number(val);
            const taskObj = generalTasks.find(t => t.id === taskId);
            if (taskObj && !selectedTasks.find(t => t.id === taskId)) {
                setSelectedTasks(prev => [...prev, taskObj]);
            }
        }
        e.target.value = "";
    };

    const removeTask = (taskId: number) => setSelectedTasks(prev => prev.filter(t => t.id !== taskId));


    // --- LOGIKA MACIERZY TAC/KOMUNII (SEKCJA 2) ---
    const toggleCollectionCell = (dateStr: string, taskId: number) => {
        setSelectedCollectionMatrix(prev => {
            const newMatrix = { ...prev };
            const currentDayTasks = newMatrix[dateStr] || [];
            if (currentDayTasks.includes(taskId)) {
                newMatrix[dateStr] = currentDayTasks.filter(id => id !== taskId);
                if (newMatrix[dateStr].length === 0) delete newMatrix[dateStr];
            } else {
                newMatrix[dateStr] = [...currentDayTasks, taskId];
            }
            return newMatrix;
        });
    };

    // Funkcja pomocnicza do wysyłania pojedynczego żądania przeszkody
    const sendSingleObstacle = (payload: any) => {
        return new Promise<void>((resolve, reject) => {
            submitRequest(payload, () => resolve(), false, `${backendUrl}/api/obstacles/users/current`, 'POST')
                .catch(err => reject(err));
        });
    };

    // --- WYSYŁANIE ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const activeGeneralDates = Object.keys(selectedMatrix);
        const activeCollectionDates = Object.keys(selectedCollectionMatrix);

        if (activeGeneralDates.length === 0 && activeCollectionDates.length === 0) {
            alert("Nie zaznaczono żadnych przeszkód. Zaznacz coś w tabeli!");
            return;
        }

        if (activeGeneralDates.length > 0 && isSpecificTask && selectedTasks.length === 0) {
            alert("Zaznaczyłeś, że przeszkoda dotyczy konkretnego oficjum, ale go nie wybrałeś!");
            return;
        }

        if (!description.trim()) {
            alert("Podaj opis wniosku!");
            return;
        }

        if (!currentUser) {
            alert("Błąd autoryzacji: Brak danych użytkownika.");
            return;
        }

        try {
            // 1. WYSYŁANIE PRZESZKÓD OGÓLNYCH (Sekcja 1)
            for (const dateStr of activeGeneralDates) {
                const sectionIds = selectedMatrix[dateStr];

                // Wysłanie tylko ZADAŃ OGÓLNYCH (generalTasks) bez tac i komunii!
                const idsToSend = isSpecificTask
                    ? selectedTasks.map(t => t.id)
                    : generalTasks.map(t => t.id);

                const payload = {
                    userId: currentUser.id,
                    tasksIds: idsToSend,
                    fromDate: dateStr,
                    toDate: dateStr,
                    applicantDescription: description,
                    taskSectionIds: sectionIds // Nowe pole obsługiwane przez zaktualizowane DTO
                };

                await sendSingleObstacle(payload);
            }

            // 2. WYSYŁANIE PRZESZKÓD DLA TAC I KOMUNII (Sekcja 2)
            for (const dateStr of activeCollectionDates) {
                const taskIds = selectedCollectionMatrix[dateStr];

                const payload = {
                    userId: currentUser.id,
                    tasksIds: taskIds,
                    fromDate: dateStr,
                    toDate: dateStr,
                    applicantDescription: `${description}`,
                    // Dla Tac i Komunii blokujemy wszystkie pory dnia w danym dniu
                    taskSectionIds: sections.map(s => s.id)
                };

                await sendSingleObstacle(payload);
            }

            setSubmitSuccess(true);
            fetchMyObstacles();

            // Reset formularza
            setSelectedMatrix({});
            setSelectedCollectionMatrix({});
            setSelectedTasks([]);
            setIsSpecificTask(false);
            setDescription("");

            // Przewiń do góry, by brat widział sukces
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error("Błąd podczas wysyłania przeszkód", error);
            alert("Wystąpił błąd podczas zapisywania. Spróbuj ponownie później.");
        }
    };

    const handleDeleteObstacle = (obstacleId: number) => {
        if (window.confirm("Czy na pewno chcesz usunąć tę przeszkodę?")) {
            deleteObstacleRequest(null, () => fetchMyObstacles(), false, `${backendUrl}/api/obstacles/${obstacleId}`, 'DELETE');
        }
    };

    // --- RENDEROWANIE ---
    if (loadingEvent || loadingTasks || loadingUser || loadingSections) return <LoadingSpinner />;
    if (errorEvent) return <AlertBox type="danger" width="100%" text={errorEvent} />;
    if (!event || !currentUser) return <LoadingSpinner />;

    const eventDays = eachDayOfInterval({ start: parseISO(event.startDate), end: parseISO(event.endDate) });

    const collectionDatesStrings = event.collectionDates || [];
        const collectionDays = collectionDatesStrings
            .map(d => parseISO(d))
            .sort((a, b) => a.getTime() - b.getTime());

    return (
        <div className="container mt-4 mb-5 fade-in" style={{ maxWidth: '900px' }}>
            <div className="card shadow border-0 rounded-3">
                <div className="card-header bg-dark text-white text-center py-3">
                    <h4 className="mb-0 fw-bold">Zgłoś przeszkodę</h4>
                    <span className="text-warning">{event.name}</span>
                </div>

                <div className="card-body p-4">
                    {submitSuccess && (
                        <div className="alert alert-success d-flex align-items-center mb-4">
                            <FontAwesomeIcon icon={faCheckCircle} className="me-2 fs-4" />
                            <div>Przeszkody zostały pomyślnie zgłoszone!</div>
                        </div>
                    )}
                    {submitError && <AlertBox type="danger" width="100%" text={submitError} />}

                    <form onSubmit={handleSubmit}>

                        {/* ========================================================= */}
                        {/* SEKCJA 1: PORY DNIA (MACIERZ OGÓLNA)                      */}
                        {/* ========================================================= */}
                        <div className="mb-4">
                            <label className="form-label fw-bold fs-5">
                                <FontAwesomeIcon icon={faCalendarDay} className="me-2 text-primary" />
                                1. Dostępność ogólna
                            </label>
                            <p className="text-muted small mb-3">Kliknij w pory dnia, w których nie będziesz mógł pełnić oficjów.</p>

                            <div className="table-responsive mb-3">
                                <table className="table table-bordered text-center align-middle" style={{ userSelect: 'none' }}>
                                    <thead className="table-light">
                                        <tr>
                                            {/* Usunięta pierwsza kolumna z nagłówkami wierszy */}
                                            {eventDays.map(day => {
                                                const dateStr = format(day, 'yyyy-MM-dd');
                                                const isAllSelected = (selectedMatrix[dateStr]?.length === sections.length) && sections.length > 0;
                                                return (
                                                    <th
                                                        key={dateStr}
                                                        onClick={() => toggleWholeDay(dateStr)}
                                                        style={{ cursor: 'pointer', transition: '0.2s', backgroundColor: isAllSelected ? '#ffc107' : '' }}
                                                        title="Kliknij, aby zaznaczyć/odznaczyć cały dzień"
                                                        className="hover-shadow"
                                                    >
                                                        <div className="fw-bold">{format(day, 'dd.MM')}</div>
                                                        <small className="fw-normal">{format(day, 'EEEE', { locale: pl })}</small>
                                                        <div className="mt-1 text-muted" style={{ fontSize: '0.65rem' }}>
                                                            <FontAwesomeIcon icon={faHandPointer} /> Cały dzień
                                                        </div>
                                                    </th>
                                                );
                                            })}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sections.map(sec => (
                                            <tr key={sec.id}>
                                                {eventDays.map(day => {
                                                    const dateStr = format(day, 'yyyy-MM-dd');
                                                    const isSelected = selectedMatrix[dateStr]?.includes(sec.id);
                                                    return (
                                                        <td
                                                            key={`${dateStr}-${sec.id}`}
                                                            onClick={() => toggleCell(dateStr, sec.id)}
                                                            className={isSelected ? 'bg-danger text-white border-danger fw-bold' : 'bg-white text-dark'}
                                                            style={{ cursor: 'pointer', transition: '0.15s', fontSize: '0.9rem' }}
                                                        >
                                                            {sec.name} {/* Wyświetlenie samej nazwy pory dnia w komórce */}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="alert alert-secondary border-0 shadow-sm p-3 mb-4" style={{ fontSize: '0.9rem' }}>
                                <h6 className="fw-bold mb-2"><i className="bi bi-info-circle me-2"></i>Legenda pór dnia:</h6>
                                <ul className="list-unstyled mb-0">
                                    <li><strong>🌅 Rano:</strong> czas do śniadania włącznie.</li>
                                    <li><strong>☀️ Przedpołudnie:</strong> między śniadaniem a horką.</li>
                                    <li><strong>⛪ Popołudnie:</strong> od horki włącznie.</li>
                                    <li><strong>🌙 Wieczór:</strong> od nieszporów włącznie</li>
                                </ul>
                            </div>

                            {/* CHECKBOX DO ROZWIJANIA KONKRETNYCH ZADAŃ */}
                            <div className="form-check bg-light p-3 rounded border">
                                <input
                                    className="form-check-input ms-1"
                                    type="checkbox"
                                    id="specificTaskCheck"
                                    checked={isSpecificTask}
                                    onChange={(e) => setIsSpecificTask(e.target.checked)}
                                />
                                <label className="form-check-label ms-2 fw-bold" htmlFor="specificTaskCheck">
                                    Chcę, aby powyższe przeszkody dotyczyły <span className="text-decoration-underline">tylko określonego oficjum</span>
                                </label>
                                <div className="text-muted small ms-2 mt-1">
                                    Domyślnie zaznaczenie w tabeli oznacza brak dyspozycyjności na <strong className="text-danger">wszystkie</strong> oficja (z wyjątkiem tac i komunii).
                                </div>
                            </div>

                            {/* WIDOK KONKRETNYCH ZADAŃ (WYŚWIETLANY JEŚLI CHECKBOX JEST ZAZNACZONY) */}
                            {isSpecificTask && (
                                <div className="mt-3 p-3 border rounded border-primary bg-white fade-in">
                                    <label className="form-label fw-bold text-primary">
                                        <FontAwesomeIcon icon={faBriefcase} className="me-2" />
                                        Wybierz oficja, których dotyczy ta przeszkoda:
                                    </label>
                                    <div className="row g-2 mb-3">
                                        <div className="col-md-6">
                                            <select className="form-select shadow-sm" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                                                <option value="">-- 1. Wybierz kategorię --</option>
                                                {generalCategories.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <select
                                                className="form-select shadow-sm"
                                                onChange={handleTaskSelect}
                                                disabled={!selectedCategory}
                                                value=""
                                            >
                                                <option value="">-- 2. Wybierz i dodaj oficjum --</option>
                                                {selectedCategory && (
                                                    <>
                                                        <option value="ALL_IN_CATEGORY" className="fw-bold text-success">
                                                            📚 Dodaj wszystkie z: {selectedCategory}
                                                        </option>
                                                        <option disabled>----------------</option>
                                                        {tasksInGeneralCategory.map(t => (
                                                            <option key={t.id} value={t.id}>{t.name} ({t.nameAbbrev})</option>
                                                        ))}
                                                    </>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="selected-tasks d-flex flex-wrap gap-2 p-2 rounded" style={{ minHeight: '50px', backgroundColor: '#f8f9fa', border: '1px dashed #ced4da' }}>
                                        {selectedTasks.length === 0 ? (
                                            <span className="text-muted align-self-center">Puste. Dodaj oficja z listy powyżej...</span>
                                        ) : (
                                            selectedTasks.map(task => (
                                                <span key={task.id} className="badge bg-primary p-2 fs-6 shadow-sm d-flex align-items-center">
                                                    {task.name}
                                                    <FontAwesomeIcon icon={faXmark} className="ms-2" style={{cursor: 'pointer'}} onClick={() => removeTask(task.id)} />
                                                </span>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <hr className="text-muted my-4" />

                        {/* ========================================================= */}
                        {/* SEKCJA 2: TACE I KOMUNIE                                  */}
                        {/* ========================================================= */}
                        {collectionTasks.length > 0 && (
                            <div className="mb-4">
                                <label className="form-label fw-bold fs-5">
                                    <FontAwesomeIcon icon={faChurch} className="me-2 text-primary" />
                                    2. Tace i Komunie (Dni specjalne)
                                </label>
                                <p className="text-muted small mb-3">Zaznacz oficja z którymi masz kolizję we wskazanych niżej dniach świątecznych.</p>

                                {collectionDays.length === 0 ? (
                                    <div className="alert alert-secondary small">
                                        W tym wydarzeniu nie zdefiniowano jeszcze dni tacowych/komunijnych.
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-bordered text-center align-middle" style={{ userSelect: 'none', tableLayout: 'fixed' }}>
                                            <thead className="table-light">
                                                <tr>
                                                    {collectionDays.map(day => {
                                                        const dateStr = format(day, 'yyyy-MM-dd');
                                                        return (
                                                            <th key={dateStr} className="bg-light">
                                                                <div className="fw-bold">{format(day, 'dd.MM')}</div>
                                                                <small className="fw-normal">{format(day, 'EEEE', { locale: pl })}</small>
                                                            </th>
                                                        );
                                                    })}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {collectionTasks.map(task => (
                                                    <tr key={task.id}>
                                                        {collectionDays.map(day => {
                                                            const dateStr = format(day, 'yyyy-MM-dd');
                                                            const isSelected = selectedCollectionMatrix[dateStr]?.includes(task.id);
                                                            return (
                                                                <td
                                                                    key={`${dateStr}-${task.id}`}
                                                                    onClick={() => toggleCollectionCell(dateStr, task.id)}
                                                                    className={isSelected ? 'bg-danger text-white border-danger fw-bold' : 'bg-white text-dark'}
                                                                    style={{ cursor: 'pointer', transition: '0.15s', fontSize: '0.9rem' }}
                                                                >
                                                                    {task.nameAbbrev} {/* Skrócona nazwa oficjum */}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {collectionTasks.length > 0 && <hr className="text-muted my-4" />}

                        {/* ========================================================= */}
                        {/* SEKCJA 3: OPIS                                            */}
                        {/* ========================================================= */}
                        <div className="mb-4">
                            <label htmlFor="applicantDescription" className="form-label fw-bold fs-5">
                                <FontAwesomeIcon icon={faCommentDots} className="me-2 text-primary" />
                                {collectionTasks.length > 0 ? "3." : "2."} Opis wniosku
                            </label>
                            <textarea
                                className="form-control shadow-sm border-primary"
                                id="applicantDescription"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Np. Wyjazd do domu od 14:00."
                            ></textarea>
                            <div className="form-text mt-2">Pamiętaj, by uargumentować nieobecność (wniosek trafi do zatwierdzenia przez Dziekana).</div>
                        </div>

                        {/* SUBMIT */}
                        <div className="d-flex justify-content-center mt-5">
                            <button type="submit" className="btn btn-success btn-lg px-5 shadow fw-bold text-uppercase" disabled={submitLoading}>
                                {submitLoading ? <LoadingSpinner /> : "Zgłoś przeszkodę"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* --- SEKCJA MOICH PRZESZKÓD --- */}
            <div className="card shadow border-0 rounded-3 mt-4">
                <div className="card-header bg-dark text-white py-3">
                    <h5 className="mb-0 fw-bold">Twoje przeszkody w tym wydarzeniu</h5>
                </div>
                <div className="card-body p-0">
                    {loadingMyObstacles ? (
                        <div className="text-center p-4"><LoadingSpinner /></div>
                    ) : myObstacles.length === 0 ? (
                        <div className="text-center text-muted p-4">Nie zgłosiłeś jeszcze żadnych przeszkód w tym terminie.</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover table-striped mb-0 text-center align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Data</th>
                                        <th>Oficja</th>
                                        <th>Opis</th>
                                        <th>Status</th>
                                        <th>Akcje</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myObstacles.map(obs => (
                                        <tr key={obs.id}>
                                            <td className="fw-bold">
                                                {format(parseISO(obs.fromDate), 'dd.MM')}
                                                {obs.fromDate !== obs.toDate && ` - ${format(parseISO(obs.toDate), 'dd.MM')}`}
                                            </td>
                                            <td style={{ maxWidth: '200px' }}>
                                                <div className="d-flex flex-wrap justify-content-center gap-1">
                                                    {obs.tasks.map(t => (
                                                        <span
                                                            key={t.id}
                                                            className="badge bg-primary text-wrap text-break"
                                                            style={{ lineHeight: '1.4' }}
                                                        >
                                                            {t.nameAbbrev}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="small text-muted text-start" style={{ maxWidth: '250px' }}>
                                                {obs.applicantDescription}
                                            </td>
                                            <td>
                                                <span className={`badge ${
                                                    obs.status === ObstacleStatus.AWAITING ? 'bg-warning text-dark' :
                                                    obs.status === ObstacleStatus.APPROVED ? 'bg-success' : 'bg-danger'
                                                }`}>
                                                    {obstacleStatusTranslation[obs.status]}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-danger shadow-sm"
                                                    onClick={() => handleDeleteObstacle(obs.id)}
                                                    title="Usuń przeszkodę"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SpecialEventObstacleForm;