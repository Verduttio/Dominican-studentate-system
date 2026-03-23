import React, { useEffect, useState } from 'react';
import { Role, Task, TaskSection } from '../../models/Interfaces';
import useHttp from '../../services/UseHttp';
import { backendUrl } from '../../utils/constants';
import LoadingSpinner from '../../components/LoadingScreen';
import AlertBox from '../../components/AlertBox';
import '../../components/Popup.css';

interface Props {
    eventId: number;
    supervisorRole: Role;
    taskToEdit?: Task | null;
    onClose: () => void;
    onSave: () => void;
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
    const { request: fetchSections } = useHttp();

    const [performerRoles, setPerformerRoles] = useState<Role[]>([]);
    const [availableSections, setAvailableSections] = useState<TaskSection[]>([]);

    // Form State
    const [name, setName] = useState('');
    const [nameAbbrev, setNameAbbrev] = useState('');
    const [description, setDescription] = useState('');
    const [participantsLimit, setParticipantsLimit] = useState(1);
    const [selectedPerformerRoles, setSelectedPerformerRoles] = useState<string[]>([]);
    const [daysOfWeek, setDaysOfWeek] = useState<string[]>(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']);
    const [selectedSectionIds, setSelectedSectionIds] = useState<number[]>([]);

    // --- NOWA ZMIENNA: Czy to jest zadanie globalne (standardowe)? ---
    const isNormalTask = taskToEdit ? (taskToEdit.specialEventId === null || taskToEdit.specialEventId === undefined) : false;

    useEffect(() => {
        fetchPerformers(null, (data: Role[]) => setPerformerRoles(data), false, `${backendUrl}/api/roles/types/TASK_PERFORMER`, 'GET');
        fetchSections(null, (data: TaskSection[]) => setAvailableSections(data), false, `${backendUrl}/api/task-sections`, 'GET');
    }, [fetchPerformers, fetchSections]);

    useEffect(() => {
        if (taskToEdit) {
            setName(taskToEdit.name);
            setNameAbbrev(taskToEdit.nameAbbrev);
            setDescription(taskToEdit.description || '');
            setParticipantsLimit(taskToEdit.participantsLimit);
            setSelectedPerformerRoles(taskToEdit.allowedRoles.map(r => r.name));
            setDaysOfWeek(taskToEdit.daysOfWeek);

            if (taskToEdit.taskSections) {
                setSelectedSectionIds(taskToEdit.taskSections.map(sec => sec.id));
            } else {
                setSelectedSectionIds([]);
            }
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
            taskSectionIds: selectedSectionIds,
            archived: false
        };

        if (taskToEdit) {
            request(taskDto, onSave, false, `${backendUrl}/api/tasks/${taskToEdit.id}`, 'PUT');
        } else {
            request(taskDto, onSave, false, `${backendUrl}/api/special-events/${eventId}/tasks`, 'POST');
        }
    };

    const toggleDay = (day: string) => {
        setDaysOfWeek(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
    };

    const toggleRole = (roleName: string) => {
        setSelectedPerformerRoles(prev => prev.includes(roleName) ? prev.filter(r => r !== roleName) : [...prev, roleName]);
    };

    const toggleSection = (sectionId: number) => {
        setSelectedSectionIds(prev => prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId]);
    };

    if (loading && (!performerRoles.length || !availableSections.length)) return <LoadingSpinner />;

    return (
        <div className="custom-modal-backdrop">
            <div className="custom-modal bg-white rounded shadow-lg p-4" style={{ maxHeight: '90vh', overflowY: 'auto' }}>

                {/* Dynamiczny tytuł */}
                <h3>
                    {!taskToEdit
                        ? 'Nowe Zadanie Specjalne'
                        : isNormalTask
                            ? 'Pory dnia oficjum globalnego'
                            : 'Edytuj Zadanie Specjalne'}
                </h3>
                <p className="text-muted small">Kategoria: <strong>{supervisorRole.name}</strong></p>

                {error && <AlertBox text={error} type="danger" width="100%" />}

                {/* --- BANER INFORMACYJNY DLA ZADAŃ GLOBALNYCH --- */}
                {isNormalTask && (
                    <div className="alert alert-info py-2 small shadow-sm border-0">
                        <strong>Oficjum globalne:</strong> Możesz zmienić tylko przypisanie tego oficjum do pór dnia (sekcji). Pozostałe parametry są zablokowane, aby zachować domyślne ustawienia w całym systemie.
                    </div>
                )}

                <form onSubmit={handleSave} className="text-start">

                    {/* WRAŻLIWE DANE - zablokowane dla isNormalTask */}
                    <div className="mb-3">
                        <label className="form-label">Nazwa zadania</label>
                        <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required disabled={isNormalTask} />
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Skrót</label>
                            <input type="text" className="form-control" value={nameAbbrev} onChange={e => setNameAbbrev(e.target.value)} required disabled={isNormalTask} />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Limit osób</label>
                            <input type="number" className="form-control" min="1" value={participantsLimit} onChange={e => setParticipantsLimit(Number(e.target.value))} required disabled={isNormalTask} />
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
                            disabled={isNormalTask}
                        />
                    </div>

                    {/* --- PORY DNIA (Zawsze odblokowane) --- */}
                    <div className="mb-3 p-3 bg-light rounded border border-primary">
                        <label className="form-label fw-bold text-primary">Pory dnia (Sekcje)</label>
                        <div className="d-flex flex-wrap gap-3">
                            {availableSections.map(sec => (
                                <div key={sec.id} className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={selectedSectionIds.includes(sec.id)}
                                        onChange={() => toggleSection(sec.id)}
                                        id={`sec-${sec.id}`}
                                    />
                                    <label className="form-check-label small fw-bold" htmlFor={`sec-${sec.id}`}>
                                        {sec.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                        {selectedSectionIds.length === 0 && (
                            <small className="text-danger d-block mt-2">
                                Uwaga: Jeśli nie zaznaczysz żadnej pory dnia, to oficjum pojawi się tylko w widoku "Wszystkie".
                            </small>
                        )}
                    </div>

                    {/* WRAŻLIWE DANE CD. - zablokowane dla isNormalTask */}
                    <div className="mb-3">
                        <label className="form-label">Kto może wykonywać? (Allowed Roles)</label>
                        <div className="card p-2 bg-light" style={{ maxHeight: '100px', overflowY: 'auto' }}>
                            {performerRoles.map(role => (
                                <div key={role.id} className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={selectedPerformerRoles.includes(role.name)}
                                        onChange={() => toggleRole(role.name)}
                                        disabled={isNormalTask}
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
                                        id={`check-${day}`}
                                        disabled={isNormalTask}
                                    />
                                    <label className="form-check-label small" htmlFor={`check-${day}`}>
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