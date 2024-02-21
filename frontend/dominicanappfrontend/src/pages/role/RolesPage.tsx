import React, { useEffect, useState } from 'react';
import useHttp from '../../services/UseHttp';
import { Role } from '../../models/interfaces';
import { backendUrl } from '../../utils/constants';
import {useNavigate} from "react-router-dom";

function ViewRoles() {
    const [roles, setRoles] = useState<Role[]>([]);
    const { request, error, loading } = useHttp(`${backendUrl}/api/roles`, 'GET');
    const {error: deleteRoleError, loading: deleteRoleLoading, request: deleteRoleRequest} = useHttp();
    const navigate = useNavigate();

    useEffect(() => {
        request(null, (data: Role[]) => setRoles(data));
    }, [request]);

    const handleDelete = (id: number) => {
        deleteRoleRequest(null, () => {
                request(null, (data: Role[]) => setRoles(data));
        }, false, `${backendUrl}/api/roles/${id}`, 'DELETE');
    }

    if (loading) return <div>Ładowanie...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="fade-in">
            <h1>Role</h1>
            {deleteRoleError && <div className="error-message">{deleteRoleError}</div>}
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Nazwa</th>
                    <th>Typ</th>
                    <th>Edytuj</th>
                    <th>Usuń</th>
                </tr>
                </thead>
                <tbody>
                {roles.map(role => (
                    <tr key={role.id}>
                        <td>{role.id}</td>
                        <td>{role.name}</td>
                        <td>{role.type}</td>
                        <td><button className="btn btn-warning" onClick={() => navigate(`/edit-role/${role.id}`)}>Edytuj</button></td>
                        <td><button className="btn btn-danger" onClick={() => {handleDelete(role.id)}} disabled={deleteRoleLoading}>Usuń</button></td>
                    </tr>
                ))}
                </tbody>
            </table>
            <button onClick={() => navigate('/add-role')}>Dodaj rolę</button>
        </div>
    );
}

export default ViewRoles;
