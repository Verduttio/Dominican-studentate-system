import React, {useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import useHttp from "../../services/UseHttp";
import {ObstacleData, TaskShortInfo, UserShortInfo} from "../../models/interfaces";
import {backendUrl} from "../../utils/constants";

function AddObstacle() {
    const initialObstacleState: ObstacleData = {
        userId: 0,
        taskId: 0,
        fromDate: '',
        toDate: '',
        applicantDescription: ''
    };

    const [obstacleData, setObstacleData] = useState<ObstacleData>(initialObstacleState);
    const [validationError, setValidationError] = useState<string>('');
    const { request: postObstacle, error: postError } = useHttp(`${backendUrl}/api/obstacles`, 'POST');
    const [users, setUsers] = useState<UserShortInfo[]>([]);
    const { request: fetchUsers, error: fetchUsersError, loading: loadingFetchUser} = useHttp(`${backendUrl}/api/users/shortInfo`, 'GET');
    const [tasks, setTasks] = useState<TaskShortInfo[]>([]);
    const { request: fetchTasks, error: fetchTasksError, loading: loadingFetchTasks } = useHttp(`${backendUrl}/api/tasks/shortInfo`, 'GET');
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers(null, (data) => setUsers(data));
        fetchTasks(null, (data) => setTasks(data));
    }, [fetchUsers, fetchTasks]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!obstacleData.userId || !obstacleData.taskId || !obstacleData.fromDate || !obstacleData.toDate || !obstacleData.applicantDescription) {
            setValidationError('Wszystkie pola muszą być wypełnione.');
            return;
        }

        postObstacle(obstacleData, () => {
            navigate('/obstacles');
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setValidationError('');
        setObstacleData({ ...obstacleData, [e.target.name]: e.target.value });
    };

    const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setValidationError('');
        setObstacleData({ ...obstacleData, userId: parseInt(e.target.value) });
    };

    const handleTaskChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setValidationError('');
        setObstacleData({ ...obstacleData, taskId: parseInt(e.target.value) });
    }

    if(fetchUsersError) return <div className="error-message">{fetchUsersError}</div>;
    if(fetchTasksError) return <div className="error-message">{fetchTasksError}</div>;
    if(loadingFetchUser || loadingFetchTasks) return <div>Ładowanie...</div>;

    return (
        <div className="fade-in">
            {postError && <div className="error-message">{postError}</div>}
            {validationError && <div className="error-message">{validationError}</div>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="userId">Użytkownik:</label>
                    <select id="userId" value={obstacleData.userId} onChange={handleUserChange}>
                        <option value="">Wybierz użytkownika</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.name} {user.surname}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="taskId">Zadanie:</label>
                    <select id="taskId" value={obstacleData.taskId} onChange={handleTaskChange}>
                        <option value="">Wybierz zadanie</option>
                        {tasks.map(task => (
                            <option key={task.id} value={task.id}>
                                {task.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="fromDate">Data Początkowa:</label>
                    <input
                        type="date"
                        id="fromDate"
                        name="fromDate"
                        value={obstacleData.fromDate}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label htmlFor="toDate">Data Końcowa:</label>
                    <input
                        type="date"
                        id="toDate"
                        name="toDate"
                        value={obstacleData.toDate}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label htmlFor="applicantDescription">Opis Wniosku:</label>
                    <textarea
                        id="applicantDescription"
                        name="applicantDescription"
                        value={obstacleData.applicantDescription}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit">Dodaj Przeszkodę</button>
            </form>
        </div>
    );
}

export default AddObstacle;
