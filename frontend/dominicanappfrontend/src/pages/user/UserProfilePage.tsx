import React, { useState, useEffect } from 'react';
import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";
import {Provider, User} from "../../models/Interfaces";
import ChangePasswordPopup from "./ChangePasswordPopup";
import CurrentUserObstaclesTable from "./CurrentUserObstaclesTable";
import {useNavigate} from "react-router-dom";
import AlertBox from "../../components/AlertBox";

function UserProfilePage () {
    const [user, setUser] = useState<User | null>(null);
    const { error, loading, request } = useHttp(`${backendUrl}/api/users/current`, 'GET');
    const [showChangePassword, setShowChangePassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        request(null, (data) => setUser(data))
            .then(() => {});
    }, [request]);

    if (loading) return <LoadingSpinner/>;
    if (error) return <AlertBox text={error} type="danger" width={'500px'} />;

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <h1 className="entity-header">Mój profil</h1>
            </div>
            {user && (
                <>
                    <div className="row d-flex align-items-center">
                        <div className="col-md-6 mw-100" style={{width: '400px'}}>
                            <div className="card shadow-sm m-1">
                                <div className="card-top-bar"></div>
                                <div className="card-body">
                                    <div><strong>Imię:</strong> {user.name}</div>
                                    <div><strong>Nazwisko:</strong> {user.surname}</div>
                                    <div><strong>Email:</strong> {user.email}</div>
                                    <div><strong>Id:</strong> {user.id}</div>
                                    <div><strong>Zarejestrowany przez:</strong> {user.provider}</div>
                                    {user.provider === Provider.LOCAL &&
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
                            {showChangePassword && <ChangePasswordPopup userId={user.id} onClose={() => setShowChangePassword(false)} />}
                        </div>
                        <div className="col-md-6 mw-100" style={{width: '400px'}}>
                            <div className="card shadow-sm m-1">
                                <div className="card-top-bar"></div>
                                <div className="card-body">
                                    <ul>
                                        {user.roles.map((role, index) => (
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