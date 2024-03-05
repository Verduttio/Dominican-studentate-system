import React, {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import useHttp from '../../services/UseHttp';
import {backendUrl} from "../../utils/constants";
import {Schedule, Task, UserTaskDependencyDaily} from "../../models/Interfaces";
import {DateFormatter} from "../../utils/DateFormatter";
import TaskInfo from "../task/TaskInfo";
import LoadingSpinner from "../../components/LoadingScreen";
import ConfirmAssignmentPopup from "./ConfirmAssignmentPopup";
import "./ScheduleCreatorAssignToTaskDaily.css";


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
                    {task?.daysOfWeek.map((day, index) => (
                        <th key={index}>{day}</th>
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
                                            <span className={dep.isInConflict.includes(day) ? 'highlighted-text-conflict' : ''}>
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
            {showConfirmAssignmentPopup && <ConfirmAssignmentPopup
                onHandle={() => {assignToTask(userIdAssignPopupData, selectedDayOfWeek)}}
                onClose={() => {setShowConfirmAssignmentPopup(false)}}
                text={confirmAssignmentPopupText}
            />}
        </div>
    );
};

export default ScheduleCreatorAssignToTaskDaily;
