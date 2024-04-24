import React, { useEffect, useState } from 'react';
import useHttp from '../../services/UseHttp';
import {Role, Schedule, ScheduleShortInfo, ScheduleShortInfoForTask, User} from '../../models/Interfaces';
import {backendUrl} from "../../utils/constants";
import axios, {AxiosError} from "axios";
import {useNavigate} from "react-router-dom";
import WeekSelector from "../../components/WeekSelector";
import {endOfWeek, format, startOfWeek} from "date-fns";
import LoadingSpinner from "../../components/LoadingScreen";
import useIsFunkcyjny from "../../services/UseIsFunkcyjny";
import AlertBox from "../../components/AlertBox";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowsRotate} from "@fortawesome/free-solid-svg-icons";
import PopupDatePicker from "../specialDate/PopupDatePicker";


function SchedulePageByDays() {
    const [usersSchedule, setUsersSchedule] = useState<Map<User, Schedule[]>>(new Map<User, Schedule[]>());
    const [usersScheduleByTaskSupervisorRole, setUsersScheduleByTaskSupervisorRole] = useState<Map<User, Schedule[]>>(new Map<User, Schedule[]>());
    const [supervisorRoles, setSupervisorRoles] = useState<Role[]>([]);
    const [selectedSupervisorRoleName, setSelectedSupervisorRoleName] = useState<string | null>(null);
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const { request: fetchSchedule, error, loading} = useHttp();
    const { request: fetchScheduleByTasksByRoles, error: errorFetchScheduleByTasksByRoles, loading: loadingFetchScheduleByTasksByRoles} = useHttp();
    const { request: fetchSupervisorRoles, error: errorFetchSupervisorRoles, loading: loadingSupervisorRoles } = useHttp();
    const navigate = useNavigate();
    const { isFunkcyjny } = useIsFunkcyjny();
    const [loadingDownloadSchedulePdfForUsers, setLoadingDownloadSchedulePdfForUsers] = useState<boolean>(false);
    const [errorDownloadSchedulePdfForUsers, setErrorDownloadSchedulePdfForUsers] = useState<string | null>(null);
    const [loadingDownloadSchedulePdfForUsersByTaskSupervisorRole, setLoadingDownloadSchedulePdfForUsersByTaskSupervisorRole] = useState<boolean>(false);
    const [errorDownloadSchedulePdfForUsersByTaskSupervisorRole, setErrorDownloadSchedulePdfForUsersByTaskSupervisorRole] = useState<string | null>(null);

    const [showStandardDateSelector, setShowStandardDateSelector] = useState<boolean>(true);
    const [showPopupDatePickerForStart, setShowPopupDatePickerForStart] = useState<boolean>(false);
    const [showPopupDatePickerForEnd, setShowPopupDatePickerForEnd] = useState<boolean>(false);
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    const [nonStandardStartDate, setNonStandardStartDate] = useState<Date>(new Date(midnight));
    const [nonStandardEndDate, setNonStandardEndDate] = useState<Date>(new Date(midnight));
    const [nonStandardDateValidationError, setNonStandardDateValidationError] = useState<string | null>(null);
    const [standardDateRefresher, setStandardDateRefresher] = useState<boolean>(false);

    const convertToMap = (data: any): Map<User, Schedule[]> => {
        const map = new Map<User, Schedule[]>();
        data.forEach((item: { user: User; schedule: Schedule[] }) => {
            map.set(item.user, item.schedule);
        });
        return map;
    };

    useEffect(() => {
        fetchSchedule(null, (data) => {
            console.log(data);
            const scheduleMap = convertToMap(data);
            setUsersSchedule(scheduleMap);
        }, false, `${backendUrl}/api/schedules/users/days?from=${format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}&to=${format(endOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}`, 'GET');
        fetchSupervisorRoles(null, (data: Role[]) => setSupervisorRoles(data), false, `${backendUrl}/api/roles/types/SUPERVISOR`, 'GET');
    }, [fetchSchedule, fetchSupervisorRoles, standardDateRefresher, currentWeek]);

    useEffect(() => {
        if (selectedSupervisorRoleName && showStandardDateSelector) {
            fetchScheduleByTasksByRoles(null, (data) => {
                    const scheduleMap = convertToMap(data);
                    setUsersScheduleByTaskSupervisorRole(scheduleMap);
            }, false,
                `${backendUrl}/api/schedules/byRole/${selectedSupervisorRoleName}/users/days?from=${format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}&to=${format(endOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}`, 'GET');
        }
    }, [fetchScheduleByTasksByRoles, selectedSupervisorRoleName, currentWeek, standardDateRefresher, showStandardDateSelector]);

    async function downloadSchedulePdfForUsers() {
        setLoadingDownloadSchedulePdfForUsers(true);
        let targetUrl;
        if (showStandardDateSelector) {
            targetUrl = `${backendUrl}/api/pdf/schedules/users/days?from=${format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}&to=${format(endOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}`;
        } else {
            targetUrl = `${backendUrl}/api/pdf/schedules/users/days?from=${format(nonStandardStartDate, 'dd-MM-yyyy')}&to=${format(nonStandardEndDate, 'dd-MM-yyyy')}`;
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
            link.setAttribute('download', `Harmonogram_bracia_wzgledem_dni_${format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}-${format(endOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const serverError = err as AxiosError<{ message?: string }>;
                if (serverError && serverError.response) {
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

    async function downloadSchedulePdfForUsersByTaskSupervisorRole() {
        setLoadingDownloadSchedulePdfForUsersByTaskSupervisorRole(true);
        let targetUrl;
        if (showStandardDateSelector) {
            targetUrl = `${backendUrl}/api/pdf/schedules/byRole/${selectedSupervisorRoleName}/users/days?from=${format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}&to=${format(endOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}`;
        } else {
            targetUrl = `${backendUrl}/api/pdf/schedules/byRole/${selectedSupervisorRoleName}/users/days?from=${format(nonStandardStartDate, 'dd-MM-yyyy')}&to=${format(nonStandardEndDate, 'dd-MM-yyyy')}`;
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
            link.setAttribute('download', `Harmonogram_bracia_${selectedSupervisorRoleName}_wzgledem_dni_${format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}-${format(endOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const serverError = err as AxiosError<{ message?: string }>;
                if (serverError.response) {
                    setErrorDownloadSchedulePdfForUsersByTaskSupervisorRole('Błąd podczas pobierania PDF:' + serverError.response.data);
                } else {
                    setErrorDownloadSchedulePdfForUsersByTaskSupervisorRole('Problem z połączeniem sieciowym');
                }
            } else {
                setErrorDownloadSchedulePdfForUsersByTaskSupervisorRole('Nieoczekiwany błąd:' + err);
            }
        } finally {
            setLoadingDownloadSchedulePdfForUsersByTaskSupervisorRole(false);
        }
    }

    const validateNonStandardDate = () => {
        if (nonStandardStartDate > nonStandardEndDate) {
            setNonStandardDateValidationError('Data początkowa musi być przed datą końcową');
            return false;
        }

        setNonStandardDateValidationError('');
        return true;
    }

    const handleFetchScheduleByNonStandardDate = () => {
        if (!validateNonStandardDate()) return;

        fetchSchedule(null, (data) => setUsersSchedule(data), false,
            `${backendUrl}/api/schedules/users/days?from=${format(nonStandardStartDate, 'dd-MM-yyyy')}&to=${format(nonStandardEndDate, 'dd-MM-yyyy')}`, 'GET');
        if(selectedSupervisorRoleName) {
            fetchScheduleByTasksByRoles(null, (data) => setUsersScheduleByTaskSupervisorRole(data), false,
                `${backendUrl}/api/schedules/byRole/${selectedSupervisorRoleName}/users/days?from=${format(nonStandardStartDate, 'dd-MM-yyyy')}&to=${format(nonStandardEndDate, 'dd-MM-yyyy')}`, 'GET');
        }
    }

    const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedRoleName = event.target.value;
        if (!selectedRoleName) {
            setUsersScheduleByTaskSupervisorRole(new Map<User, Schedule[]>());
            setSelectedSupervisorRoleName(null)
        } else {
            setSelectedSupervisorRoleName(selectedRoleName);
            let targetUrl;
            if(showStandardDateSelector) {
                targetUrl = `${backendUrl}/api/schedules/byRole/${selectedSupervisorRoleName}/users/days?from=${format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}&to=${format(endOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}`
            } else {
                targetUrl = `${backendUrl}/api/schedules/byRole/${selectedSupervisorRoleName}/users/days?from=${format(nonStandardStartDate, 'dd-MM-yyyy')}&to=${format(nonStandardEndDate, 'dd-MM-yyyy')}`
            }
            fetchScheduleByTasksByRoles(null, (data) => setUsersScheduleByTaskSupervisorRole(data), false,
                targetUrl, 'GET');
        }
    }

    const renderUsersSchedule = () => {
        if(loading) return <LoadingSpinner />;
        if(error) return <AlertBox text={error} type="danger" width={'500px'} />;

        return (
            <div className="d-flex justify-content-center">
                <div className="table-responsive" style={{maxWidth: '600px'}}>
                    <table className="table table-hover table-striped table-rounded table-shadow mb-0">
                        <thead className="table-dark">
                        <tr>
                            <th>Brat</th>
                            {showStandardDateSelector ? (
                                // dates from current week
                                <>
                                    {Array.from({length: 7}, (_, i) => {
                                        const day = new Date(startOfWeek(currentWeek, { weekStartsOn: 0 }));
                                        day.setDate(day.getDate() + i);
                                        return (
                                            <th key={i}>{format(day, 'dd-MM-yyyy')}</th>
                                        )
                                    })}
                                    </>
                            ) : (
                                // dates from non-standard date
                                <th>Od {format(nonStandardStartDate, 'dd-MM-yyyy')} do {format(nonStandardEndDate, 'dd-MM-yyyy')}</th>
                            )}
                        </tr>
                        </thead>
                        <tbody>
                        {showStandardDateSelector ? (
                            Array.from(usersSchedule.keys()).map(user => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    {Array.from({length: 7}, (_, i) => {
                                        const day = new Date(startOfWeek(currentWeek, { weekStartsOn: 0 }));
                                        day.setDate(day.getDate() + i);
                                        const formattedDay = format(day, 'yyyy-MM-dd');
                                        const dailyTasks = usersSchedule.get(user)?.filter(schedule => schedule.date === formattedDay);
                                        return (
                                            <td key={i}>
                                                {dailyTasks?.map((schedule, index, array) => (
                                                    <div key={index} style={{
                                                        borderBottom: index === array.length - 1 ? 'none' : '1px solid black',
                                                        padding: '2px 0',
                                                    }}>
                                                        {schedule.task.name}
                                                    </div>
                                                ))}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))
                        ) : (
                            Array.from(usersSchedule.keys()).map(user => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td colSpan={7}>
                                        {usersSchedule.get(user)?.map((schedule, index, array) => (
                                            <div key={index} style={{
                                                borderBottom: index === array.length - 1 ? 'none' : '1px solid black',
                                                padding: '2px 0',
                                            }}>
                                                {schedule.task.name}
                                            </div>
                                        ))}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    const renderUsersScheduleByTaskSupervisorRole = () => {
        if(loadingFetchScheduleByTasksByRoles || loadingSupervisorRoles) return <LoadingSpinner />;
        if(errorFetchScheduleByTasksByRoles || errorFetchSupervisorRoles) return <AlertBox text={errorFetchScheduleByTasksByRoles || errorFetchSupervisorRoles} type="danger" width={'500px'} />;

        return (
            <div className="d-flex justify-content-center">
                {/*<div className="table-responsive" style={{maxWidth: '600px'}}>*/}
                {/*    <table className="table table-hover table-striped table-rounded table-shadow mb-0">*/}
                {/*        <thead className="table-dark">*/}
                {/*        <tr>*/}
                {/*            <th>Oficjum</th>*/}
                {/*            <th>Bracia</th>*/}
                {/*        </tr>*/}
                {/*        </thead>*/}
                {/*        <tbody>*/}
                {/*        {scheduleShortInfoForTasksByRoles.map(scheduleShortInfoForTaskByRole => (*/}
                {/*            <tr key={scheduleShortInfoForTaskByRole.taskId}>*/}
                {/*                <td>{scheduleShortInfoForTaskByRole.taskName}</td>*/}
                {/*                <td>*/}
                {/*                    {scheduleShortInfoForTaskByRole.usersInfoStrings.map((userInfoString, index) => (*/}
                {/*                        <div key={index}>{userInfoString}</div>*/}
                {/*                    ))}*/}
                {/*                </td>*/}
                {/*            </tr>*/}
                {/*        ))}*/}
                {/*        </tbody>*/}
                {/*    </table>*/}
                {/*</div>*/}
            </div>
        )
    }

    const renderNonStandardDateSelector = () => {
        return (
            <>
                {nonStandardDateValidationError && <AlertBox text={nonStandardDateValidationError} type="danger" width={'500px'} />}
                <div className="d-flex justify-content-center">
                    <div className="card my-3">
                        <div className="card-body">
                            <p className="card-title text-center">Tutaj zakres może być dowolny ( {">"} 7 dni )</p>
                            <div className="d-flex justify-content-between mb-2">
                                <h5 className="card-title mx-2">
                                    Początek:
                                </h5>
                                <button className="btn btn-outline-dark mx-2"
                                        onClick={() => setShowPopupDatePickerForStart(true)}>
                                    {format(nonStandardStartDate, 'dd-MM-yyyy')}
                                </button>
                                {showPopupDatePickerForStart &&
                                    <PopupDatePicker selectedDate={nonStandardStartDate}
                                                     onDateChange={setNonStandardStartDate}
                                                     handleCloseCalendar={() => setShowPopupDatePickerForStart(false)}/>
                                }
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <h5 className="card-title mx-2">
                                    Koniec:
                                </h5>
                                <button className="btn btn-outline-dark mx-2"
                                        onClick={() => setShowPopupDatePickerForEnd(true)}>
                                    {format(nonStandardEndDate, 'dd-MM-yyyy')}
                                </button>
                                {showPopupDatePickerForEnd && <PopupDatePicker selectedDate={nonStandardEndDate}
                                                                               onDateChange={setNonStandardEndDate}
                                                                               handleCloseCalendar={() => setShowPopupDatePickerForEnd(false)}/>
                                }
                            </div>
                            <div className="d-flex justify-content-center">
                                <button className="btn btn-success" onClick={() => {
                                    handleFetchScheduleByNonStandardDate()
                                }}>
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
                    navigate("/schedule")
                }}>
                    <span><FontAwesomeIcon icon={faArrowsRotate}/> </span>
                    Zmień na harmonogram według braci i oficjów
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
                        setUsersSchedule(new Map<User, Schedule[]>());
                        setUsersScheduleByTaskSupervisorRole(new Map<User, Schedule[]>());
                    }
                    setShowStandardDateSelector(!showStandardDateSelector);
                }}><span><FontAwesomeIcon icon={faArrowsRotate}/> </span>
                    {showStandardDateSelector ? 'Zmień na datę niestandardową' : 'Zmień na datę standardową'}
                </button>
            </div>
            <div className="d-flex justify-content-center">
                <h4 className="entity-header-dynamic-size mb-2 mt-0">Harmonogram według braci</h4>
            </div>
            {renderUsersSchedule()}
            {errorDownloadSchedulePdfForUsers &&
                <AlertBox text={errorDownloadSchedulePdfForUsers} type="danger" width={'500px'}/>}
            <div className="text-center">
                <button className="btn btn-success mt-2" onClick={downloadSchedulePdfForUsers}
                        disabled={loadingDownloadSchedulePdfForUsers}>
                    <span>Pobierz harmonogram według braci </span>
                    {loadingDownloadSchedulePdfForUsers &&
                        <span className="spinner-border spinner-border-sm"></span>}
                </button>
            </div>

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
            {renderUsersScheduleByTaskSupervisorRole()}
            {errorDownloadSchedulePdfForUsersByTaskSupervisorRole &&
                <AlertBox text={errorDownloadSchedulePdfForUsersByTaskSupervisorRole} type="danger" width={'500px'}/>}
            <div className="text-center">
                <button className="btn btn-success mt-2" onClick={downloadSchedulePdfForUsersByTaskSupervisorRole}
                        disabled={selectedSupervisorRoleName == null || loadingDownloadSchedulePdfForUsersByTaskSupervisorRole}>
                    <span>Pobierz harmonogram według roli względem dni tygodnia </span>
                    {loadingDownloadSchedulePdfForUsersByTaskSupervisorRole &&
                        <span className="spinner-border spinner-border-sm"></span>}
                </button>
            </div>
        </div>
    );
}

export default SchedulePageByDays;
