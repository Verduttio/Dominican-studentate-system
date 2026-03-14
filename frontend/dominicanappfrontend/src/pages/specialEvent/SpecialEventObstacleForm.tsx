import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { backendUrl } from "../../utils/constants";
import useHttp from "../../services/UseHttp";
import LoadingSpinner from "../../components/LoadingScreen";
import AlertBox from "../../components/AlertBox";
import { eachDayOfInterval, format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCheckCircle, faCalendarDay, faBriefcase, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Task, SpecialEvent, User, Obstacle, ObstacleStatus, obstacleStatusTranslation } from "../../models/Interfaces";

function SpecialEventObstacleForm() {
    const { eventId } = useParams<{ eventId: string }>();

    // --- STANY ---
    const [event, setEvent] = useState<SpecialEvent | null>(null);
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [myObstacles, setMyObstacles] = useState<Obstacle[]>([]);

    // Formularz
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
    const [isAllDay, setIsAllDay] = useState<boolean>(false);
    const [description, setDescription] = useState<string>("");

    const [submitSuccess, setSubmitSuccess] = useState(false);

    // --- HOOKI HTTP ---
    const { request: requestEvent, loading: loadingEvent, error: errorEvent } = useHttp();
    const { request: requestTasks, loading: loadingTasks, error: errorTasks} = useHttp();
    const { request: submitRequest, loading: submitLoading, error: submitError } = useHttp();
    const { request: requestCurrentUser, loading: loadingUser } = useHttp();
    const { request: requestMyObstacles, loading: loadingMyObstacles } = useHttp();
    const { request: deleteObstacleRequest } = useHttp();


    // 0. Pobierz aktualnie zalogowanego użytkownika
    useEffect(() => {
        requestCurrentUser(null, (data: User) => {
            setCurrentUser(data);
        }, false, `${backendUrl}/api/users/current`, 'GET');
    }, [requestCurrentUser]);

    // 1. Pobierz dane wydarzenia
    useEffect(() => {
        requestEvent(null, (data: SpecialEvent) => {
            setEvent(data);
        }, false, `${backendUrl}/api/special-events/${eventId}`, 'GET');
    }, [eventId, requestEvent]);

    // 2. Pobierz zadania (Zwykłe + Specjalne)
    useEffect(() => {
        if (!eventId) return;

        const fetchTasks = async () => {
            let stdTasks: Task[] = [];
            let spcTasks: Task[] = [];

            // Zwykłe zadania (zakładam, że masz taki endpoint)
            await new Promise<void>(resolve => {
                requestTasks(null, (data: Task[]) => { stdTasks = data; resolve(); }, false, `${backendUrl}/api/tasks`, 'GET');
            });

            // Zadania specjalne dla tego eventu
            await new Promise<void>(resolve => {
                requestTasks(null, (data: Task[]) => { spcTasks = data; resolve(); }, false, `${backendUrl}/api/special-events/${eventId}/tasks`, 'GET');
            });

            // Łączymy i sortujemy alfabetycznie
            const combined = [...stdTasks, ...spcTasks].sort((a, b) => a.name.localeCompare(b.name));
            setAllTasks(combined);
        };

        fetchTasks();
    }, [eventId, requestTasks]);

    // Funkcja pobierająca przeszkody usera
    const fetchMyObstacles = () => {
        if (!event) return;
        // Zakładam, że masz endpoint GET /api/obstacles/users/current.
        // Jeśli nie, dodaj go w backendzie analogicznie do POST!
        requestMyObstacles(null, (data: Obstacle[]) => {
            const eventStart = new Date(event.startDate);
            const eventEnd = new Date(event.endDate);

            // Filtrujemy tylko te przeszkody, które zahaczają o czas trwania wydarzenia
            const filteredObstacles = data.filter(obs => {
                const obsStart = new Date(obs.fromDate);
                const obsEnd = new Date(obs.toDate);
                return obsStart <= eventEnd && obsEnd >= eventStart;
            });

            // Sortujemy od najnowszych
            filteredObstacles.sort((a, b) => b.id - a.id);
            setMyObstacles(filteredObstacles);

        }, false, `${backendUrl}/api/obstacles/users/current`, 'GET');
    };

    // Pobierz przeszkody po załadowaniu wydarzenia
    useEffect(() => {
        if (event) {
            fetchMyObstacles();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [event]);

    // --- LOGIKA FORMULARZA ---

    // Kategorie (unikalne nazwy ról wyciągnięte z pobranych zadań)
    const categories = Array.from(new Set(allTasks.map(t => t.supervisorRole.name))).sort();

    // Zadania dostępne w wybranej kategorii
    const tasksInCategory = allTasks.filter(t => t.supervisorRole.name === selectedCategory);

    const toggleDate = (dateStr: string) => {
        setSelectedDates(prev =>
            prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]
        );
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === "ALL_DAY") {
            setIsAllDay(true);
            setSelectedTasks([]);
            setSelectedCategory("");
        } else {
            setIsAllDay(false);
            setSelectedCategory(val);
        }
    };

    const handleTaskSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (!val) return;

        if (val === "ALL_IN_CATEGORY") {
            // Dodajemy wszystkie zadania z tej kategorii, których jeszcze nie ma na liście
            const newTasks = tasksInCategory.filter(t => !selectedTasks.find(st => st.id === t.id));
            setSelectedTasks(prev => [...prev, ...newTasks]);
        } else {
            const taskId = Number(val);
            const taskObj = allTasks.find(t => t.id === taskId);
            if (taskObj && !selectedTasks.find(t => t.id === taskId)) {
                setSelectedTasks(prev => [...prev, taskObj]);
            }
        }
        // Resetujemy dropdown po wybraniu
        e.target.value = "";
    };

    const removeTask = (taskId: number) => {
        setSelectedTasks(prev => prev.filter(t => t.id !== taskId));
    };

    // --- WYSYŁANIE ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedDates.length === 0) {
            alert("Wybierz co najmniej jeden dzień!");
            return;
        }
        if (!isAllDay && selectedTasks.length === 0) {
            alert("Wybierz oficja lub opcję 'Cały dzień'!");
            return;
        }
        if (!description.trim()) {
            alert("Podaj powód / godziny nieobecności!");
            return;
        }

        if (!currentUser) {
            alert("Błąd autoryzacji: Trwa ładowanie danych użytkownika lub sesja wygasła.");
            return;
        }
        const currentUserId = currentUser.id;

        // Backend wymaga listy ID zadań (NotEmpty)
        let idsToSend: number[] = [];
        if (isAllDay) {
            // Dla "Całego dnia" wysyłamy ID absolutnie wszystkich wczytanych zadań
            idsToSend = allTasks.map(t => t.id);
        } else {
            // Dla konkretnych oficjów wysyłamy tylko ich ID
            idsToSend = selectedTasks.map(t => t.id);
        }

        if (idsToSend.length === 0) {
            alert("Nie znaleziono żadnych oficjów do zablokowania.");
            return;
        }

        try {
            // Backend pozwala nam za jednym zamachem zablokować wiele zadań (tasksIds),
            // więc wysyłamy tylko JEDEN request na każdy wybrany dzień (zamiast jednego na każde zadanie)
            for (const dateStr of selectedDates) {
                const payload = {
                    userId: currentUserId,
                    tasksIds: idsToSend,          // Zmieniono z taskId na tasksIds
                    fromDate: dateStr,            // Zmieniono z date na fromDate
                    toDate: dateStr,              // Zmieniono z date na toDate
                    applicantDescription: description
                };

                await sendSingleObstacle(payload);
            }

            setSubmitSuccess(true);

            fetchMyObstacles();

            // Reset formularza
            setSelectedDates([]);
            setSelectedTasks([]);
            setIsAllDay(false);
            setDescription("");

        } catch (error) {
            console.error("Błąd podczas wysyłania", error);
            alert("Wystąpił błąd podczas komunikacji z serwerem. Sprawdź konsolę.");
        }
    };

    const handleDeleteObstacle = (obstacleId: number) => {
        if (window.confirm("Czy na pewno chcesz usunąć tę przeszkodę? Jeśli chcesz ją zedytować, po usunięciu zgłoś ją ponownie z poprawnymi danymi.")) {
            deleteObstacleRequest(null, () => {
                fetchMyObstacles(); // Odśwież po usunięciu
            }, false, `${backendUrl}/api/obstacles/${obstacleId}`, 'DELETE');
        }
    };

    const sendSingleObstacle = (payload: any) => {
        return new Promise<void>((resolve, reject) => {
            submitRequest(payload, () => resolve(), false, `${backendUrl}/api/obstacles/users/current`, 'POST')
                .catch(err => reject(err));
        });
    };

    // --- RENDEROWANIE ---
    if (loadingEvent || loadingTasks || loadingUser) return <LoadingSpinner />;
    if (errorEvent || errorTasks) {
        return <AlertBox type="danger" width="100%" text={errorEvent || errorTasks || "Brak dostępu do danych."} />;
    }
    if (!event) return null;

    const eventDays = eachDayOfInterval({ start: parseISO(event.startDate), end: parseISO(event.endDate) });

    return (
        <div className="container mt-4 mb-5 fade-in" style={{ maxWidth: '800px' }}>
            <div className="card shadow border-0 rounded-3">
                <div className="card-header bg-dark text-white text-center py-3">
                    <h4 className="mb-0 fw-bold">Zgłoś przeszkodę</h4>
                    <span className="text-warning">{event.name}</span>
                </div>

                <div className="card-body p-4">
                    {submitSuccess && (
                        <div className="alert alert-success d-flex align-items-center mb-4">
                            <FontAwesomeIcon icon={faCheckCircle} className="me-2 fs-4" />
                            <div>Przeszkody zostały pomyślnie zgłoszone! Możesz dodać kolejne lub opuścić tę stronę.</div>
                        </div>
                    )}

                    {submitError && <AlertBox type="danger" width="100%" text={submitError} />}

                    <form onSubmit={handleSubmit}>
                        {/* KROK 1: DATY */}
                        <div className="mb-4">
                            <label className="form-label fw-bold">
                                <FontAwesomeIcon icon={faCalendarDay} className="me-2 text-primary" />
                                1. Wybierz dni nieobecności:
                            </label>
                            <div className="d-flex flex-wrap gap-2">
                                {eventDays.map(day => {
                                    const dateStr = format(day, 'yyyy-MM-dd');
                                    const isSelected = selectedDates.includes(dateStr);
                                    return (
                                        <button
                                            type="button"
                                            key={dateStr}
                                            className={`btn ${isSelected ? 'btn-primary shadow-sm' : 'btn-outline-secondary'}`}
                                            onClick={() => toggleDate(dateStr)}
                                            style={{ minWidth: '85px' }}
                                        >
                                            <span className="fw-bold">{format(day, 'dd.MM')}</span><br/>
                                            <small>{format(day, 'EEEE', { locale: pl })}</small>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <hr className="text-muted" />

                        {/* KROK 2: ZADANIA */}
                        <div className="mb-4">
                            <label className="form-label fw-bold">
                                <FontAwesomeIcon icon={faBriefcase} className="me-2 text-primary" />
                                2. Wybierz oficja (lub zaznacz cały dzień):
                            </label>

                            <div className="row g-2 mb-3">
                                <div className="col-md-6">
                                    <select className="form-select border-primary shadow-sm" value={isAllDay ? "ALL_DAY" : selectedCategory} onChange={handleCategoryChange}>
                                        <option value="">-- 1. Wybierz kategorię --</option>
                                        <option value="ALL_DAY" className="fw-bold text-danger">🌍 Wszystkie oficja (CAŁY DZIEŃ)</option>
                                        <option disabled>----------------</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <select
                                        className="form-select shadow-sm"
                                        onChange={handleTaskSelect}
                                        disabled={isAllDay || !selectedCategory}
                                        defaultValue=""
                                    >
                                        <option value="">-- 2. Wybierz i dodaj oficjum --</option>
                                        {selectedCategory && (
                                            <>
                                                <option value="ALL_IN_CATEGORY" className="fw-bold text-success">
                                                    📚 Dodaj wszystkie z: {selectedCategory}
                                                </option>
                                                <option disabled>----------------</option>
                                                {tasksInCategory.map(t => (
                                                    <option key={t.id} value={t.id}>
                                                        {t.name} ({t.nameAbbrev}) {t.specialEventId ? '⭐' : ''}
                                                    </option>
                                                ))}
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>

                            {/* Wybrane "chipy" */}
                            <div className="selected-tasks mt-3 d-flex flex-wrap gap-2 p-2 rounded" style={{ minHeight: '50px', backgroundColor: '#f8f9fa', border: '1px dashed #ced4da' }}>
                                {isAllDay ? (
                                    <span className="badge bg-danger p-2 fs-6 shadow-sm">
                                        Cały wybrany dzień (Wszystkie oficja)
                                        <FontAwesomeIcon icon={faXmark} className="ms-2" style={{cursor: 'pointer'}} onClick={() => setIsAllDay(false)} />
                                    </span>
                                ) : selectedTasks.length === 0 ? (
                                    <span className="text-muted align-self-center">Puste. Dodaj oficja z listy powyżej...</span>
                                ) : (
                                    selectedTasks.map(task => (
                                        <span key={task.id} className={`badge ${task.specialEventId ? 'bg-warning text-dark' : 'bg-primary'} p-2 fs-6 shadow-sm d-flex align-items-center`}>
                                            {task.name}
                                            <FontAwesomeIcon
                                                icon={faXmark}
                                                className="ms-2"
                                                style={{cursor: 'pointer'}}
                                                onClick={() => removeTask(task.id)}
                                            />
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>

                        <hr className="text-muted" />

                        {/* KROK 3: OPIS */}
                        <div className="mb-4">
                            <label htmlFor="applicantDescription" className="form-label fw-bold">
                                3. Opis wniosku (Powód nieobecności + ew. godziny):
                            </label>
                            <textarea
                                className="form-control shadow-sm"
                                id="applicantDescription"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Np. Wyjazd do domu od 14:00."
                            ></textarea>
                        </div>

                        {/* SUBMIT */}
                        <div className="d-flex justify-content-center">
                            <button
                                type="submit"
                                className="btn btn-success btn-lg px-5 shadow fw-bold text-uppercase"
                                disabled={submitLoading}
                            >
                                {submitLoading ? <LoadingSpinner /> : "Zgłoś przeszkodę"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {/* --- SEKCJA MOICH PRZESZKÓD --- */}
            <div className="card shadow border-0 rounded-3 mt-4">
                <div className="card-header bg-secondary text-white py-3">
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
                                                        <span key={t.id} className="badge bg-primary">{t.nameAbbrev}</span>
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