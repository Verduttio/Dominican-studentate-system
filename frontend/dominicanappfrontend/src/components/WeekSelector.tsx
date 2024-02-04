import React, { useState } from 'react';
import { format, startOfWeek, endOfWeek, addDays, subDays } from 'date-fns';

function WeekSelector () {
    const [currentWeek, setCurrentWeek] = useState<Date>(new Date());

    const startOfWeekDate: Date = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const endOfWeekDate: Date = endOfWeek(currentWeek, { weekStartsOn: 1 });

    const handlePreviousWeek = (): void => {
        setCurrentWeek(subDays(startOfWeekDate, 7));
    };

    const handleNextWeek = (): void => {
        setCurrentWeek(addDays(endOfWeekDate, 1));
    };

    return (
        <div>
            <button onClick={handlePreviousWeek}>&lt;</button>
            <span>
                {format(startOfWeekDate, 'dd-MM-yyyy')} : {format(endOfWeekDate, 'dd-MM-yyyy')}
            </span>
            <button onClick={handleNextWeek}>&gt;</button>
        </div>
    );
}

export default WeekSelector;
