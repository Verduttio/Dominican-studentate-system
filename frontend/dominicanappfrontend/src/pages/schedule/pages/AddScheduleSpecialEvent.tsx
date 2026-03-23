import React, {useEffect, useRef, useState} from "react";
import {
    Task, UserTasksScheduleInfoWeekly, SpecialEvent, UserTaskScheduleInfo, Role, Conflict, TaskSection, User, Obstacle
} from "../../../models/Interfaces";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {backendUrl} from "../../../utils/constants";
import useHttp from "../../../services/UseHttp";
import {DateFormatter} from "../../../utils/DateFormatter";
import useIsFunkcyjny, {UNAUTHORIZED_PAGE_TEXT} from "../../../services/UseIsFunkcyjny";
import LoadingSpinner from "../../../components/LoadingScreen";
import AlertBox from "../../../components/AlertBox";
import {format, parseISO, eachDayOfInterval, startOfWeek, endOfWeek} from "date-fns";
import { pl } from 'date-fns/locale';
import ConfirmAssignmentPopup from "../common/ConfirmAssignmentPopup";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCircleXmark, faXmark, faEye, faEyeSlash, faPlus, faFilePdf, faTrash, faUserPlus} from '@fortawesome/free-solid-svg-icons';
import UserShortScheduleHistoryPopup from "../common/UserShortScheduleHistoryPopup";
import {isTaskFullyAssigned, countAssignedUsers} from "./ScheduleUtils";
import SpecialEventTaskModal from '../../specialEvent/SpecialEventTaskModal';
import GuestUserModal from '../../specialEvent/GuestUserModal';

function AddScheduleSpecialEvent() {
    const { eventId } = useParams<{ eventId: string }>();
    const location = useLocation();
    const roleName = new URLSearchParams(location.search).get('roleName');

    // Stany
    const [currentDate, setCurrentDate] = useState(new Date());
    const currentDateRef = useRef(currentDate);

    const [showStandardTasks, setShowStandardTasks] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [currentRoleObj, setCurrentRoleObj] = useState<Role | null>(null);

    const [showGuestModal, setShowGuestModal] = useState(false);
    const [guestToEdit, setGuestToEdit] = useState<User | null>(null);
    const { request: fetchUserRequest } = useHttp();

    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [allConflicts, setAllConflicts] = useState<Conflict[]>([]);

    const [conflictTask1Id, setConflictTask1Id] = useState<number | ''>('');
    const [selectedConflictRole, setSelectedConflictRole] = useState<string>('');
    const [conflictTasks2, setConflictTasks2] = useState<Task[]>([]);
    const [selectedTask2Ids, setSelectedTask2Ids] = useState<number[]>([]);

    const [taskSections, setTaskSections] = useState<TaskSection[]>([]);
    const [currentSectionId, setCurrentSectionId] = useState<number | null>(null);
    const { request: requestTaskSections } = useHttp();

    const [eventObstacles, setEventObstacles] = useState<Obstacle[]>([]);
    const { request: requestObstacles, loading: loadingObstacles } = useHttp();

    // Dane
    const [event, setEvent] = useState<SpecialEvent | null>(null);
    const [userDependencies, setUserDependencies] = useState<UserTasksScheduleInfoWeekly[]>([]);
    const [tasks, setTasks] = useState<Task[] | null>(null);

    // Requesty
    const { request: requestSchedule, loading: loadingSchedule, error: errorSchedule } = useHttp();
    const { request: requestEvent, loading: loadingEvent } = useHttp();
    const { request: requestTasks } = useHttp(); // Jeden request do zadań
    const { request: assignRequest, loading: assignLoading, error: assignError } = useHttp();
    const { request: unassignRequest, loading: unassignLoading, error: unassignError } = useHttp();
    const { request: requestRole } = useHttp();

    const { request: requestAllRoles } = useHttp();
    const { request: requestAllConflicts } = useHttp();
    const { request: requestConflictTasks } = useHttp();
    const { request: addConflictRequest, loading: addConflictLoading } = useHttp();
    const { request: deleteConflictRequest } = useHttp();

    // Popupy i Utilsy
    const dateFormatter = new DateFormatter("dd-MM-yyyy", "yyyy-MM-dd");
    const { isFunkcyjny, isFunkcyjnyLoading } = useIsFunkcyjny();
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [popupData, setPopupData] = useState({ userId: 0, taskId: 0, text: "" });
    const [historyPopup, setHistoryPopup] = useState({ show: false, userId: 0 });

    const specialTasks = tasks?.filter(t => t.specialEventId !== null && t.specialEventId !== undefined) || [];

    const visibleTasks = React.useMemo(() => {
            if (!tasks) return [];
            // Jeśli wybrana jest zakładka "Wszystkie", pokaż wszystko
            if (currentSectionId === null) return tasks;

            // Zostaw tylko te zadania, które w swojej tablicy taskSections mają wybraną sekcję
            return tasks.filter(task => {
                // Zakładamy, że zwykłe oficja (bez specialEventId) pokazujemy zawsze,
                // ale jeśli chcesz, by też podlegały sekcjom, zdejmij poniższy warunek
                const isSpecial = task.specialEventId !== null && task.specialEventId !== undefined;

                // Jeśli to zadanie specjalne, sprawdź jego sekcje
                if (!task.taskSections || task.taskSections.length === 0) return false;
                return task.taskSections.some(sec => sec.id === currentSectionId);
            });
        }, [tasks, currentSectionId]);

    // 1. Pobierz Event i ustaw datę początkową (Tylko raz przy starcie)
    useEffect(() => {
        requestEvent(null, (data: SpecialEvent) => {
            setEvent(data);
            const start = parseISO(data.startDate);
            const end = parseISO(data.endDate);
            const today = new Date();

            // Jeśli dzisiaj jest w trakcie eventu, ustaw dzisiaj, wpp. ustaw start
            if (today >= start && today <= end) {
                setCurrentDate(today);
            } else {
                setCurrentDate(start);
            }
        }, false, `${backendUrl}/api/special-events/${eventId}`, 'GET');
    }, [eventId, requestEvent]);

    // 2. Pobierz Zadania (Standardowe + Specjalne) - TYLKO RAZ po załadowaniu eventu
    useEffect(() => {
        if (!event || !roleName) return;

        const fetchAllTasks = async () => {
            let stdTasks: Task[] = [];
            let spcTasks: Task[] = [];

            // Standardowe
            await new Promise<void>(resolve => {
                requestTasks(null, (data: Task[]) => {
                    stdTasks = data;
                    resolve();
                }, false, `${backendUrl}/api/tasks/bySupervisorRole/${roleName}`, 'GET');
            });

            // Specjalne
            await new Promise<void>(resolve => {
                requestTasks(null, (data: Task[]) => {
                    spcTasks = data.filter(t => t.supervisorRole.name === roleName);
                    resolve();
                }, false, `${backendUrl}/api/special-events/${eventId}/tasks`, 'GET');
            });

            // Połącz: Standardowe + Specjalne
            setTasks([...stdTasks, ...spcTasks]);
        };

        fetchAllTasks();
    }, [event, roleName, eventId, requestTasks]);

    useEffect(() => {
        if (roleName) {
            requestRole(null, (data: Role[]) => {
                // API zwraca listę, szukamy odpowiedniej (lub backend ma endpoint byName)
                // Zakładam, że masz endpoint zwracający listę ról lub konkretną.
                // Użyję bezpiecznego podejścia: pobierz wszystkie supervisor i znajdź właściwą.
                const found = data.find(r => r.name === roleName);
                if (found) setCurrentRoleObj(found);
            }, false, `${backendUrl}/api/roles/types/SUPERVISOR`, 'GET');
        }
    }, [roleName, requestRole]);

    const handleTaskAdded = () => {
        setShowAddModal(false);
        window.location.reload(); // Najszybsza metoda, żeby odświeżyć kolumny i tabelę
    };

    // 3. Pobierz Schedule Info (Macierz) - Przy każdej zmianie daty
    const fetchSchedule = () => {
        if (!event) return;
        const dateStr = format(currentDate, 'dd-MM-yyyy');
        let url = `${backendUrl}/api/schedules/special-event/${eventId}/${roleName}/schedule-info/daily?date=${dateStr}`;

        if (currentSectionId !== null) {
            url += `&sectionId=${currentSectionId}`;
        }

        requestSchedule(null, (data) => {
            if (currentDateRef.current === currentDate) {
                setUserDependencies(data);
            }
        }, false, url, 'GET');
    };

    useEffect(() => {
        currentDateRef.current = currentDate;
        fetchSchedule();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentDate, event, currentSectionId]);

    // Pobieranie wszystkich ról i konfliktów (raz przy starcie)
    useEffect(() => {
        requestAllRoles(null, (data: Role[]) => setAllRoles(data), false, `${backendUrl}/api/roles/types/SUPERVISOR`, 'GET');
        fetchConflicts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchConflicts = () => {
        requestAllConflicts(null, (data: Conflict[]) => setAllConflicts(data), false, `${backendUrl}/api/conflicts`, 'GET');
    };


    // Pobieranie wszystkich zatwierdzonych przeszkód dla tego wydarzenia
    useEffect(() => {
        if (!event) return;
        requestObstacles(null, (data: Obstacle[]) => {
            const eventStart = new Date(event.startDate);
            const eventEnd = new Date(event.endDate);

            const approvedForEvent = data.filter(obs => {
                if (obs.status !== 'APPROVED') return false;
                const obsStart = new Date(obs.fromDate);
                const obsEnd = new Date(obs.toDate);
                // Sprawdzamy czy przeszkoda zahacza o ramy czasowe eventu
                return obsStart <= eventEnd && obsEnd >= eventStart;
            });

            // Sortujemy chronologicznie
            approvedForEvent.sort((a, b) => new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime());

            setEventObstacles(approvedForEvent);
        }, false, `${backendUrl}/api/obstacles`, 'GET');
    }, [event, requestObstacles]);

    // Pobieranie zadań do drugiego dropdowna (Zwykłe + Specjalne z tego eventu) po wybraniu kategorii
    useEffect(() => {
        if (!selectedConflictRole || !event) {
            setConflictTasks2([]);
            setSelectedTask2Ids([]);
            return;
        }

        const fetchTasksForConflict = async () => {
            let stdTasks: Task[] = [];
            let spcTasks: Task[] = [];

            await new Promise<void>(resolve => {
                requestConflictTasks(null, (data: Task[]) => { stdTasks = data; resolve(); }, false, `${backendUrl}/api/tasks/bySupervisorRole/${selectedConflictRole}`, 'GET');
            });

            await new Promise<void>(resolve => {
                requestConflictTasks(null, (data: Task[]) => {
                    spcTasks = data.filter(t => t.supervisorRole.name === selectedConflictRole);
                    resolve();
                }, false, `${backendUrl}/api/special-events/${eventId}/tasks`, 'GET');
            });

            setConflictTasks2([...stdTasks, ...spcTasks]);
            setSelectedTask2Ids([]); // Reset wyboru po zmianie kategorii
        };

        fetchTasksForConflict();
    }, [selectedConflictRole, event, eventId, requestConflictTasks]);

    // Pobieranie dostępnych pór dnia (sekcji)
    useEffect(() => {
        requestTaskSections(null, (data: TaskSection[]) => {
            setTaskSections(data);
        }, false, `${backendUrl}/api/task-sections`, 'GET');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- FUNKCJE OBSŁUGI KOLIZJI ---

    // Sprawdza, czy kolizja między wybranym task1 a danym task2 już istnieje
    const isConflictExisting = (task2Id: number) => {
        if (!conflictTask1Id) return false;
        return allConflicts.some(c =>
            (c.task1.id === Number(conflictTask1Id) && c.task2.id === task2Id) ||
            (c.task2.id === Number(conflictTask1Id) && c.task1.id === task2Id)
        );
    };

    const toggleTask2Selection = (taskId: number) => {
        setSelectedTask2Ids(prev =>
            prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
        );
    };

    const handleAddConflict = async () => {
        if (!conflictTask1Id || selectedTask2Ids.length === 0) return;

        const allDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

        for (const task2Id of selectedTask2Ids) {
            // Podwójne zabezpieczenie przed wysłaniem duplikatu
            if (isConflictExisting(task2Id)) continue;

            const conflictData = {
                task1Id: Number(conflictTask1Id),
                task2Id: task2Id,
                daysOfWeek: allDays
            };

            await new Promise<void>(resolve => {
                // Jeśli request zwroci błąd, ignorujemy go i pętla leci dalej do kolejnego zadania
                addConflictRequest(conflictData, () => resolve(), false, `${backendUrl}/api/conflicts`, 'POST')
                    .catch(() => resolve());
            });
        }

        setSelectedTask2Ids([]);
        setConflictTask1Id('');
        fetchConflicts();
        fetchSchedule();
    };

    const handleDeleteConflict = (conflictId: number) => {
        if(window.confirm("Czy na pewno chcesz usunąć tę kolizję?")) {
            deleteConflictRequest(null, () => {
                fetchConflicts();
                fetchSchedule();
            }, false, `${backendUrl}/api/conflicts/${conflictId}`, 'DELETE');
        }
    };

    const handleSelectAllTasks2 = () => {
        if (!conflictTask1Id) {
            alert("Najpierw wybierz oficjum w kroku 1!");
            return;
        }

        // Bierzemy tylko te zadania, które NIE MAJĄ jeszcze kolizji
        const availableTasks = conflictTasks2.filter(t => !isConflictExisting(t.id));
        if (availableTasks.length === 0) return;

        // Jeśli wszystkie dostępne są już zaznaczone, odznaczamy je. Wpp. zaznaczamy wszystkie dostępne.
        const allAvailableSelected = availableTasks.every(t => selectedTask2Ids.includes(t.id));

        if (allAvailableSelected) {
            setSelectedTask2Ids([]);
        } else {
            setSelectedTask2Ids(availableTasks.map(t => t.id));
        }
    };

    // --- LOGIKA POBIERANIA PDF ---
    const downloadPdf = async (url: string, filename: string) => {
        try {
            // Pobieramy token, jeśli go używasz dodatkowo (nie zaszkodzi zostawić)
            const token = localStorage.getItem('token');

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                credentials: 'include' // <-- TO ROZWIĄZUJE PROBLEM 401 (Wysyła ciasteczko sesyjne)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Kod HTTP: ${response.status}\nWiadomość: ${errorText}`);
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error: any) {
            console.error("Failed to download PDF", error);
            alert(`Nie udało się pobrać pliku PDF.\n\nSzczegóły błędu:\n${error.message}`);
        }
    };

    const handlePrintDaily = () => {
        const dateStr = format(currentDate, 'dd-MM-yyyy');
        const url = `${backendUrl}/api/pdf/schedules/special-event/${eventId}/daily?roleName=${roleName}&date=${dateStr}`;
        downloadPdf(url, `Oficja_${roleName}_${dateStr}.pdf`);
    };

    const handlePrintMatrix = () => {
        const url = `${backendUrl}/api/pdf/schedules/special-event/${eventId}/matrix?roleName=${roleName}`;
        downloadPdf(url, `Tabela_${roleName}.pdf`);
    };

    // --- LOGIKA PRZYPISYWANIA ---

    function handleSubmit(userId: number, taskId: number) {
        const dep = userDependencies.find(d => d.userId === userId);
        const udep = dep?.userTasksScheduleInfo?.find(ud => ud.taskId === taskId);
        const task = visibleTasks.find(t => t.id === taskId);
        const limit = task?.participantsLimit || 0;
        const assignedCount = countAssignedUsers(taskId, userDependencies);

        if (udep?.isInConflict && assignedCount >= limit) {
            setPopupData({ userId, taskId, text: "Brat wykonuje inne oficjum (konflikt) ORAZ limit miejsc wyczerpany. Przypisać?" });
            setShowConfirmPopup(true);
        } else if (udep?.isInConflict) {
            setPopupData({ userId, taskId, text: "Brat ma konflikt z innym zadaniem. Przypisać?" });
            setShowConfirmPopup(true);
        } else if (assignedCount >= limit) {
            setPopupData({ userId, taskId, text: "Limit miejsc wyczerpany. Przypisać mimo to?" });
            setShowConfirmPopup(true);
        } else {
            assignToTask(userId, taskId);
        }
    }

    function assignToTask(userId: number, taskId: number) {
        const taskDateStr = dateFormatter.formatDate(format(currentDate, 'dd-MM-yyyy'));
        // Backend wymaga pełnego tygodnia do walidacji
        const weekStartStr = dateFormatter.formatDate(format(startOfWeek(currentDate, {weekStartsOn: 0}), 'dd-MM-yyyy'));
        const weekEndStr = dateFormatter.formatDate(format(endOfWeek(currentDate, {weekStartsOn: 0}), 'dd-MM-yyyy'));

        const reqData = {
            userId: userId,
            taskId: taskId,
            taskDate: taskDateStr,
            weekStartDate: weekStartStr,
            weekEndDate: weekEndStr,
            taskSectionId: currentSectionId
        };

        assignRequest(reqData, () => {
            fetchSchedule();
        }, false, `${backendUrl}/api/schedules/forDailyPeriod?ignoreConflicts=true`, 'POST')
            .then(() => setShowConfirmPopup(false));
    }

    function unassignTask(userId: number, taskId: number) {
        const taskDateStr = dateFormatter.formatDate(format(currentDate, 'dd-MM-yyyy'));
        const weekStartStr = dateFormatter.formatDate(format(startOfWeek(currentDate, {weekStartsOn: 0}), 'dd-MM-yyyy'));
        const weekEndStr = dateFormatter.formatDate(format(endOfWeek(currentDate, {weekStartsOn: 0}), 'dd-MM-yyyy'));

        const reqData = { userId, taskId, taskDate: taskDateStr, weekStartDate: weekStartStr, weekEndDate: weekEndStr, taskSectionId: currentSectionId };

        unassignRequest(reqData, () => fetchSchedule(), false, `${backendUrl}/api/schedules/forDailyPeriod`, 'DELETE');
    }

    const statsOnButton = (numberOfWeeklyAssignsFromStatsDate: number, lastAssignedWeeksAgo: number) => {
        return `${lastAssignedWeeksAgo}|${numberOfWeeklyAssignsFromStatsDate}`;
    }

    // --- RENDEROWANIE KOMÓRKI (ZMODYFIKOWANE) ---
    const renderUserTaskScheduleInfo = (dep: UserTasksScheduleInfoWeekly, udep: UserTaskScheduleInfo, task: Task | undefined) => {
        // 1. Logika ukrywania
        // Sprawdzamy czy task jest specjalny (ma ID eventu)
        const isSpecial = task?.specialEventId !== null && task?.specialEventId !== undefined;
        // Jeśli NIE jest specjalny i NIE mamy pokazywać standardowych -> ukryj
        const isHidden = !isSpecial && !showStandardTasks;
        const hiddenClass = isHidden ? "d-none" : "";

        if (!udep.visible) {
            return (
                <td key={udep.taskId} className={hiddenClass}>
                    <button className="btn btn-secondary" disabled>
                        <FontAwesomeIcon icon={faCircleXmark}/>
                    </button>
                </td>
            );
        }

        if (!udep.hasRoleForTheTask) {
            return (
                <td key={udep.taskId} className={hiddenClass}>
                    <button className="btn btn-secondary" disabled>
                        <FontAwesomeIcon icon={faXmark}/>
                    </button>
                </td>
            );
        }

        // Tło komórki jeśli task pełny
        const cellClass = isTaskFullyAssigned(udep.taskId, visibleTasks, userDependencies) ? "bg-secondary" : "";

        // Łączymy klasę tła z klasą ukrywania
        const finalClass = `${cellClass} ${hiddenClass}`;

        // Logika przycisków
        if (!udep.hasObstacle) {
            if (udep.assignedToTheTask) {
                // PRZYPISANY
                return (
                    <td key={udep.taskId} className={finalClass}>
                        <button
                            className={udep.isInConflict ? 'btn btn-warning' : 'btn btn-success'}
                            onClick={() => unassignTask(dep.userId, udep.taskId)}
                            disabled={assignLoading || unassignLoading}
                        >
                            <span className={udep.isInConflict ? 'highlighted-text-conflict' : ''}>
                                {statsOnButton(udep.numberOfWeeklyAssignsFromStatsDate, udep.lastAssignedWeeksAgo)}
                            </span>
                        </button>
                    </td>
                );
            } else {
                // NIEPRZYPISANY (Można przypisać)
                return (
                    <td key={udep.taskId} className={finalClass}>
                        <button
                            className={udep.isInConflict ? 'btn btn-warning' : 'btn btn-dark'}
                            onClick={() => handleSubmit(dep.userId, udep.taskId)}
                            disabled={assignLoading || unassignLoading}
                        >
                            {statsOnButton(udep.numberOfWeeklyAssignsFromStatsDate, udep.lastAssignedWeeksAgo)}
                        </button>
                    </td>
                );
            }
        } else {
            // MA PRZESZKODĘ
            if (udep.assignedToTheTask) {
                // Przypisany mimo przeszkody
                return (
                    <td key={udep.taskId} className={finalClass}>
                        <button
                            className='btn btn-info'
                            onClick={() => unassignTask(dep.userId, udep.taskId)}
                            disabled={assignLoading || unassignLoading}
                        >
                            <span className='highlighted-text-conflict'>
                                {statsOnButton(udep.numberOfWeeklyAssignsFromStatsDate, udep.lastAssignedWeeksAgo)}
                            </span>
                        </button>
                    </td>
                );
            } else {
                // Przeszkoda, nie przypisany (zablokowany)
                return (
                    <td key={udep.taskId} className={finalClass}>
                        <button className='btn btn-info' disabled={true}>
                            {statsOnButton(udep.numberOfWeeklyAssignsFromStatsDate, udep.lastAssignedWeeksAgo)}
                        </button>
                    </td>
                );
            }
        }
    }

    // --- PASEK DNI EVENTU ---
    const renderDaySelector = () => {
        if (!event) return null;
        const days = eachDayOfInterval({ start: parseISO(event.startDate), end: parseISO(event.endDate) });

        return (
            <div className="d-flex justify-content-center flex-wrap gap-2 mb-3">
                {days.map(day => {
                    const isSelected = format(day, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
                    return (
                        <button
                            key={day.toString()}
                            className={`btn ${isSelected ? 'btn-warning fw-bold text-dark' : 'btn-dark text-white'}`}
                            onClick={() => setCurrentDate(day)}
                            style={{minWidth: '80px'}}
                        >
                            {format(day, 'dd.MM')} <br/>
                            <small>{format(day, 'EEE', { locale: pl })}</small>
                        </button>
                    );
                })}
            </div>
        );
    };

    // --- PASEK SEKCJI (PÓR DNIA) ---
    const renderSectionTabs = () => {
        return (
            <div className="d-flex justify-content-center flex-wrap gap-2 mb-4">
                <button
                    className={`btn ${currentSectionId === null ? 'btn-warning fw-bold text-dark' : 'btn-dark text-white'}`}
                    onClick={() => setCurrentSectionId(null)}
                    style={{minWidth: '100px'}}
                >
                    Wszystkie
                </button>
                {taskSections.map(sec => {
                    const isSelected = currentSectionId === sec.id;
                    return (
                        <button
                            key={sec.id}
                            className={`btn ${isSelected ? 'btn-warning fw-bold text-dark' : 'btn-dark text-white'}`}
                            onClick={() => setCurrentSectionId(sec.id)}
                            style={{minWidth: '100px'}}
                        >
                            {sec.name}
                        </button>
                    );
                })}
            </div>
        );
    };

    function getUserName(userId: number) {
        let user = userDependencies.find(dep => dep.userId === userId);
        return user ? user.userName : "unknown";
    }

    // Funkcja wywoływana po kliknięciu w imię z lewej strony macierzy
    const handleNameClick = (userId: number) => {
        // Pobieramy pełne dane użytkownika, żeby sprawdzić jego role
        fetchUserRequest(null, (user: User) => {
            const isGuest = user.roles.some(r => r.name === 'ROLE_GUEST');
            if (isGuest) {
                // Jeśli to gość, otwieramy modal do edycji
                setGuestToEdit(user);
                setShowGuestModal(true);
            } else {
                // Jeśli to brat, standardowo otwieramy jego historię
                setHistoryPopup({ show: true, userId: userId });
            }
        }, false, `${backendUrl}/api/users/${userId}`, 'GET');
    };

    if (loadingEvent || isFunkcyjnyLoading || !event) return <LoadingSpinner />;
    if (!isFunkcyjny) return <AlertBox text={UNAUTHORIZED_PAGE_TEXT} type="danger" width="500px" />;

    return (
        <div className="fade-in">
            {/* Header stylizowany jak w AddScheduleDaily */}
            <h3 className="fw-bold entity-header-dynamic-size mb-0 mx-4">
                {event.name} - {roleName}
            </h3>
            <center><span className="fs-6 fw-bold">{event.startDate} - {event.endDate}</span></center>

            <div className="mt-3">
                {renderDaySelector()}
            </div>

            {renderSectionTabs()}

            {(errorSchedule || assignError || unassignError) && (
                <AlertBox text={errorSchedule || assignError || unassignError} type="danger" width="500px"/>
            )}


            {/* --- NOWE PRZYCISKI PDF --- */}
            <div className="d-flex justify-content-center gap-2 mb-3">
                <button className="btn btn-warning btn-sm shadow-sm" onClick={handlePrintDaily}>
                    <FontAwesomeIcon icon={faFilePdf} className="me-2"/>
                    Wydruk na dany dzień
                </button>

                <button className="btn btn-warning btn-sm shadow-sm" onClick={handlePrintMatrix}>
                    <FontAwesomeIcon icon={faFilePdf} className="me-2"/>
                    Wydruk całej tabeli ({roleName})
                </button>
            </div>
            {/* PRZYCISKI STERUJĄCE */}
            <div className="d-flex justify-content-center gap-2 mb-3">
                {/* Przycisk 1: Pokaż/Ukryj */}
                <button
                    className="btn btn-dark btn-sm shadow-sm"
                    onClick={() => setShowStandardTasks(!showStandardTasks)}
                >
                    <FontAwesomeIcon icon={showStandardTasks ? faEyeSlash : faEye} className="me-2"/>
                    {showStandardTasks ? "Ukryj obowiązki standardowe" : "Pokaż obowiązki standardowe"}
                </button>

                {/* Przycisk 2: Dodaj Zadanie Specjalne (widoczny jeśli mamy rolę i event) */}
                {currentRoleObj && event && (
                    <button
                        className="btn btn-success btn-sm shadow-sm"
                        onClick={() => {
                            setTaskToEdit(null); // Czyszczenie przed dodaniem
                            setShowAddModal(true);
                        }}
                    >
                        <FontAwesomeIcon icon={faPlus} className="me-2"/>
                        Dodaj zadanie do wydarzenia
                    </button>
                )}
            </div>

            {/* Macierz */}
            {loadingSchedule ? <LoadingSpinner/> : (
                <div className="d-flex-no-media-resize justify-content-center">
                    <div className="table-responsive">
                        <table className="table table-hover table-striped table-rounded table-shadow text-center w-auto mx-auto">
                            <thead className="table-dark sticky-top">
                            <tr>
                                <th>Brat</th>
                                <th>Oficja</th>
                                {visibleTasks?.map(task => {
                                    const isSpecial = task.specialEventId !== null && task.specialEventId !== undefined;
                                    const hiddenClass = (!isSpecial && !showStandardTasks) ? "d-none" : "";

                                    return (
                                        <th
                                            key={task.id}
                                            className={`${(isSpecial) ? "bg-warning text-dark" : ""} ${hiddenClass}`}
                                            style={{cursor: "pointer"}}
                                            onClick={() => {
                                                setTaskToEdit(task);
                                                setShowAddModal(true);
                                            }}
                                        >
                                            {task.nameAbbrev}
                                        </th>
                                    );
                                })}
                            </tr>
                            </thead>
                            <tbody>
                            {userDependencies.map((dep, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <button className="btn btn-info p-1 shadow-sm" onClick={() => handleNameClick(dep.userId)}>
                                            {dep.userName}
                                        </button>
                                    </td>
                                    <td className='max-column-width-200'>
                                        {dep.assignedTasks.map((task, index) => (
                                            <React.Fragment key={index}>
                                                {index !== 0 && ', '}
                                                <strong>{task}</strong>
                                            </React.Fragment>
                                        ))}
                                    </td>

                                    {dep.userTasksScheduleInfo?.map((udep, cellIndex) => {
                                        const correspondingTask = visibleTasks[cellIndex];
                                        return renderUserTaskScheduleInfo(dep, udep, correspondingTask);
                                    })}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- Dodaj gościa --- */}
            <button
                className="btn btn-info btn-sm shadow-sm"
                onClick={() => {
                    setGuestToEdit(null); // Reset przed dodaniem nowego
                    setShowGuestModal(true);
                }}
            >
                <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                Dodaj gościa
            </button>

            {/* --- SEKCJA ZATWIERDZONYCH PRZESZKÓD --- */}
            <div className="d-flex flex-column align-items-center mb-5 mt-5">
                <h3 className="fw-bold entity-header-dynamic-size mb-4 mx-4">
                    Zatwierdzone Przeszkody
                </h3>
                <div className="card shadow-sm w-auto" style={{ minWidth: '800px', maxWidth: '100%' }}>
                    <div className="card-body p-0">
                        {loadingObstacles ? (
                             <div className="text-center p-4"><LoadingSpinner /></div>
                        ) : eventObstacles.length === 0 ? (
                            <div className="text-center text-muted p-4">
                                Brak zatwierdzonych przeszkód w terminie tego wydarzenia.
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover table-striped mb-0 text-center align-middle">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Kto</th>
                                            <th>Kiedy (Dzień + Pory)</th>
                                            <th>Oficja</th>
                                            <th>Opis wniosku</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {eventObstacles.map(obs => (
                                            <tr key={obs.id}>
                                                <td className="fw-bold text-nowrap">
                                                    {obs.user.name} {obs.user.surname}
                                                </td>
                                                <td className="text-nowrap">
                                                    <div className="fw-bold text-danger">
                                                        {format(parseISO(obs.fromDate), 'dd.MM')}
                                                        {obs.fromDate !== obs.toDate && ` - ${format(parseISO(obs.toDate), 'dd.MM')}`}
                                                    </div>
                                                    <div className="small text-muted fw-bold">
                                                        {obs.taskSections && obs.taskSections.length > 0
                                                            ? obs.taskSections.map(s => s.name).join(', ')
                                                            : "Cały dzień"}
                                                    </div>
                                                </td>
                                                <td style={{ maxWidth: '200px' }}>
                                                    <div className="d-flex flex-wrap justify-content-center gap-1">
                                                        {obs.tasks && obs.tasks.length > 0 ? (
                                                            obs.tasks.map(t => (
                                                                <span
                                                                    key={t.id}
                                                                    className="badge bg-primary shadow-sm text-wrap text-break"
                                                                    style={{ lineHeight: '1.4' }}
                                                                >
                                                                    {t.nameAbbrev}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span
                                                                className="badge bg-secondary shadow-sm text-wrap text-break"
                                                                style={{ lineHeight: '1.4' }}
                                                            >
                                                                Wszystkie
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="text-start small" style={{ maxWidth: '300px' }}>
                                                    {obs.applicantDescription || <span className="text-muted fst-italic">Brak opisu</span>}
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

            {/* --- SEKCJA KOLIZJI (POD MACIERZĄ) --- */}
            <div className="d-flex flex-column align-items-center mb-5">
                <h3 className="fw-bold entity-header-dynamic-size mb-4 mx-4">
                    Kolizje
                </h3>

                {/* FORMULARZ DODAWANIA KOLIZJI */}
                <div className="card shadow-sm mb-5" style={{ minWidth: '400px', maxWidth: '100%' }}>
                    <div className="card-header bg-dark text-white">
                        <h6 className="mb-0">Dodaj nową kolizję</h6>
                    </div>
                    <div className="card-body">
                        {/* Krok 1: Oficjum 1 */}
                        <div className="mb-3">
                            <label className="form-label fw-bold">1. Wybierz oficjum specjalne (Baza)</label>
                            <select
                                className="form-select"
                                value={conflictTask1Id}
                                onChange={(e) => setConflictTask1Id(Number(e.target.value) || '')}
                            >
                                <option value="">-- Wybierz oficjum --</option>
                                {specialTasks.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.nameAbbrev})</option>
                                ))}
                            </select>
                        </div>

                        {/* Krok 2: Kategoria dla Oficjum 2 */}
                        <div className="mb-3">
                            <label className="form-label fw-bold">2. Kategoria drugiego oficjum</label>
                            <select
                                className="form-select"
                                value={selectedConflictRole}
                                onChange={(e) => setSelectedConflictRole(e.target.value)}
                            >
                                <option value="">-- Wybierz kategorię --</option>
                                {allRoles.map(r => (
                                    <option key={r.id} value={r.name}>{r.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Krok 3: Wybór konkretnych zadań (Checkbox list) */}
                        <div className="mb-3">
                            <label className="form-label fw-bold">3. Wybierz oficjum(a) kolidujące</label>
                            <div className="border rounded p-2" style={{maxHeight: '200px', overflowY: 'auto', backgroundColor: '#f8f9fa'}}>
                                {!conflictTask1Id ? (
                                    <span className="text-muted small">Wybierz oficjum z punktu 1...</span>
                                ) : selectedConflictRole === '' ? (
                                    <span className="text-muted small">Wybierz kategorię z punktu 2...</span>
                                ) : conflictTasks2.length === 0 ? (
                                    <span className="text-muted small">Brak oficjów w tej kategorii.</span>
                                ) : (
                                    <>
                                        {(() => {
                                            const availableTasks = conflictTasks2.filter(t => !isConflictExisting(t.id));
                                            const allAvailableSelected = availableTasks.length > 0 && availableTasks.every(t => selectedTask2Ids.includes(t.id));

                                            return (
                                                <>
                                                    {/* OPCJA ZAZNACZ WSZYSTKO */}
                                                    <div className="form-check border-bottom pb-2 mb-2">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id="selectAllTasks2"
                                                            checked={allAvailableSelected}
                                                            onChange={handleSelectAllTasks2}
                                                            disabled={availableTasks.length === 0}
                                                        />
                                                        <label className="form-check-label fw-bold small text-primary" htmlFor="selectAllTasks2" style={{cursor: availableTasks.length > 0 ? 'pointer' : 'not-allowed'}}>
                                                            {availableTasks.length === 0 ? "Wszystkie możliwe kolizje już istnieją" : "Zaznacz wszystkie poniższe"}
                                                        </label>
                                                    </div>

                                                    {/* LISTA ZADAŃ */}
                                                    {conflictTasks2.map(t => {
                                                        const alreadyExists = isConflictExisting(t.id);
                                                        return (
                                                            <div className="form-check" key={t.id}>
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    id={`ctask-${t.id}`}
                                                                    // Jeśli istnieje, traktujemy jako checked wizualnie, ale go blokujemy
                                                                    checked={selectedTask2Ids.includes(t.id) || alreadyExists}
                                                                    disabled={alreadyExists}
                                                                    onChange={() => toggleTask2Selection(t.id)}
                                                                />
                                                                <label
                                                                    className={`form-check-label small ${alreadyExists ? 'text-muted' : ''}`}
                                                                    htmlFor={`ctask-${t.id}`}
                                                                    style={{cursor: alreadyExists ? 'not-allowed' : 'pointer'}}
                                                                >
                                                                    {t.name}
                                                                    {t.specialEventId && <span className="badge bg-warning text-dark ms-1">Specjalne</span>}
                                                                    {alreadyExists && <span className="badge bg-secondary ms-1">Już dodano</span>}
                                                                </label>
                                                            </div>
                                                        );
                                                    })}
                                                </>
                                            );
                                        })()}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="d-flex justify-content-end mt-4">
                            <button
                                className="btn btn-primary"
                                onClick={handleAddConflict}
                                disabled={!conflictTask1Id || selectedTask2Ids.length === 0 || addConflictLoading}
                            >
                                {addConflictLoading ? <LoadingSpinner /> : <><FontAwesomeIcon icon={faPlus} className="me-2"/> Utwórz kolizje</>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* TABELA AKTYWNYCH KOLIZJI */}
                <div className="card shadow-sm w-auto" style={{ minWidth: '600px', maxWidth: '100%' }}>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover table-striped mb-0 text-center align-middle">
                                <thead className="table-dark">
                                    <tr>
                                        <th style={{ width: '30%' }}>Oficjum Specjalne</th>
                                        <th style={{ width: '70%' }}>Koliduje z...</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {specialTasks.length === 0 && (
                                        <tr><td colSpan={2} className="text-muted p-4">Brak oficjów specjalnych w tej kategorii.</td></tr>
                                    )}
                                    {specialTasks.map(spcTask => {
                                        const relatedConflicts = allConflicts.filter(c => c.task1.id === spcTask.id || c.task2.id === spcTask.id);

                                        if (relatedConflicts.length === 0) return null;

                                        return (
                                            <tr key={spcTask.id}>
                                                <td className="fw-bold border-end">{spcTask.name}</td>
                                                <td className="text-start p-3">
                                                    <div className="d-flex flex-wrap gap-2">
                                                        {relatedConflicts.map(c => {
                                                            const otherTask = c.task1.id === spcTask.id ? c.task2 : c.task1;
                                                            return (
                                                                <span key={c.id} className="badge bg-danger d-flex align-items-center gap-2 p-2 shadow-sm">
                                                                    {otherTask.name}
                                                                    <FontAwesomeIcon
                                                                        icon={faTrash}
                                                                        style={{cursor: 'pointer', fontSize: '0.9em', opacity: 0.8}}
                                                                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                                                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                                                                        onClick={() => handleDeleteConflict(c.id)}
                                                                        title="Usuń tę kolizję"
                                                                    />
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {showConfirmPopup &&
                <ConfirmAssignmentPopup
                    text={popupData.text}
                    onHandle={() => assignToTask(popupData.userId, popupData.taskId)}
                    onClose={() => setShowConfirmPopup(false)}
                />
            }

            {historyPopup.show &&
                <UserShortScheduleHistoryPopup
                onClose={() => setHistoryPopup({show:false, userId: 0})}
                userId={historyPopup.userId}
                userName={getUserName(historyPopup.userId)}
                date={format(startOfWeek(currentDate, {weekStartsOn: 0}), 'dd-MM-yyyy')}
                weeks={5}
                />
            }

            {/* Modal dodawania/edycji nowego taska */}
            {showAddModal && event && currentRoleObj && (
                <SpecialEventTaskModal
                    eventId={event.id}
                    supervisorRole={currentRoleObj}
                    onClose={() => {
                        setShowAddModal(false);
                        setTaskToEdit(null); // Czyszczenie przy zamykaniu
                    }}
                    onSave={handleTaskAdded}
                    // ZMIANA: Przekazujemy stan zamiast null
                    taskToEdit={taskToEdit}
                />
            )}

            {/* Modal dodawania/edycji Gościa */}
            {showGuestModal && (
                <GuestUserModal
                    guestToEdit={guestToEdit}
                    onClose={() => setShowGuestModal(false)}
                    onSave={() => {
                        setShowGuestModal(false);
                        fetchSchedule();
                    }}
                />
            )}
        </div>
    );
}

export default AddScheduleSpecialEvent;