import React, { useState } from 'react';
import { format, addDays, subDays } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import {daysOfWeekAbbreviation} from "../models/DayOfWeek";

interface DaySelectorProps {
    currentDate: Date;
    setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
}

const DaySelector: React.FC<DaySelectorProps> = ({ currentDate, setCurrentDate }) => {
    const [calendarOpen, setCalendarOpen] = useState(false);

    const handlePreviousDay = () => {
        setCurrentDate(subDays(currentDate, 1));
    };

    const handleNextDay = () => {
        setCurrentDate(addDays(currentDate, 1));
    };

    const handleDateClick = () => {
        setCalendarOpen(!calendarOpen);
    };

    const handleCalendarClose = () => {
        setCalendarOpen(false);
    };

    const handleDateChange = (date: Date) => {
        setCurrentDate(date);
        handleCalendarClose();
    };

    const dayOfWeek = format(currentDate, 'EEEE').toUpperCase();
    const formattedDate = format(currentDate, 'dd-MM-yyyy');

    return (
        <div className="day-selector d-flex justify-content-center">
            <div className="card my-4" style={{ maxWidth: '400px' }}>
                <div className="card-body">
                    <div className="day-selector d-flex-no-media-resize justify-content-center align-items-center">
                        <button className="btn btn-outline-dark mx-2" onClick={handlePreviousDay}>
                            <FontAwesomeIcon icon={faChevronLeft}/>
                        </button>
                        {!calendarOpen && (
                                <button className={'btn btn-outline-dark'} onClick={handleDateClick}>
                                    <h5 className={'m-0'}>
                                        {daysOfWeekAbbreviation[dayOfWeek]} | {formattedDate}
                                    </h5>
                                </button>
                        )}
                        {calendarOpen && (
                            <DatePicker
                                selected={currentDate}
                                onChange={handleDateChange}
                                inline
                            />
                        )}
                        <button className="btn btn-outline-dark mx-2" onClick={handleNextDay}>
                            <FontAwesomeIcon icon={faChevronRight}/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DaySelector;
