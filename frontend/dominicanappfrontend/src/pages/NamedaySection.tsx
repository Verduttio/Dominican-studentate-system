import React, { useEffect, useState } from 'react';
import useHttp from "../services/UseHttp";
import { backendUrl } from "../utils/constants";
import { User } from "../models/Interfaces";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCakeCandles, faCalendarDay, faCalendarWeek} from '@fortawesome/free-solid-svg-icons';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, getDate, getMonth, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import LoadingSpinner from "../components/LoadingScreen";

interface NamedayCelebrant {
    user: User;
    dayName: string;
    fullDate: string;
    dateObj: Date;
}

interface NamedaySectionProps {
    currentWeek: Date; // Data przekazana z rodzica (Home)
}

const NamedaySection: React.FC<NamedaySectionProps> = ({ currentWeek }) => {
    const [celebrants, setCelebrants] = useState<NamedayCelebrant[]>([]);
    // Pobieramy wszystkich userów (można to zoptymalizować pobierając raz w Home, ale tak jest bezpieczniej)
    const { request: fetchUsers, loading } = useHttp(`${backendUrl}/api/users`, 'GET');

    const WEEK_START = 0;

    useEffect(() => {
        fetchUsers(null, (allUsers: User[]) => {
            // 1. Ustal zakres wybranego tygodnia na podstawie propsa currentWeek
            const start = startOfWeek(currentWeek, { weekStartsOn: WEEK_START });
            const end = endOfWeek(currentWeek, { weekStartsOn: WEEK_START });

            // 2. Wygeneruj dni dla tego konkretnego tygodnia
            const daysInWeek = eachDayOfInterval({ start, end });

            const foundCelebrants: NamedayCelebrant[] = [];

            allUsers.forEach(user => {
                if (!user.namedayDate) return;

                const namedayObj = parseISO(user.namedayDate);
                const nDay = getDate(namedayObj);
                const nMonth = getMonth(namedayObj);

                daysInWeek.forEach(currentWeekDay => {
                    if (getDate(currentWeekDay) === nDay && getMonth(currentWeekDay) === nMonth) {
                        foundCelebrants.push({
                            user: user,
                            dayName: format(currentWeekDay, 'EEEE', { locale: pl }),
                            fullDate: format(currentWeekDay, 'dd.MM'),
                            dateObj: currentWeekDay
                        });
                    }
                });
            });

            foundCelebrants.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
            setCelebrants(foundCelebrants);
        });
    }, [fetchUsers, currentWeek]);

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    if (loading) return <LoadingSpinner />;

    if (celebrants.length === 0) return null;

    return (
        <div className="d-flex justify-content-center fade-in mt-3">
            <div className="col-12 col-md-11 col-lg-9">
                <div className="card table-shadow table-rounded border-0 overflow-hidden">
                    <div className="bg-dark text-white text-center py-2 fw-bold">
                        <FontAwesomeIcon icon={faCakeCandles} className="me-2 text-warning" />
                        Imieniny w tym tygodniu
                    </div>

                    <div className="bg-white p-3">
                        <div className="row g-3 justify-content-center">
                            {celebrants.map((item) => (
                                <div key={item.user.id} className="col-12 col-sm-6 col-lg-4">
                                    {/* flex-column na mobilki (pionowo), flex-sm-row na tablety+ (poziomo) */}
                                    <div className="d-flex flex-column flex-sm-row align-items-center border rounded p-2 shadow-sm h-100" style={{backgroundColor: '#f8f9fa'}}>

                                        {/* --- DATA --- */}
                                        <div className="text-center px-2">
                                            <div className="fw-bold text-primary fs-5 lh-1">{item.fullDate}</div>
                                            <div className="small text-muted text-uppercase fw-bold" style={{fontSize: '0.7rem'}}>
                                                {item.dayName.substring(0, 3)}
                                            </div>
                                        </div>

                                        {/* --- SEPARATOR POZIOMY (Tylko Mobile) --- */}
                                        {/* Widoczny tylko poniżej breakpointu sm (d-block d-sm-none) */}
                                        <div className="d-block d-sm-none w-75 border-bottom my-2 opacity-50"></div>

                                        {/* --- SEPARATOR PIONOWY (Tylko Desktop) --- */}
                                        {/* Widoczny tylko od breakpointu sm w górę (d-none d-sm-block) */}
                                        <div className="d-none d-sm-block border-end mx-3 align-self-stretch opacity-50"></div>

                                        {/* --- OSOBA --- */}
                                        {/* Na mobile text-center, na desktopie text-start (do lewej) */}
                                        <div className="text-center text-sm-start overflow-hidden w-100">
                                            <span className="fw-bold d-block text-dark text-truncate" title={`${item.user.name} ${item.user.surname}`}>
                                                {item.user.name} {item.user.surname}
                                            </span>
                                            <span className="text-muted small fst-italic">
                                                <FontAwesomeIcon icon={faCalendarDay} className="me-1 small"/>
                                                {capitalize(item.dayName)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NamedaySection;