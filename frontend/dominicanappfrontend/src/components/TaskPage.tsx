import React, { useState, useEffect } from 'react';
import LogoutButton from "./LogoutButton";
import useHttp from "../services/UseHttp";

interface Role {
    id: number;
    name: string;
}

interface Task {
    id: number;
    name: string;
    category: string;
    participantsLimit: number;
    permanent: boolean;
    participantForWholePeriod: boolean;
    allowedRoles: Role[];
    daysOfWeek: string[];
}

function TasksPage () {
    const [tasks, setTasks] = useState<Task[]>([]);
    const { error, loading, request } = useHttp('http://localhost:8080/api/tasks', 'GET');

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