import React, { useState, useEffect } from 'react';
import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";
import {User} from "../../models/Interfaces";

function UserProfilePage () {
    const [user, setUser] = useState<User | null>(null);
    const { error, loading, request } = useHttp(`${backendUrl}/api/users/current`, 'GET');

    useEffect(() => {
        request(null, (data) => setUser(data))
            .then(() => {});
    }, [request]);

    if (loading) return <LoadingSpinner/>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <h1 className="entity-header">Mój profil</h1>
            </div>
            {user && (
                <div className="row">
                    <div className="col-md-6">
                        <div className="card shadow-sm">
                            <div className="card-top-bar"></div>
                            <div className="card-body">
                                <div><strong>Imię:</strong> {user.name}</div>
                                <div><strong>Nazwisko:</strong> {user.surname}</div>
                                <div><strong>Email:</strong> {user.email}</div>
                                <div><strong>Id:</strong> {user.id}</div>
                                <div className="d-flex justify-content-center p-3">
                                    <button className="btn btn-danger">Zmień hasło</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card shadow-sm">
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
            )}
        </div>

    );
}

export default UserProfilePage;