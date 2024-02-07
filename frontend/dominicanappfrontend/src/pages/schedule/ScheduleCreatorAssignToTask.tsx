import React, {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import useHttp from '../../services/UseHttp';
import {backendUrl} from "../../utils/constants";
import {UserTaskDependency} from "../../models/interfaces";
import {DateFormatter} from "../../utils/DateFormatter";


const ScheduleCreatorAssignToTask = () => {
    const [userDependencies, setUserDependencies] = useState<UserTaskDependency[]>([]);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const taskId = queryParams.get('taskId');
    const from = queryParams.get('from');
    const to = queryParams.get('to');
    const fetchUrl = `${backendUrl}/api/schedules/task/${taskId}/user-dependencies?from=${from}&to=${to}`;
    const { error: assignToTaskError, request: assignToTaskRequest, loading: assignToTaskLoading } = useHttp(
        `${backendUrl}/api/schedules/forWholePeriod?ignoreConflicts=true`, 'POST');

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


    if (loading) return <div>Ładowanie...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div>
            <h1>Zależności użytkowników dla zadania {taskId}</h1>
            <p>Tworzysz harmonogram od: {from}, do: {to}</p>
            {assignToTaskError && <div className="error-message">{assignToTaskError}</div>}
            <table>
                <thead>
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
                    <tr key={index} style={{ backgroundColor: dep.assignedToTheTask ? 'green' : dep.hasObstacle ? 'blue' : dep.isInConflict ? 'orange' : 'grey' }}>
                        <td>{dep.userId}</td>
                        <td>{dep.userName}</td>
                        <td>{dep.lastAssigned}</td>
                        <td>{dep.numberOfAssignsInLastYear}</td>
                        <td>{dep.assignedTasks.join(', ')}</td>
                        <td>{dep.isInConflict ? 'Tak' : 'Nie'}</td>
                        <td>{dep.hasObstacle ? 'Tak' : 'Nie'}</td>
                        <td>{dep.assignedToTheTask ? 'Tak' : 'Nie'}</td>
                        <td>
                            <button onClick={() => handleSubmit(dep.userId)} disabled={assignToTaskLoading}>Przypisz</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ScheduleCreatorAssignToTask;
