import React, { useState, useEffect } from 'react';
import { Task, TaskShortInfo, ObstacleData } from "../../../../models/Interfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRectangleXmark } from "@fortawesome/free-solid-svg-icons";
import { getIncompleteRoleNames } from "../utils/taskUtils";

interface TaskSelectorProps {
    obstacleData: ObstacleData;
    setObstacleData: React.Dispatch<React.SetStateAction<ObstacleData>>;
    visibleTasksList: TaskShortInfo[];
    allTasks: Task[];
}

const TaskSelector: React.FC<TaskSelectorProps> = ({
                                                       obstacleData,
                                                       setObstacleData,
                                                       visibleTasksList,
                                                       allTasks
                                                   }) => {
    const [availableTasks, setAvailableTasks] = useState<TaskShortInfo[]>([]);
    const [selectAllVisibleTasks, setSelectAllVisibleTasks] = useState<boolean>(false);

    useEffect(() => {
        setAvailableTasks(visibleTasksList.filter(task => !obstacleData.tasksIds.includes(task.id)));
    }, [visibleTasksList, obstacleData.tasksIds]);

    const incompleteRoleNames = getIncompleteRoleNames(
        visibleTasksList,
        obstacleData.tasksIds,
        allTasks
    );

    const handleTaskChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;

        if (incompleteRoleNames.includes(selectedValue)) {
            addTasksByRole(selectedValue);
        } else {
            addSingleTask(parseInt(selectedValue));
        }
    };

    const addTasksByRole = (roleName: string) => {
        const tasksOfRole = allTasks.filter(
            task => task.supervisorRole.assignedTasksGroupName === roleName
        );

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
        setAvailableTasks(prevTasks =>
            prevTasks.filter(task => !taskIdsToRemove.includes(task.id))
        );
    };

    const handleRemoveTask = (taskId: number) => {
        setObstacleData(prevState => ({
            ...prevState,
            tasksIds: prevState.tasksIds.filter(id => id !== taskId)
        }));

        const removedTask = visibleTasksList.find(task => task.id === taskId);
        if (removedTask) {
            setAvailableTasks(prevTasks => [...prevTasks, removedTask].sort((a, b) => a.id - b.id));
        }
    };

    const handleSelectAllVisibleTasks = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setSelectAllVisibleTasks(isChecked);

        if (isChecked) {
            setObstacleData(prevState => ({
                ...prevState,
                tasksIds: visibleTasksList.map(task => task.id)
            }));
            setAvailableTasks([]);
        } else {
            setObstacleData(prevState => ({
                ...prevState,
                tasksIds: []
            }));
            setAvailableTasks(visibleTasksList);
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
                            const task =
                                visibleTasksList.find(t => t.id === taskId) ||
                                allTasks.find(t => t.id === taskId);
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
