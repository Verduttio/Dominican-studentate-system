import React, {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import useHttp from '../../services/UseHttp';
import {backendUrl} from "../../utils/constants";
import {UserTaskDependency} from "../../models/Interfaces";
import {DateFormatter} from "../../utils/DateFormatter";
import TaskInfo from "../task/TaskInfo";
import LoadingSpinner from "../../components/LoadingScreen";


const ScheduleCreatorAssignToTaskWeekly = () => {
    const [userDependencies, setUserDependencies] = useState<UserTaskDependency[]>([]);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const taskId = queryParams.get('taskId');
    const from = queryParams.get('from');
    const to = queryParams.get('to');
    const fetchUrl = `${backendUrl}/api/schedules/task/${taskId}/user-dependencies?from=${from}&to=${to}`;
    const { error: assignToTaskError, request: assignToTaskRequest, loading: assignToTaskLoading } = useHttp(
        `${backendUrl}/api/schedules/forWholePeriod?ignoreConflicts=false`, 'POST');

    const { request, error, loading } = useHttp(fetchUrl, 'GET');
    const dateFormatter = new DateFormatter("dd-MM-yyyy", "yyyy-MM-dd");

    useEffect(() => {
        request(null, (data) => setUserDependencies(data));
    }, [request]);

    function handleSubmit(userId: number) {
        if (taskId != null && from != null && to != null) {
            const requestData = {
                userId: userId,
                taskId: parseInt(taskId),
                fromDate: dateFormatter.formatDate(from),
                toDate: dateFormatter.formatDate(to)
            };

            console.log(requestData);

            assignToTaskRequest(requestData, () => {});
        } else {
            console.log("taskId, from or to is null")
        }
    }


    if (loading) return <LoadingSpinner/>;
    if (error) return <div className="alert alert-error">{error}</div>;

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <TaskInfo taskId={taskId}/>
            </div>
            <h4 className=" fw-bold entity-header-dynamic-size">Tworzysz harmonogram od: {from}, do: {to}</h4>
            {assignToTaskError && <div className="alert alert-danger text-center">{assignToTaskError}</div>}
            <table className="table table-hover table-striped table-responsive table-rounded table-shadow">
                <thead className="table-dark">
                <tr>
                    <th>UserId</th>
                    <th>Imię i nazwisko</th>
                    <th>Ostatnio wykonany</th>
                    <th>Liczba wykonania w ostatnim roku</th>
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
                            <button className="btn btn-dark" onClick={() => handleSubmit(dep.userId)} disabled={assignToTaskLoading}>
                                Przypisz
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ScheduleCreatorAssignToTaskWeekly;
