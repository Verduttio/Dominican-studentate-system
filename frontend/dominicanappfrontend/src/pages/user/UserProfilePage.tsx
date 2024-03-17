import React, { useState } from 'react';
import LoadingSpinner from "../../components/LoadingScreen";
import {Provider} from "../../models/Interfaces";
import ChangePasswordPopup from "./ChangePasswordPopup";
import CurrentUserObstaclesTable from "./CurrentUserObstaclesTable";
import {useNavigate} from "react-router-dom";
import AlertBox from "../../components/AlertBox";
import useGetOrCreateCurrentUser from "../../services/UseGetOrCreateCurrentUser";

function UserProfilePage () {
    const [showChangePassword, setShowChangePassword] = useState(false);
    //TODO: We should fetch user from backend, because user can change his roles and local data can be outdated
    const { currentUser, errorCurrent } = useGetOrCreateCurrentUser()
    const navigate = useNavigate();

    if (!currentUser && !errorCurrent) return <LoadingSpinner />;
    if (errorCurrent) return (
        <AlertBox text={errorCurrent} type="danger" width={'500px'} />
    )

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <h1 className="entity-header">Mój profil</h1>
            </div>
            {currentUser && (
                <>
                    <div className="row d-flex align-items-center">
                        <div className="col-md-6 mw-100" style={{width: '400px'}}>
                            <div className="card shadow-sm m-1">
                                <div className="card-top-bar"></div>
                                <div className="card-body">
                                    <div><strong>Imię:</strong> {currentUser.name}</div>
                                    <div><strong>Nazwisko:</strong> {currentUser.surname}</div>
                                    <div><strong>Email:</strong> {currentUser.email}</div>
                                    <div><strong>Id:</strong> {currentUser.id}</div>
                                    <div><strong>Zarejestrowany przez:</strong> {currentUser.provider}</div>
                                    {currentUser.provider === Provider.LOCAL &&
                                        <div className="d-flex justify-content-center p-3">
                                            <button
                                                className="btn btn-danger"
                                                onClick={() => setShowChangePassword(true)}
                                            >
                                                Zmień hasło
                                            </button>
                                        </div>
                                    }
                                </div>
                            </div>
                            {showChangePassword && <ChangePasswordPopup userId={currentUser.id} onClose={() => setShowChangePassword(false)} />}
                        </div>
                        <div className="col-md-6 mw-100" style={{width: '400px'}}>
                            <div className="card shadow-sm m-1">
                                <div className="card-top-bar"></div>
                                <div className="card-body">
                                    <ul>
                                        {currentUser.roles.map((role, index) => (
                                            <li key={index}>{role.name}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="d-flex justify-content-center">
                        <h1 className="entity-header">Moje przeszkody</h1>
                    </div>
                    <CurrentUserObstaclesTable/>
                    <div className="d-flex justify-content-center">
                        <button className="btn btn-success" onClick={() => {navigate("/add-obstacle/myself")}}>Dodaj przeszkodę</button>
                    </div>
                </>
            )}
        </div>

    );
}

export default UserProfilePage;