import React, { useState, useEffect } from 'react';
import LogoutButton from "../components/LogoutButton";
import useHttp from "../services/UseHttp";
import { User } from "../models/interfaces";


function UsersPage () {
    const [users, setUsers] = useState<User[]>([]);
    const { error, func, loading, request } = useHttp('http://localhost:8080/api/users', 'GET');

    useEffect(() => {
        request(null, (data) => setUsers(data))
            .then(() => {});
    }, [request]);

    useEffect(() => {
        if (func) {
            func();
        }
    }, [func]);

    if (loading) return <div>Ładowanie...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div>
            <h2>Lista użytkowników</h2>
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Imię</th>
                    <th>Nazwisko</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Provider</th>
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
                    </tr>
                ))}
                </tbody>
            </table>
            <LogoutButton/>
        </div>
    );
}

export default UsersPage;