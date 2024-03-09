import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";
import {Role, Task} from "../../models/Interfaces";
import TaskFormFields from "./addTask/TaskFormFields";


interface TaskFormData extends Omit<Task, 'id' | 'allowedRoles' | 'supervisorRole'> {
    allowedRoleNames: string[],
    supervisorRoleName: string
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

    if (data.supervisorRoleName === '') {
        return('Proszę wybrać rolę osoby wyznaczającej.');
    }

    if (data.daysOfWeek.length === 0) {
        return('Proszę wybrać przynajmniej jeden dzień tygodnia.');
    }

    return "";
}

function EditTask() {
    const initialTaskState: TaskFormData = {
        name: '',
        participantsLimit: 0,
        permanent: false,
        participantForWholePeriod: false,
        allowedRoleNames: [],
        supervisorRoleName: '',
        daysOfWeek: []
    };

    const { taskId } = useParams();
    const [taskData, setTaskData] = useState<TaskFormData>(initialTaskState);
    const [rolesSupervisor, setRolesSupervisor] = useState<Role[]>([]);
    const [rolesTaskPerformer, setRolesTaskPerformer] = useState<Role[]>([]);
    const { request: fetchTask, error: errorFetchingTask, loading: loadingFetchingTask } = useHttp(`${backendUrl}/api/tasks/${taskId}`, 'GET');
    const { request: fetchSupervisorRoles, error: errorFetchSupervisorRoles, loading: loadingSupervisorRoles } = useHttp(`${backendUrl}/api/roles/types/SUPERVISOR`, 'GET');
    const { request: fetchTaskPerformerRoles, error: errorFetchTaskPerformerRoles, loading: loadingTaskPerformerRoles } = useHttp(`${backendUrl}/api/roles/types/TASK_PERFORMER`, 'GET');
    const { error: postError, request: postTask } = useHttp(`${backendUrl}/api/tasks/${taskId}`, 'PUT');
    const [validationError, setValidationError] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchTask(null, (data: Task) => {
            const task = data;
            if (task) {
                setTaskData({
                    name: task.name,
                    participantsLimit: task.participantsLimit,
                    permanent: task.permanent,
                    participantForWholePeriod: task.participantForWholePeriod,
                    allowedRoleNames: task.allowedRoles.map(role => role.name),
                    supervisorRoleName: task.supervisorRole?.name,
                    daysOfWeek: task.daysOfWeek
                });
            }
        });
        fetchSupervisorRoles(null, (data: Role[]) => setRolesSupervisor(data));
        fetchTaskPerformerRoles(null, (data: Role[]) => setRolesTaskPerformer(data));
    }, [fetchTask, fetchSupervisorRoles, fetchTaskPerformerRoles]);

    const handleSubmit = () => {
        let error = validateTaskData(taskData)
        if (error !== "") {
            setValidationError(error);
            return;
        } else {
            postTask(taskData, () => navigate('/tasks', { state: { message: 'Pomyślnie uaktualniono zadanie' } }));
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

    const handleSupervisorRoleChange = (roleName: string) => {
        setTaskData({
            ...taskData,
            supervisorRoleName: roleName
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


    if (loadingSupervisorRoles || loadingTaskPerformerRoles || loadingFetchingTask) return <LoadingSpinner/>;
    if (errorFetchSupervisorRoles || errorFetchTaskPerformerRoles || errorFetchingTask) return <div className="aler alert-danger">{errorFetchSupervisorRoles || errorFetchTaskPerformerRoles || errorFetchingTask}</div>;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Dodaj zadanie</h1>
            </div>
            {validationError && <div className="alert alert-danger">{validationError}</div>}
            {postError && <div className="alert alert-danger">{postError}</div>}
            <div className="edit-entity-container">
                <TaskFormFields
                    taskData={taskData}
                    handleChange={handleChange}
                    handleRoleChange={handleRoleChange}
                    handleSupervisorRoleChange={handleSupervisorRoleChange}
                    handleDayChange={handleDayChange}
                    rolesTaskPerformer={rolesTaskPerformer}
                    rolesSupervisor={rolesSupervisor}
                />
                <div className="d-flex justify-content-center">
                    <button className="btn btn-success" onClick={handleSubmit}>Uaktualnij</button>
                </div>
            </div>
        </div>
    );
}

export default EditTask;
