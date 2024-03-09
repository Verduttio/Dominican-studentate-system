import React, {useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import useHttp from "../../services/UseHttp";
import {ObstacleData, TaskShortInfo} from "../../models/Interfaces";
import {backendUrl} from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faRectangleXmark} from "@fortawesome/free-solid-svg-icons";

function AddMyObstacle() {
    const initialObstacleState: ObstacleData = {
        userId: 0,
        tasksIds: [],
        fromDate: '',
        toDate: '',
        applicantDescription: ''
    };

    const [obstacleData, setObstacleData] = useState<ObstacleData>(initialObstacleState);
    const [validationError, setValidationError] = useState<string>('');
    const { request: postObstacle, error: postError, loading: postLoading } = useHttp(`${backendUrl}/api/obstacles/users/current`, 'POST');
    const [tasks, setTasks] = useState<TaskShortInfo[]>([]);
    const { request: fetchTasks, error: fetchTasksError, loading: loadingFetchTasks } = useHttp(`${backendUrl}/api/tasks/shortInfo`, 'GET');
    const [fullTasksList, setFullTasksList] = useState<TaskShortInfo[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTasks(null, (data) => {setTasks(data); setFullTasksList(data)});
    }, [fetchTasks]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (obstacleData.tasksIds.length === 0 || !obstacleData.fromDate || !obstacleData.toDate) {
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
        const selectedTaskId = parseInt(e.target.value);
        if (!selectedTaskId || obstacleData.tasksIds.includes(selectedTaskId)) {
            return;
        }

        setObstacleData(prevState => ({
            ...prevState,
            tasksIds: [...prevState.tasksIds, selectedTaskId]
        }));

        // Remove added task from the list of available tasks
        setTasks(prevTasks => prevTasks.filter(task => task.id !== selectedTaskId));
    };


    const handleRemoveTask = (taskId: number) => {
        setObstacleData(prev => ({
            ...prev,
            tasksIds: prev.tasksIds.filter(id => id !== taskId)
        }));

        // Add removed task back to the list of available tasks
        const removedTask = fullTasksList.find(task => task.id === taskId);
        if (removedTask) {
            setTasks(prevTasks => [...prevTasks, removedTask].sort((a, b) => a.id - b.id));
        }
    };

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
                        <label className="form-label">Zadania:</label>
                        <select className="form-select" onChange={handleTaskChange}>
                            <option value="">Wybierz zadanie</option>
                            {tasks.map(task => (
                                <option key={task.id} value={task.id}>{task.name}</option>
                            ))}
                        </select>
                        <div className="selected-tasks">
                            {obstacleData.tasksIds.map(taskId => {
                                const task = fullTasksList.find(t => t.id === taskId);
                                return (
                                    <div className="pt-2">
                                        <button className="btn btn-secondary p-1" type="button"
                                                onClick={() => handleRemoveTask(taskId)}>
                                            {task ? task.name : 'Nieznane zadanie'} <FontAwesomeIcon
                                            icon={faRectangleXmark}/>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
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
