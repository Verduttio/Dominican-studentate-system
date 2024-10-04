import React, { useEffect, useState } from "react";
import { Task } from "../../../models/Interfaces";
import useHttp from "../../../services/UseHttp";
import { backendUrl } from "../../../utils/constants";
import LoadingSpinner from "../../../components/LoadingScreen";
import AlertBox from "../../../components/AlertBox";
import TaskCard from "./TaskCard";

function ObstaclesSettingsPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
    const { error: errorGetTasks, loading: loadingGetTasks, request: requestGetTasks } = useHttp(`${backendUrl}/api/tasks`, 'GET');

    useEffect(() => {
        requestGetTasks(null, (data) => {
            setTasks(data);
        }).then(() => {});
    }, [requestGetTasks]);

    const toggleTaskSelection = (taskId: number) => {
        if (selectedTasks.includes(taskId)) {
            setSelectedTasks(selectedTasks.filter(id => id !== taskId));
        } else {
            setSelectedTasks([...selectedTasks, taskId]);
        }
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
                <div className="btn btn-success mt-2">
                    Zapisz
                </div>
            </div>

            <div className="container mt-2 d-flex justify-content-center">
                <TaskCard
                    tasks={tasks}
                    selectedTasks={selectedTasks}
                    toggleTaskSelection={toggleTaskSelection}
                />
            </div>
        </div>
    );
}

export default ObstaclesSettingsPage;
