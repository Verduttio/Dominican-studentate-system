import React, { useState, useEffect } from 'react';
import LogoutButton from "./LogoutButton";
import useHttp from "../services/UseHttp";

function UserProfilePage () {
    const [user, setUser] = useState(null);
    const { error, func, loading, request } = useHttp('http://localhost:8080/api/users/current', 'GET');

    useEffect(() => {
        request(null, (data) => setUser(data))
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
            <h2>Profil Użytkownika</h2>
            {user && (
                <table>
                    <tbody>
                    {Object.entries(user).map(([key, value]) => (
                        <tr key={key}>
                            <th>{key}</th>
                            <td>
                                {Array.isArray(value)
                                    ? value.map(item => typeof item === 'object' && item.name ? item.name : item).join(', ')
                                    : String(value)}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
            <LogoutButton/>
        </div>
    );
}

export default UserProfilePage;