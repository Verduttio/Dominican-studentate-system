import React, { useEffect, useState } from 'react';
import useHttp from "../services/UseHttp";
import { backendUrl } from "../utils/constants";
import AlertBox from "../components/AlertBox";
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface Obstacle {
    id: number;
    user: {
        name: string;
        surname: string;
    };
    fromDate: string;
    toDate: string;
    applicantDescription?: string;
    tasks?: Task[];
}

interface Task {
    id: number;
    name: string;
    nameAbbrev: string;
}

interface Props {
    fromDateString: string; // "dd-MM-yyyy"
    toDateString: string;   // "dd-MM-yyyy"
}

const ApprovedObstaclesList: React.FC<Props> = ({ fromDateString, toDateString }) => {
    const [obstacles, setObstacles] = useState<Obstacle[]>([]);

    const url = `${backendUrl}/api/obstacles/approved/range?from=${fromDateString}&to=${toDateString}`;
    const { request, loading, error } = useHttp(url, 'GET');

    useEffect(() => {
        if (fromDateString && toDateString) {
            request(null, (data) => setObstacles(data));
        }
    }, [fromDateString, toDateString, request]);

    if (loading) return <div className="text-center my-3"><span className="spinner-border spinner-border-sm text-secondary"></span> <small>Sprawdzam przeszkody...</small></div>;
    if (error) return <AlertBox text={`Błąd pobierania przeszkód: ${error}`} width="100%" type="danger" />;

    if (obstacles.length === 0) {
        return <div className="alert alert-success mt-4 text-center py-2"><small>Brak zaakceptowanych przeszkód w tym tygodniu.</small></div>;
    }

    return (
        <div className="card mt-4 shadow-sm">
            <div className="card-header bg-primary-subtle text-dark fw-bold d-flex justify-content-between align-items-center">
                <span>⚠️ Przeszkody w tym tygodniu</span>
                <span className="badge bg-warning text-dark">{obstacles.length}</span>
            </div>
            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table table-striped table-hover mb-0 text-center align-middle" style={{ fontSize: '0.9rem' }}>
                        <thead className="table-dark">
                        <tr>
                            <th>Brat</th>
                            <th>Od</th>
                            <th>Do</th>
                            <th>Opis</th>
                            <th>Oficja</th>
                        </tr>
                        </thead>
                        <tbody>
                        {obstacles.map(obs => (
                            <tr key={obs.id}>
                                <td className="fw-bold">{obs.user.name} {obs.user.surname}</td>
                                <td>{format(new Date(obs.fromDate), 'dd.MM (EEE)', { locale: pl })}</td>
                                <td>{format(new Date(obs.toDate), 'dd.MM (EEE)', { locale: pl })}</td>
                                <td className="text-muted fst-italic text-start">{obs.applicantDescription || '-'}</td>
                                <td className="text-muted fst-italic text-start">{obs.tasks?.map(t => t.nameAbbrev).join(', ') || '-'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ApprovedObstaclesList;