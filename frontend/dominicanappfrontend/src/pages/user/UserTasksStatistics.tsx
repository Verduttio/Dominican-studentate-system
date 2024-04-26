import LoadingSpinner from "../../components/LoadingScreen";
import React, {useEffect, useState} from "react";
import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";
import {UserTaskStatistics} from "../../models/Interfaces";
import AlertBox from "../../components/AlertBox";
import {format} from "date-fns";

interface UserTasksStatisticsProps {
    userId: number;
}

const UserTasksStatistics: React.FC<UserTasksStatisticsProps> = ({userId}) => {
    const { error: errorFetchUserStatisticsForTasks, loading: loadingFetchUserStatisticsForTasks, request: requestFetchUserStatisticsForTasks } = useHttp(
        `${backendUrl}/api/schedules/users/${userId}/statistics/tasks`, 'GET'
    );
    const [userStatisticsForTasks, setUserStatisticsForTasks] = useState<UserTaskStatistics[]>([]);

    useEffect(() => {
        requestFetchUserStatisticsForTasks(null, (data: UserTaskStatistics[]) => {
            setUserStatisticsForTasks(data);
            console.log(data)
        });
    }, [requestFetchUserStatisticsForTasks]);


    if (loadingFetchUserStatisticsForTasks) return <LoadingSpinner />;
    if (errorFetchUserStatisticsForTasks) return <AlertBox text={errorFetchUserStatisticsForTasks} type={'danger'} width={'500px'}/>;
    return (
        <div className="fade-in d-flex justify-content-center">
            <div className="table-responsive" style={{maxWidth: '400px'}}>
                <table className="table table-hover table-striped table-rounded table-shadow mb-0">
                    <thead className="table-dark">
                    <tr>
                        <th>Oficjum</th>
                        <th>Ostatnio wyznaczony</th>
                        <th className="max-column-width-100">Wyznaczony razy od daty sys.</th>
                        <th className="max-column-width-100">Wyznaczony łącznie</th>
                    </tr>
                    </thead>
                    <tbody>
                    {userStatisticsForTasks.map(userStatisticsForTask => (
                        <tr key={userStatisticsForTask.taskName}>
                            <td>{userStatisticsForTask.taskNameAbbrev}</td>
                            <td>{format(userStatisticsForTask.lastAssigned, 'dd.MM.yyyy')}</td>
                            <td>{userStatisticsForTask.numberOfAssignsFromStatsDate}</td>
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