import React from 'react';
import { Link } from 'react-router-dom';
import useIsAdmin from "../../services/UseIsAdmin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendarDays,
    faListCheck,
    faBolt,
    faUserTag
} from "@fortawesome/free-solid-svg-icons";

const OtherEntities = () => {
    const { isAdmin } = useIsAdmin();

    return (
        <div className="container mt-4 fade-in">
            <h2 className="text-center mb-4">Inne ustawienia</h2>

            <div className="row justify-content-center">

                {/* 1. DATY (Tylko Admin) */}
                {isAdmin &&
                    <div className="col-md-6 mb-4">
                        <Link to="/dates" style={{ textDecoration: 'none' }}>
                            <div className="card text-center p-4 shadow-sm hover-effect h-100" style={{ cursor: 'pointer' }}>
                                <div className="card-body">
                                    <FontAwesomeIcon icon={faCalendarDays} size="3x" className="mb-3 text-primary" />
                                    <h4 className="card-title text-dark">Daty i Święta</h4>
                                    <p className="card-text text-muted">
                                        Dodawanie świąt oraz ustawienie daty granicznej dla statystyk.
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>
                }

                {/* 2. OFICJA */}
                <div className="col-md-6 mb-4">
                    <Link to="/tasks" style={{ textDecoration: 'none' }}>
                        <div className="card text-center p-4 shadow-sm hover-effect h-100" style={{ cursor: 'pointer' }}>
                            <div className="card-body">
                                <FontAwesomeIcon icon={faListCheck} size="3x" className="mb-3 text-success" />
                                <h4 className="card-title text-dark">Oficja</h4>
                                <p className="card-text text-muted">
                                    Pełne zarządzanie listą zadań: dodawanie nowych, edycja istniejących oraz usuwanie.
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* 3. KONFLIKTY */}
                <div className="col-md-6 mb-4">
                    <Link to="/conflicts" style={{ textDecoration: 'none' }}>
                        <div className="card text-center p-4 shadow-sm hover-effect h-100" style={{ cursor: 'pointer' }}>
                            <div className="card-body">
                                <FontAwesomeIcon icon={faBolt} size="3x" className="mb-3 text-warning" />
                                <h4 className="card-title text-dark">Konflikty</h4>
                                <p className="card-text text-muted">
                                    Definiowanie reguł wykluczania się zadań (np. brat nie może być jednocześnie w dwóch miejscach).
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* 4. ROLE */}
                <div className="col-md-6 mb-4">
                    <Link to="/roles" style={{ textDecoration: 'none' }}>
                        <div className="card text-center p-4 shadow-sm hover-effect h-100" style={{ cursor: 'pointer' }}>
                            <div className="card-body">
                                <FontAwesomeIcon icon={faUserTag} size="3x" className="mb-3 text-secondary" />
                                <h4 className="card-title text-dark">Role</h4>
                                <p className="card-text text-muted">
                                    Zarządzanie rolami i uprawnieniami użytkowników oraz grupami zadań.
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default OtherEntities;