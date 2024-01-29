import React, {useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import useHttp from "../../services/UseHttp";
import {ObstacleData, UserShortInfo} from "../../models/interfaces";

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
    const [users, setUsers] = useState<UserShortInfo[]>([]);
    const { request: fetchUsers, error: fetchUsersError, loading} = useHttp('http://localhost:8080/api/users/shortInfo', 'GET');
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers(null, (data) => setUsers(data));
    }, [fetchUsers]);

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

    if(fetchUsersError) return <div className="error-message">{fetchUsersError}</div>;
    if(loading) return <div>Ładowanie...</div>;

    return (
        <div>
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
