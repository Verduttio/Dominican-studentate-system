import React, { useEffect, useState } from 'react';
import useHttp from '../../services/UseHttp';
import {Role, ScheduleShortInfo, ScheduleShortInfoForTask} from '../../models/Interfaces';
import {backendUrl} from "../../utils/constants";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import WeekSelector from "../../components/WeekSelector";
import {endOfWeek, format, startOfWeek} from "date-fns";
import LoadingSpinner from "../../components/LoadingScreen";
import useIsFunkcyjny from "../../services/UseIsFunkcyjny";

function downloadPdf() {
    axios({
        url: `${backendUrl}/api/schedules/pdf`,
        method: 'GET',
        responseType: 'blob',
        withCredentials: true
    }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'schedules.pdf');
        document.body.appendChild(link);
        link.click();
    });
}

function SchedulePage() {
    const [scheduleShortInfo, setScheduleShortInfo] = useState<ScheduleShortInfo[]>([]);
    const [scheduleShortInfoForTasks, setScheduleShortInfoForTasks] = useState<ScheduleShortInfoForTask[]>([]);
    const [scheduleShortInfoForTasksByRoles, setScheduleShortInfoForTasksByRoles] = useState<ScheduleShortInfoForTask[]>([]);
    const [supervisorRoles, setSupervisorRoles] = useState<Role[]>([]);
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const { request: fetchSchedule, error, loading} = useHttp(`${backendUrl}/api/schedules/users/scheduleShortInfo/week?from=${format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd-MM-yyyy')}&to=${format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd-MM-yyyy')}`, 'GET');
    const { request: fetchScheduleByTasks, error: errorFetchScheduleByTasks, loading: loadingFetchScheduleByTasks} = useHttp(`${backendUrl}/api/schedules/tasks/scheduleShortInfo/week?from=${format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd-MM-yyyy')}&to=${format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd-MM-yyyy')}`, 'GET');
    const { request: fetchScheduleByTasksByRoles, error: errorFetchScheduleByTasksByRoles, loading: loadingFetchScheduleByTasksByRoles} = useHttp();
    const { request: fetchSupervisorRoles, error: errorFetchSupervisorRoles, loading: loadingSupervisorRoles } = useHttp(`${backendUrl}/api/roles/types/SUPERVISOR`, 'GET');
    const navigate = useNavigate();
    const { isFunkcyjny, isFunkcyjnyLoading, isFunkcyjnyError } = useIsFunkcyjny();

    useEffect(() => {
        fetchSchedule(null, (data) => setScheduleShortInfo(data));
        fetchScheduleByTasks(null, (data) => setScheduleShortInfoForTasks(data));
        fetchSupervisorRoles(null, (data: Role[]) => setSupervisorRoles(data));
    }, [fetchSchedule, fetchScheduleByTasks, fetchSupervisorRoles]);

    const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedRoleName = event.target.value;
        if (!selectedRoleName) {
            setScheduleShortInfoForTasksByRoles([]);
        } else {
            fetchScheduleByTasksByRoles(null, (data) => setScheduleShortInfoForTasksByRoles(data), false,
                `${backendUrl}/api/schedules/tasks/byRole/${selectedRoleName}/scheduleShortInfo/week?from=${format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd-MM-yyyy')}&to=${format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd-MM-yyyy')}`, 'GET');
        }
    }

    if (loading || loadingSupervisorRoles) return <LoadingSpinner/>;
    if (error || errorFetchSupervisorRoles) return <div className="alert alert-danger">{error || errorFetchSupervisorRoles}</div>;

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
            <table className="table table-hover table-striped table-responsive table-rounded table-shadow mb-0">
                <thead className="table-dark">
                <tr>
                    <th>ID</th>
                    <th>Użytkownik</th>
                    <th>Zadania</th>
                </tr>
                </thead>
                <tbody>
                {scheduleShortInfo.map(scheduleShortInfo => (
                    <tr key={scheduleShortInfo.userId}>
                        <td>{scheduleShortInfo.userId}</td>
                        <td>{scheduleShortInfo.userName} {scheduleShortInfo.userSurname}</td>
                        <td>{scheduleShortInfo.tasksInfoStrings.join(', ')}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <div className="text-center">
                <button className="btn btn-success mt-2" onClick={downloadPdf}>Pobierz harmonogram według użytkowników
                </button>
            </div>

            <div className="d-flex justify-content-center">
                <h4 className="entity-header-dynamic-size mb-2 mt-4">Harmonogram według roli</h4>
            </div>
            <div className="d-flex justify-content-center mb-1">
            <select className="form-select w-50" onChange={handleRoleChange}>
                    <option value="">Wybierz rolę</option>
                    {supervisorRoles.map(role => (
                        <option key={role.name} value={role.name}>{role.name}</option>
                    ))}
            </select>
            </div>
            {errorFetchScheduleByTasksByRoles && <div className="alert alert-danger">{errorFetchScheduleByTasksByRoles}</div>}
            {loadingFetchScheduleByTasksByRoles ? <LoadingSpinner/> : (
                <table className="table table-hover table-striped table-responsive table-rounded table-shadow mb-0">
                    <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Zadanie</th>
                        <th>Użytkownicy</th>
                    </tr>
                    </thead>
                    <tbody>
                    {scheduleShortInfoForTasksByRoles.map(scheduleShortInfoForTaskByRole => (
                        <tr key={scheduleShortInfoForTaskByRole.taskId}>
                            <td>{scheduleShortInfoForTaskByRole.taskId}</td>
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
            )}
            <div className="text-center">
                <button className="btn btn-success mt-2">Pobierz harmonogram według roli</button>
            </div>

            <div className="d-flex justify-content-center">
                <h4 className="entity-header-dynamic-size mb-2 mt-4">Harmonogram według wszystkich zadań</h4>
            </div>
            {errorFetchScheduleByTasks && <div className="alert alert-danger">{errorFetchScheduleByTasks}</div>}
            {loadingFetchScheduleByTasks ? <LoadingSpinner/> : (
                <table className="table table-hover table-striped table-responsive table-rounded table-shadow mb-0">
                    <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Zadanie</th>
                        <th>Użytkownicy</th>
                    </tr>
                    </thead>
                    <tbody>
                    {scheduleShortInfoForTasks.map(scheduleShortInfoForTask => (
                        <tr key={scheduleShortInfoForTask.taskId}>
                            <td>{scheduleShortInfoForTask.taskId}</td>
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
            )}
            <div className="text-center">
                <button className="btn btn-success mt-2">Pobierz harmonogram według zadań</button>
            </div>
        </div>
    );
}

export default SchedulePage;
