import React, {ChangeEvent, useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import useHttp from "../../services/UseHttp";
import {TaskShortInfo} from "../../models/Interfaces";
import {backendUrl} from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";
import '../../components/AddEditForm.css';
import ConflictFormFields from "./ConflictFormFields";


interface FormData {
    task1Id: number;
    task2Id: number;
}

function AddConflict() {
    const [tasks, setTasks] = useState<TaskShortInfo[]>([]);
    const [formData, setFormData] = useState<FormData>({
        task1Id: 0,
        task2Id: 0
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

    if (loading) return <LoadingSpinner/>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Dodaj konflikt</h1>
            </div>
            <div className="edit-entity-container mw-100" style={{width: '400px'}}>
                {postRequest.error && <div className="alert alert-danger">{postRequest.error}</div>}
                {submitError && <div className="alert alert-danger">{submitError}</div>}
                <ConflictFormFields
                    tasks={tasks}
                    formData={formData}
                    onChange={onChange}
                />
                <div className="d-flex justify-content-center">
                    <button className="btn btn-success" onClick={handleSubmit}>Dodaj</button>
                </div>
            </div>
        </div>
    );

}

export default AddConflict;