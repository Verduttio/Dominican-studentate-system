import React, { useState, useEffect } from 'react';
import useHttp from "../../services/UseHttp";
import {Obstacle, ObstacleStatus, obstacleStatusTranslation} from "../../models/Interfaces";
import {backendUrl} from "../../utils/constants";
import {useLocation, useNavigate} from "react-router-dom";
import LoadingSpinner from "../../components/LoadingScreen";
import "./ObstaclesPage.css";
import AlertBox from "../../components/AlertBox";
import Pagination from "../../components/Pagination";


function ObstaclesPage () {
    const [obstaclePage, setObstaclePage] = useState<{ content: Obstacle[], totalPages: number }>({ content: [], totalPages: 0 });
    const { error, loading, request } = useHttp();
    const [currentPage, setCurrentPage] = useState<number>(0);
    const pageSize = 10;
    const navigate = useNavigate();
    const location = useLocation();
    const locationStateMessage = location.state?.message;

    useEffect(() => {
        const baseUrl = `${backendUrl}/api/obstacles/pageable`;
        const requestUrl = `${baseUrl}?page=${currentPage}&size=${pageSize}`;
        request(null, (data) => setObstaclePage({ content: data.content, totalPages: data.totalPages }), false, requestUrl, 'GET')
            .then(() => {});
    }, [request, currentPage, pageSize]);

    if (loading) return <LoadingSpinner/>;
    if (error) return <AlertBox text={error} type={'danger'} width={'500px'}/>;

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <h1 className="entity-header">Przeszkody</h1>
            </div>
            <div className="d-flex justify-content-center">
                {locationStateMessage && <AlertBox text={locationStateMessage} type={'success'} width={'500px'}/>}
            </div>
            <div className="d-flex justify-content-center">
                <div className="table-responsive" style={{maxWidth: '800px'}}>
                    <table className="table table-hover table-striped table-rounded table-shadow">
                        <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Proszący</th>
                            <th>Zadania</th>
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
                                <tr key={obstacle.id}
                                    className={className}>
                                    <td>{obstacle.id}</td>
                                    <td>{obstacle.user.name} {obstacle.user.surname}</td>
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
                                        <button className="btn btn-sm btn-dark"
                                                onClick={() => navigate(`/edit-obstacle/${obstacle.id}`)}>Szczegóły
                                        </button>
                                    </td>
                                </tr>
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
            <div className="d-flex justify-content-center">
                <button className="btn btn-success m-1" onClick={() => navigate('/add-obstacle')}>Dodaj przeszkodę
                </button>
            </div>
        </div>
    );
}

export default ObstaclesPage;