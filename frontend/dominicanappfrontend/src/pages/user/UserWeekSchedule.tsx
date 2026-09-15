import React, {useEffect, useMemo, useRef, useState, Dispatch, SetStateAction} from 'react';
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
    currentWeek: Date;
    setCurrentWeek: Dispatch<SetStateAction<Date>>;
}

const UserWeekSchedule: React.FC<UserWeekScheduleProps> = ({userId, currentWeek, setCurrentWeek}) => {
    const currentWeekRef = useRef(currentWeek);
    const from = format(startOfWeek(currentWeek, {weekStartsOn: 0}), 'dd-MM-yyyy');
    const to = format(endOfWeek(currentWeek, {weekStartsOn: 0}), 'dd-MM-yyyy');

    const [userSchedules, setUserSchedules] = useState<Schedule[]>([]);
    const [specialEvents, setSpecialEvents] = useState<any[]>([]); // Zapisujemy listę wydarzeń z bazy

    // Hook dla grafików
    const {
        request: fetchSchedule,
        error,
        loading
    } = useHttp(`${backendUrl}/api/schedules/users/${userId}/week?from=${from}&to=${to}`, 'GET');

    // Hook dla wydarzeń specjalnych
    const { request: fetchEvents } = useHttp(`${backendUrl}/api/special-events`, 'GET');

    const todayDate = new Date();
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setScreenWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Pobieramy wydarzenia na samym początku
    useEffect(() => {
        fetchEvents(null, (data) => setSpecialEvents(data || []));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        currentWeekRef.current = currentWeek;

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

    // Funkcja sprawdzająca czy dzień fizycznie zawiera się w jakimkolwiek Wydarzeniu
    const isDayInSpecialEvent = (day: Date) => {
        const formatted = format(day, 'yyyy-MM-dd');
        return specialEvents.some(event => formatted >= event.startDate && formatted <= event.endDate);
    };

    const tasksForDay = (day: Date) => {
        const formattedDay = format(day, 'yyyy-MM-dd');
        let dailyTasks = userSchedules.filter(schedule => schedule.date === formattedDay);

        if (isDayInSpecialEvent(day)) {
            // Jeśli to czas SE - bierzemy TYLKO taski specjalne i CAŁKOWICIE ignorujemy normalne
            const specialTasks = dailyTasks.filter(schedule =>
                schedule.taskSection != null ||
                schedule.task.specialEvent != null ||
                schedule.task.specialEventId != null
            );

            specialTasks.sort((a, b) => {
                const idA = a.taskSection?.id || 0;
                const idB = b.taskSection?.id || 0;
                return idA - idB;
            });

            return (
                <div key={formattedDay} className="d-flex flex-column gap-2">
                    {specialTasks.map((schedule, index) => (
                        <div key={index} className="lh-sm">
                            <span className="fw-bold">{schedule.task.nameAbbrev}</span>{' '}
                            {schedule.taskSection && (
                                <small>({schedule.taskSection.name})</small>
                            )}
                        </div>
                    ))}
                </div>
            );
        }

        // Jeśli to ZWYKŁY dzień (poza SE) - bierzemy TYLKO normalne wpisy
        const normalTasks = dailyTasks.filter(schedule =>
             schedule.taskSection == null && schedule.task.specialEvent == null && schedule.task.specialEventId == null
        );

        const normalTasksAbbrevs = normalTasks.map(schedule => schedule.task.nameAbbrev);

        return (
            <div key={formattedDay}>
                {normalTasksAbbrevs.map((taskNameAbbrev, index) => (
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
                    <table className="table table-hover table-striped table-rounded table-shadow table-bordered text-center mb-0">
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
                                <td className="column-width-150 align-middle" key={index}>{tasksForDay(day)}</td>
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
                                    <th className={format(day, 'dd.MM.yyyy') === format(todayDate, 'dd.MM.yyyy') ? 'table-success align-middle text-center' : 'table-dark align-middle text-center'} style={{width: '30%'}}>
                                        {polishAbbreviation} <br/> {format(day, 'dd.MM.yyyy')}
                                    </th>
                                    <td className="align-middle">{tasksForDay(day)}</td>
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