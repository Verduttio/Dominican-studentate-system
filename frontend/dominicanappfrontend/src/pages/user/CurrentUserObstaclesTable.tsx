import React, {useEffect, useState} from 'react';
import {Obstacle, ObstacleStatus} from "../../models/Interfaces";
import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";
import ConfirmDeletionPopup from "../../components/ConfirmDeletionPopup";
import AlertBox from "../../components/AlertBox";


function CurrentUserObstaclesTable () {
    const [userObstacles, setUserObstacles] = useState<Obstacle[]>([]);
    const { error: userObstaclesError, loading: userObstaclesLoading, request: userObstaclesRequest } = useHttp(`${backendUrl}/api/obstacles/users/current`, 'GET');
    const { error: deleteError, loading: deleteLoading, request: deleteRequest } = useHttp();
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [showConfirmationPopup, setShowConfirmationPopup] = useState<boolean>(false);


    useEffect(() => {
        userObstaclesRequest(null, (data) => setUserObstacles(data))
    }, [userObstaclesRequest, refreshData]);

    const deleteObstacle = (obstacleId: number) => {
        deleteRequest(null, () => {
            setRefreshData(!refreshData);
        }, false, `${backendUrl}/api/obstacles/${obstacleId}`, 'DELETE')
            .then(() => setShowConfirmationPopup(false));
    }

    if (userObstaclesLoading) return <LoadingSpinner/>;
    if (userObstacles.length === 0) return <AlertBox text={"Brak przeszkód"} type="info" width={'500px'} />;
    if (userObstaclesError) return <AlertBox text={userObstaclesError} type="danger" width={'500px'} />;

    return (
        <div className="d-flex justify-content-center">
            <div className="table-responsive" style={{maxWidth: '800px'}}>
                <table className="table table-hover table-striped table-rounded table-shadow">
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
                    {userObstacles.map(obstacle => {
                        const isObsolete = new Date(obstacle.toDate) < new Date();
                        const isCurrent = new Date(obstacle.fromDate) <= new Date() && new Date(obstacle.toDate) >= new Date();
                        let className = '';
                        if (isCurrent) {
                            if (obstacle.status === ObstacleStatus.AWAITING) {
                                className = 'table-warning';
                            } else if (obstacle.status === ObstacleStatus.APPROVED) {
                                className = 'table-success';
                            } else if (obstacle.status === ObstacleStatus.REJECTED) {
                                className = 'table-danger';
                            }
                        } else {
                            if (isObsolete) {
                                className = 'table-dark';
                            } else {
                                className = 'table-info';
                            }
                        }
                        return (
                        <>
                        <tr key={obstacle.id}
                            className={className}>
                            <td className='max-column-width-300'>{obstacle.tasks.map(task => task.name).join(", ")}</td>
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
                                <button className="btn btn-danger" onClick={() => {setShowConfirmationPopup(true)}} disabled={deleteLoading}>Usuń</button>
                            </td>
                        </tr>
                        {showConfirmationPopup && <ConfirmDeletionPopup onClose={() => setShowConfirmationPopup(false)} onHandle={() => deleteObstacle(obstacle.id)}/>}
                        </>
                    )})}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default CurrentUserObstaclesTable;
