import React, { useEffect, useState } from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import useHttp from '../../services/UseHttp';
import {Task} from '../../models/interfaces';
import {backendUrl} from "../../utils/constants";

const ScheduleCreatorTaskSelection: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const roleName = queryParams.get('roleName');
    const from = queryParams.get('from');
    const to = queryParams.get('to');
    const fetchUrl = `${backendUrl}/api/schedules/available-tasks/by-supervisor/${roleName}?from=${from}&to=${to}`;
    const { request, error, loading } = useHttp(fetchUrl, 'GET');
    const navigate = useNavigate();

    const getTaskUrl = (task: Task) => {
        const base = `/schedule-creator/task/${task.participantForWholePeriod ? 'assignWeekly' : 'assignDaily'}`;
        const params = `?taskId=${task.id}&from=${from}&to=${to}`;
        return base + params;
    }

    useEffect(() => {
        request(null, (data: Task[]) => setTasks(data))
    }, [request]);

    if (loading) return <div>Ładowanie...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div>
            <h1>Zadania dla roli: {roleName}</h1>
            {tasks.length > 0 ? (
                <ul>
                    {tasks.map(task => (
                        <li key={task.id}>
                            {task.id} - {task.name}
                            <button
                                onClick={() => navigate(getTaskUrl(task))}>Zobacz
                                zależności
                            </button>
                        </li>
                    ))}
                </ul>
            ) : <p>Brak zadań dla wybranej roli.</p>}
        </div>
    );
};

export default ScheduleCreatorTaskSelection;
