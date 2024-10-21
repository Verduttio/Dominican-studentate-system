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
            <div className="table-responsive" style={{maxWidth: '450px'}}>
                <table className="table table-hover table-striped table-rounded table-shadow mb-0">
                    <thead className="table-dark">
                    <tr>
                        <th>Oficjum</th>
                        <th>Ostatnio wyznaczony</th>
                        <th className="max-column-width-150">Pełne wyznaczenia od daty sys.</th>
                        <th className="max-column-width-150">Pełne wyznaczenia łącznie</th>
                    </tr>
                    </thead>
                    <tbody>
                    {userStatisticsForTasks.map(userStatisticsForTask => (
                        <tr key={userStatisticsForTask.taskName}>
                            <td>{userStatisticsForTask.taskAbbrev}</td>
                            {userStatisticsForTask.lastAssignmentDate ? <td>{format(userStatisticsForTask.lastAssignmentDate, 'dd.MM.yyyy')}</td> : <td>Brak</td>}
                            <td>{userStatisticsForTask.normalizedOccurrencesFromStatsDate}</td>
                            <td>{userStatisticsForTask.normalizedOccurrencesAllTime}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default UserTasksStatistics;