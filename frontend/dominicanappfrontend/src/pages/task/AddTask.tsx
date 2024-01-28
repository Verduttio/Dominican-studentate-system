import React, { useEffect, useState, ChangeEvent } from 'react';
import { useNavigate } from "react-router-dom";
import useHttp from "../../services/UseHttp";
import { Task, Role } from "../../models/interfaces";

interface TaskFormData extends Omit<Task, 'id' | 'allowedRoles'> {
    allowedRoleNames: string[];
}

// noinspection JSNonASCIINames
const daysOfWeekMap: { [key: string]: string } = {
    "Poniedziałek": "MONDAY",
    "Wtorek": "TUESDAY",
    "Środa": "WEDNESDAY",
    "Czwartek": "THURSDAY",
    "Piątek": "FRIDAY",
    "Sobota": "SATURDAY",
    "Niedziela": "SUNDAY"
};



function AddTask() {
    const initialTaskState: TaskFormData = {
        name: '',
        category: '',
        participantsLimit: 0,
        permanent: false,
        participantForWholePeriod: false,
        allowedRoleNames: [],
        daysOfWeek: []
    };

    const [taskData, setTaskData] = useState(initialTaskState);
    const [roles, setRoles] = useState<Role[]>([]);
    const { request: fetchRoles, error: errorFetchRoles, loading: loadingRoles } = useHttp('http://localhost:8080/api/roles', 'GET');
    const { error: postError, request: postTask } = useHttp('http://localhost:8080/api/tasks', 'POST');
    const [validationError, setValidationError] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchRoles(null, (data: Role[]) => setRoles(data));
    }, [fetchRoles]);

    const handleSubmit = () => {
        setValidationError('');

        if (!taskData.name) {
            setValidationError('Proszę wypełnić nazwę zadania.');
            return;
        }

        if (!taskData.category) {
            setValidationError('Proszę wypełnić kategorię zadania.');
            return;
        }

        if (taskData.participantsLimit < 1) {
            setValidationError('Limit uczestników musi być większy niż 0.');
            return;
        }

        if (taskData.allowedRoleNames.length === 0) {
            setValidationError('Proszę wybrać przynajmniej jedną rolę.');
            return;
        }

        if (taskData.daysOfWeek.length === 0) {
            setValidationError('Proszę wybrać przynajmniej jeden dzień tygodnia.');
            return;
        }

        postTask(taskData, () => navigate('/tasks'));
    };


    const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;

            if (name === "allowedRoles") {
                const roleName = roles.find(role => role.id.toString() === value)?.name;
                if (!roleName) return;

                const updatedRoles = checked
                    ? [...taskData.allowedRoleNames, roleName]
                    : taskData.allowedRoleNames.filter(roleNameValue => roleNameValue !== roleName);
                setTaskData({
                    ...taskData,
                    allowedRoleNames: updatedRoles
                });
            } else if (name === "daysOfWeek") {
                const dayEnglish = daysOfWeekMap[value];
                if (!dayEnglish) return; // Check if dayEnglish is not undefined

                const updatedDays = checked
                    ? [...taskData.daysOfWeek, dayEnglish]
                    : taskData.daysOfWeek.filter(day => day !== dayEnglish);
                setTaskData({ ...taskData, daysOfWeek: updatedDays });
            } else {
                // Logic for other checkbox fields
                setTaskData({ ...taskData, [name]: checked });
            }
        } else {
            // Logic for other text and numeric fields
            setTaskData({ ...taskData, [name]: value });
        }

        setValidationError('');
    };




    if (loadingRoles) return <div>Ładowanie...</div>;
    if (errorFetchRoles) return <div className="error-message">{errorFetchRoles}</div>;

    return (
        <div>
            <input name="name" value={taskData.name} onChange={onChange} placeholder="Nazwa zadania" />
            <input name="category" value={taskData.category} onChange={onChange} placeholder="Kategoria" />
            <div>
                <label htmlFor="participantsLimit">Limit uczestników:</label>
                <input
                    id="participantsLimit"
                    name="participantsLimit"
                    type="number"
                    value={taskData.participantsLimit.toString()}
                    onChange={onChange}
                    placeholder="Limit uczestników"
                />
            </div>
            <div>
                <label>
                    Stały task:
                    <input name="permanent" type="checkbox" checked={taskData.permanent} onChange={onChange}/>
                </label>
            </div>
            <div>
                <label>
                    Uczestnik na cały okres np. tydzień (przeciwieństwo do: codziennie inny uczestnik):
                    <input name="participantForWholePeriod" type="checkbox" checked={taskData.participantForWholePeriod}
                           onChange={onChange}/>
                </label>
            </div>
            <div>
                {roles.map(role => (
                    <label key={role.id}>
                        <input
                            type="checkbox"
                            name="allowedRoles"
                            value={role.id}
                            checked={taskData.allowedRoleNames.some(r => r === role.name)}
                            onChange={onChange}
                        />
                        {role.name}
                    </label>
                ))}
            </div>
            <div>
                {Object.entries(daysOfWeekMap).map(([polishDay, englishDay]) => (
                    <label key={polishDay}>
                        <input
                            type="checkbox"
                            name="daysOfWeek"
                            value={polishDay}
                            checked={taskData.daysOfWeek.includes(englishDay)}
                            onChange={onChange}
                        />
                        {polishDay}
                    </label>
                ))}
            </div>
            {validationError && <div className="error-message">{validationError}</div>}
            {postError && <div className="error-message">{postError}</div>}
            <button onClick={handleSubmit}>Dodaj</button>
        </div>
    );
}

export default AddTask;
