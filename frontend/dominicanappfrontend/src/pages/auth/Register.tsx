import React, {useState, ChangeEvent, FormEvent, useEffect} from 'react';
import axios from 'axios';
import {useNavigate} from "react-router-dom";
import {backendUrl, frontendUrl} from "../../utils/constants";
import useHttp from "../../services/UseHttp";

interface FormData {
    name: string;
    surname: string;
    email: string;
    password: string;
    confirmPassword: string;
}

function Register () {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        surname: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState<string>('');
    const { name, surname, email, password, confirmPassword } = formData;
    const { loading, request } = useHttp(`${backendUrl}/api/users/current/check`, 'GET');

    const navigate = useNavigate();

    useEffect(() => {
        request(null, () => navigate('/home'))
            .then(() => {});
    }, [request, navigate]);

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        if (password !== confirmPassword) {
            setError('Hasła nie są takie same');
            return false;
        }
        if (password.length < 8) {
            setError('Hasło musi mieć co najmniej 8 znaków');
            return false;
        }
        if (!name || !surname || !email || !password || !confirmPassword) {
            setError('Wszystkie pola muszą być wypełnione');
            return false;
        }
        return true;
    };

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const response = await axios.post(`${backendUrl}/api/users/register`, formData);
            console.log(response.data);

            if(response.status === 200) {
                console.log('Zarejestrowano pomyślnie');
                navigate('/login')
            }
        } catch (err: any) {
            console.error(err.response.data);
            setError(err.response.data)
        }
    };

    if (loading) return <div>Ładowanie...</div>;
    return (
        <div>
            <h2>Rejestracja</h2>
            {error && <p style={{color: 'red'}}>{error}</p>}
            <form onSubmit={onSubmit} style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                <input type="text" name="name" value={name} onChange={onChange} placeholder="Imię" required/>
                <input type="text" name="surname" value={surname} onChange={onChange} placeholder="Nazwisko" required/>
                <input type="email" name="email" value={email} onChange={onChange} placeholder="Email" required/>
                <input type="password" name="password" value={password} onChange={onChange} placeholder="Hasło"
                       required/>
                <input type="password" name="confirmPassword" value={confirmPassword} onChange={onChange}
                       placeholder="Powtórz hasło" required/>
                <button type="submit">Zarejestruj</button>
            </form>
            <p>
                Lub <a href={`${backendUrl}/oauth2/authorization/google?redirect_uri=${frontendUrl}/home`}>zarejestruj się za pomocą Google</a>
            </p>
        </div>
    );
}

export default Register;
