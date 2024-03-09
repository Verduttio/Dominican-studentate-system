import React, { ChangeEvent, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useHttp from "../../services/UseHttp";
import {Conflict, TaskShortInfo} from "../../models/Interfaces";
import { backendUrl } from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";
import ConflictFormFields from './ConflictFormFields';
import "../../components/AddEditForm.css";
import ConfirmDeletionPopup from "../../components/ConfirmDeletionPopup";

interface FormData {
    task1Id: number;
    task2Id: number;
}

function EditConflict() {
    const [tasks, setTasks] = useState<TaskShortInfo[]>([]);
    const [formData, setFormData] = useState<FormData>({ task1Id: 0, task2Id: 0 });
    const { conflictId } = useParams<{ conflictId: string }>();
    const navigate = useNavigate();
    const { request: fetchTasks, loading: loadingTasks } = useHttp(`${backendUrl}/api/tasks/shortInfo`, 'GET');
    const { request: fetchConflict, loading: loadingConflict } = useHttp(`${backendUrl}/api/conflicts/${conflictId}`, 'GET');
    const { request: updateConflict, error: updateError, loading: updateLoading } = useHttp(`${backendUrl}/api/conflicts/${conflictId}`, 'PUT');
    const { request: deleteConflict, error: deleteError , loading: deleteLoading} = useHttp(`${backendUrl}/api/conflicts/${conflictId}`, 'DELETE');
    const [validationError, setValidationError] = useState<string>('');
    const [showConfirmationPopup, setShowConfirmationPopup] = useState<boolean>(false);

    useEffect(() => {
        fetchTasks(null, setTasks);
        if (conflictId) {
            fetchConflict(null, (data: Conflict) => setFormData({ task1Id: data.task1.id, task2Id: data.task2.id }));
        }
    }, [conflictId, fetchTasks, fetchConflict]);

    const handleSubmit = () => {
        if (!formData.task1Id || !formData.task2Id || formData.task1Id === formData.task2Id) {
            setValidationError("Proszę wybrać dwa różne zadania.");
            return;
        }
        updateConflict(formData, () => navigate('/conflicts', { state: { message: 'Konflikt został zaktualizowany' } }));
    };

    const handleDelete = () => {
        if (conflictId) {
            deleteConflict(null, () => {
                navigate('/conflicts', { state: { message: 'Pomyślnie usunięto konflikt' } });
            })
                .then(() => setShowConfirmationPopup(false));
        }
    };

    const onChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: parseInt(e.target.value) });
    };

    if (loadingTasks || loadingConflict || !tasks) return <LoadingSpinner />;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Edytuj konflikt</h1>
            </div>
            <div className="edit-entity-container">
                {(updateError || deleteError) && <div className="alert alert-danger">{updateError || deleteError}</div>}
                {validationError && <div className="alert alert-danger">{validationError}</div>}
                <ConflictFormFields tasks={tasks} formData={formData} onChange={onChange} />
                <div className="d-flex justify-content-between">
                    <button onClick={handleSubmit} className="btn btn-success" disabled={deleteLoading || updateLoading}>Zaktualizuj</button>
                    <button onClick={() => setShowConfirmationPopup(true)} className="btn btn-danger" disabled={deleteLoading || updateLoading}>Usuń</button>
                    {showConfirmationPopup && <ConfirmDeletionPopup onHandle={handleDelete} onClose={() => setShowConfirmationPopup(false)}/>}
                </div>
            </div>
        </div>
    );
}

export default EditConflict;
