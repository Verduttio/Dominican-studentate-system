import React, {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import useHttp from '../../services/UseHttp';
import {backendUrl} from "../../utils/constants";
import {Task, UserTaskDependencyWeekly} from "../../models/Interfaces";
import {DateFormatter} from "../../utils/DateFormatter";
import TaskInfo from "../task/TaskInfo";
import LoadingSpinner from "../../components/LoadingScreen";
import ConfirmAssignmentPopup from "./ConfirmAssignmentPopup";


const ScheduleCreatorAssignToTaskWeekly = () => {
    const [userDependencies, setUserDependencies] = useState<UserTaskDependencyWeekly[]>([]);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const taskId = queryParams.get('taskId');
    const from = queryParams.get('from');
    const to = queryParams.get('to');
    const fetchUrl = `${backendUrl}/api/schedules/task/${taskId}/user-dependencies/weekly?from=${from}&to=${to}`;
    const { error: assignToTaskError, request: assignToTaskRequest, loading: assignToTaskLoading } = useHttp(
        `${backendUrl}/api/schedules/forWholePeriod?ignoreConflicts=true`, 'POST');
    const { error: unassignTaskError, request: unassignTaskRequest, loading: unassignTaskLoading } = useHttp(
        `${backendUrl}/api/schedules/forWholePeriod`, 'DELETE');
    const [showConfirmAssignmentPopup, setShowConfirmAssignmentPopup] = useState(false);

    const { request, error, loading } = useHttp(fetchUrl, 'GET');
    const dateFormatter = new DateFormatter("dd-MM-yyyy", "yyyy-MM-dd");
    const [refreshData, setRefreshData] = useState(false);
    const [userIdAssignPopupData, setUserIdAssignPopupData] = useState(0);
    const [task, setTask] = useState<Task>();
    const { request: fetchTaskRequest, error: fetchTaskError, loading: fetchTaskLoading } = useHttp(`${backendUrl}/api/tasks/${taskId}`, 'GET');
    const [confirmAssignmentPopupText, setConfirmAssignmentPopupText] = useState("Czy na pewno chcesz przypisać użytkownika do zadania?");

    useEffect(() => {
        request(null, (data) => setUserDependencies(data));
        fetchTaskRequest(null, setTask);
    }, [request, refreshData, fetchTaskRequest]);

    function countAssignedUsers() {
        return userDependencies.filter(dep => dep.assignedToTheTask).length;
    }

    function handleSubmit(userId: number) {
        const userDependency = userDependencies.find(dep => dep.userId === userId);
        const participantsLimit = task?.participantsLimit ? task.participantsLimit : 0;
        if (userDependency?.isInConflict) {
            setConfirmAssignmentPopupText("Użytkownik wykonuje inne zadanie, które jest w konflikcie z wybranym. Czy na pewno chcesz go wyznaczyć?");
            setUserIdAssignPopupData(userDependency?.userId);
            setShowConfirmAssignmentPopup(true);
        } else if (countAssignedUsers() >= participantsLimit) {
            setConfirmAssignmentPopupText("Do zadania jest przypisana maksymalna liczba uczestników. Czy na pewno chcesz wyznaczyć do tego zadania kolejną osobę?");
            const userId = userDependency?.userId ? userDependency.userId : 0;
            setUserIdAssignPopupData(userId);
            setShowConfirmAssignmentPopup(true);
        } else {
            assignToTask(userId);
        }
    }


    function assignToTask(userId: number) {
        if (taskId != null && from != null && to != null) {

            const requestData = {
                userId: userId,
                taskId: parseInt(taskId),
                fromDate: dateFormatter.formatDate(from),
                toDate: dateFormatter.formatDate(to)
            };

            console.log(requestData);

            assignToTaskRequest(requestData, () => {setRefreshData(prev => !prev);})
                .then(() => setShowConfirmAssignmentPopup(false));
        } else {
            console.log("taskId, from or to is null")
        }
    }

    function unassignTask(userId: number) {
        if (taskId != null && from != null && to != null) {
            const requestData = {
                userId: userId,
                taskId: parseInt(taskId),
                fromDate: dateFormatter.formatDate(from),
                toDate: dateFormatter.formatDate(to)
            };

            console.log(requestData);

            unassignTaskRequest(requestData, () => {setRefreshData(prev => !prev);});
        } else {
            console.log("taskId, from or to is null")
        }
    }


    if (loading || fetchTaskLoading) return <LoadingSpinner/>;
    if (error || fetchTaskError) return <div className="alert alert-error">{error || fetchTaskError}</div>;

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <TaskInfo taskId={taskId}/>
            </div>
            <h4 className=" fw-bold entity-header-dynamic-size">Tworzysz harmonogram od: {from}, do: {to}</h4>
            {assignToTaskError && <div className="alert alert-danger text-center">{assignToTaskError}</div>}
            {unassignTaskError && <div className="alert alert-danger text-center">{unassignTaskError}</div>}
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
                    <th>Akcja</th>
                </tr>
                </thead>
                <tbody>
                {userDependencies.map((dep, index) => (
                    <tr key={index}
                        className={dep.assignedToTheTask ? 'table-success' : dep.hasObstacle ? 'table-primary' : dep.isInConflict ? 'table-warning' : ''}
                    >
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
                                dep.assignedToTheTask ? (
                                    <button className="btn btn-outline-dark" onClick={() => {unassignTask(dep.userId)}} disabled={assignToTaskLoading || unassignTaskLoading}>
                                        Odznacz
                                    </button>
                                ) : (
                                    <button className="btn btn-dark" onClick={() => handleSubmit(dep.userId)}
                                            disabled={assignToTaskLoading || unassignTaskLoading}>
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

export default ScheduleCreatorAssignToTaskWeekly;
