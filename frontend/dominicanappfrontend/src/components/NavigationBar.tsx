import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NavigationBar.css';
import LogoutButton from "./LogoutButton";
import useHttp from '../services/UseHttp';
import {backendUrl} from "../utils/constants";
import { faUserPlus, faNoteSticky} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';



const NavigationBar = () => {
    const navigate = useNavigate();
    const [numberOfUnverifiedUsers, setNumberOfUnverifiedUsers] = useState(0);
    const [numberOfAwaitingObstacles, setNumberOfAwaitingObstacles] = useState(0);
    const { request: numberOfUnverifiedUsersRequest, error: numberOfUnverifiedUsersError, loading: numberOfUnverifiedUsersLoading } = useHttp(
        `${backendUrl}/api/users/notVerified/count`, 'GET'
    );
    const { request: numberOfAwaitingObstaclesRequest, error: numberOfAwaitingObstaclesError, loading: numberOfAwaitingObstaclesLoading } = useHttp(
        `${backendUrl}/api/obstacles/AWAITING/count`, 'GET'
    );

    useEffect(() => {
        numberOfUnverifiedUsersRequest(null, ((number) => {
            console.log("Number of unverified users: " + number);
            setNumberOfUnverifiedUsers(number);
        }))

    }, [numberOfUnverifiedUsersRequest]);
    
    useEffect(() => {
        numberOfAwaitingObstaclesRequest(null, ((number) => {
            console.log("Number of awaiting obstacles: " + number);
            setNumberOfAwaitingObstacles(number);
        }))
    }, [numberOfAwaitingObstaclesRequest]);

    const navigateTo = (path : string) => {
        navigate(path);
    };

    return (
        <div className="navigation-bar">
            <button onClick={() => navigateTo('/home')}>Home</button>

            <button onClick={() => navigateTo('/user-profile')}>Mój profil</button>

            <button onClick={() => navigateTo('/tasks')}>Zadania</button>

            <button
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

            <button onClick={() => navigateTo('/conflicts')}>Konflikty</button>

            <button
                onClick={() => navigateTo('/users')}
            >
                Użytkownicy
                {numberOfUnverifiedUsers > 0 && (
                    <span className="notification-icon">
                        <FontAwesomeIcon icon={faUserPlus}/>
                        <span className="notification-count">{numberOfUnverifiedUsers}</span>
                    </span>
                )}
            </button>

            <button onClick={() => navigateTo('/schedule')}>Harmonogram</button>

            <button onClick={() => navigateTo('/roles')}>Role</button>

            <LogoutButton/>
        </div>
    );
};

export default NavigationBar;
