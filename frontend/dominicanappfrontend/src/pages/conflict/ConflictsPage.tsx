import React, { useState, useEffect } from 'react';
import useHttp from "../../services/UseHttp";
import { Conflict } from "../../models/Interfaces";
import {useLocation, useNavigate} from "react-router-dom";
import {backendUrl} from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";
import useIsFunkcyjny from "../../services/UseIsFunkcyjny";
import AlertBox from "../../components/AlertBox";


function ConflictsPage() {
    const [conflicts, setConflicts] = useState<Conflict[]>([]);
    const { error, loading, request } = useHttp(`${backendUrl}/api/conflicts`, 'GET');
    const { isFunkcyjny, isFunkcyjnyLoading, isFunkcyjnyError } = useIsFunkcyjny();
    const navigate = useNavigate();
    const location = useLocation();
    const locationStateMessage = location.state?.message;

    useEffect(() => {
        request(null, (data) => setConflicts(data))
            .then(() => {});
    }, [request]);

    if (loading) return <LoadingSpinner/>;
    if (error) return <AlertBox text={error} type={'danger'} width={'500px'}/>;

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <div>
                    <h1 className="entity-header">Konflikty</h1>
                </div>
            </div>
            <div className="d-flex justify-content-center">
                {locationStateMessage && <AlertBox text={locationStateMessage} type={'success'} width={'500px'}/>}
            </div>
            <div className="d-flex justify-content-center">
                <div className="table-responsive" style={{maxWidth: '500px'}}>
                    <table className="table table-hover table-striped table-rounded table-shadow">
                        <thead className="table-dark">
                        <tr>
                            <th>Zadanie 1</th>
                            <th>Zadanie 2</th>
                            {isFunkcyjny && <th>Edytuj</th>}
                        </tr>
                        </thead>
                        <tbody>
                        {conflicts.map(conflict => (
                            <tr key={conflict.id}>
                                <td>{conflict.task1.name}</td>
                                <td>{conflict.task2.name}</td>
                                {isFunkcyjny &&
                                    <td>
                                        <button className="btn btn-primary" onClick={() => navigate(`/edit-conflict/${conflict.id}`)}>Edytuj</button>
                                    </td>
                                }
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isFunkcyjny &&
                <div className="d-flex justify-content-center">
                    <button className="btn btn-primary m-1" onClick={() => navigate('/add-conflict')}>Dodaj konflikt</button>
                </div>
            }
        </div>
    );
}

export default ConflictsPage;