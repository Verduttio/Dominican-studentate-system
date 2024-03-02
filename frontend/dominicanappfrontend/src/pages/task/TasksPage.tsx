import React, { useState, useEffect } from 'react';
import useHttp from "../../services/UseHttp";
import { Task } from "../../models/Interfaces";
import {useLocation, useNavigate} from "react-router-dom";
import {backendUrl} from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";


function TasksPage () {
    const [tasks, setTasks] = useState<Task[]>([]);
    const { error, loading, request } = useHttp(`${backendUrl}/api/tasks`, 'GET');
    const navigate = useNavigate();
    const location = useLocation();
    const locationStateMessage = location.state?.message;

    useEffect(() => {
        request(null, (data) => setTasks(data))
            .then(() => {});
    }, [request]);

    if (loading) return <LoadingSpinner/>;
    if (error) return <div className="alert alert-error">{error}</div>;

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <h1 className="entity-header">Zadania</h1>
            </div>
            <div className="d-flex justify-content-center">
                {locationStateMessage && <div className="alert alert-success">{locationStateMessage}</div>}
            </div>
            <table className="table table-hover table-striped table-responsive table-rounded table-shadow">
                <thead className="table-dark">
                <tr>
                    <th>ID</th>
                    <th>Nazwa</th>
                    <th>Limit uczestników</th>
                    <th>Cały okres</th>
                    <th>Dozwolone role</th>
                    <th>Wyznaczający</th>
                    <th>Akcja</th>
                </tr>
                </thead>
                <tbody>
                {tasks.map(task => (
                    <tr key={task.id}>
                        <td>{task.id}</td>
                        <td>{task.name}</td>
                        <td>{task.participantsLimit}</td>
                        <td>{task.participantForWholePeriod ? 'Tak' : 'Nie'}</td>
                        <td className="max-column-width">{task.allowedRoles.map(role => role.name).join(', ')}</td>
                        <td className="max-column-width">{task.supervisorRoles.map(role => role.name).join(', ')}</td>
                        <td>
                            <button
                                className="btn btn-dark"
                                onClick={() => navigate(`/edit-task/${task.id}`)}
                            >
                                Edytuj
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <div className="d-flex justify-content-center">
                <button className="btn btn-success m-1" onClick={() => navigate('/add-task')}>Dodaj zadanie</button>
            </div>
        </div>
    );
}

export default TasksPage;