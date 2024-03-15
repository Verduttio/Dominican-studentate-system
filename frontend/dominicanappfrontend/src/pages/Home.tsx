import React from 'react';
import LoadingSpinner from "../components/LoadingScreen";
import UserWeekSchedule from "./user/UserWeekSchedule";
import UserTasksStatistics from "./user/UserTasksStatistics";
import AlertBox from "../components/AlertBox";
import useGetOrCreateCurrentUser from "../services/UseGetOrCreateCurrentUser";


function Home() {
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
