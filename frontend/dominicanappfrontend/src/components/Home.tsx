import React from 'react';
import {useNavigate} from "react-router-dom";
import LogoutButton from "./LogoutButton";

function Home () {
    const navigate = useNavigate();

    const goToTasksPage = () => {
        navigate('/tasks');
    };

    const goToUserProfile = () => {
        navigate('/user-profile');
    };

    return (
        <div>
            <h1>Ekran domyślny</h1>
            <button onClick={goToTasksPage}>Tasks</button>
            <LogoutButton/>
            <button onClick={goToUserProfile}>Strona Użytkownika</button>
        </div>
    );
}

export default Home;