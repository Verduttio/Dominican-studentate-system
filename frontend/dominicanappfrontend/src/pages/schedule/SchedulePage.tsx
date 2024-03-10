import React, { useEffect, useState } from 'react';
import useHttp from '../../services/UseHttp';
import {ScheduleShortInfo, ScheduleShortInfoForTask} from '../../models/Interfaces';
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
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const { request: fetchSchedule, error, loading} = useHttp(`${backendUrl}/api/schedules/users/scheduleShortInfo/week?from=${format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd-MM-yyyy')}&to=${format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd-MM-yyyy')}`, 'GET');
    const { request: fetchScheduleByTasks, error: errorFetchScheduleByTasks, loading: loadingFetchScheduleByTasks} = useHttp(`${backendUrl}/api/schedules/tasks/scheduleShortInfo/week?from=${format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd-MM-yyyy')}&to=${format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd-MM-yyyy')}`, 'GET');
    const navigate = useNavigate();
    const { isFunkcyjny, isFunkcyjnyLoading, isFunkcyjnyError } = useIsFunkcyjny();

    useEffect(() => {
        fetchSchedule(null, (data) => setScheduleShortInfo(data));
        fetchScheduleByTasks(null, (data) => setScheduleShortInfoForTasks(data));
    }, [fetchSchedule, fetchScheduleByTasks]);

    if (loading) return <LoadingSpinner/>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <h1 className="entity-header">Harmonogram</h1>
            </div>
            <WeekSelector currentWeek={currentWeek} setCurrentWeek={setCurrentWeek}/>
            {isFunkcyjny &&
                <div className="d-flex justify-content-center mb-2">
                    <button className="btn btn-primary" onClick={() => navigate('/add-schedule')}>Dodaj harmonogram
                    </button>
                </div>
            }

            <div className="d-flex justify-content-center">
                <h4 className="entity-header-dynamic-size">Harmonogram według użytkowników</h4>
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
                <h4 className="entity-header-dynamic-size mt-4">Harmonogram według zadań</h4>
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
                            <td>{scheduleShortInfoForTask.usersInfoStrings.join(', ')}</td>
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
