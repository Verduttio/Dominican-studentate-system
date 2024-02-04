import React from 'react';
import {useNavigate} from "react-router-dom";
import WeekSelector from "../../components/WeekSelector";


function AddSchedule() {
    const navigate = useNavigate();

    return (
        <div>
            <WeekSelector />
            <button onClick={() => {}}>Kreator harmonogramu</button>
            <button onClick={() => {}}>Wybierz jedno zadanie i wyznacz osobę</button>
        </div>
    );
}

export default AddSchedule;
