import React, { useState, useEffect } from 'react';
import LogoutButton from "../../components/LogoutButton";
import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";

function UserProfilePage () {
    const [user, setUser] = useState(null);
    const { error, loading, request } = useHttp(`${backendUrl}/api/users/current`, 'GET');

    useEffect(() => {
        request(null, (data) => setUser(data))
            .then(() => {});
    }, [request]);

    if (loading) return <div>Ładowanie...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="fade-in">
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