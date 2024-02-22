import React, { useState, useEffect } from 'react';
import useHttp from "../../services/UseHttp";
import {Obstacle, ObstacleStatus} from "../../models/Interfaces";
import {backendUrl} from "../../utils/constants";
import {useLocation, useNavigate} from "react-router-dom";
import LoadingSpinner from "../../components/LoadingScreen";


function ObstaclesPage () {
    const [obstacles, setObstacles] = useState<Obstacle[]>([]);
    const { error, loading, request } = useHttp(`${backendUrl}/api/obstacles`, 'GET');
    const navigate = useNavigate();
    const location = useLocation();
    const locationStateMessage = location.state?.message;

    useEffect(() => {
        request(null, (data) => setObstacles(data))
            .then(() => {});
    }, [request]);

    if (loading) return <LoadingSpinner/>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <h1 className="entity-header">Przeszkody</h1>
            </div>
            <div className="d-flex justify-content-center">
                {locationStateMessage && <div className="alert alert-success">{locationStateMessage}</div>}
            </div>
            <table className="table table-hover table-striped table-responsive table-rounded table-shadow">
                <thead className="table-dark">
                <tr>
                    <th>ID</th>
                    <th>Proszący</th>
                    <th>Zadanie</th>
                    <th>Od</th>
                    <th>Do</th>
                    <th>Opis</th>
                    <th>Status</th>
                    <th>Funkcyjny</th>
                    <th>Odpowiedź funkcyjnego</th>
                </tr>
                </thead>
                <tbody>
                {obstacles.map(obstacle => (
                    <tr key={obstacle.id}>
                        <td>{obstacle.id}</td>
                        <td>{obstacle.user.name} {obstacle.user.surname}</td>
                        <td>{obstacle.task.name}</td>
                        <td>{obstacle.fromDate}</td>
                        <td>{obstacle.toDate}</td>
                        <td>{obstacle.applicantDescription ? obstacle.applicantDescription : "brak"}</td>
                        <td style={{ backgroundColor:
                            obstacle.status === ObstacleStatus.AWAITING ? 'yellow' : ''}}>{obstacle.status}</td>
                        <td>{obstacle.recipientUser ? obstacle.recipientUser.name + " " + obstacle.recipientUser.surname : "brak"}</td>
                        <td>{obstacle.recipientAnswer ? obstacle.recipientAnswer : "brak"}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <div className="d-flex justify-content-center">
                <button className="btn btn-success m-1" onClick={() => navigate('/add-obstacle')}>Dodaj przeszkodę</button>
            </div>
        </div>
    );
}

export default ObstaclesPage;