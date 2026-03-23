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
    const [selectedCategory, setSelectedCategory] = useState<string>("");

        const categories = Array.from(new Set(tasks.map(t => t.supervisorRole.name))).sort();

    const availableTasksInCategory = tasks.filter(task =>
        task.supervisorRole.name === selectedCategory &&
        !obstacleData.tasksIds.includes(task.id)
    ).sort((a, b) => a.id - b.id);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const category = e.target.value;

        if (category === "ALL_DAY") {
            const allIds = tasks.map(t => t.id);
            const uniqueIds = Array.from(new Set([...obstacleData.tasksIds, ...allIds]));

            setObstacleData(prev => ({ ...prev, tasksIds: uniqueIds }));
            setSelectedCategory(""); // Reset wyboru
        } else {
            setSelectedCategory(category);
        }
    };

    const handleTaskAdd = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (!value) return;

        if (value === "ALL_IN_CATEGORY") {
            const idsToAdd = availableTasksInCategory.map(t => t.id);
            setObstacleData(prev => ({
                ...prev,
                tasksIds: [...prev.tasksIds, ...idsToAdd]
            }));
        } else {
            // Dodaj pojedyncze zadanie
            const taskId = parseInt(value);
            setObstacleData(prev => ({
                ...prev,
                tasksIds: [...prev.tasksIds, taskId]
            }));
        }
        e.target.value = "";
    };

    const handleRemoveTask = (taskId: number) => {
        setObstacleData(prevState => ({
            ...prevState,
            tasksIds: prevState.tasksIds.filter(id => id !== taskId)
        }));
    };

    return (
        <div className="mb-3">
            <label className="form-label fw-bold">Oficja:</label>

            {/* DROPDOWN 1: KATEGORIA */}
            <div className="mb-2">
                <select
                    className="form-select"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                >
                    <option value="">-- 1. Wybierz kategorię --</option>
                    <option value="ALL_DAY" className="fw-bold">🌍 Wszystkie oficja (dodaj całą listę)</option>
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
                        defaultValue=""
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
                            <option disabled>Wszystkie z tej kategorii dodane</option>
                        )}
                    </select>
                </div>
            )}

            {/* LISTA WYBRANYCH ZADAŃ (FLEXBOX) */}
            <div className="selected-tasks mt-2 d-flex flex-wrap gap-2 border-top pt-2">
                {obstacleData.tasksIds.length === 0 && <small className="text-muted">Brak wybranych oficjów</small>}

                {obstacleData.tasksIds.map(taskId => {
                    const task = tasks.find(t => t.id === taskId);
                    return (
                        <button
                            key={taskId}
                            className="btn btn-secondary p-1"
                            type="button"
                            onClick={() => handleRemoveTask(taskId)}
                        >
                            {task ? task.nameAbbrev : 'Nieznane'}{' '}
                            <FontAwesomeIcon icon={faRectangleXmark} />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default TaskSelectorAdmin;
