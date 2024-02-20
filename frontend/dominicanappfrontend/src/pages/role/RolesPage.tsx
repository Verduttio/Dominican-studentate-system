import React, { useEffect, useState } from 'react';
import useHttp from '../../services/UseHttp';
import { Role } from '../../models/interfaces';
import { backendUrl } from '../../utils/constants';
import {useNavigate} from "react-router-dom";

function ViewRoles() {
    const [roles, setRoles] = useState<Role[]>([]);
    const { request, error, loading } = useHttp(`${backendUrl}/api/roles`, 'GET');
    const navigate = useNavigate();

    useEffect(() => {
        request(null, (data: Role[]) => setRoles(data));
    }, [request]);

    if (loading) return <div>Ładowanie...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="fade-in">
            <h1>Role</h1>
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Nazwa</th>
                    <th>Typ</th>
                </tr>
                </thead>
                <tbody>
                {roles.map(role => (
                    <tr key={role.id}>
                        <td>{role.id}</td>
                        <td>{role.name}</td>
                        <td>{role.type}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <button onClick={() => navigate('/add-role')}>Dodaj rolę</button>
        </div>
    );
}

export default ViewRoles;
