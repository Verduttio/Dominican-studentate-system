import React, { useState, useEffect } from 'react';
import useHttp from "../../services/UseHttp";
import { User } from "../../models/Interfaces";
import {backendUrl} from "../../utils/constants";
import {useLocation, useNavigate} from "react-router-dom";
import LoadingSpinner from "../../components/LoadingScreen";
import "./UsersPage.css";
import useIsFunkcyjny from "../../services/UseIsFunkcyjny";


function UsersPage () {
    const [users, setUsers] = useState<User[]>([]);
    const { error, loading, request } = useHttp(`${backendUrl}/api/users`, 'GET');
    const { isFunkcyjny, isFunkcyjnyLoading, isFunkcyjnyError } = useIsFunkcyjny();
    const navigate = useNavigate();
    const location = useLocation();
    const locationStateMessage = location.state?.message;

    useEffect(() => {
        request(null, (data) => setUsers(data))
            .then(() => {});
    }, [request]);

    if (loading) return <LoadingSpinner/>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <h1 className="entity-header">Użytkownicy</h1>
            </div>
            {locationStateMessage && <div className="alert alert-success">{locationStateMessage}</div>}
            <div className="table-responsive d-flex justify-content-center">
                <table className="table table-hover table-striped table-rounded table-shadow">
                    <thead className="table-dark">
                    <tr>
                        <th>Imię</th>
                        <th>Nazwisko</th>
                        <th>Akcja</th>
                        {isFunkcyjny && <th>Edytuj</th>}
                    </tr>
                    </thead>
                    <tbody>
                    {users.map(user => (
                        <tr key={user.id}
                            className={!user.enabled ? 'table-danger' : ''}>
                            <td>{user.name}</td>
                            <td>{user.surname}</td>
                            <td>
                                <button className="btn btn-dark" onClick={() => {navigate(`/users/${user.id}/viewer/details`)}}>Szczegóły</button>
                            </td>
                            {isFunkcyjny &&
                                <td>
                                    <button className={user.enabled ? "btn btn-primary" : "btn btn-danger"} onClick={() => navigate(`/users/${user.id}/verify`)}>
                                        {user.enabled ? "Edytuj" : "Zweryfikuj"}
                                    </button>
                                </td>
                            }
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default UsersPage;