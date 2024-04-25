import React, {useEffect, useRef, useState} from "react";
import {
    Task,
    UserTasksScheduleInfoWeeklyByAllDays
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faArrowsRotate, faRectangleXmark} from '@fortawesome/free-solid-svg-icons';
import useGetOrCreateCurrentUser from "../../services/UseGetOrCreateCurrentUser";
import UserShortScheduleHistoryPopup from "./UserShortScheduleHistoryPopup";
import WeekSelector from "../../components/WeekSelector";
import {daysOfWeekAbbreviation, daysOrder} from "../../models/DayOfWeek";
import "./AddScheduleWeeklyByAllDays.css";

interface ExpandedSelects {
    [key: string]: boolean;
}

function AddScheduleWeeklyByAllDays() {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const currentWeekRef = useRef(currentWeek); // useRef to keep the value of currentWeek in the closure of useEffect
    const [userDependencies, setUserDependencies] = useState<UserTasksScheduleInfoWeeklyByAllDays[]>();
    const location = useLocation();
    const from = format(startOfWeek(currentWeek, {weekStartsOn: 0}), 'dd-MM-yyyy');
    const to = format(endOfWeek(currentWeek, {weekStartsOn: 0}), 'dd-MM-yyyy');
    const roleName = new URLSearchParams(location.search).get('roleName');
    const dateFormatter = new DateFormatter("dd-MM-yyyy", "yyyy-MM-dd");
    const fetchUrl = `${backendUrl}/api/schedules/task/${roleName}/all/schedule-info/weekly/by-all-days?from=${from}&to=${to}`;
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
    const [dayAssignPopupData, setDayAssignPopupData] = useState<string>("");
    const [infoOnlyAssignPopupData, setInfoOnlyAssignPopupData] = useState(false);
    const [confirmAssignmentPopupText, setConfirmAssignmentPopupText] = useState("Czy na pewno chcesz przypisać użytkownika do zadania?");
    const { isFunkcyjny, isFunkcyjnyLoading, isFunkcyjnyInitialized } = useIsFunkcyjny();
    const navigate = useNavigate();
    const {currentUser} = useGetOrCreateCurrentUser();
    const [userScheduleHistoryPopup, setUserScheduleHistoryPopup] = useState(false);
    const [userIdForScheduleHistoryPopup, setUserIdForScheduleHistoryPopup] = useState<number>(0);

    const [expandedSelects, setExpandedSelects] = useState<ExpandedSelects>({});

    function showUserScheduleHistoryPopup(userId: number) {
        setUserIdForScheduleHistoryPopup(userId);
        setUserScheduleHistoryPopup(true);
    }

    const handleSelectFocus = (index:number, day:string, isFocused:boolean) => {
        const key = `${index}-${day}`;
        setExpandedSelects(prev => ({
            ...prev,
            [key]: isFocused
        }));
    };

    const isRoleWeeklyScheduleCreatorDefault = (roleName: string | null) => {
        return currentUser?.roles.filter((role) => (role.name === roleName))[0]?.weeklyScheduleCreatorDefault;
    }

    useEffect(() => {
        currentWeekRef.current = currentWeek; // keep the value of currentWeek up to date

        request(null, (data) => {
            if (currentWeekRef.current === currentWeek) {
                console.log(data);
                const newData = data.map((user : UserTasksScheduleInfoWeeklyByAllDays) => ({
                    ...user,
                    userTasksScheduleInfo: new Map(Object.entries(user.userTasksScheduleInfo))
                }));
                setUserDependencies(newData);
            }
        });
    }, [request, refreshData, currentWeekRef, currentWeek]);

    useEffect(() => {
        requestAllTasksByRole(null, (data) => {
            setTasks(data);
        });
    }, [requestAllTasksByRole]);

    function countAssignedUsers(taskId: number, day: string) {
        let count = 0;
        userDependencies?.forEach(dep => {
            let taskDep = dep.userTasksScheduleInfo.get(day)?.filter(udep => udep.taskId === taskId);
            if (taskDep && taskDep.length > 0 && taskDep[0].assignedToTheTask) count++;
        });
        return count;
    }

    function handleSubmit(userIndex: number, taskId: number, day: string) {
        const userDependency = userDependencies?.[userIndex];
        const userId = userDependency?.userId ? userDependency.userId : 0;
        const task = tasks?.find(task => task.id === taskId);
        if(task === undefined) return;
        const userTaskDependency = userDependency?.userTasksScheduleInfo.get(day)?.find(uTask => uTask.taskId === task?.id);
        const participantsLimit = task?.participantsLimit ? task.participantsLimit : 0;

        if (userTaskDependency?.isInConflict && countAssignedUsers(taskId, day) >= participantsLimit) {
            setConfirmAssignmentPopupText("Brat wykonuje inne oficjum, które jest w konflikcie z wybranym. Ponadto do oficjum jest już przypisana maksymalna liczba braci. Czy na pewno chcesz wyznaczyć do tego zadania wybranego brata?");
            setUserIdAssignPopupData(userId);
            setTaskIdAssignPopupData(taskId);
            setDayAssignPopupData(day);
            setInfoOnlyAssignPopupData(false);
            setShowConfirmAssignmentPopup(true);
        } else if (userTaskDependency?.isInConflict) {
            setConfirmAssignmentPopupText("Brat wykonuje inne oficjum, które jest w konflikcie z wybranym. Czy na pewno chcesz go wyznaczyć?");
            setUserIdAssignPopupData(userId);
            setTaskIdAssignPopupData(taskId);
            setDayAssignPopupData(day);
            setInfoOnlyAssignPopupData(false);
            setShowConfirmAssignmentPopup(true);
        } else if (countAssignedUsers(taskId, day) >= participantsLimit) {
            setConfirmAssignmentPopupText("Do oficjum jest przypisana maksymalna liczba braci. Czy na pewno chcesz wyznaczyć do tego oficjum kolejnego brata?");
            const userId = userDependency?.userId ? userDependency.userId : 0;
            setUserIdAssignPopupData(userId);
            setTaskIdAssignPopupData(taskId);
            setDayAssignPopupData(day);
            setInfoOnlyAssignPopupData(false);
            setShowConfirmAssignmentPopup(true);
        } else if (userTaskDependency?.hasObstacle) {
            setConfirmAssignmentPopupText("Brat posiada przeszkodę na to oficjum w wybranym dniu. Nie możesz go wyznaczyć.");
            setInfoOnlyAssignPopupData(true);
            setShowConfirmAssignmentPopup(true);
        } else {
            assignToTask(userId, taskId, day);
        }
    }


    function assignToTask(userId: number, taskId: number, day: string) {
        if (taskId != null) {
            const from = dateFormatter.formatDate(format(startOfWeek(currentWeek, {weekStartsOn: 0}), 'dd-MM-yyyy'));
            const to = dateFormatter.formatDate(format(endOfWeek(currentWeek, {weekStartsOn: 0}), 'dd-MM-yyyy'));
            const taskDate = new Date(startOfWeek(currentWeek, {weekStartsOn: 0}));
            taskDate.setDate(taskDate.getDate() + daysOrder.indexOf(day));
            const formattedTaskDate = dateFormatter.formatDate(format(taskDate, 'dd-MM-yyyy'));

            const requestData = {
                userId: userId,
                taskId: taskId,
                weekStartDate: from,
                weekEndDate: to,
                taskDate: formattedTaskDate
            };

            assignToTaskRequest(requestData, () => {setRefreshData(prev => !prev);})
                .then(() => setShowConfirmAssignmentPopup(false));
        } else {
            console.log("taskId is null")
        }
    }

    function unassignTask(userId: number, taskId: number, day: string) {
        if (taskId != null) {
            const from = dateFormatter.formatDate(format(startOfWeek(currentWeek, {weekStartsOn: 0}), 'dd-MM-yyyy'));
            const to = dateFormatter.formatDate(format(endOfWeek(currentWeek, {weekStartsOn: 0}), 'dd-MM-yyyy'));
            const taskDate = new Date(startOfWeek(currentWeek, {weekStartsOn: 0}));
            taskDate.setDate(taskDate.getDate() + daysOrder.indexOf(day));
            const formattedTaskDate = dateFormatter.formatDate(format(taskDate, 'dd-MM-yyyy'));

            const requestData = {
                userId: userId,
                taskId: taskId,
                weekStartDate: from,
                weekEndDate: to,
                taskDate: formattedTaskDate
            };

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
                            {Object.values(daysOfWeekAbbreviation).map((day, index) => (
                                <th key={index}>{day}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {userDependencies?.map((dep, indexRow) => (
                            <tr key={indexRow}
                            >
                                <td>
                                    <button className="btn btn-info p-1"
                                            onClick={() => showUserScheduleHistoryPopup(dep.userId)}>
                                        {dep.userName}
                                    </button>
                                </td>
                                <td className='max-column-width-200'>{dep?.assignedTasks.join(', ')}</td>
                                {Object.values(daysOrder).map((day, index) => (
                                    <td key={index}>
                                        {dep.userTasksScheduleInfo.get(day)?.every(task => !task.visible) ? (
                                            <button className="btn btn-secondary p-1" type="button" disabled={true}>
                                                <FontAwesomeIcon icon={faRectangleXmark}/>
                                            </button>
                                        ) : (
                                            <>
                                                <div className="d-flex justify-content-center">
                                                    <select
                                                        className={`form-control p-0 ${expandedSelects[`${indexRow}-${day}`] ? 'select-expanded' : 'select-collapsed'}`}
                                                        onFocus={() => handleSelectFocus(indexRow, day, true)}
                                                        onBlur={() => handleSelectFocus(indexRow, day, false)}
                                                        onChange={(e) => {handleSubmit(indexRow, parseInt(e.target.value), day)}}
                                                    >
                                                        <option className="text-center">+</option>
                                                        {dep.userTasksScheduleInfo.get(day)?.filter(task => !task.assignedToTheTask && task.visible).map((task, index) => {
                                                            let optionClassName;
                                                            if (task.isInConflict) {
                                                                optionClassName = "bg-warning";
                                                            } else if (task.hasObstacle) {
                                                                optionClassName = "bg-info";
                                                            } else {
                                                                optionClassName = "";
                                                            }
                                                            optionClassName += " text-center";
                                                            return (
                                                                <option key={index} value={task.taskId}
                                                                        className={optionClassName}>
                                                                    {task.taskName}
                                                                </option>
                                                            )
                                                        })}
                                                    </select>
                                                </div>
                                                <div className="selected-tasks">
                                                    {dep.userTasksScheduleInfo.get(day)?.filter(task => task.assignedToTheTask && task.visible).map(((task, index) => {
                                                        if (task.isInConflict) {
                                                            return (
                                                                <div className="pt-2">
                                                                    <button className="btn btn-warning p-1" type="button"
                                                                            onClick={() => {
                                                                                unassignTask(dep.userId, task.taskId, day)
                                                                            }}>
                                                                         <span className={'highlighted-text-conflict'}>
                                                                            {task ? task.taskName : 'Nieznane oficjum'}
                                                                        </span>
                                                                    </button>
                                                                </div>
                                                            )
                                                        } else {
                                                            return (
                                                                <div className="pt-2">
                                                                    <button className="btn btn-success p-1" type="button"
                                                                            onClick={() => {
                                                                                unassignTask(dep.userId, task.taskId, day)
                                                                            }}>
                                                                        {task ? task.taskName : 'Nieznane oficjum'}
                                                                    </button>
                                                                </div>
                                                            )
                                                        }
                                                    }))}
                                                </div>
                                            </>
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
            <div className={"d-flex justify-content-center"}>
                <button className="btn btn-secondary mt-3" onClick={() => {
                    navigate(`/add-schedule/daily?roleName=${roleName}`);
                }}>
                    <span><FontAwesomeIcon icon={faArrowsRotate}/> </span>
                    Przełącz na kreator dzienny
                </button>
            </div>
            <WeekSelector currentWeek={currentWeek} setCurrentWeek={setCurrentWeek}/>
            {assignToTaskError && <AlertBox text={assignToTaskError} type={'danger'} width={'500px'}/>}
            {unassignTaskError && <AlertBox text={unassignTaskError} type={'danger'} width={'500px'}/>}
            {renderTable()}
            {userScheduleHistoryPopup && <UserShortScheduleHistoryPopup
                onClose={() => {
                    setUserScheduleHistoryPopup(false)
                }}
                userId={userIdForScheduleHistoryPopup}
                userName={currentUser?.name + " " + currentUser?.surname}
                date={format(startOfWeek(currentWeek, {weekStartsOn: 0}), 'dd-MM-yyyy')}
                weeks={5}/>}
            {showConfirmAssignmentPopup && <ConfirmAssignmentPopup
                onHandle={() => {
                    assignToTask(userIdAssignPopupData, taskIdAssignPopupData, dayAssignPopupData)
                }}
                onClose={() => {
                    setShowConfirmAssignmentPopup(false)
                }}
                text={confirmAssignmentPopupText}
                onlyInfo={infoOnlyAssignPopupData}
            />}
        </div>
    )
}

export default AddScheduleWeeklyByAllDays;