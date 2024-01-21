import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LogoutButton from "./LogoutButton";

function UserProfilePage () {
    const [user, setUser] = useState(null);

        useEffect(() => {
            const fetchUserData = async () => {
                try {
                    const response = await axios.get(`http://localhost:8080/api/users/current`, {
                        withCredentials: true
                    });
                    setUser(response.data);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            };

            fetchUserData().then(r => console.log('User data fetched'));
        }, []);

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