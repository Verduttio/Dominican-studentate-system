import React, { useEffect, useState } from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import useHttp from '../../services/UseHttp';
import {Task} from '../../models/Interfaces';
import {backendUrl} from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";
import AlertBox from "../../components/AlertBox";

const ScheduleCreatorChooseMethod: React.FC = () => {
    const [task, setTask] = useState<Task>();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const taskId = queryParams.get('taskId');
    const from = queryParams.get('from');
    const to = queryParams.get('to');
    const fetchUrl = `${backendUrl}/api/tasks/${taskId}`;
    const { request, error, loading } = useHttp(fetchUrl, 'GET');
    const navigate = useNavigate();

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
    if (error) return <AlertBox text={error} type={'danger'} width={'500px'}/>;

    return (
        <div className="fade-in d-flex flex-column align-items-center">
            <h2 className="entity-header-dynamic-size">Wybierz tryb tworzenia harmonogramu</h2>
            <h3 className="entity-header-dynamic-size">Zadanie: {task?.name}</h3>
            <h4 className=" fw-bold entity-header-dynamic-size">Tworzysz harmonogram od: {from}, do: {to}</h4>
            {task?.participantForWholePeriod && (
                <div className="card mb-4 mw-100" style={{width: "600px"}} id="button-scale">
                    <div className="card-body text-center" onClick={() => navigate(getTaskUrlWeekly(task?.id))}>
                        Kreator tygodniowy
                    </div>
                </div>
            )}
            <div className="card mb-4 mw-100" style={{width: "600px"}} id="button-scale">
                <div className="card-body text-center" onClick={() => {
                    navigate(getTaskUrlDaily(task?.id))
                }}>
                    Kreator dzienny
                </div>
            </div>
        </div>
    )
};

export default ScheduleCreatorChooseMethod;
