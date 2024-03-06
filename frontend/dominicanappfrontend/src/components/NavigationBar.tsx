import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NavigationBar.css';
import LogoutButton from "./LogoutButton";
import useHttp from '../services/UseHttp';
import {backendUrl} from "../utils/constants"; // Załóżmy, że useHttp to Twój hook do wykonywania zapytań HTTP

const NavigationBar = () => {
    const navigate = useNavigate();
    const [hasUnverifiedUsers, setHasUnverifiedUsers] = useState(false);
    const { request: howManyUnverifiedRequest, error: howManyUnverifiedError, loading: howManyUnverifiedLoading } = useHttp(
        `${backendUrl}/api/users/notVerified/count`, 'GET'
    );

    useEffect(() => {
        howManyUnverifiedRequest(null, ((number) => {
            console.log("Number of unverified users: " + number);
            if (number > 0) {
                setHasUnverifiedUsers(true);
            } else {
                setHasUnverifiedUsers(false);
            }
        }))

    }, [howManyUnverifiedRequest]);

    const navigateTo = (path : string) => {
        navigate(path);
    };

    return (
        <div className="navigation-bar">
            <button onClick={() => navigateTo('/home')}>Home</button>
            <button onClick={() => navigateTo('/user-profile')}>Mój profil</button>
            <button onClick={() => navigateTo('/tasks')}>Zadania</button>
            <button onClick={() => navigateTo('/obstacles')}>Przeszkody</button>
            <button onClick={() => navigateTo('/conflicts')}>Konflikty</button>
            <button
                style={{ backgroundColor: hasUnverifiedUsers ? 'red' : '' }}
                onClick={() => navigateTo('/users')}>
                Użytkownicy
            </button>
            <button onClick={() => navigateTo('/schedule')}>Harmonogram</button>
            <button onClick={() => navigateTo('/roles')}>Role</button>
            <LogoutButton/>
        </div>
    );
};

export default NavigationBar;
