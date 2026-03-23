import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faNoteSticky, faWallet, faCalendarPlus} from '@fortawesome/free-solid-svg-icons';
import useHttp from "../../services/UseHttp";
import { backendUrl } from "../../utils/constants";

const DeanPage = () => {

    const [numberOfAwaitingObstacles, setNumberOfAwaitingObstacles] = useState(0);

    const { request: numberOfAwaitingObstaclesRequest } = useHttp(
        `${backendUrl}/api/obstacles/AWAITING/count`, 'GET'
    );

    useEffect(() => {
        numberOfAwaitingObstaclesRequest(null, ((number) => {
            setNumberOfAwaitingObstacles(number);
        }))
    }, [numberOfAwaitingObstaclesRequest]);

    return (
        <div className="container mt-4 fade-in">
            <h2 className="text-center mb-4">Panel Dziekana</h2>
            <div className="row justify-content-center">
                <div className="col-md-4 mb-4">
                    <Link to="/dean/pocket-money" style={{ textDecoration: 'none' }}>
                        <div className="card text-center p-4 shadow-sm hover-effect h-100" style={{ cursor: 'pointer' }}>
                            <div className="card-body">
                                <FontAwesomeIcon icon={faWallet} size="3x" className="mb-3 text-success" />
                                <h4 className="card-title text-dark">Kieszonkowe</h4>
                                <p className="card-text text-muted">
                                    Generuj listę wypłat kieszonkowego i imieninowego na dany miesiąc.
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>
                <div className="col-md-4 mb-4">
                    <Link to="/obstacles" style={{ textDecoration: 'none' }}>
                        <div className="card text-center p-4 shadow-sm hover-effect h-100" style={{ cursor: 'pointer' }}>
                            <div className="card-body position-relative">
                                {/* Powiadomienie (Badge) */}
                                {numberOfAwaitingObstacles > 0 && (
                                    <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger mt-3 me-3" style={{ fontSize: '0.9rem' }}>
                                        {numberOfAwaitingObstacles}
                                        <span className="visually-hidden">oczekujące</span>
                                    </span>
                                )}

                                <FontAwesomeIcon icon={faNoteSticky} size="3x" className="mb-3 text-primary" />
                                <h4 className="card-title text-dark">Przeszkody</h4>
                                <p className="card-text text-muted">
                                    Przeglądaj, zatwierdzaj i zarządzaj zgłoszonymi przeszkodami braci.
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>
                <div className="col-md-4 mb-4">
                    <Link to="/dean/special-events" style={{ textDecoration: 'none' }}>
                        <div className="card text-center p-4 shadow-sm hover-effect h-100" style={{ cursor: 'pointer' }}>
                            <div className="card-body">
                                <FontAwesomeIcon icon={faCalendarPlus} size="3x" className="mb-3 text-warning" />
                                <h4 className="card-title text-dark">Wydarzenia Specjalne</h4>
                                <p className="card-text text-muted">
                                    Zarządzaj czasem w sytuacjach specjalnych.
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DeanPage;