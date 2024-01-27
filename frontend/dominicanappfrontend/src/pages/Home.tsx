import React, {useEffect} from 'react';
import {useNavigate} from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import useHttp from "../services/UseHttp";

function Home () {
    const navigate = useNavigate();

    const goToTasksPage = () => {
        navigate('/tasks');
    };

    const goToUserProfile = () => {
        navigate('/user-profile');
    };

    const goToObstaclesPage = () => {
        navigate('/obstacles');
    };

    const goToConflictsPage = () => {
        navigate('/conflicts');
    };

    const { error, func, loading, request } = useHttp('http://localhost:8080/api/users/current/check', 'GET');

    useEffect(() => {
        request()
            .then(() => {});
    }, [request]);

    useEffect(() => {
        if (func) {
            func();
        }
    }, [func]);

    if (loading) return <div>Ładowanie...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div>
            <h1>Ekran domyślny</h1>
            <button onClick={goToTasksPage}>Tasks</button>
            <LogoutButton/>
            <button onClick={goToUserProfile}>Strona Użytkownika</button>
            <button onClick={goToObstaclesPage}>Przeszkody</button>
            <button onClick={goToConflictsPage}>Konflikty</button>
        </div>
    );
}

export default Home;