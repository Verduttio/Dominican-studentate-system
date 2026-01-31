import React, {useState} from 'react';
import LoadingSpinner from "../components/LoadingScreen";
import UserWeekSchedule from "./user/UserWeekSchedule";
import UserTasksStatistics from "./user/UserTasksStatistics";
import AlertBox from "../components/AlertBox";
import useGetOrCreateCurrentUser from "../services/UseGetOrCreateCurrentUser";
import UserProfilePage from "./user/UserProfilePage";
import NamedaySection from "./NamedaySection";


function Home() {
    const { currentUser, errorCurrent } = useGetOrCreateCurrentUser()

    const [currentWeek, setCurrentWeek] = useState(new Date());

    if (!currentUser && !errorCurrent) return <LoadingSpinner />;
    if (errorCurrent) return (
        <AlertBox text={errorCurrent} type="danger" width={'500px'} />
    )
    else if (currentUser) {
        return (
            <div className="fade-in">
                <NamedaySection currentWeek={currentWeek} />

                <div className="d-flex justify-content-center">
                    <h2 className="entity-header mb-0">Mój harmonogram</h2>
                </div>
                <UserWeekSchedule
                    userId={currentUser.id}
                    currentWeek={currentWeek}
                    setCurrentWeek={setCurrentWeek}/>
                <UserProfilePage/>
                <div className="d-flex justify-content-center">
                    <h2 className="entity-header-dynamic-size my-2">Statystyki</h2>
                </div>
                <UserTasksStatistics userId={currentUser.id}/>
            </div>
        );
    } else {
        return (
            <AlertBox text={"Nie udało się pobrać danych użytkownika"} type="danger" width={'500px'}/>
        );
    }
}

export default Home;
