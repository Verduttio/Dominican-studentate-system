import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useHttp from '../../services/UseHttp';
import { CloneEventRequest } from '../../models/Interfaces';
import LoadingSpinner from '../../components/LoadingScreen';
import AlertBox from '../../components/AlertBox';
import CloneEventPopup from './CloneEventPopup';
import { backendUrl } from '../../utils/constants';
import SpecialEventTasksManager from './SpecialEventTasksManager';
import { eachDayOfInterval, format } from "date-fns";
import { pl } from "date-fns/locale";

const AddEditSpecialEvent: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    const navigate = useNavigate();

    const { loading, error, request } = useHttp();

    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    // NOWY STAN: Przechowuje wybrane dni tacowe w formacie 'yyyy-MM-dd'
    const [collectionDates, setCollectionDates] = useState<string[]>([]);

    const [showClonePopup, setShowClonePopup] = useState(false);

    // Pobranie danych przy edycji
    useEffect(() => {
        if (isEditMode) {
            request(
                null,
                (data) => {
                    setName(data.name);
                    setStartDate(data.startDate);
                    setEndDate(data.endDate);
                    // Pobieramy dni tacowe z backendu
                    setCollectionDates(data.collectionDates || []);
                },
                false,
                `${backendUrl}/api/special-events/${id}`,
                'GET'
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isEditMode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Dołączamy wybrane dni tacowe do wysyłki
        const eventData = { name, startDate, endDate, collectionDates };

        if (isEditMode) {
            request(
                { ...eventData, id: Number(id) },
                () => navigate('/dean/special-events'),
                false,
                `${backendUrl}/api/special-events`,
                'PUT'
            );
        } else {
            request(
                eventData,
                () => navigate('/dean/special-events'),
                false,
                `${backendUrl}/api/special-events`,
                'POST'
            );
        }
    };

    const handleClone = (cloneData: CloneEventRequest) => {
        setShowClonePopup(false);
        request(
            cloneData,
            (response) => {
                navigate(`/dean/special-events/edit/${response.id}`);
                setName(response.name);
                setStartDate(response.startDate);
                setEndDate(response.endDate);
                setCollectionDates(response.collectionDates || []);
            },
            false,
            `${backendUrl}/api/special-events/${id}/clone`,
            'POST'
        );
    };

    // Generowanie dni na podstawie start i end date dla kafelków
    const eventDays = (startDate && endDate && new Date(startDate) <= new Date(endDate))
        ? eachDayOfInterval({ start: new Date(startDate), end: new Date(endDate) })
        : [];

    const toggleCollectionDate = (dateStr: string) => {
        setCollectionDates(prev => prev.includes(dateStr)
            ? prev.filter(d => d !== dateStr)
            : [...prev, dateStr]
        );
    };

    if (loading && !showClonePopup) return <LoadingSpinner />;

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center mt-3">
                <h1 className="entity-header">{isEditMode ? 'Edytuj Wydarzenie' : 'Nowe Wydarzenie'}</h1>
            </div>

            {error && <AlertBox text={error} type="danger" width="500px" />}

            {showClonePopup && (
                <CloneEventPopup
                    sourceEventName={name}
                    onConfirm={handleClone}
                    onCancel={() => setShowClonePopup(false)}
                />
            )}

            <div className="d-flex justify-content-center pb-5">
                <div className="edit-entity-container mw-100 p-4 shadow-sm bg-white rounded" style={{ width: '600px' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Nazwa wydarzenia</label>
                            <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Data początkowa</label>
                                <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Data końcowa</label>
                                <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                            </div>
                        </div>

                        {/* NOWA SEKCJA: KAFELKI DNI TACOWYCH */}
                        {eventDays.length > 0 && (
                            <div className="mb-4 p-3 bg-light border rounded">
                                <label className="form-label fw-bold text-primary">Dni Tacowe i Komunijne</label>
                                <p className="text-muted small mb-2">Kliknij w dni, w których będzie włączona dodatkowa tabela dla Tac i Komunii przy zgłaszaniu przeszkód.</p>
                                <div className="d-flex flex-wrap gap-2">
                                    {eventDays.map(day => {
                                        const dateStr = format(day, 'yyyy-MM-dd');
                                        const isSelected = collectionDates.includes(dateStr);
                                        return (
                                            <button
                                                key={dateStr}
                                                type="button"
                                                onClick={() => toggleCollectionDate(dateStr)}
                                                className={`btn ${isSelected ? 'btn-danger fw-bold shadow-sm' : 'btn-outline-secondary'}`}
                                                style={{ minWidth: '80px' }}
                                            >
                                                {format(day, 'dd.MM')} <br/>
                                                <small>{format(day, 'EEE', { locale: pl })}</small>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="d-flex justify-content-between mt-4">
                            <button type="button" className="btn btn-secondary" onClick={() => navigate('/dean/special-events')}>
                                Wróć
                            </button>
                            <div className="d-flex gap-2">
                                {isEditMode && (
                                    <button type="button" className="btn btn-warning text-white" onClick={() => setShowClonePopup(true)}>
                                        Sklonuj
                                    </button>
                                )}
                                <button type="submit" className="btn btn-success" disabled={loading}>
                                    {isEditMode ? 'Zapisz' : 'Utwórz'}
                                </button>
                            </div>
                        </div>
                    </form>

                    {isEditMode && (
                        <div className="mt-4 pt-4 border-top">
                            <SpecialEventTasksManager eventId={Number(id)} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddEditSpecialEvent;