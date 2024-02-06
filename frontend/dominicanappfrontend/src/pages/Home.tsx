import React, {useEffect} from 'react';
import {useNavigate} from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import useHttp from "../services/UseHttp";
import {backendUrl} from "../utils/constants";

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

    const goToUsersPage = () => {
        navigate('/users');
    };

    const goToSchedulePage = () => {
        navigate('/schedule');
    }

    const goToRolesPage = () => {
        navigate('/roles');
    }

    const { error, loading, request } = useHttp(`${backendUrl}/api/users/current/check`, 'GET');

    useEffect(() => {
        request()
            .then(() => {});
    }, [request]);

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
            <button onClick={goToUsersPage}>Użytkownicy</button>
            <button onClick={goToSchedulePage}>Harmonogram</button>
            <button onClick={goToRolesPage}>Role</button>
        </div>
    );
}

export default Home;