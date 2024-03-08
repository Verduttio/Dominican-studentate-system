import React, {useState, ChangeEvent, FormEvent, useEffect} from 'react';
import axios from 'axios';
import {useNavigate} from "react-router-dom";
import {backendUrl, frontendUrl} from "../../utils/constants";
import useHttp from "../../services/UseHttp";
import './Login.css';
import LoadingSpinner from "../../components/LoadingScreen";
import '../../components/Common.css';

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
    const { loading, request  } = useHttp(`${backendUrl}/api/users/current/check`, 'GET');
    const [registerSuccess, setRegisterSuccess] = useState<boolean>(false);

    const navigate = useNavigate();

    useEffect(() => {
        request(null, () => navigate('/home'), true)
            .then(() => {});
    }, [request, navigate]);

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        setError("")
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        if (!name || !surname || !email || !password || !confirmPassword) {
            setError('Wszystkie pola muszą być wypełnione');
            return false;
        }

        if (password !== confirmPassword) {
            setError('Hasła nie są takie same');
            return false;
        }
        if (password.length < 8) {
            setError('Hasło musi mieć co najmniej 8 znaków');
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
                setRegisterSuccess(true);
                // navigate('/login')
            }
        } catch (err: any) {
            console.error(err.response.data);
            setError(err.response.data)
        }
    };

    if (loading) return <LoadingSpinner />;
    return (
        <div className="container fade-in">
            <div className="row justify-content-center">
                <div className="d-flex align-items-center justify-content-center">
                    <div className="login-image col-md-6">
                        <img src={`${process.env.PUBLIC_URL}/Seal_of_the_Dominican_Order.svg`} alt="Logo zakonu"
                             className="img-fluid"/>
                        <h3 className="text-center mt-3">Dominikański system studentatu</h3>
                    </div>

                    <div className="col-md-6 login-box">
                        <div
                            className="d-flex align-items-end mb-4" style={{ justifyContent: 'flex-start' }}>
                            <button onClick={() => navigate('/login')} className="btn btn-secondary"
                                    style={{marginRight: '10px'}}>
                                &larr; Powrót
                            </button>
                            <h2 className="mb-0">Rejestracja</h2>
                        </div>
                        <form onSubmit={onSubmit}>
                            <div className="mb-3">
                                <label htmlFor="name" className="form-label">Imię:</label>
                                <input type="text" className="form-control" id="name" name="name" value={name}
                                       onChange={onChange} autoComplete="off"/>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="surname" className="form-label">Nazwisko:</label>
                                <input type="text" className="form-control" id="surname" name="surname"
                                       value={surname}
                                       onChange={onChange} autoComplete="off"/>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Email:</label>
                                <input type="email" className="form-control" id="email" name="email" value={email}
                                       onChange={onChange} autoComplete="off"/>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">Hasło:</label>
                                <input type="password" className="form-control" id="password" name="password"
                                       value={password}
                                       onChange={onChange} autoComplete="off"/>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="confirmPassword" className="form-label">Powtórz hasło:</label>
                                <input type="password" className="form-control" id="confirmPassword"
                                       name="confirmPassword"
                                       value={confirmPassword} onChange={onChange} autoComplete="off"/>
                            </div>
                            {error && <div className="alert alert-danger" role="alert">{error}</div>}
                            {registerSuccess &&
                                <>
                                    <div className="alert alert-success" role="alert">
                                        Zarejestrowano pomyślnie. Możesz się teraz zalogować
                                    </div>
                                    <button className={"btn btn-success w-100"} onClick={() => navigate('/login')}>Zaloguj się</button>
                                </>
                            }
                            <button type="submit" className="btn btn-primary w-100" hidden={registerSuccess}>Zarejestruj</button>
                        </form>
                        <div className="text-center mt-3" hidden={registerSuccess}>
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
                                Zarejestruj się przez Google
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
