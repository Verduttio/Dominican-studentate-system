import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useLocation, useNavigate} from 'react-router-dom';
import useHttp from "../../services/UseHttp";
import {backendUrl, frontendUrl} from "../../utils/constants";
import './Login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

function Login () {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const { loading, request } = useHttp(`${backendUrl}/api/users/current/check`, 'GET');

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const errorOAuth2 : string|null = queryParams.get('error_oauth2');
    const errorOAuth2Message = queryParams.get('error_message') || 'nieznany błąd';

    const navigate = useNavigate();
    useEffect(() => {
        request(null, () => navigate('/home'))
            .then(() => {});
    }, [request, navigate]);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email || !password) {
            setErrorMessage('Email i hasło są wymagane!');
            return;
        }

        try {
            const response = await axios.post(`${backendUrl}/api/users/login`, {
                email,
                password
            }, {
                withCredentials: true
            });

            if (response.status === 200 && response.data === 'User authenticated successfully') {
                console.log('Zalogowano pomyślnie');
                navigate('/home');
            } else {
                console.log('Błąd podczas logowania.');
            }
        } catch (error: any) {
            if (error.response && error.response.status === 401) {
                setErrorMessage(error.response.data);
            } else {
                setErrorMessage('Wystąpił nieznany błąd podczas logowania: ' + error.response.data);
            }
        }
    };

    if (loading) return <div>Ładowanie...</div>;

    return (
        <div className="login-background">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 login-box">
                        <h2 className="text-center mb-4">Logowanie</h2>
                        {errorOAuth2 && <p className="text-danger">{decodeURIComponent(errorOAuth2Message)}</p>}
                        <form onSubmit={handleLogin}>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Email:</label>
                                <input type="email" className="form-control" id="email" value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">Hasło:</label>
                                <input type="password" className="form-control" id="password" value={password} onChange={e => setPassword(e.target.value)} />
                            </div>
                            {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
                            <button type="submit" className="btn btn-primary w-100">Zaloguj</button>
                        </form>
                        <div className="text-center mt-3">
                            <a href={`${backendUrl}/oauth2/authorization/google?redirect_uri=${frontendUrl}/home`} className="google-login">
                                <FontAwesomeIcon icon={faGoogle} /> Zaloguj się poprzez Google
                            </a>
                        </div>
                        <div className="text-center mt-2">
                            <button onClick={() => navigate('/register')} className="btn btn-warning w-100">
                                Nie masz konta? Zarejestruj się!
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;