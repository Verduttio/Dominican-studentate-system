import React, { useState, useEffect } from 'react';
import { Task, TaskShortInfo, ObstacleData } from "../../../models/Interfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRectangleXmark } from "@fortawesome/free-solid-svg-icons";
import { getRoleNamesOfTasksWhichAreAllVisibleInGroup } from "./utils/taskUtils";

interface TaskSelectorProps {
    obstacleData: ObstacleData;
    setObstacleData: React.Dispatch<React.SetStateAction<ObstacleData>>;
    visibleTasksList: TaskShortInfo[];
    allTasks: Task[];
}

const TaskSelector: React.FC<TaskSelectorProps> = ({ obstacleData, setObstacleData, visibleTasksList, allTasks }) => {
    const [tasks, setTasks] = useState<TaskShortInfo[]>([]);
    const [selectAllVisibleTasks, setSelectAllVisibleTasks] = useState<boolean>(false);

    useEffect(() => {
        setTasks(visibleTasksList);
    }, [visibleTasksList]);

    const roleNames = getRoleNamesOfTasksWhichAreAllVisibleInGroup(visibleTasksList, allTasks);

    const handleTaskChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;

        if (roleNames.includes(value)) {
            const tasksOfRole = allTasks.filter(task => task.supervisorRole.assignedTasksGroupName === value);
            const newTaskIds = tasksOfRole.map(task => task.id).filter(id => !obstacleData.tasksIds.includes(id));

            setObstacleData(prevState => ({
                ...prevState,
                tasksIds: [...prevState.tasksIds, ...newTaskIds]
            }));

            // Usunięcie dodanych zadań z dostępnych zadań
            setTasks(prevTasks => prevTasks.filter(task => !newTaskIds.includes(task.id)));
        } else {
            const selectedTaskId = parseInt(value);
            if (!selectedTaskId || obstacleData.tasksIds.includes(selectedTaskId)) return;

            setObstacleData(prevState => ({
                ...prevState,
                tasksIds: [...prevState.tasksIds, selectedTaskId]
            }));

            // Usunięcie dodanego zadania z dostępnych zadań
            setTasks(prevTasks => prevTasks.filter(task => task.id !== selectedTaskId));
        }
    };

    const handleRemoveTask = (taskId: number) => {
        setObstacleData(prevState => ({
            ...prevState,
            tasksIds: prevState.tasksIds.filter(id => id !== taskId)
        }));

        // Dodanie usuniętego zadania z powrotem do dostępnych zadań
        const removedTask = visibleTasksList.find(task => task.id === taskId);
        if (removedTask) {
            setTasks(prevTasks => [...prevTasks, removedTask].sort((a, b) => a.id - b.id));
        }
    };

    const handleSelectAllVisibleTasks = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setSelectAllVisibleTasks(checked);

        if (checked) {
            setObstacleData(prevState => ({
                ...prevState,
                tasksIds: visibleTasksList.map(task => task.id)
            }));
            setTasks([]);
        } else {
            setObstacleData(prevState => ({
                ...prevState,
                tasksIds: []
            }));
            setTasks(visibleTasksList);
        }
    };

    return (
        <div className="mb-3">
            <label className="form-label">Oficja:</label>
            <div className="d-flex justify-content-between">
                <label className="form-check-label me-2" htmlFor="selectAllVisibleTasks">
                    Wybierz wszystkie dostępne oficja
                </label>
                <div className="form-check form-switch">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="selectAllVisibleTasks"
                        checked={selectAllVisibleTasks}
                        onChange={handleSelectAllVisibleTasks}
                    />
                </div>
            </div>

            {!selectAllVisibleTasks && (
                <div className="mt-2">
                    <select className="form-select" value="" onChange={handleTaskChange}>
                        <option value="">Wybierz oficjum</option>
                        {roleNames.map(roleName => (
                            <option key={roleName} value={roleName}>
                                {'{Wszystkie oficja} '} {roleName.toUpperCase()}
                            </option>
                        ))}
                        {tasks.map(task => (
                            <option key={task.id} value={task.id}>
                                {task.nameAbbrev}
                            </option>
                        ))}
                    </select>

                    <div className="selected-tasks mt-2">
                        {obstacleData.tasksIds.map(taskId => {
                            const task = visibleTasksList.find(t => t.id === taskId) || allTasks.find(t => t.id === taskId);
                            return (
                                <div key={taskId} className="pt-2">
                                    <button
                                        className="btn btn-secondary p-1"
                                        type="button"
                                        onClick={() => handleRemoveTask(taskId)}
                                    >
                                        {task ? task.nameAbbrev : 'Nieznane oficjum'}{' '}
                                        <FontAwesomeIcon icon={faRectangleXmark} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskSelector;
