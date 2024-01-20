import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LogoutButton from "./LogoutButton";

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

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/tasks', {
                    withCredentials: true
                });
                setTasks(response.data);
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };

        fetchTasks().then(r => console.log('Tasks fetched'));
    }, []);

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