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
    // const [availableTasks, setAvailableTasks] = useState<TaskShortInfo[]>([]);
    // const [selectAllVisibleTasks, setSelectAllVisibleTasks] = useState<boolean>(false);

    const [selectedCategory, setSelectedCategory] = useState<string>("");

    const categories = Array.from(new Set(allTasks.map(t => t.supervisorRole.name))).sort();

    const availableTasksInCategory = allTasks.filter(task =>
        task.supervisorRole.name === selectedCategory &&
        !obstacleData.tasksIds.includes(task.id)
    ).sort((a, b) => a.id - b.id);

    // --- HANDLER DLA KATEGORII (DROPDOWN 1) ---
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const category = e.target.value;

        if (category === "ALL_DAY") {
            // Logika "Wszystkie oficja danego dnia" - dodajemy wszystko co jest w allTasks
            const allIds = allTasks.map(t => t.id);
            // Dodajemy tylko te, których jeszcze nie ma
            const uniqueIds = Array.from(new Set([...obstacleData.tasksIds, ...allIds]));

            setObstacleData(prev => ({ ...prev, tasksIds: uniqueIds }));
            setSelectedCategory(""); // Reset
        } else {
            setSelectedCategory(category);
        }
    };

    const handleTaskAdd = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (!value) return;

        if (value === "ALL_IN_CATEGORY") {
            // Dodaj wszystkie z aktualnie wybranej kategorii
            const idsToAdd = availableTasksInCategory.map(t => t.id);
            setObstacleData(prev => ({
                ...prev,
                tasksIds: [...prev.tasksIds, ...idsToAdd]
            }));
        } else {
            // Dodaj pojedyncze zadanie (np. T13)
            const taskId = parseInt(value);
            setObstacleData(prev => ({
                ...prev,
                tasksIds: [...prev.tasksIds, taskId]
            }));
        }

        e.target.value = "";
    };

    // useEffect(() => {
    //     setAvailableTasks(visibleTasksList.filter(task => !obstacleData.tasksIds.includes(task.id)));
    // }, [visibleTasksList, obstacleData.tasksIds]);

    // const incompleteRoleNames = getIncompleteRoleNames(
    //     visibleTasksList,
    //     obstacleData.tasksIds,
    //     allTasks
    // );
    //
    // const handleTaskChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    //     const selectedValue = e.target.value;
    //
    //     if (incompleteRoleNames.includes(selectedValue)) {
    //         addTasksByRole(selectedValue);
    //     } else {
    //         addSingleTask(parseInt(selectedValue));
    //     }
    // };
    //
    // const addTasksByRole = (roleName: string) => {
    //     const tasksOfRole = allTasks.filter(
    //         task => task.supervisorRole.assignedTasksGroupName === roleName
    //     );
    //
    //     const newTaskIds = tasksOfRole
    //         .map(task => task.id)
    //         .filter(id => !obstacleData.tasksIds.includes(id));
    //
    //     updateObstacleDataWithNewTasks(newTaskIds);
    //     removeTasksFromAvailableTasks(newTaskIds);
    // };
    //
    // const addSingleTask = (taskId: number) => {
    //     if (!taskId || obstacleData.tasksIds.includes(taskId)) return;
    //
    //     updateObstacleDataWithNewTasks([taskId]);
    //     removeTasksFromAvailableTasks([taskId]);
    // };
    //
    // const updateObstacleDataWithNewTasks = (newTaskIds: number[]) => {
    //     setObstacleData(prevState => ({
    //         ...prevState,
    //         tasksIds: [...prevState.tasksIds, ...newTaskIds]
    //     }));
    // };
    //
    // const removeTasksFromAvailableTasks = (taskIdsToRemove: number[]) => {
    //     setAvailableTasks(prevTasks =>
    //         prevTasks.filter(task => !taskIdsToRemove.includes(task.id))
    //     );
    // };

    const handleRemoveTask = (taskId: number) => {
        setObstacleData(prevState => ({
            ...prevState,
            tasksIds: prevState.tasksIds.filter(id => id !== taskId)
        }));

        // const removedTask = visibleTasksList.find(task => task.id === taskId);
        // if (removedTask) {
        //     setAvailableTasks(prevTasks => [...prevTasks, removedTask].sort((a, b) => a.id - b.id));
        // }
    };

    // const handleSelectAllVisibleTasks = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const isChecked = e.target.checked;
    //     setSelectAllVisibleTasks(isChecked);
    //
    //     if (isChecked) {
    //         setObstacleData(prevState => ({
    //             ...prevState,
    //             tasksIds: visibleTasksList.map(task => task.id)
    //         }));
    //         setAvailableTasks([]);
    //     } else {
    //         setObstacleData(prevState => ({
    //             ...prevState,
    //             tasksIds: []
    //         }));
    //         setAvailableTasks(visibleTasksList);
    //     }
    // };

    return (
        <div className="mb-3">
            <label className="form-label fw-bold">Wybór oficjów:</label>

                {/* DROPDOWN 1: KATEGORIA */}
                <div className="mb-2">
                    <select
                        className="form-select"
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                    >
                        <option value="">-- 1. Wybierz kategorię --</option>
                        <option value="ALL_DAY" className="fw-bold">🌍 Wszystkie oficja danego dnia (dodaj wszystkie)</option>
                        <option disabled>----------------</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* DROPDOWN 2: KONKRETNE ZADANIA (Pokaż tylko gdy wybrano kategorię) */}
                {selectedCategory && (
                    <div className="mb-2 fade-in">
                        <select
                            className="form-select"
                            onChange={handleTaskAdd}
                            value="" // Zawsze resetujemy do wartości domyślnej po wyborze
                            disabled={availableTasksInCategory.length === 0}
                        >
                            <option value="">-- 2. Wybierz i dodaj oficjum --</option>
                            {availableTasksInCategory.length > 0 && (
                                <>
                                    <option value="ALL_IN_CATEGORY" className="fw-bold">
                                        📚 Dodaj wszystkie z: {selectedCategory}
                                    </option>
                                    <option disabled>----------------</option>
                                </>
                            )}
                            {availableTasksInCategory.map(task => (
                                <option key={task.id} value={task.id}>
                                    {task.nameAbbrev}
                                </option>
                            ))}
                            {availableTasksInCategory.length === 0 && (
                                <option disabled>Wszystkie oficja z tej kategorii są już dodane</option>
                            )}
                        </select>
                    </div>
                )}

                    <div className="selected-tasks mt-2 d-flex flex-wrap gap-2">
                        {obstacleData.tasksIds.map(taskId => {
                            const task =
                                visibleTasksList.find(t => t.id === taskId) ||
                                allTasks.find(t => t.id === taskId);
                            return (
                                    <button
                                        className="btn btn-secondary p-1"
                                        type="button"
                                        onClick={() => handleRemoveTask(taskId)}
                                    >
                                        {task ? task.nameAbbrev : 'Nieznane oficjum'}{' '}
                                        <FontAwesomeIcon icon={faRectangleXmark} />
                                    </button>
                            );
                        })}
                    </div>
        </div>
    );
};

export default TaskSelector;
