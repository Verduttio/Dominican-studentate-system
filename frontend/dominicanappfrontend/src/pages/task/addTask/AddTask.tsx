import React, {useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import useHttp from "../../../services/UseHttp";
import { Task, Role } from "../../../models/Interfaces";
import {backendUrl} from "../../../utils/constants";
import LoadingSpinner from "../../../components/LoadingScreen";
import TaskFormFields from "./TaskFormFields";
import AlertBox from "../../../components/AlertBox";
import useIsAdmin, {UNAUTHORIZED_PAGE_TEXT} from "../../../services/UseIsFunkcyjny";


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

function AddTask() {
    const initialTaskState: TaskFormData = {
        name: '',
        nameAbbrev: '',
        participantsLimit: 0,
        permanent: false,
        participantForWholePeriod: false,
        allowedRoleNames: [],
        supervisorRoleName: '',
        daysOfWeek: []
    };

    const [taskData, setTaskData] = useState(initialTaskState);
    const [rolesSupervisor, setRolesSupervisor] = useState<Role[]>([]);
    const [rolesTaskPerformer, setRolesTaskPerformer] = useState<Role[]>([]);
    const { request: fetchSupervisorRoles, error: errorFetchSupervisorRoles, loading: loadingSupervisorRoles } = useHttp(`${backendUrl}/api/roles/types/SUPERVISOR`, 'GET');
    const { request: fetchTaskPerformerRoles, error: errorFetchTaskPerformerRoles, loading: loadingTaskPerformerRoles } = useHttp(`${backendUrl}/api/roles/types/TASK_PERFORMER`, 'GET');
    const { error: postError, request: postTask, loading: postTaskLoading } = useHttp(`${backendUrl}/api/tasks`, 'POST');
    const { isFunkcyjny, isFunkcyjnyLoading, isFunkcyjnyInitialized } = useIsAdmin();
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

    if(isFunkcyjnyLoading || isFunkcyjnyInitialized) {
        return <LoadingSpinner/>;
    } else if(!isFunkcyjny) return <AlertBox text={UNAUTHORIZED_PAGE_TEXT} type="danger" width={'500px'} />;

    if (loadingSupervisorRoles || loadingTaskPerformerRoles) return <LoadingSpinner/>;
    if (errorFetchSupervisorRoles || errorFetchTaskPerformerRoles) return <AlertBox text={errorFetchSupervisorRoles || errorFetchTaskPerformerRoles} type="danger" width={'500px'} />;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Dodaj zadanie</h1>
            </div>
            {validationError && <AlertBox text={validationError} type={'danger'} width={'500px'}/> }
            {postError && <AlertBox text={postError} type={'danger'} width={'500px'}/>}
            <div className="edit-entity-container mw-100" style={{width: '400px'}}>
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
                    <button className="btn btn-success" onClick={handleSubmit} disabled={postTaskLoading}>
                        {postTaskLoading ? (
                            <>
                                <span>Dodawanie </span>
                                <span className="spinner-border spinner-border-sm"></span>
                            </>
                        ) : 'Dodaj'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddTask;
