import LoadingSpinner from "../../components/LoadingScreen";
import React, {useEffect, useState} from "react";
import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";
import {UserTaskStatistics} from "../../models/Interfaces";
import AlertBox from "../../components/AlertBox";

interface UserTasksStatisticsProps {
    userId: number;
}

const UserTasksStatistics: React.FC<UserTasksStatisticsProps> = ({userId}) => {
    const { error: errorFetchUserStatisticsForTasks, loading: loadingFetchUserStatisticsForTasks, request: requestFetchUserStatisticsForTasks } = useHttp(
        `${backendUrl}/api/schedules/users/${userId}/statistics/tasks`, 'GET'
    );
    const [userStatisticsForTasks, setUserStatisticsForTasks] = useState<UserTaskStatistics[]>([]);

    useEffect(() => {
        requestFetchUserStatisticsForTasks(null, (data: UserTaskStatistics[]) => setUserStatisticsForTasks(data));
    }, [requestFetchUserStatisticsForTasks]);


    if (loadingFetchUserStatisticsForTasks) return <LoadingSpinner />;
    if (errorFetchUserStatisticsForTasks) return <AlertBox text={errorFetchUserStatisticsForTasks} type={'danger'} width={'500px'}/>;
    return (
        <div className="fade-in d-flex justify-content-center">
            <div className="table-responsive" style={{maxWidth: '800px'}}>
                <table className="table table-hover table-striped table-rounded table-shadow mb-0">
                    <thead className="table-dark">
                    <tr>
                        <th>Oficjum</th>
                        <th>Ostatnio wyznaczony</th>
                        <th>Ostatnie 30 dni</th>
                        <th>Ostatnie 90 dni</th>
                        <th>Ostatni rok</th>
                        <th>Łącznie</th>
                    </tr>
                    </thead>
                    <tbody>
                    {userStatisticsForTasks.map(userStatisticsForTask => (
                        <tr key={userStatisticsForTask.taskName}>
                            <td>[{userStatisticsForTask.taskNameAbbrev}] {userStatisticsForTask.taskName}</td>
                            <td>{userStatisticsForTask.lastAssigned}</td>
                            <td>{userStatisticsForTask.numberOfAssignInLast30Days}</td>
                            <td>{userStatisticsForTask.numberOfAssignInLast90Days}</td>
                            <td>{userStatisticsForTask.numberOfAssignInLast365Days}</td>
                            <td>{userStatisticsForTask.totalNumberOfAssigns}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default UserTasksStatistics;