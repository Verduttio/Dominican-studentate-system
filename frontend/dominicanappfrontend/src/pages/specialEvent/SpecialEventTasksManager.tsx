import React, { useEffect, useState } from 'react';
import { Role, Task } from '../../models/Interfaces';
import useHttp from '../../services/UseHttp';
import { backendUrl } from '../../utils/constants';
import LoadingSpinner from '../../components/LoadingScreen';
import AlertBox from '../../components/AlertBox';
import SpecialEventTaskModal from './SpecialEventTaskModal';
import ConfirmDeletionPopup from '../../components/ConfirmDeletionPopup';

interface Props {
    eventId: number;
}

const SpecialEventTasksManager: React.FC<Props> = ({ eventId }) => {
    const { loading, error, request } = useHttp();

    const [supervisorRoles, setSupervisorRoles] = useState<Role[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
    const [eventTasks, setEventTasks] = useState<Task[]>([]);

    // Modal states
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

    // 1. Pobierz role wyznaczające (Supervisor)
    useEffect(() => {
        request(
            null,
            (data: Role[]) => {
                setSupervisorRoles(data);
                if (data.length > 0) setSelectedRoleId(data[0].id); // Domyślnie wybierz pierwszą
            },
            false,
            `${backendUrl}/api/roles/types/SUPERVISOR`,
            'GET'
        );
    }, []);

    // 2. Pobierz zadania tego eventu
    const fetchTasks = () => {
        request(
            null,
            (data: Task[]) => setEventTasks(data),
            false,
            `${backendUrl}/api/special-events/${eventId}/tasks`,
            'GET'
        );
    };

    useEffect(() => {
        fetchTasks();
    }, [eventId]);

    // Filtrowanie zadań po wybranej roli
    const filteredTasks = eventTasks.filter(t => t.supervisorRole?.id === Number(selectedRoleId));
    const selectedRoleObj = supervisorRoles.find(r => r.id === Number(selectedRoleId));

    const handleTaskSaved = () => {
        setShowTaskModal(false);
        setTaskToEdit(null);
        fetchTasks(); // Odśwież listę
    };

    const handleDelete = () => {
        if (taskToDelete) {
            request(
                null,
                () => {
                    setTaskToDelete(null);
                    fetchTasks();
                },
                false,
                `${backendUrl}/api/tasks/${taskToDelete}`,
                'DELETE'
            );
        }
    };

    return (
        <div className="mt-4 pt-3 border-top">
            {showTaskModal && selectedRoleObj && (
                <SpecialEventTaskModal
                    eventId={eventId}
                    supervisorRole={selectedRoleObj}
                    taskToEdit={taskToEdit}
                    onClose={() => { setShowTaskModal(false); setTaskToEdit(null); }}
                    onSave={handleTaskSaved}
                />
            )}

            {taskToDelete && (
                <ConfirmDeletionPopup
                    onHandle={handleDelete}
                    onClose={() => setTaskToDelete(null)}
                />
            )}

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="m-0">Zadania w wydarzeniu</h4>
            </div>

            {error && <AlertBox text={error} type="danger" width="100%" />}

            {/* Dropdown Wyboru Roli */}
            <div className="mb-3" style={{ maxWidth: '400px' }}>
                <label className="form-label">Wybierz kategorię (Rola Wyznaczająca):</label>
                <select
                    className="form-select"
                    value={selectedRoleId || ''}
                    onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                >
                    {supervisorRoles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                </select>
            </div>

            {/* Tabela Zadań */}
            <div className="card shadow-sm">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <span>Zadania dla: <strong>{selectedRoleObj?.name}</strong></span>
                    <button
                        className="btn btn-sm btn-success"
                        onClick={() => { setTaskToEdit(null); setShowTaskModal(true); }}
                        disabled={!selectedRoleId}
                    >
                        + Dodaj Zadanie
                    </button>
                </div>
                <div className="card-body p-0">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                        <tr>
                            <th>Nazwa</th>
                            <th>Skrót</th>
                            <th>Opis / Uwagi</th>
                            <th style={{ width: '150px' }}>Akcje</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map(task => (
                                <tr key={task.id}>
                                    <td>{task.name}</td>
                                    <td>{task.nameAbbrev}</td>
                                    <td>
                                        <small className="text-muted text-wrap" style={{ display: 'block', maxWidth: '300px' }}>
                                            {task.description || '-'}
                                        </small>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-outline-primary me-2"
                                            onClick={() => { setTaskToEdit(task); setShowTaskModal(true); }}
                                        >
                                            Edytuj
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => setTaskToDelete(task.id)}
                                        >
                                            Usuń
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="text-center py-3 text-muted">
                                    Brak zadań w tej kategorii dla tego wydarzenia.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SpecialEventTasksManager;