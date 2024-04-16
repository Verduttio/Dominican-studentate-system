import React, {useEffect, useRef, useState} from "react";
import {
    Task,
    UserTasksScheduleInfoWeekly
} from "../../models/Interfaces";
import {useLocation, useNavigate} from "react-router-dom";
import {backendUrl} from "../../utils/constants";
import useHttp from "../../services/UseHttp";
import {DateFormatter} from "../../utils/DateFormatter";
import useIsFunkcyjny, {UNAUTHORIZED_PAGE_TEXT} from "../../services/UseIsFunkcyjny";
import LoadingSpinner from "../../components/LoadingScreen";
import AlertBox from "../../components/AlertBox";
import {endOfWeek, format, startOfWeek} from "date-fns";
import ConfirmAssignmentPopup from "./ConfirmAssignmentPopup";
import ButtonLegend from "./ButtonLegend";
import DaySelector from "../../components/DaySelector";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import useGetOrCreateCurrentUser from "../../services/UseGetOrCreateCurrentUser";
import UserShortScheduleHistoryPopup from "./UserShortScheduleHistoryPopup";

function AddScheduleDaily() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const currentDateRef = useRef(currentDate); // useRef to keep the value of currentDate in the closure of useEffect
    const [userDependencies, setUserDependencies] = useState<UserTasksScheduleInfoWeekly[]>([]);
    const location = useLocation();
    const roleName = new URLSearchParams(location.search).get('roleName');
    const dateFormatter = new DateFormatter("dd-MM-yyyy", "yyyy-MM-dd");
    const fetchUrl = `${backendUrl}/api/schedules/task/${roleName}/all/schedule-info/daily?date=${format(currentDate, 'dd-MM-yyyy')}`;
    const { error: assignToTaskError, request: assignToTaskRequest, loading: assignToTaskLoading } = useHttp(
        `${backendUrl}/api/schedules/forDailyPeriod?ignoreConflicts=true`, 'POST');
    const { error: unassignTaskError, request: unassignTaskRequest, loading: unassignTaskLoading } = useHttp(
        `${backendUrl}/api/schedules/forDailyPeriod`, 'DELETE');

    const { request, error, loading } = useHttp(fetchUrl, 'GET');
    const { request: requestAllTasksByRole, error: errorAllTasksByRole, loading: loadingAllTasksByRole } = useHttp(`${backendUrl}/api/tasks/bySupervisorRole/${roleName}`, 'GET');
    const [tasks, setTasks] = useState<Task[] | null>(null);
    const [refreshData, setRefreshData] = useState(false);
    const [showConfirmAssignmentPopup, setShowConfirmAssignmentPopup] = useState(false);
    const [userIdAssignPopupData, setUserIdAssignPopupData] = useState(0);
    const [taskIdAssignPopupData, setTaskIdAssignPopupData] = useState(0);
    const [confirmAssignmentPopupText, setConfirmAssignmentPopupText] = useState("Czy na pewno chcesz przypisać użytkownika do zadania?");
    const { isFunkcyjny, isFunkcyjnyLoading, isFunkcyjnyInitialized } = useIsFunkcyjny();
    const navigate = useNavigate();
    const {currentUser} = useGetOrCreateCurrentUser();
    const [userScheduleHistoryPopup, setUserScheduleHistoryPopup] = useState(false);
    const [userIdForScheduleHistoryPopup, setUserIdForScheduleHistoryPopup] = useState<number>(0);

    function showUserScheduleHistoryPopup(userId: number) {
        setUserIdForScheduleHistoryPopup(userId);
        setUserScheduleHistoryPopup(true);
    }

    const statsOnButton = (numberOfWeeklyAssignsFromStatsDate: number, lastAssignedWeeksAgo: number) => {
        return `${lastAssignedWeeksAgo}|${numberOfWeeklyAssignsFromStatsDate}`;
    }

    const isRoleWeeklyScheduleCreatorDefault = (roleName: string | null) => {
        return currentUser?.roles.filter((role) => (role.name === roleName))[0]?.weeklyScheduleCreatorDefault;
    }

    useEffect(() => {
        currentDateRef.current = currentDate; // keep the value of currentDate up to date

        request(null, (data) => {
            if (currentDateRef.current === currentDate) {
                setUserDependencies(data);
            }
        });
    }, [request, refreshData, currentDateRef, currentDate]);

    useEffect(() => {
        requestAllTasksByRole(null, (data) => {
            setTasks(data);
        });
    }, [requestAllTasksByRole]);

    function countAssignedUsers(taskId: number) {
        let count = 0;
        userDependencies.forEach(dep => {
            let taskDep = dep.userTasksScheduleInfo?.filter(udep => udep.taskId === taskId);
            if (taskDep && taskDep.length > 0 && taskDep[0].assignedToTheTask) count++;
        });
        return count;
    }

    function handleSubmit(userId: number, taskId: number) {
        const userDependency = userDependencies.find(dep => dep.userId === userId);
        const userTaskDependency = userDependency?.userTasksScheduleInfo?.find(udep => udep.taskId === taskId);
        const task = tasks?.find(task => task.id === taskId);
        const participantsLimit = task?.participantsLimit ? task.participantsLimit : 0;

        if (userTaskDependency?.isInConflict && countAssignedUsers(taskId) >= participantsLimit) {
            setConfirmAssignmentPopupText("Brat wykonuje inne oficjum, które jest w konflikcie z wybranym. Ponadto do oficjum jest już przypisana maksymalna liczba braci. Czy na pewno chcesz wyznaczyć do tego zadania wybranego brata?");
            setUserIdAssignPopupData(userId);
            setTaskIdAssignPopupData(taskId);
            setShowConfirmAssignmentPopup(true);
        } else if (userTaskDependency?.isInConflict) {
            setConfirmAssignmentPopupText("Brat wykonuje inne oficjum, które jest w konflikcie z wybranym. Czy na pewno chcesz go wyznaczyć?");
            setUserIdAssignPopupData(userId);
            setTaskIdAssignPopupData(taskId);
            setShowConfirmAssignmentPopup(true);
        } else if (countAssignedUsers(taskId) >= participantsLimit) {
            setConfirmAssignmentPopupText("Do oficjum jest przypisana maksymalna liczba braci. Czy na pewno chcesz wyznaczyć do tego oficjum kolejnego brata?");
            const userId = userDependency?.userId ? userDependency.userId : 0;
            setUserIdAssignPopupData(userId);
            setTaskIdAssignPopupData(taskId);
            setShowConfirmAssignmentPopup(true);
        } else {
            assignToTask(userId, taskId);
        }
    }


    function assignToTask(userId: number, taskId: number) {
        if (taskId != null) {
            const from = dateFormatter.formatDate(format(startOfWeek(currentDate, {weekStartsOn: 0}), 'dd-MM-yyyy'));
            const to = dateFormatter.formatDate(format(endOfWeek(currentDate, {weekStartsOn: 0}), 'dd-MM-yyyy'));
            const taskDate = dateFormatter.formatDate(format(currentDate, 'dd-MM-yyyy'));

            const requestData = {
                userId: userId,
                taskId: taskId,
                weekStartDate: from,
                weekEndDate: to,
                taskDate: taskDate
            };

            console.log(requestData);

            assignToTaskRequest(requestData, () => {setRefreshData(prev => !prev);})
                .then(() => setShowConfirmAssignmentPopup(false));
        } else {
            console.log("taskId is null")
        }
    }

    function unassignTask(userId: number, taskId: number) {
        if (taskId != null) {
            const from = dateFormatter.formatDate(format(startOfWeek(currentDate, {weekStartsOn: 0}), 'dd-MM-yyyy'));
            const to = dateFormatter.formatDate(format(endOfWeek(currentDate, {weekStartsOn: 0}), 'dd-MM-yyyy'));
            const taskDate = dateFormatter.formatDate(format(currentDate, 'dd-MM-yyyy'));

            const requestData = {
                userId: userId,
                taskId: taskId,
                weekStartDate: from,
                weekEndDate: to,
                taskDate: taskDate
            };

            console.log(requestData);

            unassignTaskRequest(requestData, () => {setRefreshData(prev => !prev);});
        } else {
            console.log("taskId is null")
        }
    }


    const renderTable = () => {
        if(isFunkcyjnyLoading || isFunkcyjnyInitialized) {
            return <LoadingSpinner/>;
        } else if(!isFunkcyjny) return <AlertBox text={UNAUTHORIZED_PAGE_TEXT} type="danger" width={'500px'} />;

        if (loading || loadingAllTasksByRole) return <LoadingSpinner/>;
        if (error || errorAllTasksByRole) return (
            <AlertBox text={error } type={'danger'} width={'500px'}/>
        )

        return (
            <div className="d-flex-no-media-resize justify-content-center">
                <div className="table-responsive-fit-content">
                    <table className="table table-hover table-striped table-rounded table-shadow text-center">
                        <thead className="table-dark">
                        <tr>
                            <th>Brat</th>
                            <th>Oficja</th>
                            {tasks?.map((task) => (
                                <th key={task.id}>{task.nameAbbrev}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {userDependencies?.map((dep, index) => (
                            <tr key={index}
                            >
                                <td>
                                    <button className="btn btn-info p-1"
                                            onClick={() => showUserScheduleHistoryPopup(dep.userId)}>
                                        {dep.userName}
                                    </button>
                                </td>
                                <td className='max-column-width-200'>{dep?.assignedTasks.join(', ')}</td>
                                {dep.userTasksScheduleInfo?.map(udep => (
                                    <td>
                                        {!udep.hasObstacle ? (
                                            udep.assignedToTheTask ? (
                                                <button
                                                    className={udep.isInConflict ? 'btn btn-warning' : 'btn btn-success'}
                                                    onClick={() => {
                                                        unassignTask(dep.userId, udep.taskId)
                                                    }} disabled={assignToTaskLoading || unassignTaskLoading}>
                                                <span
                                                    className={udep.isInConflict ? 'highlighted-text-conflict' : ''}>
                                                        {statsOnButton(udep.numberOfWeeklyAssignsFromStatsDate, udep.lastAssignedWeeksAgo)}
                                                    </span>
                                                </button>
                                            ) : (
                                                <button
                                                    className={udep.isInConflict ? 'btn btn-warning' : 'btn btn-dark'}
                                                    onClick={() => handleSubmit(dep.userId, udep.taskId)}
                                                    disabled={assignToTaskLoading || unassignTaskLoading}>
                                                    {statsOnButton(udep.numberOfWeeklyAssignsFromStatsDate, udep.lastAssignedWeeksAgo)}
                                                </button>
                                            )
                                        ) : (udep.assignedToTheTask ? (
                                                <button className='btn btn-info'
                                                        onClick={() => {
                                                            unassignTask(dep.userId, udep.taskId)
                                                        }} disabled={assignToTaskLoading || unassignTaskLoading}>
                                                <span
                                                    className='highlighted-text-conflict'>
                                                        {statsOnButton(udep.numberOfWeeklyAssignsFromStatsDate, udep.lastAssignedWeeksAgo)}
                                                    </span>
                                                </button>
                                            ) : (
                                                <button className='btn btn-info'
                                                        disabled={true}>
                                                    {statsOnButton(udep.numberOfWeeklyAssignsFromStatsDate, udep.lastAssignedWeeksAgo)}
                                                </button>
                                            )
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    return (
        <div className="fade-in">
            <h3 className="fw-bold entity-header-dynamic-size mb-0 mx-4">Oficja - {roleName}</h3>
            <ButtonLegend/>
            {isRoleWeeklyScheduleCreatorDefault(roleName) && (
                <div className={"d-flex justify-content-center"}>
                    <button className="btn btn-secondary mt-3" onClick={() => {
                        navigate(`/add-schedule/weekly?roleName=${roleName}`);
                    }}>
                        <span><FontAwesomeIcon icon={faArrowsRotate}/> </span>
                        Przełącz na kreator tygodniowy
                    </button>
                </div>
            )}
            <DaySelector currentDate={currentDate} setCurrentDate={setCurrentDate}/>
            {assignToTaskError && <AlertBox text={assignToTaskError} type={'danger'} width={'500px'}/>}
            {unassignTaskError && <AlertBox text={unassignTaskError} type={'danger'} width={'500px'}/>}
            {renderTable()}
            {userScheduleHistoryPopup && <UserShortScheduleHistoryPopup onClose={() => {setUserScheduleHistoryPopup(false)}} userId={userIdForScheduleHistoryPopup} date={format(startOfWeek(currentDate, { weekStartsOn: 0 }), 'dd-MM-yyyy')} weeks={5}/>}
            {showConfirmAssignmentPopup && <ConfirmAssignmentPopup
                onHandle={() => {
                    assignToTask(userIdAssignPopupData, taskIdAssignPopupData)
                }}
                onClose={() => {
                    setShowConfirmAssignmentPopup(false)
                }}
                text={confirmAssignmentPopupText}
            />}
        </div>
    )
}

export default AddScheduleDaily;