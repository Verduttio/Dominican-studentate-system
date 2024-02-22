import React, { useEffect, useState } from 'react';
import useHttp from '../../services/UseHttp';
import { Role } from '../../models/Interfaces';
import { backendUrl } from '../../utils/constants';
import {useLocation, useNavigate} from "react-router-dom";
import LoadingSpinner from "../../components/LoadingScreen";

function ViewRoles() {
    const [roles, setRoles] = useState<Role[]>([]);
    const { request, error, loading } = useHttp(`${backendUrl}/api/roles`, 'GET');
    const navigate = useNavigate();
    const location = useLocation();
    const locationStateMessage = location.state?.message;

    useEffect(() => {
        request(null, (data: Role[]) => setRoles(data));
    }, [request]);

    if (loading) return <LoadingSpinner/>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <div>
                    <h1 className="entity-header">Role</h1>
                </div>
            </div>
            <div className="d-flex justify-content-center">
                {locationStateMessage && <div className="alert alert-success">{locationStateMessage}</div>}
            </div>
            <table className="table table-hover table-striped table-responsive table-rounded table-shadow">
                <thead className="table-dark">
                <tr>
                    <th>ID</th>
                    <th>Nazwa</th>
                    <th>Typ</th>
                    <th>Akcja</th>
                </tr>
                </thead>
                <tbody>
                {roles.map(role => (
                    <tr key={role.id}>
                        <td>{role.id}</td>
                        <td>{role.name}</td>
                        <td>{role.type}</td>
                        <td>
                            <button className="btn btn-sm btn-dark"
                                    onClick={() => navigate(`/edit-role/${role.id}`)}>Edytuj
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <div className="d-flex justify-content-center">
                <button className="btn btn-success m-1" onClick={() => navigate('/add-role')}>Dodaj rolę</button>
            </div>
        </div>
    );
}

export default ViewRoles;
