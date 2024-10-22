import React, { useState, useEffect } from 'react';
import {ObstacleData, Task} from "../../../../models/Interfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRectangleXmark } from "@fortawesome/free-solid-svg-icons";
import { getIncompleteRoleNamesAdmin } from "../utils/taskUtils";

interface TaskSelectorAdminProps {
    obstacleData: ObstacleData;
    setObstacleData: React.Dispatch<React.SetStateAction<ObstacleData>>;
    tasks: Task[];
}

const TaskSelectorAdmin: React.FC<TaskSelectorAdminProps> = ({
                                                                 obstacleData,
                                                                 setObstacleData,
                                                                 tasks
                                                             }) => {
    const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
    const [selectAllTasks, setSelectAllTasks] = useState<boolean>(false);

    useEffect(() => {
        setAvailableTasks(tasks.filter(task => !obstacleData.tasksIds.includes(task.id)));
    }, [tasks, obstacleData.tasksIds]);

    const incompleteRoleNames = getIncompleteRoleNamesAdmin(tasks, obstacleData.tasksIds);

    const handleTaskChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;

        if (incompleteRoleNames.includes(selectedValue)) {
            addTasksByRole(selectedValue);
        } else {
            addSingleTask(parseInt(selectedValue));
        }
    };

    const addTasksByRole = (roleName: string) => {
        const tasksOfRole = tasks.filter(task => task.supervisorRole.assignedTasksGroupName === roleName);

        const newTaskIds = tasksOfRole
            .map(task => task.id)
            .filter(id => !obstacleData.tasksIds.includes(id));

        updateObstacleDataWithNewTasks(newTaskIds);
        removeTasksFromAvailableTasks(newTaskIds);
    };

    const addSingleTask = (taskId: number) => {
        if (!taskId || obstacleData.tasksIds.includes(taskId)) return;

        updateObstacleDataWithNewTasks([taskId]);
        removeTasksFromAvailableTasks([taskId]);
    };

    const updateObstacleDataWithNewTasks = (newTaskIds: number[]) => {
        setObstacleData(prevState => ({
            ...prevState,
            tasksIds: [...prevState.tasksIds, ...newTaskIds]
        }));
    };

    const removeTasksFromAvailableTasks = (taskIdsToRemove: number[]) => {
        setAvailableTasks(prevTasks => prevTasks.filter(task => !taskIdsToRemove.includes(task.id)));
    };

    const handleRemoveTask = (taskId: number) => {
        setObstacleData(prevState => ({
            ...prevState,
            tasksIds: prevState.tasksIds.filter(id => id !== taskId)
        }));

        const removedTask = tasks.find(task => task.id === taskId);
        if (removedTask) {
            setAvailableTasks(prevTasks => [...prevTasks, removedTask].sort((a, b) => a.id - b.id));
        }
    };

    const handleSelectAllTasks = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setSelectAllTasks(isChecked);

        if (isChecked) {
            setObstacleData(prevState => ({
                ...prevState,
                tasksIds: tasks.map(task => task.id)
            }));
            setAvailableTasks([]);
        } else {
            setObstacleData(prevState => ({
                ...prevState,
                tasksIds: []
            }));
            setAvailableTasks(tasks);
        }
    };

    return (
        <div className="mb-3">
            <label className="form-label">Oficja:</label>
            <div className="d-flex justify-content-between">
                <label className="form-check-label me-2" htmlFor="selectAllTasksSwitch">
                    Wybierz wszystkie oficja
                </label>
                <div className="form-check form-switch">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="selectAllTasksSwitch"
                        checked={selectAllTasks}
                        onChange={handleSelectAllTasks}
                    />
                </div>
            </div>

            {!selectAllTasks && (
                <div className="mt-2">
                    <select className="form-select" value="" onChange={handleTaskChange}>
                        <option value="">Wybierz oficjum</option>
                        {incompleteRoleNames.map(roleName => (
                            <option key={roleName} value={roleName}>
                                {'{Wszystkie oficja} '} {roleName.toUpperCase()}
                            </option>
                        ))}
                        {availableTasks.map(task => (
                            <option key={task.id} value={task.id}>
                                {task.nameAbbrev}
                            </option>
                        ))}
                    </select>

                    <div className="selected-tasks mt-2">
                        {obstacleData.tasksIds.map(taskId => {
                            const task = tasks.find(t => t.id === taskId);
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

export default TaskSelectorAdmin;
