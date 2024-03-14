import React, {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import useHttp from '../../services/UseHttp';
import {backendUrl} from "../../utils/constants";
import {Schedule, Task, UserTaskDependencyDaily, UserTaskDependencyWeekly} from "../../models/Interfaces";
import {DateFormatter} from "../../utils/DateFormatter";
import TaskInfo from "../task/TaskInfo";
import LoadingSpinner from "../../components/LoadingScreen";
import ConfirmAssignmentPopup from "./ConfirmAssignmentPopup";
import "./ScheduleCreatorAssignToTaskDaily.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSort, faSortDown, faSortUp} from "@fortawesome/free-solid-svg-icons";
import {daysOfWeekTranslation} from "../../models/DayOfWeek";
import AlertBox from "../../components/AlertBox";

interface SortConfig {
    key: string | null;
    direction: string;
}

const ScheduleCreatorAssignToTaskDaily = () => {
    const [userDependencies, setUserDependencies] = useState<UserTaskDependencyDaily[]>([]);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const taskId = queryParams.get('taskId');
    const from = queryParams.get('from');
    const to = queryParams.get('to');
    const fetchUrl = `${backendUrl}/api/schedules/task/${taskId}/user-dependencies/daily?from=${from}&to=${to}`;
    const { error: assignToTaskError, request: assignToTaskRequest, loading: assignToTaskLoading } = useHttp(
        `${backendUrl}/api/schedules/forDailyPeriod?ignoreConflicts=true`, 'POST');
    const { error: unassignTaskError, request: unassignTaskRequest, loading: unassignTaskLoading } = useHttp(
        `${backendUrl}/api/schedules/forDailyPeriod`, 'DELETE');

    const { request, error, loading } = useHttp(fetchUrl, 'GET');
    const dateFormatter = new DateFormatter("dd-MM-yyyy", "yyyy-MM-dd");
    const [task, setTask] = useState<Task | null>(null);
    const { request: fetchTaskRequest, error: fetchTaskError, loading: fetchTaskLoading } = useHttp(`${backendUrl}/api/tasks/${taskId}`, 'GET');
    const [refreshData, setRefreshData] = useState(false);
    const [showConfirmAssignmentPopup, setShowConfirmAssignmentPopup] = useState(false);
    const [userIdAssignPopupData, setUserIdAssignPopupData] = useState(0);
    const [selectedDayOfWeek, setSelectedDayOfWeek] = useState("Monday");
    const [confirmAssignmentPopupText, setConfirmAssignmentPopupText] = useState("Czy na pewno chcesz przypisać użytkownika do zadania?");
    const { request: taskSchedulesRequest, error: taskSchedulesError, loading: taskSchedulesLoading } = useHttp(`${backendUrl}/api/schedules/tasks/${taskId}/week?from=${from}&to=${to}`, 'GET');
    const [taskSchedules, setTaskSchedules] = useState<Schedule[]>([]);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'ascending' });


    useEffect(() => {
        fetchTaskRequest(null, setTask);
    }, [fetchTaskRequest]);

    useEffect(() => {
        taskSchedulesRequest(null, (data) => {
            setTaskSchedules(data);
        });
    },[taskSchedulesRequest, refreshData]);

    useEffect(() => {
        request(null, (data) => {
            setUserDependencies(data);
            console.log("userDependencies: ", data);
        });
    }, [request, refreshData]);


    function countAssignedUsersOnSelectedDay(dayOfWeek: string) {
        if (from == null) return 0;

        const taskDate = dateFormatter.getNextDateForDayOfWeek(from, dayOfWeek);
        return taskSchedules.filter(schedule => schedule.date && schedule.date === taskDate).length;
    }

    function handleSubmit(userId: number, dayOfWeek: string) {
        const userDependency = userDependencies.find(dep => dep.userId === userId);
        const participantsLimit = task?.participantsLimit ? task.participantsLimit : 0;

        if (userDependency?.isInConflict.includes(dayOfWeek) && countAssignedUsersOnSelectedDay(dayOfWeek) >= participantsLimit) {
            setConfirmAssignmentPopupText("Użytkownik wykonuje inne zadanie, które jest w konflikcie z wybranym. Ponadto do zadania jest już przypisana maksymalna liczba uczesnitków. Czy na pewno chcesz wyznaczyć do tego zadania wybraną osobę?");
            setUserIdAssignPopupData(userDependency?.userId);
            setSelectedDayOfWeek(dayOfWeek);
            setShowConfirmAssignmentPopup(true);
        } else if (userDependency?.isInConflict.includes(dayOfWeek)) {
            setConfirmAssignmentPopupText("Użytkownik wykonuje inne zadanie, które jest w konflikcie z wybranym. Czy na pewno chcesz go wyznaczyć?");
            setUserIdAssignPopupData(userDependency?.userId);
            setSelectedDayOfWeek(dayOfWeek);
            setShowConfirmAssignmentPopup(true);
        } else if (countAssignedUsersOnSelectedDay(dayOfWeek) >= participantsLimit) {
            setConfirmAssignmentPopupText("Do zadania jest przypisana maksymalna liczba uczestników. Czy na pewno chcesz wyznaczyć do tego zadania kolejną osobę?");
            const userId = userDependency?.userId ? userDependency.userId : 0;
            setUserIdAssignPopupData(userId);
            setSelectedDayOfWeek(dayOfWeek);
            setShowConfirmAssignmentPopup(true);
        } else {
            assignToTask(userId, dayOfWeek);
        }
    }

    function assignToTask(userId: number, dayOfWeek: string) {
        if (taskId != null && from != null && to != null) {
            const taskDate = dateFormatter.getNextDateForDayOfWeek(from, dayOfWeek);

            const requestData = {
                userId: userId,
                taskId: parseInt(taskId),
                weekStartDate: dateFormatter.formatDate(from),
                weekEndDate: dateFormatter.formatDate(to),
                taskDate: taskDate
            };

            console.log(requestData);

            assignToTaskRequest(requestData, () => {setRefreshData(prev => !prev);})
                .then(() => setShowConfirmAssignmentPopup(false));
        } else {
            console.log("taskId, from, to or selected day is null")
        }
    }

    function unassignTask(userId: number, dayOfWeek: string) {
        if (taskId != null && from != null && to != null) {
            const taskDate = dateFormatter.getNextDateForDayOfWeek(from, dayOfWeek);

            const requestData = {
                userId: userId,
                taskId: parseInt(taskId),
                weekStartDate: dateFormatter.formatDate(from),
                weekEndDate: dateFormatter.formatDate(to),
                taskDate: taskDate
            };

            console.log(requestData);

            unassignTaskRequest(requestData, () => {setRefreshData(prev => !prev);});
        } else {
            console.log("taskId, from, to or selected day is null")
        }
    }

    const requestSort = (key: keyof UserTaskDependencyWeekly) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    userDependencies.sort((a, b) => {
        if (!sortConfig.key) return 0;

        if (a[sortConfig.key as keyof UserTaskDependencyWeekly] < b[sortConfig.key as keyof UserTaskDependencyWeekly]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key as keyof UserTaskDependencyWeekly ] > b[sortConfig.key as keyof UserTaskDependencyWeekly]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });


    const SortIcon: React.FC<{ keyName: string }> = ({ keyName }) => {
        if (sortConfig.key !== keyName) {
            return <span><FontAwesomeIcon icon={faSort}/></span>;
        }
        return <span>{sortConfig.direction === 'ascending' ? <FontAwesomeIcon icon={faSortUp}/> : <FontAwesomeIcon icon={faSortDown}/>}</span>;
    };


    if (loading || fetchTaskLoading || taskSchedulesLoading) return <LoadingSpinner/>;
    if (error || fetchTaskError || taskSchedulesError) return (
        <AlertBox text={error || fetchTaskError || taskSchedulesError} type={'danger'} width={'500px'}/>
    )

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <TaskInfo taskId={taskId}/>
            </div>
            <h4 className=" fw-bold entity-header-dynamic-size">Tworzysz harmonogram od: {from}, do: {to}</h4>
            {assignToTaskError && <AlertBox text={assignToTaskError} type={'danger'} width={'500px'}/>}
            {unassignTaskError && <AlertBox text={unassignTaskError} type={'danger'} width={'500px'}/>}
            <div className="table-responsive">
                <table className="table table-hover table-striped table-rounded table-shadow">
                    <thead className="table-dark">
                    <tr>
                        <th>UserId</th>
                        <th>Imię i nazwisko</th>
                        <th onClick={() => requestSort('lastAssigned')}>Ostatnio wykonany <SortIcon keyName='lastAssigned'/>
                        </th>
                        <th onClick={() => requestSort('numberOfAssignsInLastYear')}>Dni z zadaniem (ostatni rok) <SortIcon
                            keyName='numberOfAssignsInLastYear'/></th>
                        <th>Aktualne taski</th>
                        {task?.daysOfWeek.map((day, index) => (
                            <th key={index}>{daysOfWeekTranslation[day]}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {userDependencies.map((dep, index) => (
                        <tr key={index}
                            className={dep.assignedToTheTask.length > 0 ? 'table-success' : dep.hasObstacle.length > 0 ? 'table-primary' : dep.isInConflict.length > 0 ? 'table-warning' : ''}
                        >
                            <td>{dep.userId}</td>
                            <td>{dep.userName}</td>
                            <td>{dep.lastAssigned}</td>
                            <td>{dep.numberOfAssignsInLastYear}</td>
                            <td>{dep.assignedTasks.join(', ')}</td>
                            {task?.daysOfWeek.map((day, index) => (
                                <td key={index}>
                                    {(dep.hasObstacle.includes(day)) ? (
                                        <button
                                            className="btn btn-info"
                                            disabled={true}
                                        >
                                            Przeszkoda
                                        </button>
                                    ) : (
                                        (dep.assignedToTheTask.includes(day)) ? (
                                            <button
                                                className={dep.isInConflict.includes(day) ? 'btn btn-warning' : 'btn btn-success'}
                                                onClick={() => unassignTask(dep.userId, day)}
                                                disabled={assignToTaskLoading || unassignTaskLoading}
                                            >
                                                <span
                                                    className={dep.isInConflict.includes(day) ? 'highlighted-text-conflict' : ''}>
                                                    Odznacz
                                                </span>
                                            </button>
                                        ) : (
                                            <button
                                                className={dep.isInConflict.includes(day) ? 'btn btn-warning' : 'btn btn-dark'}
                                                onClick={() => handleSubmit(dep.userId, day)}
                                                disabled={assignToTaskLoading || unassignTaskLoading}
                                            >
                                                Przypisz
                                            </button>
                                        )
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            {showConfirmAssignmentPopup && <ConfirmAssignmentPopup
                onHandle={() => {
                    assignToTask(userIdAssignPopupData, selectedDayOfWeek)
                }}
                onClose={() => {
                    setShowConfirmAssignmentPopup(false)
                }}
                text={confirmAssignmentPopupText}
            />}
            <h4 className="entity-header-dynamic-size">Jeśli użytkownika nie ma na liście, to znaczy, że nie posiada
                roli, która pozwala wykonać zadanie</h4>
            <h4 className="entity-header-dynamic-size">Nadaj użytkownikowi odpowiednią rolę, aby pojawił się na
                liście</h4>
        </div>
    );
};

export default ScheduleCreatorAssignToTaskDaily;
