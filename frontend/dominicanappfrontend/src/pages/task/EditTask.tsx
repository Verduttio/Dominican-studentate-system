import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";
import {Role, Task} from "../../models/Interfaces";
import TaskFormFields from "./addTask/TaskFormFields";
import ConfirmDeletionPopup from "../../components/ConfirmDeletionPopup";
import AlertBox from "../../components/AlertBox";
import useIsAdmin, {UNAUTHORIZED_PAGE_TEXT} from "../../services/UseIsFunkcyjny";


interface TaskFormData extends Omit<Task, 'id' | 'allowedRoles' | 'supervisorRole'> {
    allowedRoleNames: string[],
    supervisorRoleName: string
}

function validateTaskData(data: TaskFormData) : string {
    if (!data.name) {
        return('Proszę wypełnić nazwę oficjum.');
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
        nameAbbrev: '',
        participantsLimit: 0,
        permanent: false,
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
    const { error: postError, request: postTask, loading: postLoading } = useHttp(`${backendUrl}/api/tasks/${taskId}`, 'PUT');
    const { request: deleteTask, error: deleteError, loading: deleteLoading } = useHttp(`${backendUrl}/api/tasks/${taskId}`, 'DELETE');
    const { isFunkcyjny, isFunkcyjnyLoading, isFunkcyjnyInitialized } = useIsAdmin();
    const [validationError, setValidationError] = useState<string>('');
    const [showConfirmationPopup, setShowConfirmationPopup] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTask(null, (data: Task) => {
            const task = data;
            if (task) {
                setTaskData({
                    name: task.name,
                    nameAbbrev: task.nameAbbrev,
                    participantsLimit: task.participantsLimit,
                    permanent: task.permanent,
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
            postTask(taskData, () => navigate('/tasks', { state: { message: 'Pomyślnie uaktualniono oficjum' } }));
        }
    };

    const handleDelete = () => {
        deleteTask(null, () => {
            navigate('/tasks', { state: { message: 'Pomyślnie usunięto oficjum' } });
        })
            .then(() => setShowConfirmationPopup(false));
    }

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

    if (loadingSupervisorRoles || loadingTaskPerformerRoles || loadingFetchingTask) return <LoadingSpinner/>;
    if (errorFetchSupervisorRoles || errorFetchTaskPerformerRoles || errorFetchingTask) return (
        <AlertBox text={errorFetchSupervisorRoles || errorFetchTaskPerformerRoles || errorFetchingTask} type={'danger'} width={'500px'}/>
    )

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Edytuj oficjum</h1>
            </div>
            {validationError &&  <AlertBox text={validationError} type={'danger'} width={'500px'}/>}
            {postError &&  <AlertBox text={postError} type={'danger'} width={'500px'}/>}
            {deleteError &&  <AlertBox text={deleteError} type={'danger'} width={'500px'}/>}
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
                <div className="d-flex justify-content-between">
                    <button className="btn btn-success m-1" onClick={handleSubmit} disabled={postLoading || deleteLoading}>
                        {postLoading ? (
                            <>
                                <span>Aktualizowanie </span>
                                <span className="spinner-border spinner-border-sm"></span>
                            </>
                        ) : 'Zaktualizuj'}
                    </button>
                    <button className="btn btn-danger m-1" onClick={() => setShowConfirmationPopup(true)} disabled={postLoading || deleteLoading}>Usuń oficjum</button>
                    {showConfirmationPopup && <ConfirmDeletionPopup onHandle={handleDelete} onClose={() => setShowConfirmationPopup(false)}/>}
                </div>
            </div>
        </div>
    );
}

export default EditTask;
