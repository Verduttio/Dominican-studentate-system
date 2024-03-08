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
            <table className="table table-hover table-striped table-responsive table-rounded table-shadow">
                <thead className="table-dark">
                <tr>
                    <th>ID</th>
                    <th>Imię</th>
                    <th>Nazwisko</th>
                    <th>Email</th>
                    <th>Zweryfikowany</th>
                    <th>Akcja</th>
                    {isFunkcyjny && <th>Edytuj</th>}
                </tr>
                </thead>
                <tbody>
                {users.map(user => (
                    <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.surname}</td>
                        <td>{user.email}</td>
                        <td>
                            <span className={
                                user.enabled ? '' : 'highlighted-text-not-verified'}
                            >
                            {user.enabled ? "Tak" : "Nie"}
                            </span>
                        </td>
                        <td>
                            <button className="btn btn-dark" onClick={() => {}}>Szczegóły</button>
                        </td>
                        {isFunkcyjny &&
                            <td>
                                <button className="btn btn-primary" onClick={() => navigate(`/users/${user.id}/verify`)}>
                                    {user.enabled ? "Edytuj" : "Zweryfikuj"}
                                </button>
                            </td>
                        }
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default UsersPage;