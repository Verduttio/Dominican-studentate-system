import React, {useEffect, useMemo, useState} from 'react';
import {addDays, endOfWeek, format, startOfWeek} from "date-fns";
import useHttp from "../../services/UseHttp";
import {Schedule} from "../../models/Interfaces";
import {backendUrl} from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";
import WeekSelector from "../../components/WeekSelector";
import {daysOfWeekAbbreviation} from "../../models/DayOfWeek";
import AlertBox from "../../components/AlertBox";

interface UserWeekScheduleProps {
    userId: number;
}

const UserWeekSchedule: React.FC<UserWeekScheduleProps> = ({userId}) => {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [userSchedules, setUserSchedules] = useState<Schedule[]>([]);
    const {
        request: fetchSchedule,
        error,
        loading
    } = useHttp(`${backendUrl}/api/schedules/users/${userId}/week?from=${format(startOfWeek(currentWeek, {weekStartsOn: 1}), 'dd-MM-yyyy')}&to=${format(endOfWeek(currentWeek, {weekStartsOn: 1}), 'dd-MM-yyyy')}`, 'GET');
    const todayDate = new Date();
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setScreenWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        fetchSchedule(null, (data) => setUserSchedules(data));
    }, [fetchSchedule]);

    const weekDays = useMemo(() => {
        let weekStart = startOfWeek(currentWeek, {weekStartsOn: 1});
        return Array.from({length: 7}).map((_, i) => addDays(weekStart, i));
    }, [currentWeek]);

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

    function getEnglishDayOfWeek(date: Date): string {
        const daysOfWeek = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
        return daysOfWeek[date.getDay()];
    }

    const renderTablePC = () => {
        return (
            <div className="d-flex justify-content-center">
                <div className="table-responsive" style={{maxWidth: '1000px'}}>
                    <table className="table table-hover table-striped table-rounded table-shadow">
                        <thead className="table-dark">
                        <tr>
                            {weekDays.map((day, index) => {
                                const englishDayOfWeek = getEnglishDayOfWeek(day);
                                const polishAbbreviation = daysOfWeekAbbreviation[englishDayOfWeek];

                                return (
                                    <th key={index}
                                        style={{backgroundColor: format(day, 'dd.MM.yyyy') === format(todayDate, 'dd.MM.yyyy') ? 'green' : ''}}>
                                        {polishAbbreviation}
                                        <br/> {format(day, 'dd.MM.yyyy')}
                                    </th>
                                );
                            })}
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
            </div>
        )
    }

    const renderTablePhone = () => {
        return (
            <div className="d-flex justify-content-center">
                <div className="table-responsive" style={{maxWidth: '600px'}}>
                    <table className="table table-hover table-striped table-rounded table-shadow">
                        <tbody>
                        {weekDays.map((day, index) => {
                            const englishDayOfWeek = getEnglishDayOfWeek(day);
                            const polishAbbreviation = daysOfWeekAbbreviation[englishDayOfWeek];
                            return (
                                <tr key={index}>
                                    <th className={format(day, 'dd.MM.yyyy') === format(todayDate, 'dd.MM.yyyy') ? 'table-success' : 'table-dark'}>
                                        {polishAbbreviation} <br/> {format(day, 'dd.MM.yyyy')}
                                    </th>
                                    <td>{tasksForDay(day)}</td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </div>

        )
    }


    const renderContent = () => {
        if (loading) return <LoadingSpinner/>;
        if (error) return <AlertBox text={error} type="danger" width={'500px'}/>;

        return screenWidth <= 700 ? renderTablePhone() : renderTablePC();
    };

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <WeekSelector currentWeek={currentWeek} setCurrentWeek={setCurrentWeek}/>
            </div>
            {renderContent()}
        </div>
    );
}


export default UserWeekSchedule;
