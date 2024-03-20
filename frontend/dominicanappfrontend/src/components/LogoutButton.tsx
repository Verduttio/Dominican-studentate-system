import React, {useState} from 'react';
import axios, {AxiosError} from 'axios';
import { useNavigate } from 'react-router-dom';
import {backendUrl} from "../utils/constants";
import "./LogoutButton.css";
import {removeCurrentUser} from "../services/CurrentUserCookieService";

function LogoutButton () {
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await axios.post(`${backendUrl}/api/users/logout`, {}, {
                withCredentials: true
            });

            if (response.status === 200) {
                console.log('Wylogowano pomyślnie');
                removeCurrentUser();
                navigate('/login');
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const serverError = err as AxiosError<{ message?: string }>;
                if (serverError && serverError.response) {
                    setError('Błąd podczas wylogowywania:' + (serverError.response.data?.message || serverError.response.data));
                } else {
                    setError('Problem z połączeniem sieciowym');
                }
            } else {
                setError('Nieoczekiwany błąd:' + err);
            }
        }
    };

    if (error) {
        return (
            <div className="custom-modal-backdrop fade-in">
                <div className="card custom-modal">
                    <div className="card-body">
                        <div className="modal-body">
                            <h5>{error}</h5>
                        </div>
                        <div className="modal-footer d-flex justify-content-center">
                            <button className="btn btn-secondary m-1" onClick={() => setError(null)}>OK</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <button id="logout-button" onClick={handleLogout}>Wyloguj</button>
    );
}

export default LogoutButton;