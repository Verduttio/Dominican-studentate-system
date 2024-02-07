import React, {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import useHttp from '../../services/UseHttp';
import {backendUrl} from "../../utils/constants";
import {Task, UserTaskDependency} from "../../models/interfaces";
import {DateFormatter} from "../../utils/DateFormatter";
import TaskInfo from "../task/TaskInfo";


const ScheduleCreatorAssignToTaskDaily = () => {
    const [userDependencies, setUserDependencies] = useState<UserTaskDependency[]>([]);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const taskId = queryParams.get('taskId');
    const from = queryParams.get('from');
    const to = queryParams.get('to');
    const fetchUrl = `${backendUrl}/api/schedules/task/${taskId}/user-dependencies?from=${from}&to=${to}`;
    const { error: assignToTaskError, request: assignToTaskRequest, loading: assignToTaskLoading } = useHttp(
        `${backendUrl}/api/schedules/forDailyPeriod?ignoreConflicts=false`, 'POST');

    const { request, error, loading } = useHttp(fetchUrl, 'GET');
    const dateFormatter = new DateFormatter("dd-MM-yyyy", "yyyy-MM-dd");
    const [task, setTask] = useState<Task | null>(null);
    const { request: fetchTaskRequest, error: fetchTaskError, loading: fetchTaskLoading } = useHttp(`${backendUrl}/api/tasks/${taskId}`, 'GET');
    const [selectedDays, setSelectedDays] = useState<{ [userId: number]: string }>({});


    useEffect(() => {
        fetchTaskRequest(null, setTask);
    }, [fetchTaskRequest]);

    useEffect(() => {
        request(null, (data) => setUserDependencies(data));
    }, [request]);

    const handleDayChange = (userId: number, selectedDay: string) => {
        setSelectedDays(prev => ({
            ...prev,
            [userId]: selectedDay
        }));
    };


    function handleSubmit(userId: number) {
        if (taskId != null && from != null && to != null && selectedDays[userId]) {
            const selectedDayOfWeek = selectedDays[userId];
            const taskDate = dateFormatter.getNextDateForDayOfWeek(from, selectedDayOfWeek);

            const requestData = {
                userId: userId,
                taskId: parseInt(taskId),
                weekStartDate: dateFormatter.formatDate(from),
                weekEndDate: dateFormatter.formatDate(to),
                taskDate: taskDate
            };

            console.log(requestData);

            assignToTaskRequest(requestData, () => {});
        } else {
            console.log("taskId, from, to or selected day is null")
        }
    }



    if (loading || fetchTaskLoading) return <div>Ładowanie...</div>;
    if (error || fetchTaskError) return <div className="error-message">{error || fetchTaskError}</div>;

    return (
        <div>
            <h1>Zależności użytkowników dla zadania {taskId}</h1>
            <TaskInfo taskId={taskId} />
            <p>Tworzysz harmonogram od: {from}, do: {to}</p>
            {assignToTaskError && <div className="error-message">{assignToTaskError}</div>}
            <table>
                <thead>
                <tr>
                    <th>UserId</th>
                    <th>Imię i nazwisko</th>
                    <th>Ostatnio wykonany</th>
                    <th>Liczba wykonania w ostatnim roku</th>
                    <th>Aktualne taski</th>
                    <th>Konflikt</th>
                    <th>Przeszkoda</th>
                    <th>Już wyznaczony</th>
                    <th>Dzień tygodnia</th>
                    <th>Akcja</th>
                </tr>
                </thead>
                <tbody>
                {userDependencies.map((dep, index) => (
                    <tr key={index}
                        style={{backgroundColor: dep.assignedToTheTask ? 'green' : dep.hasObstacle ? 'blue' : dep.isInConflict ? 'orange' : 'grey'}}>
                        <td>{dep.userId}</td>
                        <td>{dep.userName}</td>
                        <td>{dep.lastAssigned}</td>
                        <td>{dep.numberOfAssignsInLastYear}</td>
                        <td>{dep.assignedTasks.join(', ')}</td>
                        <td>{dep.isInConflict ? 'Tak' : 'Nie'}</td>
                        <td>{dep.hasObstacle ? 'Tak' : 'Nie'}</td>
                        <td>{dep.assignedToTheTask ? 'Tak' : 'Nie'}</td>
                        <td>
                            {task && (
                                <select onChange={(e) => handleDayChange(dep.userId, e.target.value)}
                                        value={selectedDays[dep.userId] || ''}>
                                    {task.daysOfWeek.map(day => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>
                            )}
                        </td>
                        <td>
                            <button onClick={() => handleSubmit(dep.userId)} disabled={assignToTaskLoading}>Przypisz
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ScheduleCreatorAssignToTaskDaily;
