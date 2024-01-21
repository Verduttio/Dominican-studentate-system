import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login () {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email || !password) {
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
                console.log('Nieprawidłowe dane logowania');
            } else {
                setErrorMessage('Wystąpił nieznany błąd podczas logowania.');
            }
        }
    };

    return (
        <div>
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
        </div>
    );
}

export default Login;