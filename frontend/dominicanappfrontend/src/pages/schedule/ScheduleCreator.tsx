import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useHttp from '../../services/UseHttp';
import { Role } from '../../models/interfaces';
import { backendUrl } from '../../utils/constants';

const ScheduleCreator: React.FC = () => {
    const [supervisorRoles, setSupervisorRoles] = useState<Role[]>([]);
    const { request, error, loading } = useHttp(`${backendUrl}/api/roles/types/SUPERVISOR`, 'GET');
    const location = useLocation();

    useEffect(() => {
        request(null, setSupervisorRoles);
    }, [request]);

    const queryParams = new URLSearchParams(location.search);
    const from = queryParams.get('from');
    const to = queryParams.get('to');

    if (loading) return <div>Ładowanie...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div>
            <h1>Wybierz rolę, aby przejść do tasków przypisanych do niej</h1>
            <p>Tworzysz harmonogram od: {from}, do: {to}</p>
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Nazwa</th>
                </tr>
                </thead>
                <tbody>
                {supervisorRoles.map((role) => (
                    <tr key={role.id}>
                        <td>{role.id}</td>
                        <td>{role.name}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ScheduleCreator;
