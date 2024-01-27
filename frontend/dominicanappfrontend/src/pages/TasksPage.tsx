import React, { useState, useEffect } from 'react';
import LogoutButton from "../components/LogoutButton";
import useHttp from "../services/UseHttp";
import { Task } from "../models/interfaces";


function TasksPage () {
    const [tasks, setTasks] = useState<Task[]>([]);
    const { error, func, loading, request } = useHttp('http://localhost:8080/api/tasks', 'GET');

    useEffect(() => {
        request(null, (data) => setTasks(data))
            .then(() => {});
    }, [request]);

    useEffect(() => {
        if (func) {
            func();
        }
    }, [func]);

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
                    <th>Kategoria</th>
                    <th>Limit uczestników</th>
                    <th>Stały</th>
                    <th>Cały okres</th>
                    <th>Dozwolone role</th>
                    <th>Dni tygodnia</th>
                </tr>
                </thead>
                <tbody>
                {tasks.map(task => (
                    <tr key={task.id}>
                        <td>{task.id}</td>
                        <td>{task.name}</td>
                        <td>{task.category}</td>
                        <td>{task.participantsLimit}</td>
                        <td>{task.permanent ? 'Tak' : 'Nie'}</td>
                        <td>{task.participantForWholePeriod ? 'Tak' : 'Nie'}</td>
                        <td>{task.allowedRoles.map(role => role.name).join(', ')}</td>
                        <td>{task.daysOfWeek.join(', ')}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <LogoutButton/>
        </div>
    );
}

export default TasksPage;