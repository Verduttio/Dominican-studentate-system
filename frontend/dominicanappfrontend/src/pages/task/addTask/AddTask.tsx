import React, {useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import useHttp from "../../../services/UseHttp";
import { Task, Role } from "../../../models/Interfaces";
import { RoleCheckboxList } from './RoleCheckboxList';
import { DaysOfWeekCheckboxList } from './DaysOfWeekCheckboxList';
import {backendUrl} from "../../../utils/constants";
import LoadingSpinner from "../../../components/LoadingScreen";


interface TaskFormData extends Omit<Task, 'id' | 'allowedRoles' | 'supervisorRoles'> {
    allowedRoleNames: string[],
    supervisorRoleNames: string[]
}

function validateTaskData(data: TaskFormData) : string {
    if (!data.name) {
        return('Proszę wypełnić nazwę zadania.');
    }

    if (data.participantsLimit == null || data.participantsLimit < 1) {
        return('Limit uczestników musi być większy niż 0.');
    }

    if (data.allowedRoleNames.length === 0) {
        return('Proszę wybrać przynajmniej jedną rolę osoby wykonującej.');
    }

    if (data.supervisorRoleNames.length === 0) {
        return('Proszę wybrać przynajmniej jedną rolę osoby wyznaczającej.');
    }

    if (data.daysOfWeek.length === 0) {
        return('Proszę wybrać przynajmniej jeden dzień tygodnia.');
    }

    return "";
}

function AddTask() {
    const initialTaskState: TaskFormData = {
        name: '',
        participantsLimit: 0,
        permanent: false,
        participantForWholePeriod: false,
        allowedRoleNames: [],
        supervisorRoleNames: [],
        daysOfWeek: []
    };

    const [taskData, setTaskData] = useState(initialTaskState);
    const [rolesSupervisor, setRolesSupervisor] = useState<Role[]>([]);
    const [rolesTaskPerformer, setRolesTaskPerformer] = useState<Role[]>([]);
    const { request: fetchSupervisorRoles, error: errorFetchSupervisorRoles, loading: loadingSupervisorRoles } = useHttp(`${backendUrl}/api/roles/types/SUPERVISOR`, 'GET');
    const { request: fetchTaskPerformerRoles, error: errorFetchTaskPerformerRoles, loading: loadingTaskPerformerRoles } = useHttp(`${backendUrl}/api/roles/types/TASK_PERFORMER`, 'GET');
    const { error: postError, request: postTask } = useHttp(`${backendUrl}/api/tasks`, 'POST');
    const [validationError, setValidationError] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchSupervisorRoles(null, (data: Role[]) => setRolesSupervisor(data));
        fetchTaskPerformerRoles(null, (data: Role[]) => setRolesTaskPerformer(data));
    }, [fetchSupervisorRoles, fetchTaskPerformerRoles]);

    const handleSubmit = () => {
        let error = validateTaskData(taskData)
        if (error !== "") {
            setValidationError(error);
            return;
        } else {
            postTask(taskData, () => navigate('/tasks', { state: { message: 'Pomyślnie dodano zadanie' } }));
        }
    };

    const handleRoleChange = (roleName: string, checked: boolean) => {
        const updatedRoles = checked
            ? [...taskData.allowedRoleNames, roleName]
            : taskData.allowedRoleNames.filter(roleNameValue => roleNameValue !== roleName);
        setTaskData({
            ...taskData,
            allowedRoleNames: updatedRoles
        });
    };

    const handleSupervisorRoleChange = (roleName: string, checked: boolean) => {
        const updatedRoles = checked
            ? [...taskData.supervisorRoleNames, roleName]
            : taskData.supervisorRoleNames.filter(roleNameValue => roleNameValue !== roleName);
        setTaskData({
            ...taskData,
            supervisorRoleNames: updatedRoles
        });
    };


    const handleDayChange = (dayEnglish: string, checked: boolean) => {
        const updatedDays = checked
            ? [...taskData.daysOfWeek, dayEnglish]
            : taskData.daysOfWeek.filter(day => day !== dayEnglish);
        setTaskData({ ...taskData, daysOfWeek: updatedDays });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === "checkbox" && name !== "allowedRoles" && name !== "daysOfWeek" && name !== "supervisorRoles") {
            const checked = (e.target as HTMLInputElement).checked;
            setTaskData({ ...taskData, [name]: checked });
        } else {
            setTaskData({ ...taskData, [name]: value });
        }

        setValidationError('');
    };


    if (loadingSupervisorRoles || loadingTaskPerformerRoles) return <LoadingSpinner/>;
    if (errorFetchSupervisorRoles || errorFetchTaskPerformerRoles) return <div className="aler alert-danger">{errorFetchSupervisorRoles}</div>;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Dodaj zadanie</h1>
            </div>
            {validationError && <div className="alert alert-danger">{validationError}</div>}
            {postError && <div className="alert alert-danger">{postError}</div>}
            <div className="edit-entity-container">
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                        Nazwa zadania:
                    </label>
                    <input
                        className="form-control-sm"
                        name="name"
                        value={taskData.name}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="participantsLimit" className="form-label">Limit uczestników:</label>
                    <input
                        className="form-control-sm"
                        id="participantsLimit"
                        name="participantsLimit"
                        type="number"
                        value={taskData.participantsLimit.toString()}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label custom-checkbox">
                        Stały task:
                        <input
                            className="form-check-input"
                            name="permanent"
                            type="checkbox"
                            checked={taskData.permanent}
                            onChange={handleChange}
                        />
                    </label>
                </div>
                <div className="mb-3">
                    <label className="form-label">Role potrzebne do wykonania zadania:</label>
                    <RoleCheckboxList roles={rolesTaskPerformer} selectedRoles={taskData.allowedRoleNames}
                                      onRoleChange={handleRoleChange}/>
                </div>
                <div className="mb-3">
                    <label className="form-label">Kto może wyznaczyć do tego zadania:</label>
                    <RoleCheckboxList roles={rolesSupervisor} selectedRoles={taskData.supervisorRoleNames}
                                      onRoleChange={handleSupervisorRoleChange}/>
                </div>
                <div className="mb-3">
                    <label className="form-label">Dni tygodnia:</label>
                    <DaysOfWeekCheckboxList selectedDays={taskData.daysOfWeek} onDayChange={handleDayChange}/>
                </div>
                <div className="mb-3">
                    <label className="form-label custom-checkbox">
                        Uczestnik na cały okres:
                        <input
                            className="form-check-input"
                            name="participantForWholePeriod"
                            type="checkbox"
                            checked={taskData.participantForWholePeriod}
                            onChange={handleChange}
                        />
                    </label>
                </div>
                <div className="d-flex justify-content-center">
                    <button className="btn btn-success" onClick={handleSubmit}>Dodaj</button>
                </div>
            </div>
        </div>
    );
}

export default AddTask;
