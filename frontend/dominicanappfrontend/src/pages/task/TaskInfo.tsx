import React, { useEffect, useState } from 'react';
import useHttp from '../../services/UseHttp';
import { backendUrl } from "../../utils/constants";
import { Task } from "../../models/Interfaces";
import LoadingSpinner from "../../components/LoadingScreen";
import {faChevronDown, faChevronUp} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import "./TaskInfo.css";
import {daysOfWeekTranslation} from "../../models/DayOfWeek";
import AlertBox from "../../components/AlertBox";

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
    if (error) return <AlertBox text={error} type={'danger'} width={'500px'}/>;
    if (!task) return <AlertBox text={"Nie znaleziono oficjum"} type={'danger'} width={'500px'}/>;

    return (
    <div className="fade-in">
        <div className="table-responsive d-flex justify-content-center">
            <table className="table table-hover table-striped table-rounded table-shadow">
                <tbody>
                    <tr>
                        <th className="table-dark">Oficjum</th>
                        <td>[{task.nameAbbrev}] {task.name}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div className={isExpanded ? 'detailsVisible table-responsive d-flex justify-content-center' : 'detailsHidden'}>
            <table className="table table-hover table-striped table-rounded table-shadow">
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
                            <th className="table-dark">Role, które mogą wykonać oficjum</th>
                            <td>
                                <ul className="list-unstyled">
                                    {task.allowedRoles.map(role => <li key={role.id}>{role.name}</li>)}
                                </ul>
                            </td>
                        </tr>
                        <tr>
                            <th className="table-dark">Rola umożliwiająca wyznaczanie oficjum</th>
                            <td>
                                {task.supervisorRole.name}
                            </td>
                        </tr>
                        <tr>
                            <th className="table-dark">Dni tygodnia</th>
                            <td>
                                <ul className="list-unstyled">
                                    {task.daysOfWeek.map((day, index) => <li key={index}>{daysOfWeekTranslation[day]}</li>)}
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
