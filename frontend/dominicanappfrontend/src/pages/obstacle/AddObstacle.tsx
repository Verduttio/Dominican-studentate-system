import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import useHttp from "../../services/UseHttp";
import { ObstacleData } from "../../models/interfaces";

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
    const { request: postObstacle, error: postError } = useHttp('http://localhost:8080/api/obstacles', 'POST');
    const navigate = useNavigate();

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


    return (
        <div>
            {postError && <div className="error-message">{postError}</div>}
            {validationError && <div className="error-message">{validationError}</div>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="userId">ID Użytkownika:</label>
                    <input
                        type="number"
                        id="userId"
                        name="userId"
                        value={obstacleData.userId}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label htmlFor="taskId">ID Zadania:</label>
                    <input
                        type="number"
                        id="taskId"
                        name="taskId"
                        value={obstacleData.taskId}
                        onChange={handleChange}
                    />
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
