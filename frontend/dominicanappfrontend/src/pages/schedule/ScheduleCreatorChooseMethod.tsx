import React, { useEffect, useState } from 'react';
import {Link, useLocation} from 'react-router-dom';
import useHttp from '../../services/UseHttp';
import {Task} from '../../models/Interfaces';
import {backendUrl} from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";

const ScheduleCreatorChooseMethod: React.FC = () => {
    const [task, setTask] = useState<Task>();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const taskId = queryParams.get('taskId');
    const from = queryParams.get('from');
    const to = queryParams.get('to');
    const fetchUrl = `${backendUrl}/api/tasks/${taskId}`;
    const { request, error, loading } = useHttp(fetchUrl, 'GET');

    const getTaskUrlWeekly = (taskId: number | undefined) => {
        const base = `/schedule-creator/task/assignWeekly`;
        const params = `?taskId=${taskId}&from=${from}&to=${to}`;
        return base + params;
    }

    const getTaskUrlDaily = (taskId: number | undefined) => {
        const base = `/schedule-creator/task/assignDaily`;
        const params = `?taskId=${taskId}&from=${from}&to=${to}`;
        return base + params;
    }

    useEffect(() => {
        request(null, (data: Task) => setTask(data))
    }, [request]);

    if (loading) return <LoadingSpinner/>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="fade-in">
            <h2 className="entity-header-dynamic-size">Wybierz tryb tworzenia harmonogramu</h2>
            <h3 className="entity-header-dynamic-size">Zadanie: {task?.name}</h3>
            <h4 className=" fw-bold entity-header-dynamic-size">Tworzysz harmonogram od: {from}, do: {to}</h4>
            {task?.participantForWholePeriod && (
                <div className="card mb-4" id="button-scale">
                    <div className="card-body text-center">
                        <Link to={getTaskUrlWeekly(task?.id)}
                              className={"stretched-link text-decoration-none text-black"}
                        >
                            Kreator tygodniowy
                        </Link>
                    </div>
                </div>
            )}
            <div className="card mb-4" id="button-scale">
                <div className="card-body text-center">
                    <Link to={getTaskUrlDaily(task?.id)}
                          className={"stretched-link text-decoration-none text-black"}
                    >
                        Kreator dzienny
                    </Link>
                </div>
            </div>
        </div>
    )
};

export default ScheduleCreatorChooseMethod;
