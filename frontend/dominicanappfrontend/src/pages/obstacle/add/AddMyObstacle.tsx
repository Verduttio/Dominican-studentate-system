import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import useHttp from "../../../services/UseHttp";
import { ObstacleData } from "../../../models/Interfaces";
import { backendUrl } from "../../../utils/constants";
import LoadingSpinner from "../../../components/LoadingScreen";
import AlertBox from "../../../components/AlertBox";
import TaskSelector from "./TaskSelector";
import DatePicker from "./DatePicker";
import DescriptionInput from "./DescriptionInput";
import { useFetchTasks, useFetchAllTasks } from "./hooks/taskHooks";

const initialObstacleState: ObstacleData = {
    userId: 0,
    tasksIds: [],
    fromDate: '',
    toDate: '',
    applicantDescription: ''
};

const AddMyObstacle: React.FC = () => {
    const [obstacleData, setObstacleData] = useState<ObstacleData>(initialObstacleState);
    const [validationError, setValidationError] = useState<string>('');
    const navigate = useNavigate();

    const { data: visibleTasksList, error: fetchTasksError, loading: loadingFetchTasks } = useFetchTasks();
    const { data: allTasks, error: fetchAllTasksError, loading: loadingFetchAllTasks } = useFetchAllTasks();

    const { request: postObstacle, error: postError, loading: postLoading } = useHttp(`${backendUrl}/api/obstacles/users/current`, 'POST');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateObstacleData()) return;

        postObstacle(obstacleData, () => {
            navigate('/home', { state: { message: 'Pomyślnie dodano przeszkodę' } });
        });
    };

    const validateObstacleData = (): boolean => {
        if (obstacleData.tasksIds.length === 0 || !obstacleData.fromDate || !obstacleData.toDate) {
            setValidationError('Wypełnij wymagane pola');
            return false;
        }
        if (obstacleData.toDate < obstacleData.fromDate) {
            setValidationError('Data końcowa nie może być wcześniejsza niż początkowa');
            return false;
        }
        setValidationError('');
        return true;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setObstacleData({ ...obstacleData, [e.target.name]: e.target.value });
    };

    if (loadingFetchTasks || loadingFetchAllTasks) return <LoadingSpinner />;
    if (fetchAllTasksError || fetchTasksError) return <AlertBox text={fetchAllTasksError || fetchTasksError} type="danger" width="500px" />;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Dodaj swoją przeszkodę</h1>
            </div>
            <div className="edit-entity-container mw-100" style={{ width: '400px' }}>
                {postError && <AlertBox text={postError} type="danger" width="500px" />}
                {validationError && <AlertBox text={validationError} type="danger" width="500px" />}
                <form onSubmit={handleSubmit}>
                    <TaskSelector
                        obstacleData={obstacleData}
                        setObstacleData={setObstacleData}
                        visibleTasksList={visibleTasksList}
                        allTasks={allTasks}
                    />
                    <DatePicker
                        fromDate={obstacleData.fromDate}
                        toDate={obstacleData.toDate}
                        handleInputChange={handleInputChange}
                    />
                    <DescriptionInput
                        applicantDescription={obstacleData.applicantDescription}
                        handleInputChange={handleInputChange}
                    />
                    <div className="d-flex justify-content-center">
                        <button className="btn btn-success" type="submit" disabled={postLoading}>
                            {postLoading ? (
                                <>
                                    <span>Dodawanie </span>
                                    <span className="spinner-border spinner-border-sm"></span>
                                </>
                            ) : 'Dodaj'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMyObstacle;
