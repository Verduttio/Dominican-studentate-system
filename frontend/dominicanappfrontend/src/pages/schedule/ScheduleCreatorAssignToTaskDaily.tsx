import React, {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import useHttp from '../../services/UseHttp';
import {backendUrl} from "../../utils/constants";
import {Task, UserTaskDependency} from "../../models/Interfaces";
import {DateFormatter} from "../../utils/DateFormatter";
import TaskInfo from "../task/TaskInfo";
import LoadingSpinner from "../../components/LoadingScreen";


const ScheduleCreatorAssignToTaskDaily = () => {
    const [userDependencies, setUserDependencies] = useState<UserTaskDependency[]>([]);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const taskId = queryParams.get('taskId');
    const from = queryParams.get('from');
    const to = queryParams.get('to');
    const fetchUrl = `${backendUrl}/api/schedules/task/${taskId}/user-dependencies?from=${from}&to=${to}`;
    const { error: assignToTaskError, request: assignToTaskRequest, loading: assignToTaskLoading } = useHttp(
        `${backendUrl}/api/schedules/forDailyPeriod?ignoreConflicts=true`, 'POST');

    const { request, error, loading } = useHttp(fetchUrl, 'GET');
    const dateFormatter = new DateFormatter("dd-MM-yyyy", "yyyy-MM-dd");
    const [task, setTask] = useState<Task | null>(null);
    const { request: fetchTaskRequest, error: fetchTaskError, loading: fetchTaskLoading } = useHttp(`${backendUrl}/api/tasks/${taskId}`, 'GET');
    const [selectedDays, setSelectedDays] = useState<{ [userId: number]: string }>({});


    useEffect(() => {
        fetchTaskRequest(null, setTask);
    }, [fetchTaskRequest]);

    useEffect(() => {
        request(null, (data) => {
            setUserDependencies(data);
            // Initialize selectedDays with the first day of task.daysOfWeek for each user
            if (task && task.daysOfWeek.length > 0) {
                const initialSelectedDays: { [userId: number]: string } = {};
                data.forEach((dep: UserTaskDependency) => {
                    initialSelectedDays[dep.userId] = task.daysOfWeek[0];
                });
                setSelectedDays(initialSelectedDays);
            }
        });
    }, [request, task]);

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
            console.log("selected day: ", selectedDays[userId]);
            console.log("taskId, from, to or selected day is null")
        }
    }



    if (loading || fetchTaskLoading) return <LoadingSpinner/>;
    if (error || fetchTaskError) return <div className="alert alert-danger">{error || fetchTaskError}</div>;

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <TaskInfo taskId={taskId}/>
            </div>
            <h4 className=" fw-bold entity-header-dynamic-size">Tworzysz harmonogram od: {from}, do: {to}</h4>
            {assignToTaskError && <div className="alert alert-danger">{assignToTaskError}</div>}
            <table className="table table-hover table-striped table-responsive table-rounded table-shadow">
                <thead className="table-dark">
                <tr>
                    <th>UserId</th>
                    <th>Imię i nazwisko</th>
                    <th>Ostatnio wykonany</th>
                    <th>Dni z zadaniem (ostatni rok)</th>
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
                        className={dep.assignedToTheTask ? 'table-success' : dep.hasObstacle ? 'table-primary' : dep.isInConflict ? 'table-warning' : ''}>
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
                                        value={selectedDays[dep.userId] || ''}
                                        className={`form-select ${dep.assignedToTheTask ? 'disabled' : ''}`}
                                >
                                    {task.daysOfWeek.map(day => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>
                            )}
                        </td>
                        <td>
                            <button
                                className="btn btn-dark"
                                onClick={() => handleSubmit(dep.userId)}
                                disabled={assignToTaskLoading}
                            >
                                Przypisz
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
