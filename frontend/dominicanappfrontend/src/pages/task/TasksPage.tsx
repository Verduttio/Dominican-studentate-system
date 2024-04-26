import React, { useState, useEffect } from 'react';
import useHttp from "../../services/UseHttp";
import { Task } from "../../models/Interfaces";
import {useLocation, useNavigate} from "react-router-dom";
import {backendUrl} from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";
import useIsAdmin from "../../services/UseIsFunkcyjny";
import AlertBox from "../../components/AlertBox";


function TasksPage () {
    const [tasks, setTasks] = useState<Task[]>([]);
    const { error, loading, request } = useHttp(`${backendUrl}/api/tasks`, 'GET');
    const { isFunkcyjny} = useIsAdmin();
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
                <h1 className="entity-header">Oficja</h1>
            </div>
            <div className="d-flex justify-content-center">
                {locationStateMessage && <AlertBox text={locationStateMessage} type={'success'} width={'500px'}/>}
            </div>
            {isFunkcyjny &&
                <div className="d-flex justify-content-center">
                    <button className="btn btn-primary mb-3" onClick={() => navigate('/add-task')}>Dodaj oficjum</button>
                </div>
            }
            <div className="d-flex justify-content-center">
                <div className="table-responsive" style={{maxWidth: '400px'}}>
                    <table className="table table-hover table-striped table-rounded table-shadow">
                        <thead className="table-dark">
                        <tr>
                            <th>Nazwa</th>
                            <th>Akcja</th>
                        </tr>
                        </thead>
                        <tbody>
                        {tasks.map(task => (
                            <tr key={task.id}>
                                <td>[{task.nameAbbrev}] {task.name}</td>
                                {isFunkcyjny ? (
                                    <td>
                                        <button className="btn btn-primary" onClick={() => navigate(`/edit-task/${task.id}/`)}>Edytuj</button>
                                    </td>
                                ) : (
                                    <td>
                                        <button className="btn btn-dark" onClick={() => navigate(`/tasks/details/${task.id}/`)}>Szczegóły</button>
                                    </td>

                                )}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default TasksPage;