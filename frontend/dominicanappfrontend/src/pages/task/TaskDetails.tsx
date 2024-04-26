import AlertBox from "../../components/AlertBox";
import {Task} from "../../models/Interfaces";
import React, {useEffect, useState} from "react";
import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";
import {useParams} from "react-router-dom";
import LoadingSpinner from "../../components/LoadingScreen";
import {daysOfWeekTranslation} from "../../models/DayOfWeek";

function TaskDetails () {
    const { taskId } = useParams();
    const { request: fetchTask, error: errorFetchingTask, loading: loadingFetchingTask } = useHttp(`${backendUrl}/api/tasks/${taskId}`, 'GET');
    const [task, setTask] = useState<Task>();

    useEffect(() => {
        fetchTask(null, setTask);
    }, [fetchTask]);

    if (loadingFetchingTask) return <LoadingSpinner />;
    if (errorFetchingTask) return <AlertBox text={errorFetchingTask} type={'danger'} width={'500px'}/>;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h2 className="entity-header-dynamic-size">Szczegóły oficjum</h2>
            </div>
            <div className="table-responsive d-flex justify-content-center">
                <div className="table-responsive" style={{maxWidth: '500px'}}>
                    <table className="table table-hover table-striped table-rounded table-shadow">
                        <tbody>
                        <tr>
                            <th className="table-dark">Id</th>
                            <td>{task?.id}</td>
                        </tr>
                        <tr>
                            <th className="table-dark">Skrót</th>
                            <td>{task?.nameAbbrev}</td>
                        </tr>
                        <tr>
                            <th className="table-dark">Nazwa</th>
                            <td>{task?.name}</td>
                        </tr>
                        <tr>
                            <th className="table-dark">Dni tygodnia</th>
                            <td>{task?.daysOfWeek.map(day => daysOfWeekTranslation[day]).join(", ")}</td>
                        </tr>
                        <tr>
                            <th className="table-dark">Wyznaczający</th>
                            <td>{task?.supervisorRole.name}</td>
                        </tr>
                        <tr>
                            <th className="table-dark">Może wykonać</th>
                            <td>
                                {task?.allowedRoles.map(role => role.name).join(", ")}
                            </td>
                        </tr>
                        <tr>
                            <th className="table-dark">Limit braci</th>
                            <td>{task?.participantsLimit}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default TaskDetails;