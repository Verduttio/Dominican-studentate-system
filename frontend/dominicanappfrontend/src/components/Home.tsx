import React from 'react';
import {useNavigate} from "react-router-dom";
import LogoutButton from "./LogoutButton";

function Home () {
    const navigate = useNavigate();

    const goToTasksPage = () => {
        navigate('/tasks');
    };

    return (
        <div>
            <h1>Ekran domyślny</h1>
            <button onClick={goToTasksPage}>Tasks</button>
            <LogoutButton/>
        </div>
    );
}

export default Home;