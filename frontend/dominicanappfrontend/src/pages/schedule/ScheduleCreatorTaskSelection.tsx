import React, { useEffect, useState } from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import useHttp from '../../services/UseHttp';
import {Task} from '../../models/Interfaces';
import {backendUrl} from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";

const ScheduleCreatorTaskSelection: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const roleName = queryParams.get('roleName');
    const from = queryParams.get('from');
    const to = queryParams.get('to');
    const fetchUrl = `${backendUrl}/api/tasks/bySupervisorRole/${roleName}`;
    const { request, error, loading } = useHttp(fetchUrl, 'GET');
    const navigate = useNavigate();

    useEffect(() => {
        request(null, (data: Task[]) => setTasks(data))
    }, [request]);

    if (loading) return <LoadingSpinner/>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="fade-in">
            <h2 className="entity-header-dynamic-size">Zadania dla roli: {roleName}</h2>
            <h4 className=" fw-bold entity-header-dynamic-size">Tworzysz harmonogram od: {from}, do: {to}</h4>
            {tasks.length > 0 ? (
                    <>
                        {tasks.map(task => (
                            <div className="card mb-4" id="button-scale">
                                <div className="card-body text-center" onClick={() => {navigate(`/schedule-creator/task/chooseMethod?taskId=${task.id}&from=${from}&to=${to}`)}}>
                                    {task.name}
                                </div>
                            </div>
                        ))}
                    </>
                )
                :
                <div className="alert alert-info text-center">Brak zadań dla wybranej roli</div>
            }
        </div>
    )
        ;
};

export default ScheduleCreatorTaskSelection;
