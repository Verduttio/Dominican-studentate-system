import React, { useState } from 'react';
import LoadingSpinner from "../../components/LoadingScreen";
import {Provider} from "../../models/Interfaces";
import ChangePasswordPopup from "./ChangePasswordPopup";
import CurrentUserObstaclesTable from "./CurrentUserObstaclesTable";
import {useLocation, useNavigate} from "react-router-dom";
import AlertBox from "../../components/AlertBox";
import useGetOrCreateCurrentUser from "../../services/UseGetOrCreateCurrentUser";
import ChangeNameSurnamePopup from "./ChangeNameSurnamePopup";
import ChangeEntryDatePopup from "./ChangeEntryDatePopup";
import {formatEntryDate} from "../../utils/LocalDateTimeFormatter";

function UserProfilePage () {
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showChangeNameSurname, setShowChangeNameSurname] = useState(false);
    const [showChangeEntryDate, setShowChangeEntryDate] = useState(false);
    const { currentUser, errorCurrent } = useGetOrCreateCurrentUser()
    const navigate = useNavigate();
    const location = useLocation();
    const locationStateMessage = location.state?.message;

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
                                    <div><strong>Data pierwszych ślubów:</strong> {currentUser.entryDate ? formatEntryDate(currentUser.entryDate) : "BRAK DANYCH"}</div>
                                    <div><strong>Id:</strong> {currentUser.id}</div>
                                    <div><strong>Zarejestrowany przez:</strong> {currentUser.provider}</div>
                                    <div className={"d-flex justify-content-between mt-1"}>
                                        <button
                                            className="btn btn-info m-1"
                                            onClick={() => setShowChangeNameSurname(true)}
                                        >
                                            Zmień imię i nazwisko
                                        </button>
                                        <button
                                            className="btn btn-info m-1"
                                            onClick={() => setShowChangeEntryDate(true)}
                                        >
                                            Zmień datę pierwszych ślubów
                                        </button>
                                        {currentUser.provider === Provider.LOCAL &&
                                            <div className="d-flex justify-content-center m-1">
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
                            </div>
                            {showChangePassword && <ChangePasswordPopup userId={currentUser.id}
                                                                        onClose={() => setShowChangePassword(false)}/>}
                            {showChangeNameSurname && <ChangeNameSurnamePopup userId={currentUser.id}
                                                                              onClose={() => setShowChangeNameSurname(false)}/>}
                            {showChangeEntryDate && <ChangeEntryDatePopup userId={currentUser.id}
                                                                                onClose={() => setShowChangeEntryDate(false)}
                                                                          initialDateTime={currentUser.entryDate}
                            />}
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
                    <div className="d-flex justify-content-center">
                        <button className="btn btn-success mb-2" onClick={() => {
                            navigate("/add-obstacle/myself")
                        }}>Dodaj przeszkodę
                        </button>
                    </div>
                    {locationStateMessage && <AlertBox text={locationStateMessage} type={'success'} width={'500px'}/>}
                    <CurrentUserObstaclesTable/>
                </>
            )}
        </div>

    );
}

export default UserProfilePage;