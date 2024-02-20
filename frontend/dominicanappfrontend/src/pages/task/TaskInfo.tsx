import React, { useEffect, useState } from 'react';
import useHttp from '../../services/UseHttp';
import { backendUrl } from "../../utils/constants";
import { Task } from "../../models/interfaces";

interface TaskInfoProps {
    taskId: string | null
}

const TaskInfo: React.FC<TaskInfoProps> = ({ taskId }) => {
    const [task, setTask] = useState<Task | null>(null);
    const { request, error, loading } = useHttp(`${backendUrl}/api/tasks/${taskId}`, 'GET');

    useEffect(() => {
        request(null, setTask);
    }, [request, taskId]);

    if (loading) return <div>Ładowanie szczegółów zadania...</div>;
    if (error) return <div className="error-message">Błąd: {error}</div>;
    if (!task) return <div>Nie znaleziono zadania.</div>;

    return (
        <div className="fade-in">
            <h2>Szczegóły Zadania:</h2>
            <p>ID: {task.id}</p>
            <p>Nazwa: {task.name}</p>
            <p>Limit uczestników: {task.participantsLimit}</p>
            <p>Stałe: {task.permanent ? 'Tak' : 'Nie'}</p>
            <p>Uczestnik na cały okres: {task.participantForWholePeriod ? 'Tak' : 'Nie'}</p>
            <p>Role, które mogą wykonać zadanie:</p>
            <ul>
                {task.allowedRoles.map(role => <li key={role.id}>{role.name}</li>)}
            </ul>
            <p>Role, które mogą wyznaczyć osoby do zadania:</p>
            <ul>
                {task.supervisorRoles.map(role => <li key={role.id}>{role.name}</li>)}
            </ul>
            <p>Dni tygodnia:</p>
            <ul>
                {task.daysOfWeek.map((day, index) => <li key={index}>{day}</li>)}
            </ul>
        </div>
    );
};

export default TaskInfo;
