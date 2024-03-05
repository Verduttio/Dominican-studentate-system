import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import WeekSelector from "../../components/WeekSelector";
import { format, startOfWeek, endOfWeek } from 'date-fns';

function AddSchedule() {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const navigate = useNavigate();

    const handleScheduleCreator = () => {
        const from = format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd-MM-yyyy');
        const to = format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd-MM-yyyy');
        navigate(`/schedule-creator?from=${from}&to=${to}`);
    };

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <h1 className="entity-header">Wybierz tydzień</h1>
            </div>
            <WeekSelector currentWeek={currentWeek} setCurrentWeek={setCurrentWeek}/>
            <div className="d-flex justify-content-center">
                <button className="btn btn-success me-4" onClick={handleScheduleCreator}>Zatwierdź</button>
            </div>
        </div>
    );
}

export default AddSchedule;
