import React from 'react';
import {useNavigate} from 'react-router-dom';


const OtherEntities = () => {
    const navigate = useNavigate();

    return (
        <div className="fade-in w-25">
            <div className="card mb-4" id="button-scale">
                <div className="card-body text-center" onClick={() => {navigate("/tasks")}}>
                    Zadania
                </div>
            </div>
            <div className="card mb-4" id="button-scale">
                <div className="card-body text-center" onClick={() => {navigate("/conflicts")}}>
                    Konflikty
                </div>
            </div>
            <div className="card mb-4" id="button-scale">
                <div className="card-body text-center" onClick={() => {navigate("/roles")}}>
                    Role
                </div>
            </div>
        </div>
    );
};

export default OtherEntities;
