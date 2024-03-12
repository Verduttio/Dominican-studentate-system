import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useLocation, useNavigate} from 'react-router-dom';
import useHttp from "../../services/UseHttp";
import {backendUrl, frontendUrl} from "../../utils/constants";
import './Login.css';
import LoadingSpinner from "../../components/LoadingScreen";
import '../../components/Common.css';

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
        request(null, () => navigate('/home'), true)
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

            if (response.status === 200 && response.data.id !== 0) {
                console.log('Zalogowano pomyślnie');
                localStorage.setItem('userId', response.data.id);
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

    if (loading) return <LoadingSpinner />;

    return (
        <div className="container fade-in" style={{minHeight: '100vh'}}>
            <div className="row justify-content-center">
                <div className="d-flex align-items-center justify-content-center" style={{minHeight: '100vh'}}>
                    <div className="login-image col-md-6">
                        <img src={`${process.env.PUBLIC_URL}/Seal_of_the_Dominican_Order.svg`} alt="Opis zdjęcia" className="img-fluid"/>
                        <h3 className="text-center mt-3">Dominikański system studentatu</h3>
                    </div>

                    <div className="col-md-6 login-box">
                        <h2 className="text-center mb-4">Logowanie</h2>
                        <form onSubmit={handleLogin}>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Email:</label>
                                <input type="email" className="form-control" id="email" value={email}
                                       onChange={e => setEmail(e.target.value)}
                                       autoComplete="off"/>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">Hasło:</label>
                                <input type="password" className="form-control" id="password" value={password}
                                       onChange={e => setPassword(e.target.value)}
                                       autoComplete="off"/>
                            </div>
                            {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
                            {errorOAuth2 && <div className="alert alert-danger" role="alert">{errorOAuth2Message}</div>}
                            <button type="submit" className="btn btn-primary w-100">Zaloguj</button>
                        </form>
                        <div className="text-center mt-3">
                            <a href={`${backendUrl}/oauth2/authorization/google?redirect_uri=${frontendUrl}/home`}
                               className="google-login">
                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24"
                                     viewBox="0 0 48 48">
                                    <path fill="#FFC107"
                                          d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                                    <path fill="#FF3D00"
                                          d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                                    <path fill="#4CAF50"
                                          d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                                    <path fill="#1976D2"
                                          d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                                </svg>
                                Zaloguj się przez Google
                            </a>
                        </div>
                        <div className="text-center mt-2">
                            <button onClick={() => navigate('/register')}
                                    className="btn btn-danger w-100 btn-register">
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