import React, { useEffect, useState } from 'react';
import useHttp from '../../services/UseHttp';
import {Schedule, ScheduleShortInfo} from '../../models/Interfaces';
import {backendUrl} from "../../utils/constants";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import WeekSelector from "../../components/WeekSelector";
import {endOfWeek, format, startOfWeek} from "date-fns";

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
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const { request: fetchSchedule, error, loading} = useHttp(`${backendUrl}/api/schedules/users/scheduleShortInfo/week?from=${format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd-MM-yyyy')}&to=${format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd-MM-yyyy')}`, 'GET');
    const navigate = useNavigate();

    const handleScheduleCreator = () => {
        const from = format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd-MM-yyyy');
        const to = format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd-MM-yyyy');
        navigate(`/schedule-creator?from=${from}&to=${to}`);
    };

    useEffect(() => {
        fetchSchedule(null, (data) => setScheduleShortInfo(data));
    }, [fetchSchedule]);

    if (loading) return <div>Ładowanie...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <h1 className="entity-header">Harmonogram</h1>
            </div>
            <WeekSelector currentWeek={currentWeek} setCurrentWeek={setCurrentWeek}/>
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
                <button className="btn btn-success mt-4" onClick={() => navigate('/add-schedule')}>Dodaj harmonogram</button>
            </div>
            <div className="text-center">
                <button className="btn btn-info mt-4" onClick={downloadPdf}>Pobierz harmonogram</button>
            </div>
        </div>
    );
}

export default SchedulePage;
