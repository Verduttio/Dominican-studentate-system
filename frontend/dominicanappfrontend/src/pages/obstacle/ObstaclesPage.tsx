import React, { useState, useEffect } from 'react';
import useHttp from "../../services/UseHttp";
import {Obstacle, ObstacleStatus} from "../../models/Interfaces";
import {backendUrl} from "../../utils/constants";
import {useLocation, useNavigate} from "react-router-dom";
import LoadingSpinner from "../../components/LoadingScreen";
import "./ObstaclesPage.css";


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
                    <th>Akcja</th>
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
                        <td>{obstacle.applicantDescription ? obstacle.applicantDescription : "-"}</td>
                        <td>
                            <span className={
                                obstacle.status === ObstacleStatus.AWAITING ? 'highlighted-text-awaiting' :
                                    obstacle.status === ObstacleStatus.APPROVED ? 'highlighted-text-approved' :
                                        obstacle.status === ObstacleStatus.REJECTED ? 'highlighted-text-rejected' : ''
                            }>
                            {obstacle.status}
                          </span>
                        </td>
                        <td>{obstacle.recipientUser ? obstacle.recipientUser.name + " " + obstacle.recipientUser.surname : "-"}</td>
                        <td>{obstacle.recipientAnswer ? obstacle.recipientAnswer : "-"}</td>
                        <td>
                            <button className="btn btn-sm btn-info"
                                    onClick={() => navigate(`/edit-obstacle/${obstacle.id}`)}>Modyfikuj
                            </button>
                        </td>
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