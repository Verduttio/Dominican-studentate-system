import React from 'react';
import { format, startOfWeek, endOfWeek, addDays, subDays } from 'date-fns';

interface WeekSelectorProps {
    currentWeek: Date;
    setCurrentWeek: React.Dispatch<React.SetStateAction<Date>>;
}

const WeekSelector: React.FC<WeekSelectorProps> = ({ currentWeek, setCurrentWeek }) => {
    const startOfWeekDate = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const endOfWeekDate = endOfWeek(currentWeek, { weekStartsOn: 1 });

    const handlePreviousWeek = () => {
        setCurrentWeek(subDays(startOfWeekDate, 7));
    };

    const handleNextWeek = () => {
        setCurrentWeek(addDays(endOfWeekDate, 1));
    };

    return (
        <div>
            <button onClick={handlePreviousWeek}>&lt;</button>
            <span>
                {format(startOfWeekDate, 'dd-MM-yyyy')} - {format(endOfWeekDate, 'dd-MM-yyyy')}
            </span>
            <button onClick={handleNextWeek}>&gt;</button>
        </div>
    );
}

export default WeekSelector;
