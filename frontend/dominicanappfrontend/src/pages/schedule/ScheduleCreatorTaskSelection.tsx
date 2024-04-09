import React, { useEffect, useState } from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import useHttp from '../../services/UseHttp';
import {Task} from '../../models/Interfaces';
import {backendUrl} from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";
import AlertBox from "../../components/AlertBox";
import useIsFunkcyjny, {UNAUTHORIZED_PAGE_TEXT} from "../../services/UseIsFunkcyjny";

const ScheduleCreatorTaskSelection: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const roleName = queryParams.get('roleName');
    const from = queryParams.get('from');
    const to = queryParams.get('to');
    const fetchUrl = `${backendUrl}/api/tasks/bySupervisorRole/${roleName}`;
    const { request, error, loading } = useHttp(fetchUrl, 'GET');
    const { isFunkcyjny, isFunkcyjnyLoading, isFunkcyjnyInitialized } = useIsFunkcyjny();
    const navigate = useNavigate();

    useEffect(() => {
        request(null, (data: Task[]) => setTasks(data))
    }, [request]);

    if(isFunkcyjnyLoading || isFunkcyjnyInitialized) {
        return <LoadingSpinner/>;
    } else if(!isFunkcyjny) return <AlertBox text={UNAUTHORIZED_PAGE_TEXT} type="danger" width={'500px'} />;

    if (loading) return <LoadingSpinner/>;
    if (error) return <AlertBox text={error} type={'danger'} width={'500px'}/>;

    return (
        <div className="fade-in d-flex flex-column align-items-center">
            <h2 className="entity-header-dynamic-size">Zadania dla roli: {roleName}</h2>
            <h4 className=" fw-bold entity-header-dynamic-size">Tworzysz harmonogram od: {from}, do: {to}</h4>
            {tasks.length > 0 ? (
                    <>
                        {tasks.map(task => (
                            <div className="card mb-4 mw-100" style={{width: "600px"}} id="button-scale" key={task.id}>
                                <div className="card-body text-center" onClick={() => {
                                    navigate(`/schedule-creator/task/chooseMethod?taskId=${task.id}&from=${from}&to=${to}`)
                                }}>
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
