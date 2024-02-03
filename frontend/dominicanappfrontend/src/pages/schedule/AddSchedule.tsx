import React from 'react';
import {useNavigate} from "react-router-dom";


function AddSchedule() {
    const navigate = useNavigate();

    return (
        <div>
            <button onClick={() => {}}>Dodaj harmonogram na cały tydzień</button>
            <button onClick={() => {}}>Dodaj pojedyncze zadanie do harmonogramu</button>
        </div>
    );
}

export default AddSchedule;
