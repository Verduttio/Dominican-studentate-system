import React, { useEffect, useState } from 'react';
import { Role, Task } from '../../models/Interfaces';
import useHttp from '../../services/UseHttp';
import { backendUrl } from '../../utils/constants';
import LoadingSpinner from '../../components/LoadingScreen';
import AlertBox from '../../components/AlertBox';
import '../../components/Popup.css';

interface Props {
    eventId: number;
    supervisorRole: Role; // Rola, dla której tworzymy zadanie (np. Liturgista)
    taskToEdit?: Task | null; // Jeśli null, to tworzymy nowe
    onClose: () => void;
    onSave: () => void; // Odświeżenie listy po zapisie
}

const dayTranslations: Record<string, string> = {
    MONDAY: 'Poniedziałek',
    TUESDAY: 'Wtorek',
    WEDNESDAY: 'Środa',
    THURSDAY: 'Czwartek',
    FRIDAY: 'Piątek',
    SATURDAY: 'Sobota',
    SUNDAY: 'Niedziela'
};

const SpecialEventTaskModal: React.FC<Props> = ({ eventId, supervisorRole, taskToEdit, onClose, onSave }) => {
    const { loading, error, request } = useHttp();
    const { request: fetchPerformers } = useHttp();

    const [performerRoles, setPerformerRoles] = useState<Role[]>([]);

    // Form State
    const [name, setName] = useState('');
    const [nameAbbrev, setNameAbbrev] = useState('');
    const [description, setDescription] = useState('');
    const [participantsLimit, setParticipantsLimit] = useState(1);
    const [selectedPerformerRoles, setSelectedPerformerRoles] = useState<string[]>([]);
    const [daysOfWeek, setDaysOfWeek] = useState<string[]>(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']); // Domyślnie wszystkie dni, użytkownik może odznaczyć

    // Pobranie ról wykonujących (np. Bracia)
    useEffect(() => {
        fetchPerformers(
            null,
            (data: Role[]) => setPerformerRoles(data),
            false,
            `${backendUrl}/api/roles/types/TASK_PERFORMER`,
            'GET'
        );
    }, [fetchPerformers]);

    // Wypełnienie formularza przy edycji
    useEffect(() => {
        if (taskToEdit) {
            setName(taskToEdit.name);
            setNameAbbrev(taskToEdit.nameAbbrev);
            setDescription(taskToEdit.description || '');
            setParticipantsLimit(taskToEdit.participantsLimit);
            setSelectedPerformerRoles(taskToEdit.allowedRoles.map(r => r.name));
            setDaysOfWeek(taskToEdit.daysOfWeek);
        }
    }, [taskToEdit]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        const taskDto = {
            name,
            nameAbbrev,
            description,
            participantsLimit,
            allowedRoleNames: selectedPerformerRoles,
            supervisorRoleName: supervisorRole.name,
            daysOfWeek,
            archived: false
        };

        if (taskToEdit) {
            // Edycja istniejącego zadania (PUT /api/tasks/{id})
            request(
                taskDto,
                onSave,
                false,
                `${backendUrl}/api/tasks/${taskToEdit.id}`,
                'PUT'
            );
        } else {
            // Nowe zadanie do eventu (POST /api/special-events/{id}/tasks)
            request(
                taskDto,
                onSave,
                false,
                `${backendUrl}/api/special-events/${eventId}/tasks`,
                'POST'
            );
        }
    };

    const toggleDay = (day: string) => {
        setDaysOfWeek(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const toggleRole = (roleName: string) => {
        setSelectedPerformerRoles(prev =>
            prev.includes(roleName) ? prev.filter(r => r !== roleName) : [...prev, roleName]
        );
    };

    if (loading && !performerRoles.length) return <LoadingSpinner />;

    return (
        <div className="custom-modal-backdrop">
            <div className="custom-modal bg-white rounded shadow-lg p-4" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                <h3>{taskToEdit ? 'Edytuj Zadanie Specjalne' : 'Nowe Zadanie Specjalne'}</h3>
                <p className="text-muted small">Kategoria: <strong>{supervisorRole.name}</strong></p>

                {error && <AlertBox text={error} type="danger" width="100%" />}

                <form onSubmit={handleSave} className="text-start">
                    <div className="mb-3">
                        <label className="form-label">Nazwa zadania</label>
                        <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Skrót</label>
                            <input type="text" className="form-control" value={nameAbbrev} onChange={e => setNameAbbrev(e.target.value)} required />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Limit osób</label>
                            <input type="number" className="form-control" min="1" value={participantsLimit} onChange={e => setParticipantsLimit(Number(e.target.value))} required />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Opis / Uwagi (Dla wyznaczającego)</label>
                        <textarea
                            className="form-control"
                            rows={3}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Np. Tylko w Wielki Piątek; wymaga 2 akolitów..."
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Kto może wykonywać? (Allowed Roles)</label>
                        <div className="card p-2" style={{ maxHeight: '100px', overflowY: 'auto' }}>
                            {performerRoles.map(role => (
                                <div key={role.id} className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={selectedPerformerRoles.includes(role.name)}
                                        onChange={() => toggleRole(role.name)}
                                    />
                                    <label className="form-check-label">{role.name}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Dni tygodnia (W które dni eventu to zadanie obowiązuje)</label>
                        <div className="d-flex flex-wrap gap-2">
                            {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => (
                                <div key={day} className="form-check me-2">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={daysOfWeek.includes(day)}
                                        onChange={() => toggleDay(day)}
                                        id={`check-${day}`} // Dodaj ID dla lepszego UX
                                    />
                                    <label className="form-check-label small" htmlFor={`check-${day}`}>
                                        {/* ZMIANA: Użycie tłumaczenia */}
                                        {dayTranslations[day] || day}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-4">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Anuluj</button>
                        <button type="submit" className="btn btn-primary">Zapisz</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SpecialEventTaskModal;