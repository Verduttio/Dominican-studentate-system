import React, { useEffect, useState, useMemo } from 'react';
import useHttp from "../services/UseHttp";
import { backendUrl } from "../utils/constants";
import LoadingSpinner from "../components/LoadingScreen";
import {addDays, format, startOfWeek} from "date-fns";
import {Schedule, User} from "../models/Interfaces";

function Home() {
    const { error: errorCurrent, loading: loadingCurrent, request: requestCurrent } = useHttp(`${backendUrl}/api/users/current`, 'GET');
    const { error: errorFetchUserSchedules, loading: loadingFetchUserSchedules, request: requestFetchUserSchedules } = useHttp();
    const [userSchedules, setUserSchedules] = useState<Schedule[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const date = new Date();
    let userId: number = localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId') as string) : 0;

    const weekDays = useMemo(() => {
        const today = new Date();
        let weekStart = startOfWeek(today, { weekStartsOn: 1 });
        return Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
    }, []);

    const tasksForDay = (day: Date) => {
        const formattedDay = format(day, 'yyyy-MM-dd');
        const dailyTasks = userSchedules.filter(schedule => schedule.date === formattedDay);

        return (
            <>
                {dailyTasks.map((schedule, index, array) => (
                    <div key={index} style={{
                        borderBottom: index === array.length - 1 ? 'none' : '1px solid black',
                        padding: '2px 0',
                    }}>
                        {schedule.task.name}
                    </div>
                ))}
            </>
        );
    };

    useEffect(() => {
        requestCurrent(null, ((data : User) => {
            setCurrentUser(data);
            localStorage.setItem('userId', data.id.toString());
            userId = data.id;
            const fromDate = format(weekDays[0], 'dd-MM-yyyy');
            const toDate = format(weekDays[6], 'dd-MM-yyyy');
            requestFetchUserSchedules(null, (data: Schedule[]) => {
                setUserSchedules(data);
            }, false, `${backendUrl}/api/schedules/users/${userId}/week?from=${fromDate}&to=${toDate}`, 'GET');
        }));
    }, [requestCurrent, requestFetchUserSchedules, userId, weekDays]);

    if (loadingCurrent || loadingFetchUserSchedules) return <LoadingSpinner />;
    if (errorCurrent || errorFetchUserSchedules) return <div className="alert alert-danger">{errorCurrent || errorFetchUserSchedules}</div>;

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <h2 className="entity-header">Witaj {currentUser?.id} {currentUser?.name} {currentUser?.surname}</h2>
            </div>
            <div className="d-flex justify-content-center">
                <h2 className="entity-header">Twój harmonogram na ten tydzień</h2>
            </div>
            <table className="table table-hover table-striped table-responsive table-rounded table-shadow">
                <thead className="table-dark">
                <tr>
                    {weekDays.map((day, index) => (
                        <th key={index}
                            style={{backgroundColor: format(day, 'dd.MM.yyyy') === format(date, 'dd.MM.yyyy') ? 'green' : ''}}>
                            {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Niedz'][index]} <br/> {format(day, 'dd.MM.yyyy')}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                <tr>
                    {weekDays.map((day, index) => (
                        <td key={index}>{tasksForDay(day)}</td>
                    ))}
                </tr>
                </tbody>
            </table>
        </div>
    );
}

export default Home;
