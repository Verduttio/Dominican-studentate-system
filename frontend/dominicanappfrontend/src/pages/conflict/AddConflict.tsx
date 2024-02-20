import React, {ChangeEvent, useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import useHttp from "../../services/UseHttp";
import {TaskShortInfo} from "../../models/interfaces";
import {backendUrl} from "../../utils/constants";


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

        postRequest.request(formData, () => navigate('/conflicts')).then(r => {});
    };

    const onChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value ? parseInt(e.target.value) : 0 });
        setSubmitError('');
    };

    if (loading) return <div>Ładowanie...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="fade-in">
            <select name="task1Id" value={task1Id.toString()} onChange={onChange}>
                <option value="">Wybierz Task 1</option>
                {tasks.map(task => <option key={task.id} value={task.id}>{task.name}</option>)}
            </select>
            <select name="task2Id" value={task2Id.toString()} onChange={onChange}>
                <option value="">Wybierz Task 2</option>
                {tasks.map(task => <option key={task.id} value={task.id}>{task.name}</option>)}
            </select>
            <button onClick={handleSubmit}>Zapisz</button>
            {postRequest.error && <div className="error-message">{postRequest.error}</div>}
            {submitError && <div className="error-message">{submitError}</div>}
        </div>
    );

}

export default AddConflict;