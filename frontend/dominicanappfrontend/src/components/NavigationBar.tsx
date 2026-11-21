import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NavigationBar.css';
import LogoutButton from "./LogoutButton";
import useHttp from '../services/UseHttp';
import {backendUrl} from "../utils/constants";
import { faUserPlus, faNoteSticky, faBars, faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useIsAdmin from "../services/UseIsAdmin";
import useIsFunkcyjny from "../services/UseIsFunkcyjny";
import { WishesMenuStateDTO } from "../models/Interfaces";

const NavigationBar = () => {
    const navigate = useNavigate();
    const [numberOfUnverifiedUsers, setNumberOfUnverifiedUsers] = useState(0);
    const [numberOfAwaitingObstacles, setNumberOfAwaitingObstacles] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [wishesVisible, setWishesVisible] = useState(false);

    const { isAdmin} = useIsAdmin();
    const { isFunkcyjny } = useIsFunkcyjny();
    const { request: numberOfUnverifiedUsersRequest} = useHttp(
        `${backendUrl}/api/users/notVerified/count`, 'GET'
    );
    const { request: numberOfAwaitingObstaclesRequest} = useHttp(
        `${backendUrl}/api/obstacles/AWAITING/count`, 'GET'
    );

    const { request: wishesMenuStateRequest } = useHttp(
        `${backendUrl}/api/wishes/menu-state`, 'GET'
    );

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

    useEffect(() => {
        wishesMenuStateRequest(null, (data: WishesMenuStateDTO) => {
            setWishesVisible(data.visible);
        });
    }, [wishesMenuStateRequest]);

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
                {numberOfUnverifiedUsers + numberOfAwaitingObstacles > 0 && isAdmin ? (
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


                {isAdmin &&
                <button
                    onClick={() => navigateTo('/users')}
                >
                    Bracia
                    {numberOfUnverifiedUsers > 0 && isAdmin && (
                        <span className="notification-icon">
                        <FontAwesomeIcon icon={faUserPlus}/>
                        <span className="notification-count">{numberOfUnverifiedUsers}</span>
                    </span>
                    )}
                </button>
                }

                <button
                    onClick={() => navigateTo('/schedule')}
                >
                    Wydruki
                </button>

                {(wishesVisible && !isAdmin) && (
                    <button onClick={() => navigateTo('/wishes')}>
                        Życzenia
                    </button>
                )}

                {isFunkcyjny &&
                    <button
                        onClick={() => navigateTo('/add-schedule/select-role')}
                    >
                        Wyznacz
                    </button>
                }


                {isAdmin &&
                    <button
                        onClick={() => navigateTo('/dean')}
                    >
                        Dziekan
                        {numberOfAwaitingObstacles > 0 && (
                            <span className="notification-icon">
                                <FontAwesomeIcon icon={faNoteSticky} />
                                <span className="notification-count">{numberOfAwaitingObstacles}</span>
                            </span>
                        )}
                    </button>
                }

                <button onClick={() => {
                    navigateTo('/other')
                }}>Inne
                </button>

                <button
                    onClick={() => navigateTo('/links')}
                >
                    Info
                </button>

                <LogoutButton/>
            </div>

            <div className="navbar-buttons-pc">
                <button onClick={() => navigateTo('/home')}>Home</button>


                {isAdmin &&
                <button
                    onClick={() => navigateTo('/users')}
                >
                    Bracia
                    {numberOfUnverifiedUsers > 0 && isAdmin && (
                        <span className="notification-icon">
                            <FontAwesomeIcon icon={faUserPlus}/>
                            <span className="notification-count">{numberOfUnverifiedUsers}</span>
                        </span>
                    )}
                </button>
                }

                <button
                    onClick={() => navigateTo('/schedule')}
                >
                    Wydruki
                </button>

                {(wishesVisible && !isAdmin) && (
                    <button onClick={() => navigateTo('/wishes')}>
                        Życzenia
                    </button>
                )}

                {isFunkcyjny &&
                    <button
                        onClick={() => navigateTo('/add-schedule/select-role')}
                    >
                        Wyznacz
                    </button>
                }


                {isAdmin &&
                    <button
                        onClick={() => navigateTo('/dean')}
                    >
                        Dziekan
                        {numberOfAwaitingObstacles > 0 && (
                            <span className="notification-icon">
                                <FontAwesomeIcon icon={faNoteSticky} />
                                <span className="notification-count">{numberOfAwaitingObstacles}</span>
                            </span>
                        )}
                    </button>
                }


                <button onClick={() => {
                    navigateTo('/other')
                }}>Inne
                </button>

                <button
                    onClick={() => navigateTo('/links')}
                >
                    Info
                </button>

                <LogoutButton/>
            </div>
        </div>
    );
};

export default NavigationBar;
