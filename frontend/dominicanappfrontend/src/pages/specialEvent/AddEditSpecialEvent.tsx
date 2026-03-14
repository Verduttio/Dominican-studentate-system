import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useHttp from '../../services/UseHttp';
import { CloneEventRequest } from '../../models/Interfaces';
import LoadingSpinner from '../../components/LoadingScreen';
import AlertBox from '../../components/AlertBox';
import CloneEventPopup from './CloneEventPopup';
import { backendUrl } from '../../utils/constants'; // Import backendUrl
import SpecialEventTasksManager from './SpecialEventTasksManager';

const AddEditSpecialEvent: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    const navigate = useNavigate();

    const { loading, error, request } = useHttp();

    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

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
                },
                false,
                `${backendUrl}/api/special-events/${id}`, // Dynamiczny URL
                'GET'
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isEditMode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const eventData = { name, startDate, endDate };

        if (isEditMode) {
            request(
                { ...eventData, id: Number(id) },
                () => navigate('/dean/special-events'),
                false,
                `${backendUrl}/api/special-events`, // Dynamiczny URL
                'PUT'
            );
        } else {
            request(
                eventData,
                () => navigate('/dean/special-events'),
                false,
                `${backendUrl}/api/special-events`, // Dynamiczny URL
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
            },
            false,
            `${backendUrl}/api/special-events/${id}/clone`, // Dynamiczny URL
            'POST'
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

            <div className="d-flex justify-content-center">
                <div className="edit-entity-container mw-100 p-4 shadow-sm bg-white rounded" style={{ width: '500px' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Nazwa wydarzenia</label>
                            <input
                                type="text"
                                className="form-control"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Data początkowa</label>
                            <input
                                type="date"
                                className="form-control"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Data końcowa</label>
                            <input
                                type="date"
                                className="form-control"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="d-flex justify-content-between mt-4">
                            <button type="button" className="btn btn-secondary" onClick={() => navigate('/dean/special-events')}>
                                Wróć
                            </button>

                            <div className="d-flex gap-2">
                                {isEditMode && (
                                    <button
                                        type="button"
                                        className="btn btn-warning text-white"
                                        onClick={() => setShowClonePopup(true)}
                                    >
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
                        <SpecialEventTasksManager eventId={Number(id)} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddEditSpecialEvent;