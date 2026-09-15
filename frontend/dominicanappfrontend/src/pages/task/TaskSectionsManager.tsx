import React, { useEffect, useState } from 'react';
import useHttp from '../../services/UseHttp';
import { backendUrl } from '../../utils/constants';
import { TaskSection } from '../../models/Interfaces';
import LoadingSpinner from '../../components/LoadingScreen';
import AlertBox from '../../components/AlertBox';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faCheck, faXmark, faPlus, faClock } from "@fortawesome/free-solid-svg-icons";

const TaskSectionsManager: React.FC = () => {
    const [sections, setSections] = useState<TaskSection[]>([]);
    const [newSectionName, setNewSectionName] = useState('');

    // Stan edycji
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');

    const { request: fetchRequest, loading: fetchLoading, error: fetchError } = useHttp();
    const { request: actionRequest, loading: actionLoading, error: actionError } = useHttp();

    const fetchSections = () => {
        fetchRequest(null, (data: TaskSection[]) => {
            setSections(data);
        }, false, `${backendUrl}/api/task-sections`, 'GET');
    };

    useEffect(() => {
        fetchSections();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSectionName.trim()) return;

        actionRequest({ name: newSectionName }, () => {
            setNewSectionName('');
            fetchSections();
        }, false, `${backendUrl}/api/task-sections`, 'POST');
    };

    const handleDelete = (id: number, name: string) => {
        if (window.confirm(`Czy na pewno chcesz usunąć porę dnia "${name}"? \nUWAGA: Upewnij się, że nie ma już przypisanych zadań do tej pory!`)) {
            actionRequest(null, () => {
                fetchSections();
            }, false, `${backendUrl}/api/task-sections/${id}`, 'DELETE');
        }
    };

    const startEditing = (section: TaskSection) => {
        setEditingId(section.id);
        setEditName(section.name);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditName('');
    };

    const saveEdit = (id: number) => {
        if (!editName.trim()) return;

        actionRequest({ name: editName }, () => {
            cancelEditing();
            fetchSections();
        }, false, `${backendUrl}/api/task-sections/${id}`, 'PUT'); // Lub PATCH w zależności od Twojego backendu
    };

    if (fetchLoading && sections.length === 0) return <LoadingSpinner />;

    return (
        <div className="container mt-4 mb-5 fade-in" style={{ maxWidth: '700px' }}>
            <div className="d-flex align-items-center justify-content-center mb-4">
                <FontAwesomeIcon icon={faClock} size="2x" className="me-3 text-info" />
                <h2 className="mb-0">Zarządzanie Porami Dnia</h2>
            </div>

            {(fetchError || actionError) && <AlertBox text={fetchError || actionError} type="danger" width="100%" />}

            {/* Formularz dodawania */}
            <div className="card shadow-sm mb-4 border-0">
                <div className="card-body bg-light rounded">
                    <form onSubmit={handleAdd} className="d-flex gap-2">
                        <input
                            type="text"
                            className="form-control border-primary shadow-sm"
                            placeholder="Wpisz nazwę nowej pory dnia (np. Świt, Północ)..."
                            value={newSectionName}
                            onChange={(e) => setNewSectionName(e.target.value)}
                            required
                        />
                        <button type="submit" className="btn btn-primary fw-bold px-4 shadow-sm" disabled={actionLoading}>
                            {actionLoading ? <span className="spinner-border spinner-border-sm"></span> : <><FontAwesomeIcon icon={faPlus} className="me-1" /> Dodaj</>}
                        </button>
                    </form>
                </div>
            </div>

            {/* Lista sekcji */}
            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <table className="table table-hover table-striped mb-0 align-middle text-center">
                        <thead className="table-dark">
                            <tr>
                                <th style={{ width: '15%' }}>ID</th>
                                <th style={{ width: '55%' }}>Nazwa Pory Dnia</th>
                                <th style={{ width: '30%' }}>Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sections.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-muted p-4">Brak zdefiniowanych pór dnia.</td>
                                </tr>
                            ) : (
                                sections.map(section => (
                                    <tr key={section.id}>
                                        <td className="fw-bold">{section.id}</td>
                                        <td>
                                            {editingId === section.id ? (
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm text-center mx-auto"
                                                    style={{ maxWidth: '250px' }}
                                                    value={editName}
                                                    onChange={e => setEditName(e.target.value)}
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className="fs-6">{section.name}</span>
                                            )}
                                        </td>
                                        <td>
                                            {editingId === section.id ? (
                                                <div className="d-flex justify-content-center gap-2">
                                                    <button className="btn btn-success btn-sm shadow-sm" onClick={() => saveEdit(section.id)} title="Zapisz">
                                                        <FontAwesomeIcon icon={faCheck} />
                                                    </button>
                                                    <button className="btn btn-secondary btn-sm shadow-sm" onClick={cancelEditing} title="Anuluj">
                                                        <FontAwesomeIcon icon={faXmark} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="d-flex justify-content-center gap-2">
                                                    <button
                                                        className="btn btn-warning btn-sm text-dark shadow-sm"
                                                        onClick={() => startEditing(section)}
                                                        disabled={actionLoading}
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm shadow-sm"
                                                        onClick={() => handleDelete(section.id, section.name)}
                                                        disabled={actionLoading}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TaskSectionsManager;