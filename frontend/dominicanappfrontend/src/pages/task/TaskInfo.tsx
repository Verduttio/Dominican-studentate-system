import React, { useEffect, useState } from 'react';
import useHttp from '../../services/UseHttp';
import { backendUrl } from "../../utils/constants";
import { Task } from "../../models/Interfaces";
import LoadingSpinner from "../../components/LoadingScreen";
import {faChevronDown, faChevronUp} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import "./TaskInfo.css";

interface TaskInfoProps {
    taskId: string | null
}

const TaskInfo: React.FC<TaskInfoProps> = ({ taskId }) => {
    const [task, setTask] = useState<Task | null>(null);
    const { request, error, loading } = useHttp(`${backendUrl}/api/tasks/${taskId}`, 'GET');
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => setIsExpanded(!isExpanded);

    useEffect(() => {
        request(null, setTask);
    }, [request, taskId]);

    if (loading) return <LoadingSpinner/>;
    if (error) return <div className="alert alert-danger">Błąd: {error}</div>;
    if (!task) return <div className="alert alert-danger">Nie znaleziono zadania.</div>;

    return (
    <div className="fade-in">
        <table className="table table-hover table-striped table-responsive table-rounded table-shadow">
            <tbody>
                <tr>
                    <th className="table-dark">Zadanie</th>
                    <td>{task.name}</td>
                </tr>
            </tbody>
        </table>
        <div className={isExpanded ? 'detailsVisible' : 'detailsHidden'}>
            <table className="table table-hover table-striped table-responsive table-rounded table-shadow">
                <tbody>
                {isExpanded && (
                    <>
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
                            <th className="table-dark">Rola umożliwiająca wyznaczanie zadania</th>
                            <td>
                                {task.supervisorRole.name}
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
                    </>
                )}
                </tbody>
            </table>
        </div>
        <div className="d-flex justify-content-center">
            <button onClick={toggleExpand} className="btn btn-success">
                <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown}/>
                {isExpanded ? ' Schowaj szczegóły ' : ' Rozwiń szczegóły '}
                <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown}/>
            </button>
        </div>
    </div>
)
    ;
};

export default TaskInfo;
