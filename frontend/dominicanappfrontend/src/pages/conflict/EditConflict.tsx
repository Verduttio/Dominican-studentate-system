import React, { ChangeEvent, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useHttp from "../../services/UseHttp";
import {Conflict, TaskShortInfo} from "../../models/Interfaces";
import { backendUrl } from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";
import ConflictFormFields from './ConflictFormFields';
import "../../components/AddEditForm.css";
import ConfirmDeletionPopup from "../../components/ConfirmDeletionPopup";
import AlertBox from "../../components/AlertBox";
import useIsFunkcyjny, {UNAUTHORIZED_PAGE_TEXT} from "../../services/UseIsFunkcyjny";

interface FormData {
    task1Id: number;
    task2Id: number;
    daysOfWeek: string[];
}

function EditConflict() {
    const [tasks, setTasks] = useState<TaskShortInfo[]>([]);
    const [formData, setFormData] = useState<FormData>({ task1Id: 0, task2Id: 0, daysOfWeek: [] });
    const { conflictId } = useParams<{ conflictId: string }>();
    const navigate = useNavigate();
    const { request: fetchTasks, loading: loadingTasks, error: fetchTasksError } = useHttp(`${backendUrl}/api/tasks/shortInfo`, 'GET');
    const { request: fetchConflict, loading: loadingConflict, error: fetchConflictError } = useHttp(`${backendUrl}/api/conflicts/${conflictId}`, 'GET');
    const { request: updateConflict, error: updateError, loading: updateLoading } = useHttp(`${backendUrl}/api/conflicts/${conflictId}`, 'PUT');
    const { request: deleteConflict, error: deleteError , loading: deleteLoading} = useHttp(`${backendUrl}/api/conflicts/${conflictId}`, 'DELETE');
    const [validationError, setValidationError] = useState<string>('');
    const [showConfirmationPopup, setShowConfirmationPopup] = useState<boolean>(false);
    const { isFunkcyjny, isFunkcyjnyLoading, isFunkcyjnyInitialized } = useIsFunkcyjny();

    useEffect(() => {
        fetchTasks(null, setTasks);
        if (conflictId) {
            fetchConflict(null, (data: Conflict) => setFormData({ task1Id: data.task1.id, task2Id: data.task2.id, daysOfWeek: data.daysOfWeek}));
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

    const onChangeDays = (dayEnglish: string, checked: boolean) => {
        const updatedDays = checked
            ? [...formData.daysOfWeek, dayEnglish]
            : formData.daysOfWeek.filter(day => day !== dayEnglish);
        setFormData({ ...formData, daysOfWeek: updatedDays });
    };

    const onChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: parseInt(e.target.value) });
    };

    if(isFunkcyjnyLoading || isFunkcyjnyInitialized) {
        return <LoadingSpinner/>;
    } else if(!isFunkcyjny) return <AlertBox text={UNAUTHORIZED_PAGE_TEXT} type="danger" width={'500px'} />;

    if (loadingTasks || loadingConflict) return <LoadingSpinner />;
    if (fetchTasksError || fetchConflictError) return <AlertBox text={fetchTasksError || fetchConflictError} type={'danger'} width={'500px'}/>

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Edytuj konflikt</h1>
            </div>
            <div className="edit-entity-container mw-100" style={{width: '400px'}}>
                {(updateError || deleteError) && <AlertBox text={deleteError || updateError} type={'danger'} width={'500px'}/>}
                {validationError && <div className="alert alert-danger">{validationError}</div>}
                <ConflictFormFields tasks={tasks} formData={formData} onChange={onChange} onChangeDays={onChangeDays}/>
                <div className="d-flex justify-content-between">
                    <button onClick={handleSubmit} className="btn btn-success m-1" disabled={deleteLoading || updateLoading}>Zaktualizuj</button>
                    <button onClick={() => setShowConfirmationPopup(true)} className="btn btn-danger m-1" disabled={deleteLoading || updateLoading}>Usuń</button>
                    {showConfirmationPopup && <ConfirmDeletionPopup onHandle={handleDelete} onClose={() => setShowConfirmationPopup(false)}/>}
                </div>
            </div>
        </div>
    );
}

export default EditConflict;
