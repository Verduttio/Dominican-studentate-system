import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet } from '@fortawesome/free-solid-svg-icons'; // Upewnij się, że masz tę ikonę lub wybierz inną

const DeanPage = () => {
    return (
        <div className="container mt-4 fade-in">
            <h2 className="text-center mb-4">Panel Dziekana</h2>
            <div className="row justify-content-center">
                <div className="col-md-4">
                    <Link to="/dean/pocket-money" style={{ textDecoration: 'none' }}>
                        <div className="card text-center p-4 shadow-sm hover-effect" style={{ cursor: 'pointer' }}>
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
                {/* Tutaj w przyszłości dodasz kolejne kafelki */}
            </div>
        </div>
    );
};

export default DeanPage;