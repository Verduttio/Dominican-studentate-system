import React, {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import useHttp from '../../services/UseHttp';
import {backendUrl} from "../../utils/constants";
import {Schedule, Task, UserTaskDependency} from "../../models/Interfaces";
import {DateFormatter} from "../../utils/DateFormatter";
import TaskInfo from "../task/TaskInfo";
import LoadingSpinner from "../../components/LoadingScreen";
import ConfirmAssignmentPopup from "./ConfirmAssignmentPopup";


const ScheduleCreatorAssignToTaskDaily = () => {
    const [userDependencies, setUserDependencies] = useState<UserTaskDependency[]>([]);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const taskId = queryParams.get('taskId');
    const from = queryParams.get('from');
    const to = queryParams.get('to');
    const fetchUrl = `${backendUrl}/api/schedules/task/${taskId}/user-dependencies?from=${from}&to=${to}`;
    const { error: assignToTaskError, request: assignToTaskRequest, loading: assignToTaskLoading } = useHttp(
        `${backendUrl}/api/schedules/forDailyPeriod?ignoreConflicts=true`, 'POST');
    const { error: unassignTaskError, request: unassignTaskRequest, loading: unassignTaskLoading } = useHttp(
        `${backendUrl}/api/schedules/forDailyPeriod`, 'DELETE');

    const { request, error, loading } = useHttp(fetchUrl, 'GET');
    const dateFormatter = new DateFormatter("dd-MM-yyyy", "yyyy-MM-dd");
    const [task, setTask] = useState<Task | null>(null);
    const { request: fetchTaskRequest, error: fetchTaskError, loading: fetchTaskLoading } = useHttp(`${backendUrl}/api/tasks/${taskId}`, 'GET');
    const [selectedDays, setSelectedDays] = useState<{ [userId: number]: string }>({});
    const [refreshData, setRefreshData] = useState(false);
    const [showConfirmAssignmentPopup, setShowConfirmAssignmentPopup] = useState(false);
    const [userIdAssignPopupData, setUserIdAssignPopupData] = useState(0);
    const [confirmAssignmentPopupText, setConfirmAssignmentPopupText] = useState("Czy na pewno chcesz przypisać użytkownika do zadania?");
    const { request: taskSchedulesRequest, error: taskSchedulesError, loading: taskSchedulesLoading } = useHttp(`${backendUrl}/api/schedules/tasks/${taskId}/week?from=${from}&to=${to}`, 'GET');
    const [taskSchedules, setTaskSchedules] = useState<Schedule[]>([]);


    useEffect(() => {
        fetchTaskRequest(null, setTask);
    }, [fetchTaskRequest]);

    useEffect(() => {
        taskSchedulesRequest(null, (data) => {
            setTaskSchedules(data);
        });
    },[taskSchedulesRequest]);

    useEffect(() => {
        request(null, (data) => {
            setUserDependencies(data);
            // Initialize selectedDays with the first day of task.daysOfWeek for each user
            if (task && task.daysOfWeek.length > 0) {
                const initialSelectedDays: { [userId: number]: string } = {};
                data.forEach((dep: UserTaskDependency) => {
                    initialSelectedDays[dep.userId] = task.daysOfWeek[0];
                });
                setSelectedDays(initialSelectedDays);
            }
        });
    }, [request, task, refreshData, taskSchedulesRequest]);

    const handleDayChange = (userId: number, selectedDay: string) => {
        setSelectedDays(prev => ({
            ...prev,
            [userId]: selectedDay
        }));
    };

    function countAssignedUsersOnSelectedDay(userId: number) {
        if (from == null) return 0;

        const selectedDayOfWeek = selectedDays[userId];
        const taskDate = dateFormatter.getNextDateForDayOfWeek(from, selectedDayOfWeek);
        return taskSchedules.filter(schedule => schedule.date && schedule.date === taskDate).length;
    }

    function handleSubmit(userId: number) {
        const userDependency = userDependencies.find(dep => dep.userId === userId);
        const participantsLimit = task?.participantsLimit ? task.participantsLimit : 0;
        if (userDependency?.isInConflict) {
            setConfirmAssignmentPopupText("Użytkownik wykonuje inne zadanie, które jest w konflikcie z wybranym. Czy na pewno chcesz go wyznaczyć?");
            setUserIdAssignPopupData(userDependency?.userId);
            setShowConfirmAssignmentPopup(true);
        } else if (countAssignedUsersOnSelectedDay(userId) >= participantsLimit) {
            setConfirmAssignmentPopupText("Do zadania jest przypisana maksymalna liczba uczestników. Czy na pewno chcesz wyznaczyć do tego zadania kolejną osobę?");
            const userId = userDependency?.userId ? userDependency.userId : 0;
            setUserIdAssignPopupData(userId);
            setShowConfirmAssignmentPopup(true);
        } else {
            assignToTask(userId);
        }
    }

    function assignToTask(userId: number) {
        if (taskId != null && from != null && to != null && selectedDays[userId]) {
            const selectedDayOfWeek = selectedDays[userId];
            const taskDate = dateFormatter.getNextDateForDayOfWeek(from, selectedDayOfWeek);

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
            console.log("selected day: ", selectedDays[userId]);
            console.log("taskId, from, to or selected day is null")
        }
    }

    function unassignTask(userId: number) {
        if (taskId != null && from != null && to != null && selectedDays[userId]) {
            const selectedDayOfWeek = selectedDays[userId];
            const taskDate = dateFormatter.getNextDateForDayOfWeek(from, selectedDayOfWeek);

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
            console.log("selected day: ", selectedDays[userId]);
            console.log("taskId, from, to or selected day is null")
        }
    }


    if (loading || fetchTaskLoading || taskSchedulesLoading) return <LoadingSpinner/>;
    if (error || fetchTaskError || taskSchedulesError) return <div className="alert alert-danger">{error || fetchTaskError || taskSchedulesError}</div>;

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <TaskInfo taskId={taskId}/>
            </div>
            <h4 className=" fw-bold entity-header-dynamic-size">Tworzysz harmonogram od: {from}, do: {to}</h4>
            {assignToTaskError && <div className="alert alert-danger">{assignToTaskError}</div>}
            {unassignTaskError && <div className="alert alert-danger">{unassignTaskError}</div>}
            <table className="table table-hover table-striped table-responsive table-rounded table-shadow">
                <thead className="table-dark">
                <tr>
                    <th>UserId</th>
                    <th>Imię i nazwisko</th>
                    <th>Ostatnio wykonany</th>
                    <th>Dni z zadaniem (ostatni rok)</th>
                    <th>Aktualne taski</th>
                    <th>Konflikt</th>
                    <th>Przeszkoda</th>
                    <th>Już wyznaczony</th>
                    <th>Dzień tygodnia</th>
                    <th>Akcja</th>
                </tr>
                </thead>
                <tbody>
                {userDependencies.map((dep, index) => (
                    <tr key={index}
                        className={dep.assignedToTheTask ? 'table-success' : dep.hasObstacle ? 'table-primary' : dep.isInConflict ? 'table-warning' : ''}>
                        <td>{dep.userId}</td>
                        <td>{dep.userName}</td>
                        <td>{dep.lastAssigned}</td>
                        <td>{dep.numberOfAssignsInLastYear}</td>
                        <td>{dep.assignedTasks.join(', ')}</td>
                        <td>{dep.isInConflict ? 'Tak' : 'Nie'}</td>
                        <td>{dep.hasObstacle ? 'Tak' : 'Nie'}</td>
                        <td>{dep.assignedToTheTask ? 'Tak' : 'Nie'}</td>
                        <td>
                            {!dep.hasObstacle && (
                                task && (
                                    <select onChange={(e) => handleDayChange(dep.userId, e.target.value)}
                                            value={selectedDays[dep.userId] || ''}
                                            className={`form-select ${dep.assignedToTheTask ? 'disabled' : ''}`}
                                    >
                                        {task.daysOfWeek.map(day => (
                                            <option key={day} value={day}>{day}</option>
                                        ))}
                                    </select>
                                )
                            )}
                        </td>
                        <td>
                            {!dep.hasObstacle && (
                                dep.assignedToTheTask ? (
                                    <button
                                        className="btn btn-outline-dark"
                                        onClick={() => unassignTask(dep.userId)}
                                        disabled={assignToTaskLoading || unassignTaskLoading}
                                    >
                                        Odznacz
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-dark"
                                        onClick={() => handleSubmit(dep.userId)}
                                        disabled={assignToTaskLoading || unassignTaskLoading}
                                    >
                                        Przypisz
                                    </button>
                                )
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            {showConfirmAssignmentPopup && <ConfirmAssignmentPopup
                onHandle={() => {assignToTask(userIdAssignPopupData)}}
                onClose={() => {setShowConfirmAssignmentPopup(false)}}
                text={confirmAssignmentPopupText}
            />}
        </div>
    );
};

export default ScheduleCreatorAssignToTaskDaily;
