import React, {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import useHttp from '../../services/UseHttp';
import {backendUrl} from "../../utils/constants";
import {Task, UserTaskDependencyWeekly} from "../../models/Interfaces";
import {DateFormatter} from "../../utils/DateFormatter";
import TaskInfo from "../task/TaskInfo";
import LoadingSpinner from "../../components/LoadingScreen";
import ConfirmAssignmentPopup from "./ConfirmAssignmentPopup";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSort, faSortDown, faSortUp} from "@fortawesome/free-solid-svg-icons";
import AlertBox from "../../components/AlertBox";
import useIsFunkcyjny, {UNAUTHORIZED_PAGE_TEXT} from "../../services/UseIsFunkcyjny";

interface SortConfig {
    key: string | null;
    direction: string;
}

const ScheduleCreatorAssignToTaskWeekly = () => {
    const [userDependencies, setUserDependencies] = useState<UserTaskDependencyWeekly[]>([]);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const taskId = queryParams.get('taskId');
    const from = queryParams.get('from');
    const to = queryParams.get('to');
    const fetchUrl = `${backendUrl}/api/schedules/task/${taskId}/user-dependencies/weekly?from=${from}&to=${to}`;
    const { error: assignToTaskError, request: assignToTaskRequest, loading: assignToTaskLoading } = useHttp(
        `${backendUrl}/api/schedules/forWholePeriod?ignoreConflicts=true`, 'POST');
    const { error: unassignTaskError, request: unassignTaskRequest, loading: unassignTaskLoading } = useHttp(
        `${backendUrl}/api/schedules/forWholePeriod`, 'DELETE');
    const [showConfirmAssignmentPopup, setShowConfirmAssignmentPopup] = useState(false);

    const { request, error, loading } = useHttp(fetchUrl, 'GET');
    const dateFormatter = new DateFormatter("dd-MM-yyyy", "yyyy-MM-dd");
    const [refreshData, setRefreshData] = useState(false);
    const [userIdAssignPopupData, setUserIdAssignPopupData] = useState(0);
    const [task, setTask] = useState<Task>();
    const { request: fetchTaskRequest, error: fetchTaskError, loading: fetchTaskLoading } = useHttp(`${backendUrl}/api/tasks/${taskId}`, 'GET');
    const [confirmAssignmentPopupText, setConfirmAssignmentPopupText] = useState("Czy na pewno chcesz przypisać użytkownika do zadania?");
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'ascending' });
    const { isFunkcyjny, isFunkcyjnyLoading, isFunkcyjnyInitialized } = useIsFunkcyjny();

    useEffect(() => {
        request(null, (data) => setUserDependencies(data));
        fetchTaskRequest(null, setTask);
    }, [request, refreshData, fetchTaskRequest]);

    function countAssignedUsers() {
        return userDependencies.filter(dep => dep.assignedToTheTask).length;
    }

    function handleSubmit(userId: number) {
        const userDependency = userDependencies.find(dep => dep.userId === userId);
        const participantsLimit = task?.participantsLimit ? task.participantsLimit : 0;

        if (userDependency?.isInConflict && countAssignedUsers() >= participantsLimit) {
            setConfirmAssignmentPopupText("Użytkownik wykonuje inne zadanie, które jest w konflikcie z wybranym. Ponadto do zadania jest już przypisana maksymalna liczba uczesnitków. Czy na pewno chcesz wyznaczyć do tego zadania wybraną osobę?");
            setUserIdAssignPopupData(userDependency?.userId);
            setShowConfirmAssignmentPopup(true);
        } else if (userDependency?.isInConflict) {
            setConfirmAssignmentPopupText("Użytkownik wykonuje inne zadanie, które jest w konflikcie z wybranym. Czy na pewno chcesz go wyznaczyć?");
            setUserIdAssignPopupData(userDependency?.userId);
            setShowConfirmAssignmentPopup(true);
        } else if (countAssignedUsers() >= participantsLimit) {
            setConfirmAssignmentPopupText("Do zadania jest przypisana maksymalna liczba uczestników. Czy na pewno chcesz wyznaczyć do tego zadania kolejną osobę?");
            const userId = userDependency?.userId ? userDependency.userId : 0;
            setUserIdAssignPopupData(userId);
            setShowConfirmAssignmentPopup(true);
        } else {
            assignToTask(userId);
        }
    }


    function assignToTask(userId: number) {
        if (taskId != null && from != null && to != null) {

            const requestData = {
                userId: userId,
                taskId: parseInt(taskId),
                fromDate: dateFormatter.formatDate(from),
                toDate: dateFormatter.formatDate(to)
            };

            console.log(requestData);

            assignToTaskRequest(requestData, () => {setRefreshData(prev => !prev);})
                .then(() => setShowConfirmAssignmentPopup(false));
        } else {
            console.log("taskId, from or to is null")
        }
    }

    function unassignTask(userId: number) {
        if (taskId != null && from != null && to != null) {
            const requestData = {
                userId: userId,
                taskId: parseInt(taskId),
                fromDate: dateFormatter.formatDate(from),
                toDate: dateFormatter.formatDate(to)
            };

            console.log(requestData);

            unassignTaskRequest(requestData, () => {setRefreshData(prev => !prev);});
        } else {
            console.log("taskId, from or to is null")
        }
    }

    const requestSort = (key: keyof UserTaskDependencyWeekly) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    userDependencies.sort((a, b) => {
        if (!sortConfig.key) return 0;

        if (a[sortConfig.key as keyof UserTaskDependencyWeekly] < b[sortConfig.key as keyof UserTaskDependencyWeekly]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key as keyof UserTaskDependencyWeekly ] > b[sortConfig.key as keyof UserTaskDependencyWeekly]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });


    const SortIcon: React.FC<{ keyName: string }> = ({ keyName }) => {
        if (sortConfig.key !== keyName) {
            return <span><FontAwesomeIcon icon={faSort}/></span>;
        }
        return <span>{sortConfig.direction === 'ascending' ? <FontAwesomeIcon icon={faSortUp}/> : <FontAwesomeIcon icon={faSortDown}/>}</span>;
    };

    if(isFunkcyjnyLoading || isFunkcyjnyInitialized) {
        return <LoadingSpinner/>;
    } else if(!isFunkcyjny) return <AlertBox text={UNAUTHORIZED_PAGE_TEXT} type="danger" width={'500px'} />;

    if (loading || fetchTaskLoading) return <LoadingSpinner/>;
    if (error || fetchTaskError) return (
        <AlertBox text={error || fetchTaskError} type={'danger'} width={'500px'}/>

    );

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <TaskInfo taskId={taskId}/>
            </div>
            <h4 className=" fw-bold entity-header-dynamic-size">Tworzysz harmonogram od: {from}, do: {to}</h4>
            {assignToTaskError && <AlertBox text={assignToTaskError} type={'danger'} width={'500px'}/>}
            {unassignTaskError && <AlertBox text={unassignTaskError} type={'danger'} width={'500px'}/>}
            <div className="table-responsive">
                <table className="table table-hover table-stripe table-rounded table-shadow">
                    <thead className="table-dark">
                    <tr>
                        <th>UserId</th>
                        <th>Imię i nazwisko</th>
                        <th onClick={() => requestSort('lastAssigned')}>Ostatnio wykonany <SortIcon keyName='lastAssigned'/>
                        </th>
                        <th onClick={() => requestSort('numberOfAssignsInLastYear')}>Dni z zadaniem (ostatni rok) <SortIcon
                            keyName='numberOfAssignsInLastYear'/></th>
                        <th>Aktualne taski</th>
                        <th>Konflikt</th>
                        <th>Przeszkoda</th>
                        <th>Już wyznaczony</th>
                        <th>Akcja</th>
                    </tr>
                    </thead>
                    <tbody>
                    {userDependencies.map((dep, index) => (
                        <tr key={index}
                            className={dep.assignedToTheTask ? 'table-success' : dep.hasObstacle ? 'table-primary' : dep.isInConflict ? 'table-warning' : ''}
                        >
                            <td>{dep.userId}</td>
                            <td>{dep.userName}</td>
                            <td>{dep.lastAssigned}</td>
                            <td>{dep.numberOfAssignsInLastYear}</td>
                            <td>{dep.assignedTasks.join(', ')}</td>
                            <td>{dep.isInConflict ? 'Tak' : 'Nie'}</td>
                            <td>{dep.hasObstacle ? 'Tak' : 'Nie'}</td>
                            <td>{dep.assignedToTheTask ? 'Tak' : 'Nie'}</td>
                            <td>
                                {!dep.hasObstacle ? (
                                    dep.assignedToTheTask ? (
                                        <button className={dep.isInConflict ? 'btn btn-warning' : 'btn btn-success'} onClick={() => {
                                            unassignTask(dep.userId)
                                        }} disabled={assignToTaskLoading || unassignTaskLoading}>
                                            <span
                                                className={dep.isInConflict? 'highlighted-text-conflict' : ''}>
                                                    Odznacz
                                                </span>
                                        </button>
                                    ) : (
                                        <button className={dep.isInConflict ? 'btn btn-warning' : 'btn btn-dark'} onClick={() => handleSubmit(dep.userId)}
                                                disabled={assignToTaskLoading || unassignTaskLoading}>
                                            Przypisz
                                        </button>
                                    )
                                ) : (dep.assignedToTheTask && (
                                        <button className='btn btn-info'
                                                onClick={() => {
                                                    unassignTask(dep.userId)
                                                }} disabled={assignToTaskLoading || unassignTaskLoading}>
                                            <span
                                                className='highlighted-text-conflict'>
                                                    Odznacz
                                                </span>
                                        </button>
                                    )
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            {showConfirmAssignmentPopup && <ConfirmAssignmentPopup
                onHandle={() => {
                    assignToTask(userIdAssignPopupData)
                }}
                onClose={() => {
                    setShowConfirmAssignmentPopup(false)
                }}
                text={confirmAssignmentPopupText}
            />}
            <h4 className="entity-header-dynamic-size">Jeśli użytkownika nie ma na liście, to znaczy, że nie posiada
                roli, która pozwala wykonać zadanie</h4>
            <h4 className="entity-header-dynamic-size">Nadaj użytkownikowi odpowiednią rolę, aby pojawił się na liście</h4>
        </div>
    );
};

export default ScheduleCreatorAssignToTaskWeekly;
