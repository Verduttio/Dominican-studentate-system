import React, { useState, useEffect } from 'react';
import LogoutButton from "../../components/LogoutButton";
import useHttp from "../../services/UseHttp";
import { Conflict } from "../../models/interfaces";
import {useNavigate} from "react-router-dom";
import {backendUrl} from "../../utils/constants";


function ConflictsPage() {
    const [conflicts, setConflicts] = useState<Conflict[]>([]);
    const { error, loading, request } = useHttp(`${backendUrl}/api/conflicts`, 'GET');
    const navigate = useNavigate();

    useEffect(() => {
        request(null, (data) => setConflicts(data))
            .then(() => {});
    }, [request]);

    if (loading) return <div>Ładowanie...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div>
            <h2>Lista konfliktów</h2>
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Task1</th>
                    <th>Task2</th>
                </tr>
                </thead>
                <tbody>
                {conflicts.map(conflict => (
                    <tr key={conflict.id}>
                        <td>{conflict.id}</td>
                        <td>{conflict.task1.name}</td>
                        <td>{conflict.task2.name}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <button onClick={() => navigate("/add-conflict")}>Dodaj konflikt</button>
            <LogoutButton/>
        </div>
    );
}

export default ConflictsPage;