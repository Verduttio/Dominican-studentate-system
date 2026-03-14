import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useHttp from '../../../services/UseHttp';
import { backendUrl } from '../../../utils/constants';
import { SpecialEvent } from '../../../models/Interfaces';
import LoadingSpinner from '../../../components/LoadingScreen';

const ActiveSpecialEventsList: React.FC = () => {
    const navigate = useNavigate();
    const { loading, request } = useHttp();
    const [activeEvents, setActiveEvents] = useState<SpecialEvent[]>([]);

    useEffect(() => {
        // Pobierz wszystkie eventy i przefiltruj na froncie te, które jeszcze się nie skończyły
        // (lub użyj dedykowanego endpointu, jeśli stworzyliśmy taki w backendzie)
        request(
            null,
            (data: SpecialEvent[]) => {
                const today = new Date().toISOString().slice(0, 10);
                const upcoming = data.filter(e => e.endDate >= today);
                setActiveEvents(upcoming);
            },
            false,
            `${backendUrl}/api/special-events`,
            'GET'
        );
    }, []);

    if (loading) return <LoadingSpinner />;
    if (activeEvents.length === 0) return null; // Nie wyświetlaj nic, jeśli brak eventów

    return (
        <div className="row mt-4 fade-in">
            <div className="col-12">
                <h4 className="text-muted mb-3 border-bottom pb-2">Wydarzenia Specjalne</h4>
            </div>
            {activeEvents.map(event => (
                <div key={event.id} className="col-md-4 mb-3">
                    <div
                        className="card text-center shadow-sm hover-effect h-100 border-warning"
                        style={{ cursor: 'pointer', backgroundColor: '#fffbf0' }}
                        onClick={() => navigate(`/schedule/special-event/${event.id}`)}
                    >
                        <div className="card-body d-flex flex-column justify-content-center align-items-center">
                            <i className="bi bi-star-fill text-warning mb-2" style={{ fontSize: '2rem' }}></i>
                            <h5 className="card-title text-dark">{event.name}</h5>
                            <p className="card-text text-muted small">
                                {event.startDate} — {event.endDate}
                            </p>
                            <span className="btn btn-sm btn-outline-warning mt-2">Wyznacz służby</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActiveSpecialEventsList;