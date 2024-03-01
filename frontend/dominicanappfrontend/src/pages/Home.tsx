import React, { useEffect, useState, useMemo } from 'react';
import useHttp from "../services/UseHttp";
import { backendUrl } from "../utils/constants";
import LoadingSpinner from "../components/LoadingScreen";
import {addDays, format, startOfWeek} from "date-fns";
import {Schedule} from "../models/Interfaces";

function Home() {
    const { error, loading, request } = useHttp(`${backendUrl}/api/users/current/check`, 'GET');
    const { error: errorFetchUserSchedules, loading: loadingFetchUserSchedules, request: requestFetchUserSchedules } = useHttp();
    const [userSchedules, setUserSchedules] = useState<Schedule[]>([]);
    // const [date] = useState(new Date());
    const date = new Date();
    const userId: number = 51;

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
        request().then(() => {});

        const fromDate = format(weekDays[0], 'dd-MM-yyyy');
        const toDate = format(weekDays[6], 'dd-MM-yyyy');
        requestFetchUserSchedules(null, (data: Schedule[]) => {
            setUserSchedules(data);
        }, false, `${backendUrl}/api/schedules/users/${userId}?from=${fromDate}&to=${toDate}`, 'GET');
    }, [request, requestFetchUserSchedules, userId, weekDays]);

    if (loading || loadingFetchUserSchedules) return <LoadingSpinner />;
    if (error || errorFetchUserSchedules) return <div className="alert alert-danger">{error || errorFetchUserSchedules}</div>;

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <h2 className="entity-header">Twój harmonogram na ten tydzień:</h2>
            </div>
            <table className="table table-hover table-striped table-responsive table-rounded table-shadow">
                <thead className="table-dark">
                <tr>
                    {weekDays.map((day, index) => (
                        <th key={index} style={{ backgroundColor: format(day, 'dd.MM.yyyy') === format(date, 'dd.MM.yyyy') ? 'green' : '' }}>
                            {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Niedz'][index]} <br /> {format(day, 'dd.MM.yyyy')}
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
