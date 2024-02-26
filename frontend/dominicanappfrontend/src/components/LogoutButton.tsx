import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {backendUrl} from "../utils/constants";
import "./LogoutButton.css";

function LogoutButton () {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await axios.post(`${backendUrl}/api/users/logout`, {}, {
                withCredentials: true
            });

            if (response.status === 200) {
                console.log('Wylogowano pomyślnie');
                navigate('/login');
            }
        } catch (error) {
            console.error('Błąd podczas wylogowywania:', error);
        }
    };

    return (
        <button id="logout-button" onClick={handleLogout}>Wyloguj</button>
    );
}

export default LogoutButton;