import React, { useEffect, useState } from 'react';
import useHttp from "../services/UseHttp";
import { backendUrl } from "../utils/constants";
import LoadingSpinner from "../components/LoadingScreen";
import {User} from "../models/Interfaces";
import UserWeekSchedule from "./user/UserWeekSchedule";

function Home() {
    const { error: errorCurrent, loading: loadingCurrent, request: requestCurrent } = useHttp(`${backendUrl}/api/users/current`, 'GET');
    const { error: errorFetchUserSchedules, loading: loadingFetchUserSchedules, request: requestFetchUserSchedules } = useHttp();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    let userId: number = localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId') as string) : 0;

    useEffect(() => {
        requestCurrent(null, ((data : User) => {
            setCurrentUser(data);
            localStorage.setItem('userId', data.id.toString());
            userId = data.id;
        }));
    }, [requestCurrent, requestFetchUserSchedules, userId]);

    if (loadingCurrent || loadingFetchUserSchedules) return <LoadingSpinner />;
    if (errorCurrent || errorFetchUserSchedules) return <div className="alert alert-danger">{errorCurrent || errorFetchUserSchedules}</div>;

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <h2 className="entity-header">Witaj {currentUser?.name} {currentUser?.surname}</h2>
            </div>
            <div className="d-flex justify-content-center">
                <h2 className="entity-header">Twój harmonogram na</h2>
            </div>
            <UserWeekSchedule userId={userId}/>
        </div>
    );
}

export default Home;
