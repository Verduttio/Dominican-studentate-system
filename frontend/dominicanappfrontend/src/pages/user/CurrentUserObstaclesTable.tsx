import React, {useEffect, useState} from 'react';
import {Obstacle, ObstacleStatus, obstacleStatusTranslation} from "../../models/Interfaces";
import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";
import AlertBox from "../../components/AlertBox";
import Pagination from "../../components/Pagination";
import {useNavigate} from "react-router-dom";
import {format} from "date-fns";


function CurrentUserObstaclesTable () {
    const [obstaclePage, setObstaclePage] = useState<{ content: Obstacle[], totalPages: number }>({ content: [], totalPages: 0 });
    const [currentPage, setCurrentPage] = useState<number>(0);
    const pageSize = 10;
    const { error: userObstaclesError, loading: userObstaclesLoading, request: userObstaclesRequest } = useHttp();
    const navigate = useNavigate();


    useEffect(() => {
        const baseUrl = `${backendUrl}/api/obstacles/users/current/pageable`;
        const requestUrl = `${baseUrl}?page=${currentPage}&size=${pageSize}`;
        userObstaclesRequest(null, (data) => setObstaclePage({ content: data.content, totalPages: data.totalPages }), false, requestUrl, 'GET')
            .then(() => {});
    }, [userObstaclesRequest, pageSize, currentPage]);

    if (userObstaclesLoading) return <LoadingSpinner/>;
    if (obstaclePage.content.length === 0) return <AlertBox text={"Brak przeszkód"} type="info" width={'500px'} />;
    if (userObstaclesError) return <AlertBox text={userObstaclesError} type="danger" width={'500px'} />;

    return (
        <>
            <div className="d-flex justify-content-center">
                <div className="table-responsive" style={{maxWidth: '800px'}}>
                    <table className="table table-hover table-striped table-rounded table-shadow text-center">
                        <thead className="table-dark">
                        <tr>
                            <th>Oficja</th>
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
                                    className = 'table-links';
                                }
                            }
                            return (
                                <>
                                    <tr key={obstacle.id}
                                        className={className}>
                                        <td className='max-column-width-200'>{obstacle.tasks.map(task => task.nameAbbrev).join(", ")}</td>
                                        <td>{format(obstacle.fromDate, "dd.MM.yyyy")}</td>
                                        <td>{format(obstacle.toDate, "dd.MM.yyyy")}</td>
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
                                            <button className="btn btn-dark" onClick={() => {
                                                navigate(`/obstacles/my/${obstacle.id}`)
                                            }}>Szczegóły
                                            </button>
                                        </td>
                                    </tr>
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
