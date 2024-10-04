import React, { useEffect, useState } from "react";
import { Task } from "../../../models/Interfaces";
import useHttp from "../../../services/UseHttp";
import { backendUrl } from "../../../utils/constants";
import LoadingSpinner from "../../../components/LoadingScreen";
import AlertBox from "../../../components/AlertBox";
import TaskCard from "./TaskCard";

function ObstaclesSettingsPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [workingTasks, setWorkingTasks] = useState<Task[]>([]);
    const { error: errorGetTasks, loading: loadingGetTasks, request: requestGetTasks } = useHttp(`${backendUrl}/api/tasks`, 'GET');

    useEffect(() => {
        requestGetTasks(null, (data: Task[]) => {
            setTasks(data);
            setWorkingTasks(data.map(task => ({ ...task })));
        }).then(() => {});
    }, [requestGetTasks]);

    const toggleTaskSelection = (taskId: number) => {
        setWorkingTasks(workingTasks.map(task =>
            task.id === taskId
                ? { ...task, visibleInObstacleFormForUserRole: !task.visibleInObstacleFormForUserRole }
                : task
        ));
    };

    const hasChanges = () => {
        return workingTasks.some(task => {
            const originalTask = tasks.find(t => t.id === task.id);
            return originalTask && originalTask.visibleInObstacleFormForUserRole !== task.visibleInObstacleFormForUserRole;
        });
    };

    const getModifiedTasks = () => {
        return workingTasks.filter(task => {
            const originalTask = tasks.find(t => t.id === task.id);
            return originalTask && originalTask.visibleInObstacleFormForUserRole !== task.visibleInObstacleFormForUserRole;
        });
    };

    const handleSave = () => {
        const modifiedTasks = getModifiedTasks();
        console.log("Zmodyfikowane taski:", modifiedTasks);

    };

    if (loadingGetTasks) return <LoadingSpinner />;
    if (errorGetTasks) return <AlertBox text={errorGetTasks} type={'danger'} width={'500px'} />;

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <h1 className="entity-header">Ustawienia przeszkód</h1>
            </div>
            <div className="d-flex justify-content-center">
                <h5 className="entity-header-dynamic-size m-0">Wybór oficjów dla zwykłego użytkownika</h5>
            </div>
            <div className="d-flex justify-content-center">
                <button
                    className="btn btn-success mt-2"
                    disabled={!hasChanges()}
                    onClick={handleSave}
                >
                    Zapisz
                </button>
            </div>

            <div className="container mt-2 d-flex justify-content-center">
                <TaskCard
                    tasks={workingTasks}
                    toggleTaskSelection={toggleTaskSelection}
                />
            </div>
        </div>
    );
}

export default ObstaclesSettingsPage;
