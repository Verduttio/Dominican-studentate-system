import React, { useState, useEffect } from 'react';
import LogoutButton from "../../components/LogoutButton";
import useHttp from "../../services/UseHttp";
import { Task } from "../../models/interfaces";
import {useNavigate} from "react-router-dom";
import {backendUrl} from "../../utils/constants";


function TasksPage () {
    const [tasks, setTasks] = useState<Task[]>([]);
    const { error, loading, request } = useHttp(`${backendUrl}/api/tasks`, 'GET');
    const navigate = useNavigate();

    useEffect(() => {
        request(null, (data) => setTasks(data))
            .then(() => {});
    }, [request]);

    if (loading) return <div>Ładowanie...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div>
            <h2>Lista Tasków</h2>
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Nazwa</th>
                    <th>Limit uczestników</th>
                    <th>Stały</th>
                    <th>Cały okres</th>
                    <th>Dozwolone role</th>
                    <th>Wyznaczający</th>
                    <th>Dni tygodnia</th>
                </tr>
                </thead>
                <tbody>
                {tasks.map(task => (
                    <tr key={task.id}>
                        <td>{task.id}</td>
                        <td>{task.name}</td>
                        <td>{task.participantsLimit}</td>
                        <td>{task.permanent ? 'Tak' : 'Nie'}</td>
                        <td>{task.participantForWholePeriod ? 'Tak' : 'Nie'}</td>
                        <td>{task.allowedRoles.map(role => role.name).join(', ')}</td>
                        <td>{task.supervisorRoles.map(role => role.name).join(', ')}</td>
                        <td>{task.daysOfWeek.join(', ')}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <LogoutButton/>
            <button onClick={() => navigate('/add-task')}>Dodaj taska!</button>
        </div>
    );
}

export default TasksPage;