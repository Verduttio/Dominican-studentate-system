import React, {useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import useHttp from "../../services/UseHttp";
import {ObstacleData, TaskShortInfo} from "../../models/Interfaces";
import {backendUrl} from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";

function AddMyObstacle() {
    const initialObstacleState: ObstacleData = {
        userId: 0,
        taskId: 0,
        fromDate: '',
        toDate: '',
        applicantDescription: ''
    };

    const [obstacleData, setObstacleData] = useState<ObstacleData>(initialObstacleState);
    const [validationError, setValidationError] = useState<string>('');
    const { request: postObstacle, error: postError, loading: postLoading } = useHttp(`${backendUrl}/api/obstacles/users/current`, 'POST');
    const [tasks, setTasks] = useState<TaskShortInfo[]>([]);
    const { request: fetchTasks, error: fetchTasksError, loading: loadingFetchTasks } = useHttp(`${backendUrl}/api/tasks/shortInfo`, 'GET');
    const navigate = useNavigate();

    useEffect(() => {
        fetchTasks(null, (data) => setTasks(data));
    }, [fetchTasks]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!obstacleData.taskId || !obstacleData.fromDate || !obstacleData.toDate) {
            setValidationError('Wypełnij wymagane pola');
            return;
        }

        postObstacle(obstacleData, () => {
            navigate('/user-profile');
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setValidationError('');
        setObstacleData({ ...obstacleData, [e.target.name]: e.target.value });
    };

    const handleTaskChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setValidationError('');
        setObstacleData({ ...obstacleData, taskId: parseInt(e.target.value) });
    }

    if(loadingFetchTasks) return <LoadingSpinner/>;
    if(fetchTasksError) return <div className="alert alert-danger">{fetchTasksError}</div>;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Dodaj swoją przeszkodę</h1>
            </div>
            <div className="edit-entity-container">
                {postError && <div className="alert alert-danger">{postError}</div>}
                {validationError && <div className="alert alert-danger">{validationError}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="taskId" className="form-label">Zadanie:</label>
                        <select
                            className="form-select"
                            id="taskId"
                            value={obstacleData.taskId}
                            onChange={handleTaskChange}
                        >
                            <option value="">Wybierz zadanie</option>
                            {tasks.map(task => (
                                <option key={task.id} value={task.id}>
                                    {task.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="fromDate" className="form-label">Data początkowa:</label>
                        <input
                            className="form-control"
                            type="date"
                            id="fromDate"
                            name="fromDate"
                            value={obstacleData.fromDate}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="toDate" className="form-label">Data końcowa:</label>
                        <input
                            className="form-control"
                            type="date"
                            id="toDate"
                            name="toDate"
                            value={obstacleData.toDate}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="applicantDescription" className="form-label">Opis wniosku (opcjonalnie):</label>
                        <textarea
                            className="form-control"
                            id="applicantDescription"
                            name="applicantDescription"
                            value={obstacleData.applicantDescription}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="d-flex justify-content-center">
                        <button className="btn btn-success" type="submit" disabled={postLoading}>Dodaj</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddMyObstacle;
