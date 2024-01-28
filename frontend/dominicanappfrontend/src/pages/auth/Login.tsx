import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useLocation, useNavigate} from 'react-router-dom';
import useHttp from "../../services/UseHttp";

function Login () {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const { loading, request } = useHttp('http://localhost:8080/api/users/current/check', 'GET');

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const errorOAuth2 : string|null = queryParams.get('error_oauth2');
    const errorOAuth2Message = queryParams.get('error_message') || 'nieznany błąd';

    const navigate = useNavigate();

    const goToRegisterPage = () => {
        navigate('/register');
    };

    useEffect(() => {
        request(null, () => navigate('/home'))
            .then(() => {});
    }, [request, navigate]);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email) {
            setErrorMessage('Email i hasło są wymagane!');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/api/users/login', {
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
        <div>
            {errorOAuth2 && <p>Błąd uwierzytelenienia poprzez Google: {decodeURIComponent(errorOAuth2Message)}</p>}
            <form onSubmit={handleLogin}>
                <label>Email:</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}/>
                <br/>
                <label>Hasło:</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}/>
                <br/>
                <button type="submit">Zaloguj</button>
                {errorMessage && <p>{errorMessage}</p>}
            </form>
            <a href={'http://localhost:8080/oauth2/authorization/google?redirect_uri=http://localhost:3000/home'}>Zaloguj
                się poprzez Google</a>
            <button onClick={goToRegisterPage}>Nie masz konta? Zarejestruj się!</button>
        </div>
    );
}

export default Login;