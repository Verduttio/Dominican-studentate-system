import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useHttp from '../../services/UseHttp';
import { SpecialEvent } from '../../models/Interfaces';
import LoadingSpinner from '../../components/LoadingScreen';
import AlertBox from '../../components/AlertBox';
import ConfirmDeletionPopup from '../../components/ConfirmDeletionPopup';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { backendUrl } from '../../utils/constants'; // Import backendUrl
import '../../components/Common.css';

const SpecialEventsPage: React.FC = () => {
    const navigate = useNavigate();
    const { loading, error, request } = useHttp();
    const [events, setEvents] = useState<SpecialEvent[]>([]);
    const [eventToDelete, setEventToDelete] = useState<number | null>(null);

    const fetchEvents = () => {
        request(
            null,
            (data) => {
                const sorted = data.sort((a: SpecialEvent, b: SpecialEvent) =>
                    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
                );
                setEvents(sorted);
            },
            false,
            `${backendUrl}/api/special-events`, // Dynamiczny URL
            'GET'
        );
    };

    useEffect(() => {
        fetchEvents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDelete = () => {
        if (eventToDelete) {
            request(
                null,
                () => {
                    setEvents(prev => prev.filter(e => e.id !== eventToDelete));
                    setEventToDelete(null);
                },
                false,
                `${backendUrl}/api/special-events/${eventToDelete}`, // Dynamiczny URL
                'DELETE'
            );
        }
    };

    // --- LOGIKA POBIERANIA PDF ---
        const downloadPdf = async (url: string, filename: string) => {
            try {
                // Pobieramy token, jeśli go używasz dodatkowo (nie zaszkodzi zostawić)
                const token = localStorage.getItem('token');

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    credentials: 'include' // <-- TO ROZWIĄZUJE PROBLEM 401 (Wysyła ciasteczko sesyjne)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Kod HTTP: ${response.status}\nWiadomość: ${errorText}`);
                }

                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(downloadUrl);
            } catch (error: any) {
                console.error("Failed to download PDF", error);
                alert(`Nie udało się pobrać pliku PDF.\n\nSzczegóły błędu:\n${error.message}`);
            }
        };

    const handlePrintAllMatrix = (eventId: number, eventName: string) => {
        // Zauważ brak parametru ?roleName=
        const url = `${backendUrl}/api/pdf/schedules/special-event/${eventId}/matrix`;
        downloadPdf(url, `Caly_Harmonogram_${eventName}.pdf`);
    };

    const handlePrintDescriptions = (eventId: number, eventName: string) => {
        const url = `${backendUrl}/api/pdf/schedules/special-event/${eventId}/tasks-description`;
        downloadPdf(url, `Opisy_Oficjow_${eventName}.pdf`);
    };

    if (loading && !events.length) return <LoadingSpinner />;

    return (
        <div className="fade-in">
            {error && <AlertBox text={error} type="danger" width="500px" />}

            {eventToDelete && (
                <ConfirmDeletionPopup
                    onHandle={handleDelete}
                    onClose={() => setEventToDelete(null)}
                />
            )}

            <div className="d-flex justify-content-center">
                <h1 className="entity-header">Wydarzenia Specjalne</h1>
            </div>

            <div className="d-flex justify-content-center mb-3">
                <button className="btn btn-secondary" onClick={() => navigate('/dean/special-events/add')}>
                    + Dodaj Nowe Wydarzenie
                </button>
            </div>

            <div className="d-flex justify-content-center">
                <div className="table-responsive" style={{ maxWidth: '800px', width: '100%' }}>
                    <table className="table table-hover table-striped table-rounded table-shadow">
                        <thead className="table-dark">
                        <tr>
                            <th>Nazwa</th>
                            <th>Data Początkowa</th>
                            <th>Data Końcowa</th>
                            <th>Akcje</th>
                        </tr>
                        </thead>
                        <tbody>
                        {events.map(event => (
                            <tr key={event.id}>
                                <td>{event.name}</td>
                                <td>{event.startDate}</td>
                                <td>{event.endDate}</td>
                                <td>
                                    <button
                                        className="btn btn-dark btn-sm me-2"
                                        onClick={() => navigate(`/dean/special-events/edit/${event.id}`)}
                                    >
                                        Edytuj / Sklonuj
                                    </button>
                                    <button
                                            className="btn btn-warning btn-sm me-2"
                                            onClick={() => handlePrintAllMatrix(event.id, event.name)}
                                            title="Pobierz pełny harmonogram dla wszystkich oficjów"
                                        >
                                            <FontAwesomeIcon icon={faFilePdf} className="me-2"/>
                                            PDF (Całość)
                                    </button>
                                    <button
                                            className="btn btn-info btn-sm text-white me-2"
                                            onClick={() => handlePrintDescriptions(event.id, event.name)}
                                        >
                                            <FontAwesomeIcon icon={faFilePdf} className="me-2"/>
                                            Opisy
                                        </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => setEventToDelete(event.id)}
                                    >
                                        Usuń
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {events.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center">Brak wydarzeń specjalnych.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SpecialEventsPage;