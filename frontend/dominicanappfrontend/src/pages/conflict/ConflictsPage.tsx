import React, { useState, useEffect } from 'react';
import useHttp from "../../services/UseHttp";
import { Conflict } from "../../models/Interfaces";
import {useLocation, useNavigate} from "react-router-dom";
import {backendUrl} from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";


function ConflictsPage() {
    const [conflicts, setConflicts] = useState<Conflict[]>([]);
    const { error, loading, request } = useHttp(`${backendUrl}/api/conflicts`, 'GET');
    const navigate = useNavigate();
    const location = useLocation();
    const locationStateMessage = location.state?.message;

    useEffect(() => {
        request(null, (data) => setConflicts(data))
            .then(() => {});
    }, [request]);

    if (loading) return <LoadingSpinner/>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <div>
                    <h1 className="entity-header">Konflikty</h1>
                </div>
            </div>
            <div className="d-flex justify-content-center">
                {locationStateMessage && <div className="alert alert-success">{locationStateMessage}</div>}
            </div>
            <table className="table table-hover table-striped table-responsive table-rounded table-shadow">
                <thead className="table-dark">
                <tr>
                    <th>ID</th>
                    <th>Zadanie 1</th>
                    <th>Zadanie 2</th>
                    <th>Akcja</th>
                </tr>
                </thead>
                <tbody>
                {conflicts.map(conflict => (
                    <tr key={conflict.id}>
                        <td>{conflict.id}</td>
                        <td>{conflict.task1.name}</td>
                        <td>{conflict.task2.name}</td>
                        <td>
                            <button className="btn btn-sm btn-dark"
                                    onClick={() => navigate(`/edit-conflict/${conflict.id}`)}>Edytuj
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <div className="d-flex justify-content-center">
                <button className="btn btn-success m-1" onClick={() => navigate('/add-conflict')}>Dodaj konflikt</button>
            </div>
        </div>
    );
}

export default ConflictsPage;