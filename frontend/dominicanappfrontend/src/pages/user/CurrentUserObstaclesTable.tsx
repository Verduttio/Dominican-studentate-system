import React, {useEffect, useState} from 'react';
import {Obstacle, ObstacleStatus, obstacleStatusTranslation} from "../../models/Interfaces";
import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";
import ConfirmDeletionPopup from "../../components/ConfirmDeletionPopup";
import AlertBox from "../../components/AlertBox";
import Pagination from "../../components/Pagination";


function CurrentUserObstaclesTable () {
    const [obstaclePage, setObstaclePage] = useState<{ content: Obstacle[], totalPages: number }>({ content: [], totalPages: 0 });
    const [currentPage, setCurrentPage] = useState<number>(0);
    const pageSize = 10;
    const { error: userObstaclesError, loading: userObstaclesLoading, request: userObstaclesRequest } = useHttp();
    const { error: deleteError, loading: deleteLoading, request: deleteRequest } = useHttp();
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [showConfirmationPopup, setShowConfirmationPopup] = useState<boolean>(false);


    useEffect(() => {
        const baseUrl = `${backendUrl}/api/obstacles/users/current/pageable`;
        const requestUrl = `${baseUrl}?page=${currentPage}&size=${pageSize}`;
        userObstaclesRequest(null, (data) => setObstaclePage({ content: data.content, totalPages: data.totalPages }), false, requestUrl, 'GET')
            .then(() => {});
    }, [userObstaclesRequest, refreshData, pageSize, currentPage]);

    const deleteObstacle = (obstacleId: number) => {
        deleteRequest(null, () => {
            setRefreshData(!refreshData);
        }, false, `${backendUrl}/api/obstacles/${obstacleId}`, 'DELETE')
            .then(() => setShowConfirmationPopup(false));
    }

    if (userObstaclesLoading) return <LoadingSpinner/>;
    if (obstaclePage.content.length === 0) return <AlertBox text={"Brak przeszkód"} type="info" width={'500px'} />;
    if (userObstaclesError) return <AlertBox text={userObstaclesError} type="danger" width={'500px'} />;

    return (
        <>
            {deleteError && <AlertBox text={deleteError} type="danger" width={'500px'}/>}
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
                        {obstaclePage.content.map(obstacle => {
                            const obstacleToDate = new Date(obstacle.toDate);
                            const obstacleFromDate = new Date(obstacle.fromDate);
                            const currentDate = new Date();

                            const obstacleSimpleToDate = new Date(obstacleToDate.getFullYear(), obstacleToDate.getMonth(), obstacleToDate.getDate());
                            const obstacleSimpleFromDate = new Date(obstacleFromDate.getFullYear(), obstacleFromDate.getMonth(), obstacleFromDate.getDate());
                            const currentSimpleDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

                            const isObsolete = obstacleSimpleToDate < currentSimpleDate;
                            const isCurrent = obstacleSimpleFromDate <= currentSimpleDate && obstacleSimpleToDate >= currentSimpleDate;
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
                                        {obstacleStatusTranslation[obstacle.status]}
                                    </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-danger" onClick={() => {
                                                setShowConfirmationPopup(true)
                                            }} disabled={deleteLoading}>Usuń
                                            </button>
                                        </td>
                                    </tr>
                                    {showConfirmationPopup &&
                                        <ConfirmDeletionPopup onClose={() => setShowConfirmationPopup(false)}
                                                              onHandle={() => deleteObstacle(obstacle.id)}/>}
                                </>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
            </div>
            <div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={obstaclePage.totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                />
            </div>
        </>
    );
}

export default CurrentUserObstaclesTable;
