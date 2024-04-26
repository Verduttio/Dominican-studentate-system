import React, { useEffect, useState } from 'react';
import useHttp from '../../../services/UseHttp';
import {Role, ScheduleShortInfo, ScheduleShortInfoForTask} from '../../../models/Interfaces';
import {backendUrl} from "../../../utils/constants";
import axios, {AxiosError} from "axios";
import {useNavigate} from "react-router-dom";
import WeekSelector from "../../../components/WeekSelector";
import {endOfWeek, format, startOfWeek} from "date-fns";
import LoadingSpinner from "../../../components/LoadingScreen";
import useIsFunkcyjny from "../../../services/UseIsFunkcyjny";
import AlertBox from "../../../components/AlertBox";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowsRotate, faChevronDown, faChevronUp, faRightToBracket} from "@fortawesome/free-solid-svg-icons";
import PopupDatePicker from "../../specialDate/PopupDatePicker";


function SchedulePage() {
    const [scheduleShortInfo, setScheduleShortInfo] = useState<ScheduleShortInfo[]>([]);
    const [scheduleShortInfoForTasks, setScheduleShortInfoForTasks] = useState<ScheduleShortInfoForTask[]>([]);
    const [scheduleShortInfoForTasksByRoles, setScheduleShortInfoForTasksByRoles] = useState<ScheduleShortInfoForTask[]>([]);
    const [supervisorRoles, setSupervisorRoles] = useState<Role[]>([]);
    const [selectedSupervisorRoleName, setSelectedSupervisorRoleName] = useState<string | null>(null);
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const { request: fetchSchedule, error, loading} = useHttp();
    const { request: fetchScheduleByTasks, error: errorFetchScheduleByTasks, loading: loadingFetchScheduleByTasks} = useHttp();
    const { request: fetchScheduleByTasksByRoles, error: errorFetchScheduleByTasksByRoles, loading: loadingFetchScheduleByTasksByRoles} = useHttp();
    const { request: fetchSupervisorRoles, error: errorFetchSupervisorRoles, loading: loadingSupervisorRoles } = useHttp();
    const navigate = useNavigate();
    const { isFunkcyjny } = useIsFunkcyjny();
    const [loadingDownloadSchedulePdfForUsers, setLoadingDownloadSchedulePdfForUsers] = useState<boolean>(false);
    const [loadingDownloadSchedulePdfForTasksByRole, setLoadingDownloadSchedulePdfForTasksByRole] = useState<boolean>(false);
    const [loadingDownloadSchedulePdfForTasks, setLoadingDownloadSchedulePdfForTasks] = useState<boolean>(false);
    const [errorDownloadSchedulePdfForUsers, setErrorDownloadSchedulePdfForUsers] = useState<string | null>(null);
    const [errorDownloadSchedulePdfForTasksByRole, setErrorDownloadSchedulePdfForTasksByRole] = useState<string | null>(null);
    const [errorDownloadSchedulePdfForTasks, setErrorDownloadSchedulePdfForTasks] = useState<string | null>(null);

    const [showStandardDateSelector, setShowStandardDateSelector] = useState<boolean>(true);
    const [showPopupDatePickerForStart, setShowPopupDatePickerForStart] = useState<boolean>(false);
    const [showPopupDatePickerForEnd, setShowPopupDatePickerForEnd] = useState<boolean>(false);
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    const [nonStandardStartDate, setNonStandardStartDate] = useState<Date>(new Date(midnight));
    const [nonStandardEndDate, setNonStandardEndDate] = useState<Date>(new Date(midnight));
    const [nonStandardDateValidationError, setNonStandardDateValidationError] = useState<string | null>(null);
    const [standardDateRefresher, setStandardDateRefresher] = useState<boolean>(false);
    const [isTableOpened, setIsTableOpened] = useState<Map<string, boolean>>(new Map());

    const changeTableState = (id: string) => {
        setIsTableOpened(prevState => {
            if (prevState.has(id)) {
                const newState = new Map(prevState);
                newState.set(id, !prevState.get(id));
                return newState;
            } else {
                const newState = new Map(prevState);
                newState.set(id, true);
                return newState;
            }
        });
    }


    useEffect(() => {
        fetchSchedule(null, (data) => setScheduleShortInfo(data), false, `${backendUrl}/api/schedules/users/scheduleShortInfo/week?from=${format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}&to=${format(endOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}`, 'GET');
        fetchScheduleByTasks(null, (data) => setScheduleShortInfoForTasks(data), false, `${backendUrl}/api/schedules/tasks/scheduleShortInfo/week?from=${format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}&to=${format(endOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}`, 'GET');
        fetchSupervisorRoles(null, (data: Role[]) => setSupervisorRoles(data), false, `${backendUrl}/api/roles/types/SUPERVISOR`, 'GET');
    }, [fetchSchedule, fetchScheduleByTasks, fetchSupervisorRoles, standardDateRefresher, currentWeek]);

    useEffect(() => {
        if (selectedSupervisorRoleName && showStandardDateSelector) {
            fetchScheduleByTasksByRoles(null, (data) => setScheduleShortInfoForTasksByRoles(data), false,
                `${backendUrl}/api/schedules/tasks/byRole/${selectedSupervisorRoleName}/scheduleShortInfo/week?from=${format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}&to=${format(endOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}`, 'GET');
        }
    }, [fetchScheduleByTasksByRoles, selectedSupervisorRoleName, currentWeek, standardDateRefresher, showStandardDateSelector]);

    async function downloadSchedulePdfForUsers() {
        setLoadingDownloadSchedulePdfForUsers(true);
        let targetUrl;
        if (showStandardDateSelector) {
            targetUrl = `${backendUrl}/api/pdf/schedules/users/scheduleShortInfo/week?from=${format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}&to=${format(endOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}`;
        } else {
            targetUrl = `${backendUrl}/api/pdf/schedules/users/scheduleShortInfo/week?from=${format(nonStandardStartDate, 'dd-MM-yyyy')}&to=${format(nonStandardEndDate, 'dd-MM-yyyy')}`;
        }

        try {
            const response = await axios({
                url: targetUrl,
                method: 'GET',
                responseType: 'blob',
                withCredentials: true
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Harmonogram_bracia_${format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}-${format(endOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const serverError = err as AxiosError<{ message?: string }>;
                if (serverError.response) {
                    setErrorDownloadSchedulePdfForUsers('Błąd podczas pobierania PDF:' + serverError.response.data);
                } else {
                    setErrorDownloadSchedulePdfForUsers('Problem z połączeniem sieciowym');
                }
            } else {
                setErrorDownloadSchedulePdfForUsers('Nieoczekiwany błąd:' + err);
            }
        } finally {
            setLoadingDownloadSchedulePdfForUsers(false);
        }
    }

    async function downloadSchedulePdfForTasksByRole() {
        setLoadingDownloadSchedulePdfForTasksByRole(true);
        let targetUrl;
        if (showStandardDateSelector) {
            targetUrl = `${backendUrl}/api/pdf/schedules/tasks/byRole/${selectedSupervisorRoleName}/scheduleShortInfo/week?from=${format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}&to=${format(endOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}`;
        } else {
            targetUrl = `${backendUrl}/api/pdf/schedules/tasks/byRole/${selectedSupervisorRoleName}/scheduleShortInfo/week?from=${format(nonStandardStartDate, 'dd-MM-yyyy')}&to=${format(nonStandardEndDate, 'dd-MM-yyyy')}`;
        }

        try {
            const response = await axios({
                url: targetUrl,
                method: 'GET',
                responseType: 'blob',
                withCredentials: true
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Harmonogram_oficjów_wg_roli_${selectedSupervisorRoleName}_${format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}-${format(endOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const serverError = err as AxiosError<{ message?: string }>;
                if (serverError.response) {
                    setErrorDownloadSchedulePdfForTasksByRole('Błąd podczas pobierania PDF:' + serverError.response.data);
                } else {
                    setErrorDownloadSchedulePdfForTasksByRole('Problem z połączeniem sieciowym');
                }
            } else {
                setErrorDownloadSchedulePdfForTasksByRole('Nieoczekiwany błąd:' + err);
            }
        } finally {
            setLoadingDownloadSchedulePdfForTasksByRole(false);
        }
    }

    async function downloadSchedulePdfForTasks() {
        setLoadingDownloadSchedulePdfForTasks(true);
        let targetUrl;
        if (showStandardDateSelector) {
            targetUrl = `${backendUrl}/api/pdf/schedules/tasks/scheduleShortInfo/week?from=${format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}&to=${format(endOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}`;
        } else {
            targetUrl = `${backendUrl}/api/pdf/schedules/tasks/scheduleShortInfo/week?from=${format(nonStandardStartDate, 'dd-MM-yyyy')}&to=${format(nonStandardEndDate, 'dd-MM-yyyy')}`;
        }

        try {
            const response = await axios({
                url: targetUrl,
                method: 'GET',
                responseType: 'blob',
                withCredentials: true
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Harmonogram_oficjów_${selectedSupervisorRoleName}_${format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}-${format(endOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const serverError = err as AxiosError<{ message?: string }>;
                if (serverError && serverError.response) {
                    setErrorDownloadSchedulePdfForTasks('Błąd podczas pobierania PDF:' + serverError.response.data);
                } else {
                    setErrorDownloadSchedulePdfForTasks('Problem z połączeniem sieciowym');
                }
            } else {
                setErrorDownloadSchedulePdfForTasks('Nieoczekiwany błąd:' + err);
            }
        } finally {
            setLoadingDownloadSchedulePdfForTasks(false);
        }
    }

    const validateNonStandardDate = () => {
        if (nonStandardStartDate > nonStandardEndDate) {
            setNonStandardDateValidationError('Data początkowa musi być przed datą końcową');
            return false;
        }
        if (nonStandardEndDate.getTime() - nonStandardStartDate.getTime() >= 7 * 24 * 60 * 60 * 1000) {
            setNonStandardDateValidationError('Zakres dat nie może być dłuższy niż 7 dni');
            return false;
        }

        setNonStandardDateValidationError('');
        return true;
    }

    const handleFetchScheduleByNonStandardDate = () => {
        if (!validateNonStandardDate()) return;

        fetchSchedule(null, (data) => setScheduleShortInfo(data), false,
            `${backendUrl}/api/schedules/users/scheduleShortInfo/week?from=${format(nonStandardStartDate, 'dd-MM-yyyy')}&to=${format(nonStandardEndDate, 'dd-MM-yyyy')}`, 'GET');
        fetchScheduleByTasks(null, (data) => setScheduleShortInfoForTasks(data), false,
            `${backendUrl}/api/schedules/tasks/scheduleShortInfo/week?from=${format(nonStandardStartDate, 'dd-MM-yyyy')}&to=${format(nonStandardEndDate, 'dd-MM-yyyy')}`, 'GET');
        if(selectedSupervisorRoleName) {
            fetchScheduleByTasksByRoles(null, (data) => setScheduleShortInfoForTasksByRoles(data), false,
                `${backendUrl}/api/schedules/tasks/byRole/${selectedSupervisorRoleName}/scheduleShortInfo/week?from=${format(nonStandardStartDate, 'dd-MM-yyyy')}&to=${format(nonStandardEndDate, 'dd-MM-yyyy')}`, 'GET');
        }
    }

    const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedRoleName = event.target.value;
        if (!selectedRoleName) {
            setScheduleShortInfoForTasksByRoles([]);
            setSelectedSupervisorRoleName(null)
        } else {
            setSelectedSupervisorRoleName(selectedRoleName);
            let targetUrl;
            if(showStandardDateSelector) {
                targetUrl = `${backendUrl}/api/schedules/tasks/byRole/${selectedRoleName}/scheduleShortInfo/week?from=${format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}&to=${format(endOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}`
            } else {
                targetUrl = `${backendUrl}/api/schedules/tasks/byRole/${selectedRoleName}/scheduleShortInfo/week?from=${format(nonStandardStartDate, 'dd-MM-yyyy')}&to=${format(nonStandardEndDate, 'dd-MM-yyyy')}`
            }
            fetchScheduleByTasksByRoles(null, (data) => setScheduleShortInfoForTasksByRoles(data), false,
                targetUrl, 'GET');
        }
    }

    const renderUsersSchedule = () => {
        if(loading) return <LoadingSpinner />;
        if(error) return <AlertBox text={error} type="danger" width={'500px'} />;

        return (
            <>
                <div className={"d-flex justify-content-center"}>
                    <button className="btn btn-dark" type="button" data-bs-toggle="collapse"
                            data-bs-target="#collapseUsersSchedule" aria-expanded="false" aria-controls="collapseUsersSchedule" onClick={() => {changeTableState("collapseUsersSchedule")}}>
                        <FontAwesomeIcon icon={isTableOpened.get("collapseUsersSchedule") ? faChevronUp : faChevronDown}/>
                        {isTableOpened.get("collapseUsersSchedule") ? " Ukryj harmonogram " : " Pokaż harmonogram "}
                        <FontAwesomeIcon icon={isTableOpened.get("collapseUsersSchedule") ? faChevronUp : faChevronDown}/>
                    </button>
                </div>
                <div className="collapse" id="collapseUsersSchedule">
                    <div className="d-flex justify-content-center">
                        <div className="table-responsive" style={{maxWidth: '600px'}}>
                            <table className="table table-hover table-striped table-rounded table-shadow mb-0">
                                <thead className="table-dark">
                                <tr>
                                    <th>Brat</th>
                                    <th>Oficjum</th>
                                </tr>
                                </thead>
                                <tbody>
                                {scheduleShortInfo.map(scheduleShortInfo => (
                                    <tr key={scheduleShortInfo.userId}>
                                        <td>{scheduleShortInfo.userName} {scheduleShortInfo.userSurname}</td>
                                        <td>
                                            {scheduleShortInfo?.tasksInfoStrings.map((task, index) => {
                                                const [taskName, days] = task.split(' (');
                                                if (days) {
                                                    return (
                                                        <React.Fragment key={task}>
                                                            {index !== 0 && ', '}
                                                            <strong>{taskName}</strong> ({days}
                                                        </React.Fragment>
                                                    );
                                                } else {
                                                    return (
                                                        <React.Fragment key={task}>
                                                            {index !== 0 && ', '}
                                                            <strong>{taskName}</strong>
                                                        </React.Fragment>
                                                    );
                                                }
                                            })}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    const renderTasksScheduleByRole = () => {
        if(loadingFetchScheduleByTasksByRoles || loadingSupervisorRoles) return <LoadingSpinner />;
        if(errorFetchScheduleByTasksByRoles || errorFetchSupervisorRoles) return <AlertBox text={errorFetchScheduleByTasksByRoles || errorFetchSupervisorRoles} type="danger" width={'500px'} />;

        return (
            <>
                <div className={"d-flex justify-content-center"}>
                    <button className="btn btn-dark" type="button" data-bs-toggle="collapse"
                            data-bs-target="#collapseTasksScheduleByRole" aria-expanded="false" aria-controls="collapseTasksScheduleByRole" onClick={() => {changeTableState("collapseTasksScheduleByRole")}}
                            disabled={selectedSupervisorRoleName == null}
                    >
                        <FontAwesomeIcon icon={isTableOpened.get("collapseTasksScheduleByRole") ? faChevronUp : faChevronDown}/>
                        {isTableOpened.get("collapseTasksScheduleByRole") ? " Ukryj harmonogram " : " Pokaż harmonogram "}
                        <FontAwesomeIcon icon={isTableOpened.get("collapseTasksScheduleByRole") ? faChevronUp : faChevronDown}/>
                    </button>
                </div>
                <div className="collapse" id="collapseTasksScheduleByRole">
                    <div className="d-flex justify-content-center">
                        <div className="table-responsive" style={{maxWidth: '600px'}}>
                            <table className="table table-hover table-striped table-rounded table-shadow mb-0">
                                <thead className="table-dark">
                                <tr>
                                    <th>Oficjum</th>
                                    <th>Bracia</th>
                                </tr>
                                </thead>
                                <tbody>
                                {scheduleShortInfoForTasksByRoles.map(scheduleShortInfoForTaskByRole => (
                                    <tr key={scheduleShortInfoForTaskByRole.taskId}>
                                        <td>{scheduleShortInfoForTaskByRole.taskName}</td>
                                        <td>
                                            {scheduleShortInfoForTaskByRole.usersInfoStrings.map((userInfoString, index) => {
                                                const [userName, tasks] = userInfoString.split(' (');
                                                return (
                                                    <div key={index}>
                                                        <React.Fragment key={index}>
                                                            <strong>{userName}</strong> ({tasks}
                                                        </React.Fragment>
                                                    </div>
                                                );
                                            })}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    const renderTasksSchedule = () => {
        if(loadingFetchScheduleByTasks) return <LoadingSpinner />;
        if(errorFetchScheduleByTasks) return <AlertBox text={errorFetchScheduleByTasks} type="danger" width={'500px'} />;

        return (
            <>
                <div className={"d-flex justify-content-center"}>
                    <button className="btn btn-dark" type="button" data-bs-toggle="collapse"
                            data-bs-target="#collapseTasksSchedule" aria-expanded="false" aria-controls="collapseTasksSchedule" onClick={() => {changeTableState("collapseTasksSchedule")}}
                    >
                        <FontAwesomeIcon icon={isTableOpened.get("collapseTasksSchedule") ? faChevronUp : faChevronDown}/>
                        {isTableOpened.get("collapseTasksSchedule") ? " Ukryj harmonogram " : " Pokaż harmonogram "}
                        <FontAwesomeIcon icon={isTableOpened.get("collapseTasksSchedule") ? faChevronUp : faChevronDown}/>
                    </button>
                </div>
                <div className="collapse" id="collapseTasksSchedule">
                    <div className="d-flex justify-content-center">
                        <div className="table-responsive" style={{maxWidth: '600px'}}>
                            <table className="table table-hover table-striped table-rounded table-shadow mb-0">
                                <thead className="table-dark">
                                <tr>
                                    <th>Oficjum</th>
                                    <th>Bracia</th>
                                </tr>
                                </thead>
                                <tbody>
                                {scheduleShortInfoForTasks.map(scheduleShortInfoForTask => (
                                    <tr key={scheduleShortInfoForTask.taskId}>
                                        <td>{scheduleShortInfoForTask.taskName}</td>
                                        <td>
                                            {scheduleShortInfoForTask.usersInfoStrings.map((userInfoString, index) => {
                                                const [userName, tasks] = userInfoString.split(' (');
                                                return (
                                                    <div key={index}>
                                                        <React.Fragment key={index}>
                                                            <strong>{userName}</strong> ({tasks}
                                                        </React.Fragment>
                                                    </div>
                                                );
                                            })}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    const renderNonStandardDateSelector = () => {
        return (
            <>
            {nonStandardDateValidationError && <AlertBox text={nonStandardDateValidationError} type="danger" width={'500px'} />}
            <div className="d-flex justify-content-center">
                <div className="card my-3">
                    <div className="card-body">
                        <div className="d-flex justify-content-between mb-2">
                            <h5 className="card-title mx-2">
                                Początek:
                            </h5>
                            <button className="btn btn-outline-dark mx-2" onClick={() => setShowPopupDatePickerForStart(true)}>
                                {format(nonStandardStartDate, 'dd-MM-yyyy')}
                            </button>
                            {showPopupDatePickerForStart &&
                                <PopupDatePicker selectedDate={nonStandardStartDate} onDateChange={setNonStandardStartDate}
                                                 handleCloseCalendar={() => setShowPopupDatePickerForStart(false)}/>
                            }
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <h5 className="card-title mx-2">
                                Koniec:
                            </h5>
                            <button className="btn btn-outline-dark mx-2" onClick={() => setShowPopupDatePickerForEnd(true)}>
                                {format(nonStandardEndDate, 'dd-MM-yyyy')}
                            </button>
                            {showPopupDatePickerForEnd && <PopupDatePicker selectedDate={nonStandardEndDate} onDateChange={setNonStandardEndDate}
                                                                     handleCloseCalendar={() => setShowPopupDatePickerForEnd(false)}/>
                            }
                        </div>
                        <div className="d-flex justify-content-center">
                            <button className="btn btn-success" onClick={() => {handleFetchScheduleByNonStandardDate()}}>
                                Wyszukaj
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            </>
        )
    }


    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <button className="btn btn-info mt-3" onClick={() => {
                    navigate("/schedule/by-days")
                }}>
                    <span><FontAwesomeIcon icon={faArrowsRotate}/> </span>
                    Zmień na harmonogram według dni
                </button>
            </div>

            {showStandardDateSelector ? (<WeekSelector currentWeek={currentWeek}
                                                       setCurrentWeek={setCurrentWeek}/>) : renderNonStandardDateSelector()}
            <div className="d-flex justify-content-center">
                <button className="btn btn-primary mt-0 mb-3" onClick={() => {
                    if (!showStandardDateSelector) {
                        // We are switching to standard date selector,
                        // so we have to refresh the data
                        setStandardDateRefresher(!standardDateRefresher);
                    } else {
                        // We are switching to non-standard date selector,
                        // so we have to erase all data.
                        setScheduleShortInfo([]);
                        setScheduleShortInfoForTasks([]);
                        setScheduleShortInfoForTasksByRoles([]);
                    }
                    setShowStandardDateSelector(!showStandardDateSelector);
                }}><span><FontAwesomeIcon icon={faArrowsRotate}/> </span>
                    {showStandardDateSelector ? 'Zmień na datę niestandardową' : 'Zmień na datę standardową'}
                </button>
            </div>
            <div className="d-flex justify-content-center">
                <button className="btn btn-success"
                        onClick={() => navigate("/pdf/non-standard", showStandardDateSelector ? {
                            state: {
                                startDate: startOfWeek(currentWeek, {weekStartsOn: 0}),
                                endDate: endOfWeek(currentWeek, {weekStartsOn: 0})
                            }
                        } : {state: {startDate: nonStandardStartDate, endDate: nonStandardEndDate}})}>
                    <span><FontAwesomeIcon icon={faRightToBracket}/> </span>
                    Niestandardowy wydruk wielu roli
                </button>
            </div>

            <div className="d-flex justify-content-center">
                <h4 className="entity-header-dynamic-size my-2">Harmonogram według braci</h4>
            </div>
            {errorDownloadSchedulePdfForUsers &&
                <AlertBox text={errorDownloadSchedulePdfForUsers} type="danger" width={'500px'}/>}
            <div className="text-center">
                <button className="btn btn-success my-2" onClick={downloadSchedulePdfForUsers}
                        disabled={loadingDownloadSchedulePdfForUsers}>
                    <span>Pobierz harmonogram według braci </span>
                    {loadingDownloadSchedulePdfForUsers &&
                        <span className="spinner-border spinner-border-sm"></span>}
                </button>
            </div>
            {renderUsersSchedule()}

            <div className="d-flex justify-content-center">
                <h4 className="entity-header-dynamic-size mb-2 mt-4">Harmonogram według roli</h4>
            </div>
            <div className="d-flex justify-content-center mb-1">
                <select className="form-select w-100" style={{maxWidth: '350px'}} onChange={handleRoleChange}>
                    <option value="">Wybierz rolę</option>
                    {supervisorRoles.map(role => (
                        <option key={role.name} value={role.name}>{role.name}</option>
                    ))}
                </select>
            </div>
            {errorDownloadSchedulePdfForTasksByRole &&
                <AlertBox text={errorDownloadSchedulePdfForTasksByRole} type="danger" width={'500px'}/>}
            <div className="text-center">
                <button className="btn btn-success my-2" onClick={downloadSchedulePdfForTasksByRole}
                        disabled={selectedSupervisorRoleName == null || loadingDownloadSchedulePdfForTasksByRole}>
                    <span>Pobierz harmonogram według roli </span>
                    {loadingDownloadSchedulePdfForTasksByRole &&
                        <span className="spinner-border spinner-border-sm"></span>}
                </button>
            </div>
            {renderTasksScheduleByRole()}

            <div className="d-flex justify-content-center">
                <h4 className="entity-header-dynamic-size mb-2 mt-4">Harmonogram według wszystkich zadań</h4>
            </div>
            {errorDownloadSchedulePdfForTasks &&
                <AlertBox text={errorDownloadSchedulePdfForTasks} type="danger" width={'500px'}/>}
            <div className="text-center">
                <button className="btn btn-success my-2" onClick={downloadSchedulePdfForTasks}
                        disabled={loadingDownloadSchedulePdfForTasks}>
                    <span>Pobierz harmonogram według oficjów </span>
                    {loadingDownloadSchedulePdfForTasks &&
                        <span className="spinner-border spinner-border-sm"></span>}
                </button>
            </div>
            {renderTasksSchedule()}
        </div>
    );
}

export default SchedulePage;
