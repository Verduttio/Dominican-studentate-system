import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useHttp from '../../services/UseHttp';
import { backendUrl } from "../../utils/constants";
import {UserTaskDependency} from "../../models/interfaces";

const ScheduleCreatorAssignToTask = () => {
    const [userDependencies, setUserDependencies] = useState<UserTaskDependency[]>([]);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const taskId = queryParams.get('taskId');
    const from = queryParams.get('from');
    const to = queryParams.get('to');
    const fetchUrl = `${backendUrl}/api/schedules/task/${taskId}/user-dependencies?from=${from}&to=${to}`;

    const { request, error, loading } = useHttp(fetchUrl, 'GET');

    useEffect(() => {
        request(null, (data) => setUserDependencies(data));
    }, [request]);

    if (loading) return <div>Ładowanie...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div>
            <h1>Zależności użytkowników dla zadania {taskId}</h1>
            <table>
                <thead>
                <tr>
                    <th>Imię i nazwisko</th>
                    <th>Ostatnio wykonany</th>
                    <th>Liczba wykonania w ostatnim roku</th>
                    <th>Aktualne taski</th>
                    <th>Konflikt</th>
                    <th>Przeszkoda</th>
                </tr>
                </thead>
                <tbody>
                {userDependencies.map((dep, index) => (
                    <tr key={index} style={{ backgroundColor: dep.hasObstacle ? 'green' : dep.isInConflict ? 'orange' : 'grey' }}>
                        <td>{dep.userName}</td>
                        <td>{dep.lastAssigned}</td>
                        <td>{dep.numberOfAssignsInLastYear}</td>
                        <td>{dep.assignedTasks.join(', ')}</td>
                        <td>{dep.isInConflict ? 'Tak' : 'Nie'}</td>
                        <td>{dep.hasObstacle ? 'Tak' : 'Nie'}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ScheduleCreatorAssignToTask;
