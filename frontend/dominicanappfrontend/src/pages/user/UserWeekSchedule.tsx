import React, {useEffect, useMemo, useRef, useState} from 'react';
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
    const currentWeekRef = useRef(currentWeek); // useRef to keep the value of currentWeek in the closure of useEffect
    const from = format(startOfWeek(currentWeek, {weekStartsOn: 0}), 'dd-MM-yyyy');
    const to = format(endOfWeek(currentWeek, {weekStartsOn: 0}), 'dd-MM-yyyy');
    const [userSchedules, setUserSchedules] = useState<Schedule[]>([]);
    const {
        request: fetchSchedule,
        error,
        loading
    } = useHttp(`${backendUrl}/api/schedules/users/${userId}/week?from=${from}&to=${to}`, 'GET');
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
        currentWeekRef.current = currentWeek; // keep the value of currentWeek up to date

        fetchSchedule(null, (data) => {
            if (format(startOfWeek(currentWeekRef.current, {weekStartsOn: 0}), 'dd-MM-yyyy') === from &&
                format(endOfWeek(currentWeekRef.current, {weekStartsOn: 0}), 'dd-MM-yyyy') === to) {
                setUserSchedules(data);
            }
        });
    }, [fetchSchedule, currentWeek, from, to]);

    const weekDays = useMemo(() => {
        let weekStart = startOfWeek(currentWeek, {weekStartsOn: 0});
        return Array.from({length: 7}).map((_, i) => addDays(weekStart, i));
    }, [currentWeek]);

    const tasksForDay = (day: Date) => {
        const formattedDay = format(day, 'yyyy-MM-dd');
        const dailyTasks = userSchedules.filter(schedule => schedule.date === formattedDay);
        const dailyTaskNamesAbbrevs = dailyTasks.map(schedule => schedule.task.nameAbbrev);

        return (
            <div key={formattedDay}>
                {dailyTaskNamesAbbrevs.map((taskNameAbbrev, index) => (
                    <div key={index}>{taskNameAbbrev}</div>
                ))}
            </div>
        );
    };

    function getEnglishDayOfWeek(date: Date): string {
        const daysOfWeek = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
        return daysOfWeek[date.getDay()];
    }

    const renderTablePC = () => {
        return (
            <div className="d-flex-no-media-resize justify-content-center">
                <div className="table-responsive-fit-content">
                    <table className="table table-hover table-striped table-rounded table-shadow table-bordered text-cente mb-0">
                        <thead className="table-dark">
                        <tr>
                            {weekDays.map((day, index) => {
                                const englishDayOfWeek = getEnglishDayOfWeek(day);
                                const polishAbbreviation = daysOfWeekAbbreviation[englishDayOfWeek];

                                return (
                                    <th key={index}
                                        className="column-width-150"
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
                                <td className="column-width-150" key={index}>{tasksForDay(day)}</td>
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
