import React, { useState, useEffect } from 'react';
import useHttp from "../../services/UseHttp";
import { Task } from "../../models/Interfaces";
import {useLocation, useNavigate} from "react-router-dom";
import {backendUrl} from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";
import useIsFunkcyjny from "../../services/UseIsFunkcyjny";
import AlertBox from "../../components/AlertBox";


function TasksPage () {
    const [tasks, setTasks] = useState<Task[]>([]);
    const { error, loading, request } = useHttp(`${backendUrl}/api/tasks`, 'GET');
    const { isFunkcyjny, isFunkcyjnyLoading, isFunkcyjnyError } = useIsFunkcyjny();
    const navigate = useNavigate();
    const location = useLocation();
    const locationStateMessage = location.state?.message;

    useEffect(() => {
        request(null, (data) => setTasks(data))
            .then(() => {});
    }, [request]);

    if (loading) return <LoadingSpinner/>;
    if (error) return <AlertBox text={error} type={'danger'} width={'500px'}/>;

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <h1 className="entity-header">Zadania</h1>
            </div>
            <div className="d-flex justify-content-center">
                {locationStateMessage && <AlertBox text={locationStateMessage} type={'success'} width={'500px'}/>}
            </div>
            <div className="d-flex justify-content-center">
                <div className="table-responsive" style={{maxWidth: '800px'}}>
                    <table className="table table-hover table-striped table-rounded table-shadow">
                        <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Nazwa</th>
                            <th>Limit uczestników</th>
                            <th>Cały okres</th>
                            <th>Dozwolone role</th>
                            <th>Wyznaczający</th>
                            {isFunkcyjny && <th>Edytuj</th>}
                        </tr>
                        </thead>
                        <tbody>
                        {tasks.map(task => (
                            <tr key={task.id}>
                                <td>{task.id}</td>
                                <td>[{task.nameAbbrev}] {task.name}</td>
                                <td>{task.participantsLimit}</td>
                                <td>{task.participantForWholePeriod ? 'Tak' : 'Nie'}</td>
                                <td className="max-column-width">{task.allowedRoles.map(role => role.name).join(', ')}</td>
                                <td className="max-column-width">{task.supervisorRole?.name}</td>
                                {isFunkcyjny &&
                                    <td>
                                        <button className="btn btn-primary" onClick={() => navigate(`/edit-task/${task.id}/`)}>Edytuj</button>
                                    </td>
                                }
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isFunkcyjny &&
                <div className="d-flex justify-content-center">
                    <button className="btn btn-primary m-1" onClick={() => navigate('/add-task')}>Dodaj zadanie</button>
                </div>
            }
        </div>
    );
}

export default TasksPage;