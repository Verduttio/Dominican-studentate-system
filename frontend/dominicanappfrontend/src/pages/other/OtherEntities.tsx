import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import useIsAdmin from "../../services/UseIsAdmin";


const OtherEntities = () => {
    const navigate = useNavigate();
    const {isAdmin} = useIsAdmin();

    return (
        <div className="fade-in d-flex flex-column align-items-center" style={{minHeight: '80vh'}}>

            {isAdmin &&
                <div className="card mb-4 mw-100" style={{width: "600px"}} id="button-scale">
                    <div className="card-body text-center" onClick={() => {
                        navigate("/dates")
                    }}>
                        Daty
                    </div>
                </div>
            }

            <div className="card mb-4 mw-100" style={{width: "600px"}} id="button-scale">
                <div className="card-body text-center" onClick={() => {
                    navigate("/tasks")
                }}>
                    Oficja
                </div>
            </div>

            <div className="card mb-4 mw-100" style={{width: "600px"}} id="button-scale">
                <div className="card-body text-center" onClick={() => {
                    navigate("/conflicts")
                }}>
                    Konflikty
                </div>
            </div>

            <div className="card mb-4 mw-100" style={{width: "600px"}} id="button-scale">
                <div className="card-body text-center" onClick={() => {
                    navigate("/roles")
                }}>
                    Role
                </div>
            </div>

        </div>
    );
};

export default OtherEntities;
