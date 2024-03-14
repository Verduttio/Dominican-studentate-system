import React, {ChangeEvent, useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import useHttp from "../../services/UseHttp";
import {TaskShortInfo} from "../../models/Interfaces";
import {backendUrl} from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";
import '../../components/AddEditForm.css';
import ConflictFormFields from "./ConflictFormFields";
import AlertBox from "../../components/AlertBox";


interface FormData {
    task1Id: number;
    task2Id: number;
    daysOfWeek: string[];
}

function AddConflict() {
    const [tasks, setTasks] = useState<TaskShortInfo[]>([]);
    const [formData, setFormData] = useState<FormData>({
        task1Id: 0,
        task2Id: 0,
        daysOfWeek: []
    });
    const { task1Id, task2Id } = formData;
    const { error, loading, request } = useHttp(`${backendUrl}/api/tasks/shortInfo`, 'GET');
    const postRequest = useHttp(`${backendUrl}/api/conflicts`, 'POST');
    const [submitError, setSubmitError] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        request(null, (data) => setTasks(data))
            .then(() => {});
    }, [request]);

    const handleSubmit = () => {
        if (task1Id === 0 || task2Id === 0) {
            setSubmitError('Proszę wybrać oba zadania.');
            return;
        } else if (task1Id === task2Id) {
            setSubmitError('Proszę wybrać dwa różne zadania.');
            return;
        }

        postRequest.request(formData, () => {
            navigate('/conflicts', { state: { message: 'Pomyślnie dodano konflikt' } })
        });
    };

    const onChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value ? parseInt(e.target.value) : 0 });
        setSubmitError('');
    };

    const onChangeDays = (dayEnglish: string, checked: boolean) => {
        const updatedDays = checked
            ? [...formData.daysOfWeek, dayEnglish]
            : formData.daysOfWeek.filter(day => day !== dayEnglish);
        setFormData({ ...formData, daysOfWeek: updatedDays });
    };

    if (loading) return <LoadingSpinner/>;
    if (error) return <AlertBox text={error} type={'danger'} width={'500px'}/>;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Dodaj konflikt</h1>
            </div>
            <div className="edit-entity-container mw-100" style={{width: '400px'}}>
                {postRequest.error && <AlertBox text={postRequest.error} type={'danger'} width={'500px'}/>}
                {submitError && <AlertBox text={submitError} type={'danger'} width={'500px'}/>}
                <ConflictFormFields
                    tasks={tasks}
                    formData={formData}
                    onChange={onChange}
                    onChangeDays={onChangeDays}
                />
                <div className="d-flex justify-content-center">
                    <button className="btn btn-success" disabled={postRequest.loading} onClick={handleSubmit}>Dodaj</button>
                </div>
            </div>
        </div>
    );

}

export default AddConflict;