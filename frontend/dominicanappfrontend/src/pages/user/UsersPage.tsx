import React, { useState, useEffect } from 'react';
import useHttp from "../../services/UseHttp";
import { User } from "../../models/Interfaces";
import {backendUrl} from "../../utils/constants";
import {useNavigate} from "react-router-dom";
import LoadingSpinner from "../../components/LoadingScreen";
import "./UsersPage.css";


function UsersPage () {
    const [users, setUsers] = useState<User[]>([]);
    const { error, loading, request } = useHttp(`${backendUrl}/api/users`, 'GET');
    const {error: deleteUserError, loading: deleteUserLoading, request: deleteUserRequest} = useHttp();
    const navigate = useNavigate();

    useEffect(() => {
        request(null, (data) => setUsers(data))
            .then(() => {});
    }, [request]);

    const handleDelete = (userId: number) => {
        deleteUserRequest(null, () => {
                request(null, (data) => setUsers(data))
                    .then(() => {});
            },
            false, `${backendUrl}/api/users/${userId}`, 'DELETE')
            .then(r => {});
    }

    if (loading) return <LoadingSpinner/>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <h1 className="entity-header">Użytkownicy</h1>
            </div>
            {deleteUserError && <div className="error-message">{deleteUserError}</div>}
            <table className="table table-hover table-striped table-responsive table-rounded table-shadow">
                <thead className="table-dark">
                <tr>
                    <th>ID</th>
                    <th>Imię</th>
                    <th>Nazwisko</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Provider</th>
                    <th>Zweryfikowany</th>
                    <th>Akcja</th>
                </tr>
                </thead>
                <tbody>
                {users.map(user => (
                    <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.surname}</td>
                        <td>{user.email}</td>
                        <td className="max-column-width">{user.roles.map(role => role.name).join(', ')}</td>
                        <td>{user.provider}</td>
                        <td>
                            <span className={
                                user.enabled ? '' : 'highlighted-text-not-verified'}
                            >
                            {user.enabled ? "Tak" : "Nie"}
                            </span>
                        </td>
                        <td>
                            <button className="btn btn-dark" onClick={() => navigate(`/users/${user.id}/verify`)}>Akcja</button>
                        </td>
                        {/*<td>*/}
                        {/*    <button className="btn btn-danger" disabled={deleteUserLoading}*/}
                        {/*            onClick={() => handleDelete(user.id)}>Usuń*/}
                        {/*    </button>*/}
                        {/*</td>*/}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default UsersPage;