import React, { useEffect, useState } from 'react';
import useHttp from '../../services/UseHttp';
import {Role, ScheduleShortInfo, ScheduleShortInfoForTask} from '../../models/Interfaces';
import {backendUrl} from "../../utils/constants";
import axios, {AxiosError} from "axios";
import {useNavigate} from "react-router-dom";
import WeekSelector from "../../components/WeekSelector";
import {endOfWeek, format, startOfWeek} from "date-fns";
import LoadingSpinner from "../../components/LoadingScreen";
import useIsFunkcyjny from "../../services/UseIsFunkcyjny";
import AlertBox from "../../components/AlertBox";


function SchedulePage() {
    const [scheduleShortInfo, setScheduleShortInfo] = useState<ScheduleShortInfo[]>([]);
    const [scheduleShortInfoForTasks, setScheduleShortInfoForTasks] = useState<ScheduleShortInfoForTask[]>([]);
    const [scheduleShortInfoForTasksByRoles, setScheduleShortInfoForTasksByRoles] = useState<ScheduleShortInfoForTask[]>([]);
    const [supervisorRoles, setSupervisorRoles] = useState<Role[]>([]);
    const [selectedSupervisorRoleName, setSelectedSupervisorRoleName] = useState<string | null>(null);
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const { request: fetchSchedule, error, loading} = useHttp(`${backendUrl}/api/schedules/users/scheduleShortInfo/week?from=${format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}&to=${format(endOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}`, 'GET');
    const { request: fetchScheduleByTasks, error: errorFetchScheduleByTasks, loading: loadingFetchScheduleByTasks} = useHttp(`${backendUrl}/api/schedules/tasks/scheduleShortInfo/week?from=${format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}&to=${format(endOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}`, 'GET');
    const { request: fetchScheduleByTasksByRoles, error: errorFetchScheduleByTasksByRoles, loading: loadingFetchScheduleByTasksByRoles} = useHttp();
    const { request: fetchSupervisorRoles, error: errorFetchSupervisorRoles, loading: loadingSupervisorRoles } = useHttp(`${backendUrl}/api/roles/types/SUPERVISOR`, 'GET');
    const navigate = useNavigate();
    const { isFunkcyjny } = useIsFunkcyjny();
    const [loadingDownloadSchedulePdfForUsers, setLoadingDownloadSchedulePdfForUsers] = useState<boolean>(false);
    const [loadingDownloadSchedulePdfForTasksByRole, setLoadingDownloadSchedulePdfForTasksByRole] = useState<boolean>(false);
    const [loadingDownloadSchedulePdfForTasks, setLoadingDownloadSchedulePdfForTasks] = useState<boolean>(false);
    const [errorDownloadSchedulePdfForUsers, setErrorDownloadSchedulePdfForUsers] = useState<string | null>(null);
    const [errorDownloadSchedulePdfForTasksByRole, setErrorDownloadSchedulePdfForTasksByRole] = useState<string | null>(null);
    const [errorDownloadSchedulePdfForTasks, setErrorDownloadSchedulePdfForTasks] = useState<string | null>(null);


    useEffect(() => {
        fetchSchedule(null, (data) => setScheduleShortInfo(data));
        fetchScheduleByTasks(null, (data) => setScheduleShortInfoForTasks(data));
        fetchSupervisorRoles(null, (data: Role[]) => setSupervisorRoles(data));
    }, [fetchSchedule, fetchScheduleByTasks, fetchSupervisorRoles]);

    useEffect(() => {
        if (selectedSupervisorRoleName) {
            fetchScheduleByTasksByRoles(null, (data) => setScheduleShortInfoForTasksByRoles(data), false,
                `${backendUrl}/api/schedules/tasks/byRole/${selectedSupervisorRoleName}/scheduleShortInfo/week?from=${format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}&to=${format(endOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}`, 'GET');
        }
    }, [fetchScheduleByTasksByRoles, selectedSupervisorRoleName, currentWeek]);

    async function downloadSchedulePdfForUsers() {
        setLoadingDownloadSchedulePdfForUsers(true);
        try {
            const response = await axios({
                url: `${backendUrl}/api/pdf/schedules/users/scheduleShortInfo/week?from=${format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}&to=${format(endOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}`,
                method: 'GET',
                responseType: 'blob',
                withCredentials: true
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Harmonogram_użytkownicy_${format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}-${format(endOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const serverError = err as AxiosError<{ message?: string }>;
                if (serverError.response) {
                    setErrorDownloadSchedulePdfForUsers('Błąd podczas pobierania PDF:' + serverError.response.data);
                } else {
                    setErrorDownloadSchedulePdfForUsers('Problem z połączeniem sieciowym');
                }
            } else {
                setErrorDownloadSchedulePdfForUsers('Nieoczekiwany błąd:' + err);
            }
        } finally {
            setLoadingDownloadSchedulePdfForUsers(false);
        }
    }

    async function downloadSchedulePdfForTasksByRole() {
        setLoadingDownloadSchedulePdfForTasksByRole(true);
        try {
            const response = await axios({
                url: `${backendUrl}/api/pdf/schedules/tasks/byRole/${selectedSupervisorRoleName}/scheduleShortInfo/week?from=${format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}&to=${format(endOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}`,
                method: 'GET',
                responseType: 'blob',
                withCredentials: true
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Harmonogram_zadan_wg_roli_${selectedSupervisorRoleName}_${format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}-${format(endOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const serverError = err as AxiosError<{ message?: string }>;
                if (serverError.response) {
                    setErrorDownloadSchedulePdfForTasksByRole('Błąd podczas pobierania PDF:' + serverError.response.data);
                } else {
                    setErrorDownloadSchedulePdfForTasksByRole('Problem z połączeniem sieciowym');
                }
            } else {
                setErrorDownloadSchedulePdfForTasksByRole('Nieoczekiwany błąd:' + err);
            }
        } finally {
            setLoadingDownloadSchedulePdfForTasksByRole(false);
        }
    }

    async function downloadSchedulePdfForTasks() {
        setLoadingDownloadSchedulePdfForTasks(true);
        try {
            const response = await axios({
                url: `${backendUrl}/api/pdf/schedules/tasks/scheduleShortInfo/week?from=${format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}&to=${format(endOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}`,
                method: 'GET',
                responseType: 'blob',
                withCredentials: true
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Harmonogram_zadan_${selectedSupervisorRoleName}_${format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}-${format(endOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const serverError = err as AxiosError<{ message?: string }>;
                if (serverError && serverError.response) {
                    setErrorDownloadSchedulePdfForTasks('Błąd podczas pobierania PDF:' + serverError.response.data);
                } else {
                    setErrorDownloadSchedulePdfForTasks('Problem z połączeniem sieciowym');
                }
            } else {
                setErrorDownloadSchedulePdfForTasks('Nieoczekiwany błąd:' + err);
            }
        } finally {
            setLoadingDownloadSchedulePdfForTasks(false);
        }
    }

    const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedRoleName = event.target.value;
        if (!selectedRoleName) {
            setScheduleShortInfoForTasksByRoles([]);
            setSelectedSupervisorRoleName(null)
        } else {
            setSelectedSupervisorRoleName(selectedRoleName);
            fetchScheduleByTasksByRoles(null, (data) => setScheduleShortInfoForTasksByRoles(data), false,
                `${backendUrl}/api/schedules/tasks/byRole/${selectedRoleName}/scheduleShortInfo/week?from=${format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}&to=${format(endOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}`, 'GET');
        }
    }

    const renderUsersSchedule = () => {
        if(loading) return <LoadingSpinner />;
        if(error) return <AlertBox text={error} type="danger" width={'500px'} />;

        return (
            <div className="d-flex justify-content-center">
                <div className="table-responsive" style={{maxWidth: '600px'}}>
                    <table className="table table-hover table-striped table-rounded table-shadow mb-0">
                        <thead className="table-dark">
                        <tr>
                            <th>Użytkownik</th>
                            <th>Zadania</th>
                        </tr>
                        </thead>
                        <tbody>
                        {scheduleShortInfo.map(scheduleShortInfo => (
                            <tr key={scheduleShortInfo.userId}>
                                <td>{scheduleShortInfo.userName} {scheduleShortInfo.userSurname}</td>
                                <td>{scheduleShortInfo.tasksInfoStrings.join(', ')}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    const renderTasksScheduleByRole = () => {
        if(loadingFetchScheduleByTasksByRoles || loadingSupervisorRoles) return <LoadingSpinner />;
        if(errorFetchScheduleByTasksByRoles || errorFetchSupervisorRoles) return <AlertBox text={errorFetchScheduleByTasksByRoles || errorFetchSupervisorRoles} type="danger" width={'500px'} />;

        return (
            <div className="d-flex justify-content-center">
                <div className="table-responsive" style={{maxWidth: '600px'}}>
                    <table className="table table-hover table-striped table-rounded table-shadow mb-0">
                        <thead className="table-dark">
                        <tr>
                            <th>Zadanie</th>
                            <th>Użytkownicy</th>
                        </tr>
                        </thead>
                        <tbody>
                        {scheduleShortInfoForTasksByRoles.map(scheduleShortInfoForTaskByRole => (
                            <tr key={scheduleShortInfoForTaskByRole.taskId}>
                                <td>{scheduleShortInfoForTaskByRole.taskName}</td>
                                <td>
                                    {scheduleShortInfoForTaskByRole.usersInfoStrings.map((userInfoString, index) => (
                                        <div key={index}>{userInfoString}</div>
                                    ))}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    const renderTasksSchedule = () => {
        if(loadingFetchScheduleByTasks) return <LoadingSpinner />;
        if(errorFetchScheduleByTasks) return <AlertBox text={errorFetchScheduleByTasks} type="danger" width={'500px'} />;

        return (
            <div className="d-flex justify-content-center">
                <div className="table-responsive" style={{maxWidth: '600px'}}>
                    <table className="table table-hover table-striped table-rounded table-shadow mb-0">
                        <thead className="table-dark">
                        <tr>
                            <th>Zadanie</th>
                            <th>Użytkownicy</th>
                        </tr>
                        </thead>
                        <tbody>
                        {scheduleShortInfoForTasks.map(scheduleShortInfoForTask => (
                            <tr key={scheduleShortInfoForTask.taskId}>
                                <td>{scheduleShortInfoForTask.taskName}</td>
                                <td>
                                    {scheduleShortInfoForTask.usersInfoStrings.map((userInfoString, index) => (
                                        <div key={index}>{userInfoString}</div>
                                    ))}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }


    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <h1 className="entity-header">Harmonogram</h1>
            </div>
            {isFunkcyjny &&
                <div className="d-flex justify-content-center mb-2">
                    <button className="btn btn-primary" onClick={() => navigate('/add-schedule')}>Dodaj harmonogram
                    </button>
                </div>
            }
            <WeekSelector currentWeek={currentWeek} setCurrentWeek={setCurrentWeek}/>
            <div className="d-flex justify-content-center">
                <h4 className="entity-header-dynamic-size mb-2 mt-0">Harmonogram według użytkowników</h4>
            </div>
            {renderUsersSchedule()}
            {errorDownloadSchedulePdfForUsers && <AlertBox text={errorDownloadSchedulePdfForUsers} type="danger" width={'500px'} />}
            <div className="text-center">
                <button className="btn btn-success mt-2" onClick={downloadSchedulePdfForUsers}
                        disabled={loadingDownloadSchedulePdfForUsers}>
                    <span>Pobierz harmonogram według użytkowników </span>
                    {loadingDownloadSchedulePdfForUsers &&
                        <span className="spinner-border spinner-border-sm"></span>}
                </button>
            </div>

            <div className="d-flex justify-content-center">
                <h4 className="entity-header-dynamic-size mb-2 mt-4">Harmonogram według roli</h4>
            </div>
            <div className="d-flex justify-content-center mb-1">
                <select className="form-select w-100" style={{maxWidth: '350px'}} onChange={handleRoleChange}>
                    <option value="">Wybierz rolę</option>
                    {supervisorRoles.map(role => (
                        <option key={role.name} value={role.name}>{role.name}</option>
                    ))}
                </select>
            </div>
            {renderTasksScheduleByRole()}
            {errorDownloadSchedulePdfForTasksByRole && <AlertBox text={errorDownloadSchedulePdfForTasksByRole} type="danger" width={'500px'} />}
            <div className="text-center">
                <button className="btn btn-success mt-2" onClick={downloadSchedulePdfForTasksByRole} disabled={selectedSupervisorRoleName == null || loadingDownloadSchedulePdfForTasksByRole}>
                    <span>Pobierz harmonogram według roli </span>
                    {loadingDownloadSchedulePdfForTasksByRole &&
                        <span className="spinner-border spinner-border-sm"></span>}
                </button>
            </div>

            <div className="d-flex justify-content-center">
                <h4 className="entity-header-dynamic-size mb-2 mt-4">Harmonogram według wszystkich zadań</h4>
            </div>
            {renderTasksSchedule()}
            {errorDownloadSchedulePdfForTasks && <AlertBox text={errorDownloadSchedulePdfForTasks} type="danger" width={'500px'} />}
            <div className="text-center">
                <button className="btn btn-success mt-2" onClick={downloadSchedulePdfForTasks} disabled={loadingDownloadSchedulePdfForTasks}>
                    <span>Pobierz harmonogram według zadań </span>
                    {loadingDownloadSchedulePdfForTasks &&
                        <span className="spinner-border spinner-border-sm"></span>}
                </button>
            </div>
        </div>
    );
}

export default SchedulePage;
