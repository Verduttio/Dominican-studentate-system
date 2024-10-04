import React, { useEffect, useState } from "react";
import { Task } from "../../../models/Interfaces";
import useHttp from "../../../services/UseHttp";
import { backendUrl } from "../../../utils/constants";
import LoadingSpinner from "../../../components/LoadingScreen";
import AlertBox from "../../../components/AlertBox";
import TaskCard from "./TaskCard";
import AlertBoxTimed from "../../../components/AlertBoxTimed";

function ObstaclesSettingsPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [workingTasks, setWorkingTasks] = useState<Task[]>([]);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const { error: errorGetTasks, loading: loadingGetTasks, request: requestGetTasks } = useHttp(`${backendUrl}/api/tasks`, 'GET');
    const { error: updateError, request: updateRequest, loading: updateLoading } = useHttp(`${backendUrl}/api/tasks`, 'PUT');

    const loadTasks = () => {
        requestGetTasks(null, (data: Task[]) => {
            setTasks(data);
            setWorkingTasks(data.map(task => ({ ...task })));
        }).then(() => {});
    };

    useEffect(() => {
        loadTasks();
    }, []);


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
        updateRequest(modifiedTasks, () => {
            setSuccessMessage('Pomyślnie zaktualizowano widoczność oficjów');
            loadTasks();
        });
    };

    const renderTaskCards = () => {
        if (loadingGetTasks) return <LoadingSpinner />;
        else return (
            <div className="container mt-2 d-flex justify-content-center">
                <TaskCard
                    tasks={workingTasks}
                    toggleTaskSelection={toggleTaskSelection}
                />
            </div>
        )
    }


    if (errorGetTasks || updateError) return <AlertBox text={errorGetTasks || updateError} type={'danger'}
                                                       width={'500px'}/>;

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <h1 className="entity-header">Ustawienia przeszkód</h1>
            </div>
            <div className="d-flex justify-content-center">
                <h5 className="entity-header-dynamic-size m-0">Wybór oficjów dla zwykłego użytkownika</h5>
            </div>

            {successMessage && (
                <AlertBoxTimed
                    text={successMessage}
                    type="success"
                    width="500px"
                    duration={5000}
                    onClose={() => setSuccessMessage(null)}
                />
            )}

            <div className="d-flex justify-content-center">
                <button
                    className="btn btn-success mt-2"
                    disabled={!hasChanges() || updateLoading}
                    onClick={handleSave}
                >
                    Zapisz {updateLoading && <span className="spinner-border spinner-border-sm"></span>}
                </button>
            </div>

            {renderTaskCards()}
        </div>
    );
}

export default ObstaclesSettingsPage;
