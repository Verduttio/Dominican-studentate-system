import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import useHttp from "../../../../services/UseHttp";
import { ObstacleData } from "../../../../models/Interfaces";
import { backendUrl } from "../../../../utils/constants";
import LoadingSpinner from "../../../../components/LoadingScreen";
import AlertBox from "../../../../components/AlertBox";
import useIsAdmin, { UNAUTHORIZED_PAGE_TEXT } from "../../../../services/UseIsAdmin";
import TaskSelectorAdmin from "./TaskSelectorAdmin";
import DatePicker from "./../DatePicker";
import DescriptionInput from "./../DescriptionInput";
import {useFetchUsers} from "../hooks/useFetchUsers";
import {useFetchTasks} from "../hooks/useFetchTasks";

const initialObstacleState: ObstacleData = {
    userId: 0,
    tasksIds: [],
    fromDate: '',
    toDate: '',
    applicantDescription: ''
};

const AddObstacle: React.FC = () => {
    const [obstacleData, setObstacleData] = useState<ObstacleData>(initialObstacleState);
    const [validationError, setValidationError] = useState<string>('');
    const navigate = useNavigate();

    const { request: postObstacle, error: postError, loading: postLoading } = useHttp(
        `${backendUrl}/api/obstacles`,
        'POST'
    );

    const { data: users, error: fetchUsersError, loading: loadingFetchUsers } = useFetchUsers();
    const { data: tasks, error: fetchTasksError, loading: loadingFetchTasks } = useFetchTasks();

    const { isAdmin, isAdminLoading, isAdminInitialized } = useIsAdmin();

    useEffect(() => {
        if (fetchUsersError) setValidationError(fetchUsersError);
        if (fetchTasksError) setValidationError(fetchTasksError);
    }, [fetchUsersError, fetchTasksError]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateObstacleData()) return;

        postObstacle(obstacleData, () => {
            navigate('/obstacles', { state: { message: 'Pomyślnie dodano przeszkodę' } });
        });
    };

    const validateObstacleData = (): boolean => {
        if (
            obstacleData.tasksIds.length === 0 ||
            !obstacleData.userId ||
            !obstacleData.fromDate ||
            !obstacleData.toDate
        ) {
            setValidationError('Wypełnij wymagane pola');
            return false;
        }
        setValidationError('');
        return true;
    };

    const handleInputChange = (name: string, value: string) => {
        setObstacleData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setObstacleData({ ...obstacleData, userId: parseInt(e.target.value) });
    };

    if (isAdminLoading || isAdminInitialized || loadingFetchUsers || loadingFetchTasks) {
        return <LoadingSpinner />;
    } else if (!isAdmin) {
        return <AlertBox text={UNAUTHORIZED_PAGE_TEXT} type="danger" width="500px" />;
    }

    if (validationError) {
        return <AlertBox text={validationError} type="danger" width="500px" />;
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Dodaj przeszkodę</h1>
            </div>
            <div className="edit-entity-container mw-100" style={{ width: '400px' }}>
                {postError && <AlertBox text={postError} type="danger" width="500px" />}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="userId" className="form-label">
                            Brat:
                        </label>
                        <select
                            className="form-select"
                            id="userId"
                            value={obstacleData.userId}
                            onChange={handleUserChange}
                        >
                            <option value="">Wybierz brata</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.name} {user.surname}
                                </option>
                            ))}
                        </select>
                    </div>
                    <TaskSelectorAdmin
                        obstacleData={obstacleData}
                        setObstacleData={setObstacleData}
                        tasks={tasks}
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
                            ) : (
                                'Dodaj'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddObstacle;
