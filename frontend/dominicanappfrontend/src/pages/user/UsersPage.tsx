import React, { useState, useEffect } from 'react';
import LogoutButton from "../../components/LogoutButton";
import useHttp from "../../services/UseHttp";
import { User } from "../../models/interfaces";
import {backendUrl} from "../../utils/constants";
import {useNavigate} from "react-router-dom";


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

    if (loading) return <div>Ładowanie...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="fade-in">
            <h2>Lista użytkowników</h2>
            {deleteUserError && <div className="error-message">{deleteUserError}</div>}
            <table>
                <thead>
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
                        <td>{user.roles.map(role => role.name).join(', ')}</td>
                        <td>{user.provider}</td>
                        <td>{user.enabled ? "Tak" : "Nie"}</td>
                        <td>
                            <button onClick={() => navigate(`/users/${user.id}/verify`)}>Zweryfikuj</button>
                        </td>
                        <td>
                            <button className="btn btn-danger" disabled={deleteUserLoading}
                                    onClick={() => handleDelete(user.id)}>Usuń
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <LogoutButton/>
        </div>
    );
}

export default UsersPage;