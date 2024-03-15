import React, { useEffect, useState } from 'react';
import useHttp from "../services/UseHttp";
import { backendUrl } from "../utils/constants";
import LoadingSpinner from "../components/LoadingScreen";
import {User} from "../models/Interfaces";
import UserWeekSchedule from "./user/UserWeekSchedule";
import UserTasksStatistics from "./user/UserTasksStatistics";
import AlertBox from "../components/AlertBox";
import useGetOrCreateCurrentUser from "../services/UseGetOrCreateCurrentUser";


function Home() {
    // let userId: number = localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId') as string) : 0;
    // const { error: errorCurrent, loading: loadingCurrent, request: requestCurrent } = useHttp(`${backendUrl}/api/users/current`, 'GET');
    // const [currentUser, setCurrentUser] = useState<User | null>(null);
    //
    // useEffect(() => {
    //     requestCurrent(null, ((data : User) => {
    //         setCurrentUser(data);
    //         localStorage.setItem('userId', data.id.toString());
    //         userId = data.id;
    //     }));
    // }, [requestCurrent, userId]);

    const { currentUser, errorCurrent } = useGetOrCreateCurrentUser()

    if (!currentUser && !errorCurrent) return <LoadingSpinner />;
    if (errorCurrent) return (
        <AlertBox text={errorCurrent} type="danger" width={'500px'} />
    )
    else if (currentUser) {
        return (
            <div className="fade-in">
                <div className="d-flex justify-content-center">
                    <h2 className="entity-header">Witaj {currentUser.name} {currentUser.surname}</h2>
                </div>
                <div className="d-flex justify-content-center">
                    <h2 className="entity-header">Twój harmonogram na</h2>
                </div>
                <UserWeekSchedule userId={currentUser.id}/>
                <div className="d-flex justify-content-center">
                    <h4 className="entity-header-dynamic-size mb-2 mt-0">Statystyki</h4>
                </div>
                <UserTasksStatistics userId={currentUser.id}/>
            </div>
        );
    } else {
        return (
            <AlertBox text={"Nie udało się pobrać danych użytkownika"} type="danger" width={'500px'} />
        );
    }
}

export default Home;
