import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NavigationBar.css';
import LogoutButton from "./LogoutButton";

const NavigationBar = () => {
    const navigate = useNavigate();

    const navigateTo = (path : string) => {
        navigate(path);
    };

    return (
        <div className="navigation-bar">
            <button onClick={() => navigateTo('/user-profile')}>Mój profil</button>
            <button onClick={() => navigateTo('/tasks')}>Zadania</button>
            <button onClick={() => navigateTo('/obstacles')}>Przeszkody</button>
            <button onClick={() => navigateTo('/conflicts')}>Konflikty</button>
            <button onClick={() => navigateTo('/users')}>Użytkownicy</button>
            <button onClick={() => navigateTo('/schedule')}>Harmonogram</button>
            <button onClick={() => navigateTo('/roles')}>Role</button>
            <LogoutButton/>
        </div>
    );
};

export default NavigationBar;
