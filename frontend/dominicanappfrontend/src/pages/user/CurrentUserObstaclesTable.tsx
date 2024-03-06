import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import {Obstacle, ObstacleStatus} from "../../models/Interfaces";
import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";


function CurrentUserObstaclesTable () {
    const [userObstacles, setUserObstacles] = useState<Obstacle[]>([]);
    const { error: userObstaclesError, loading: userObstaclesLoading, request: userObstaclesRequest } = useHttp(`${backendUrl}/api/obstacles/users/current`, 'GET');
    const { error: deleteError, loading: deleteLoading, request: deleteRequest } = useHttp();
    const [refreshData, setRefreshData] = useState<boolean>(false);


    useEffect(() => {
        userObstaclesRequest(null, (data) => setUserObstacles(data))
    }, [userObstaclesRequest, refreshData]);

    const handleDelete = (obstacleId: number) => {
        deleteRequest(null, () => {
            setRefreshData(!refreshData);
        }, false, `${backendUrl}/api/obstacles/${obstacleId}`, 'DELETE');
    }

    if (userObstaclesLoading) return <LoadingSpinner/>;
    if (userObstacles.length === 0) return <div className="alert alert-info text-center">Brak przeszkód</div>;
    if (userObstaclesError) return <div className="alert alert-danger">{userObstaclesError}</div>;

    return (
        <table className="table table-hover table-striped table-responsive table-rounded table-shadow">
            <thead className="table-dark">
            <tr>
                <th>Zadanie</th>
                <th>Od</th>
                <th>Do</th>
                <th>Status</th>
                <th>Akcja</th>
            </tr>
            </thead>
            <tbody>
            {userObstacles.map(obstacle => (
                <tr key={obstacle.id}>
                    <td>{obstacle.task.name}</td>
                    <td>{obstacle.fromDate}</td>
                    <td>{obstacle.toDate}</td>
                    <td>
                        <span className={
                            obstacle.status === ObstacleStatus.AWAITING ? 'highlighted-text-awaiting' :
                                obstacle.status === ObstacleStatus.APPROVED ? 'highlighted-text-approved' :
                                    obstacle.status === ObstacleStatus.REJECTED ? 'highlighted-text-rejected' : ''
                        }>
                            {obstacle.status}
                        </span>
                    </td>
                    <td>
                        <button className="btn btn-danger" onClick={() => {handleDelete(obstacle.id)}} disabled={deleteLoading}>Usuń</button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
};

export default CurrentUserObstaclesTable;
