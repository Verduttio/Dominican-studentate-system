import React, { useEffect, useState } from 'react';
import useHttp from '../../services/UseHttp';
import { backendUrl } from "../../utils/constants";
import { Task } from "../../models/Interfaces";
import LoadingSpinner from "../../components/LoadingScreen";

interface TaskInfoProps {
    taskId: string | null
}

const TaskInfo: React.FC<TaskInfoProps> = ({ taskId }) => {
    const [task, setTask] = useState<Task | null>(null);
    const { request, error, loading } = useHttp(`${backendUrl}/api/tasks/${taskId}`, 'GET');

    useEffect(() => {
        request(null, setTask);
    }, [request, taskId]);

    if (loading) return <LoadingSpinner/>;
    if (error) return <div className="alert alert-danger">Błąd: {error}</div>;
    if (!task) return <div className="alert alert-danger">Nie znaleziono zadania.</div>;

    return (
        <div className="fade-in">
            <h2 className="mb-4 entity-header-dynamic-size">Szczegóły zadania</h2>
                <table className="table table-hover table-striped table-responsive table-rounded table-shadow">
                    <tbody>
                    <tr>
                        <th className="table-dark">ID</th>
                        <td>{task.id}</td>
                    </tr>
                    <tr>
                        <th className="table-dark">Nazwa</th>
                        <td>{task.name}</td>
                    </tr>
                    <tr>
                        <th className="table-dark">Limit uczestników</th>
                        <td>{task.participantsLimit}</td>
                    </tr>
                    <tr>
                        <th className="table-dark">Stałe</th>
                        <td>{task.permanent ? 'Tak' : 'Nie'}</td>
                    </tr>
                    <tr>
                        <th className="table-dark">Uczestnik na cały okres</th>
                        <td>{task.participantForWholePeriod ? 'Tak' : 'Nie'}</td>
                    </tr>
                    <tr>
                        <th className="table-dark">Role, które mogą wykonać zadanie</th>
                        <td>
                            <ul className="list-unstyled">
                                {task.allowedRoles.map(role => <li key={role.id}>{role.name}</li>)}
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <th className="table-dark">Role, które mogą wyznaczać do zadania</th>
                        <td>
                            <ul className="list-unstyled">
                                {task.supervisorRoles.map(role => <li key={role.id}>{role.name}</li>)}
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <th className="table-dark">Dni tygodnia</th>
                        <td>
                            <ul className="list-unstyled">
                                {task.daysOfWeek.map((day, index) => <li key={index}>{day}</li>)}
                            </ul>
                        </td>
                    </tr>
                    </tbody>
                </table>
        </div>

    );
};

export default TaskInfo;
