import React, {useEffect, useState} from 'react';
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
import axios from "axios";
import {backendUrl} from "../../utils/constants";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCalendarAlt, faCheck, faCopy} from "@fortawesome/free-solid-svg-icons";

function UserProfilePage () {
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showChangeNameSurname, setShowChangeNameSurname] = useState(false);
    const [showChangeEntryDate, setShowChangeEntryDate] = useState(false);
    const { currentUser, errorCurrent } = useGetOrCreateCurrentUser()
    const navigate = useNavigate();
    const location = useLocation();
    const locationStateMessage = location.state?.message;

    const [calendarLink, setCalendarLink] = useState("");
    const [copied, setCopied] = useState(false);

    // Pobierz token przy załadowaniu komponentu
    useEffect(() => {
        if (currentUser) {
            axios.get(`${backendUrl}/api/calendar/my-link`, { withCredentials: true })
                .then(res => {
                    const token = res.data.token;
                    setCalendarLink(`${backendUrl}/api/calendar/ics/${token}`);
                })
                .catch(err => console.error("Nie udało się pobrać linku do kalendarza"));
        }
    }, [currentUser]);

    const handleCopy = () => {
        if (!calendarLink) return;
        navigator.clipboard.writeText(calendarLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

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
                                    <div className="mt-2">
                                        <strong>Subskrybcja kalendarza:</strong>
                                        <div className="input-group mb-2 mt-2">
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={calendarLink}
                                                readOnly
                                                style={{ backgroundColor: '#f8f9fa', fontSize: '0.9rem' }}
                                            />
                                            <button
                                                className={`btn ${copied ? 'btn-success' : 'btn-outline-primary'}`}
                                                type="button"
                                                onClick={handleCopy}
                                            >
                                                <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                                                {copied ? " Skopiowano" : " Kopiuj"}
                                            </button>
                                        </div>
                                        <p className="card-text text-muted small">
                                            Skopiuj link i dodaj go w Google Calendar / Outlook jako <em>"Subskrypcja z adresu URL"</em>.
                                        </p>
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
                                        {currentUser.roles.filter(role => role.type !== "SYSTEM").map((role, index) => {
                                            if (role.type === "SUPERVISOR") {
                                                return (
                                                    <li key={index}><strong>{role.name}</strong></li>
                                                )
                                            } else {
                                                return (
                                                    <li key={index}>{role.name}</li>
                                                )
                                            }
                                        })}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/*<div className="d-flex justify-content-center mt-4">*/}
                    {/*    <div className="card shadow-sm m-1" style={{ maxWidth: '820px', width: '100%' }}>*/}
                    {/*        <div className="card-header bg-secondary text-white fw-bold">*/}
                    {/*            <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />*/}
                    {/*            Synchronizacja z kalendarzem*/}
                    {/*        </div>*/}
                    {/*        <div className="card-body">*/}
                    {/*            */}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}

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