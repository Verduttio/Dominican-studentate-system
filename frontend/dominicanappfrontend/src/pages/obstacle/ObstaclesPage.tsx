import React, { useState, useEffect } from 'react';
import LogoutButton from "../../components/LogoutButton";
import useHttp from "../../services/UseHttp";
import {Obstacle} from "../../models/interfaces";
import {backendUrl} from "../../utils/constants";


function ObstaclesPage () {
    const [obstacles, setObstacles] = useState<Obstacle[]>([]);
    const { error, func, loading, request } = useHttp(`${backendUrl}/api/obstacles`, 'GET');

    useEffect(() => {
        request(null, (data) => setObstacles(data))
            .then(() => {});
    }, [request]);

    useEffect(() => {
        if (func) {
            func();
        }
    }, [func]);

    if (loading) return <div>Ładowanie...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div>
            <h2>Lista przeszkód</h2>
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Proszący</th>
                    <th>Task</th>
                    <th>Od</th>
                    <th>Do</th>
                    <th>Opis</th>
                    <th>Status</th>
                    <th>Akceptant</th>
                    <th>Odpowiedź akceptanta</th>
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
                        <td>{obstacle.status}</td>
                        <td>{obstacle.recipientUser ? obstacle.recipientUser.name + " " + obstacle.recipientUser.surname : "brak"}</td>
                        <td>{obstacle.recipientAnswer ? obstacle.recipientAnswer : "brak"}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <LogoutButton/>
        </div>
    );
}

export default ObstaclesPage;