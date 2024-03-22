import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NavigationBar.css';
import LogoutButton from "./LogoutButton";
import useHttp from '../services/UseHttp';
import {backendUrl} from "../utils/constants";
import { faUserPlus, faNoteSticky, faBars, faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useIsFunkcyjny from "../services/UseIsFunkcyjny";


const NavigationBar = () => {
    const navigate = useNavigate();
    const [numberOfUnverifiedUsers, setNumberOfUnverifiedUsers] = useState(0);
    const [numberOfAwaitingObstacles, setNumberOfAwaitingObstacles] = useState(0);
    const { isFunkcyjny, isFunkcyjnyLoading, isFunkcyjnyError } = useIsFunkcyjny();
    const { request: numberOfUnverifiedUsersRequest, error: numberOfUnverifiedUsersError, loading: numberOfUnverifiedUsersLoading } = useHttp(
        `${backendUrl}/api/users/notVerified/count`, 'GET'
    );
    const { request: numberOfAwaitingObstaclesRequest, error: numberOfAwaitingObstaclesError, loading: numberOfAwaitingObstaclesLoading } = useHttp(
        `${backendUrl}/api/obstacles/AWAITING/count`, 'GET'
    );
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        numberOfUnverifiedUsersRequest(null, ((number) => {
            setNumberOfUnverifiedUsers(number);
        }))

    }, [numberOfUnverifiedUsersRequest]);
    
    useEffect(() => {
        numberOfAwaitingObstaclesRequest(null, ((number) => {
            setNumberOfAwaitingObstacles(number);
        }))
    }, [numberOfAwaitingObstaclesRequest]);

    const navigateTo = (path : string) => {
        navigate(path);
        setIsMenuOpen(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div className="navigation-bar">
            <button className="hamburger-menu" onClick={toggleMenu}>
                Opcje
                {numberOfUnverifiedUsers + numberOfAwaitingObstacles > 0 && isFunkcyjny ? (
                    <span className="notification-icon">
                        <FontAwesomeIcon icon={faBars}/>
                        <span
                            className="notification-count">{numberOfUnverifiedUsers + numberOfAwaitingObstacles}</span>
                    </span>
                ) : <span> <FontAwesomeIcon icon={faBars}/></span>}
            </button>

            <button className="bg-success" onClick={() => {
                navigate(-1)
            }}>
                <span>
                    <FontAwesomeIcon icon={faArrowLeft}/>
                </span>
            </button>

            <div className={`mobile-menu ${isMenuOpen ? 'active' : 'hidden'}`}>
                <button onClick={() => navigateTo('/home')}>Home</button>

                <button onClick={() => navigateTo('/user-profile')}>Mój profil</button>

                <button
                    onClick={() => navigateTo('/users')}
                >
                    Użytkownicy
                    {numberOfUnverifiedUsers > 0 && isFunkcyjny && (
                        <span className="notification-icon">
                        <FontAwesomeIcon icon={faUserPlus}/>
                        <span className="notification-count">{numberOfUnverifiedUsers}</span>
                    </span>
                    )}
                </button>

                <button
                    onClick={() => navigateTo('/schedule')}
                >
                    Harmonogram
                </button>

                {isFunkcyjny &&
                    <button
                        className="bg-primary"
                        onClick={() => navigateTo('/obstacles')}
                    >
                        Przeszkody
                        {numberOfAwaitingObstacles > 0 && (
                            <span className="notification-icon">
                            <FontAwesomeIcon icon={faNoteSticky}/>
                            <span className="notification-count">{numberOfAwaitingObstacles}</span>
                        </span>
                        )}
                    </button>
                }

                <button onClick={() => {
                    navigateTo('/other')
                }}>Inne
                </button>
                <LogoutButton/>
            </div>

            <div className="navbar-buttons-pc">
                <button onClick={() => navigateTo('/home')}>Home</button>

                <button onClick={() => navigateTo('/user-profile')}>Mój profil</button>

                <button
                    onClick={() => navigateTo('/users')}
                >
                    Użytkownicy
                    {numberOfUnverifiedUsers > 0 && isFunkcyjny && (
                        <span className="notification-icon">
                            <FontAwesomeIcon icon={faUserPlus}/>
                            <span className="notification-count">{numberOfUnverifiedUsers}</span>
                        </span>
                    )}
                </button>

                <button
                    onClick={() => navigateTo('/schedule')}
                >
                    Harmonogram
                </button>

                {isFunkcyjny &&
                    <button
                        className="bg-primary"
                        onClick={() => navigateTo('/obstacles')}
                    >
                        Przeszkody
                        {numberOfAwaitingObstacles > 0 && (
                            <span className="notification-icon">
                                <FontAwesomeIcon icon={faNoteSticky}/>
                                <span className="notification-count">{numberOfAwaitingObstacles}</span>
                            </span>
                        )}
                    </button>
                }

                <button onClick={() => {
                    navigateTo('/other')
                }}>Inne
                </button>

                <LogoutButton/>
            </div>
        </div>
    );
};

export default NavigationBar;
