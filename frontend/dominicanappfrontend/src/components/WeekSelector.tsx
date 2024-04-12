import React from 'react';
import { format, startOfWeek, endOfWeek, addDays, subDays } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';


interface WeekSelectorProps {
    currentWeek: Date;
    setCurrentWeek: React.Dispatch<React.SetStateAction<Date>>;
}

const WeekSelector: React.FC<WeekSelectorProps> = ({ currentWeek, setCurrentWeek }) => {
    const startOfWeekDate = startOfWeek(currentWeek, { weekStartsOn: 0 });
    const endOfWeekDate = endOfWeek(currentWeek, { weekStartsOn: 0 });

    const handlePreviousWeek = () => {
        setCurrentWeek(subDays(startOfWeekDate, 7));
    };

    const handleNextWeek = () => {
        setCurrentWeek(addDays(endOfWeekDate, 1));
    };

    return (
        <div className="week-selector d-flex justify-content-center">
            <div className="card my-4" style={{maxWidth: '600px'}}>
                <div className="card-body">
                    <div className="week-selector d-flex justify-content-center align-items-center">
                        <button className="btn btn-outline-dark mx-2" onClick={handlePreviousWeek}>
                            <FontAwesomeIcon icon={faChevronLeft}/>
                        </button>
                        <h5 className="card-title mx-2">
                            {format(startOfWeekDate, 'dd-MM-yyyy')} - {format(endOfWeekDate, 'dd-MM-yyyy')}
                        </h5>
                        <button className="btn btn-outline-dark mx-2" onClick={handleNextWeek}>
                            <FontAwesomeIcon icon={faChevronRight}/>
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
}

export default WeekSelector;
