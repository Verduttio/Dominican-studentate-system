import React, { useEffect, useState } from 'react';
import useHttp from '../../../services/UseHttp';
import {
    Role,
    UserSchedulesOnDaysDTO
} from '../../../models/Interfaces';
import {backendUrl} from "../../../utils/constants";
import axios, {AxiosError} from "axios";
import {useNavigate} from "react-router-dom";
import WeekSelector from "../../../components/WeekSelector";
import {endOfWeek, format, startOfWeek} from "date-fns";
import LoadingSpinner from "../../../components/LoadingScreen";
import AlertBox from "../../../components/AlertBox";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowsRotate, faChevronDown, faChevronUp} from "@fortawesome/free-solid-svg-icons";
import PopupDatePicker from "../../specialDate/PopupDatePicker";
import {daysOfWeekAbbreviation, daysOrder} from "../../../models/DayOfWeek";


function SchedulePageByDays() {
    const [usersSchedule, setUsersSchedule] = useState<UserSchedulesOnDaysDTO[]>([]);
    const [usersScheduleByTaskSupervisorRole, setUsersScheduleByTaskSupervisorRole] = useState<UserSchedulesOnDaysDTO[]>([]);
    const [supervisorRoles, setSupervisorRoles] = useState<Role[]>([]);
    const [selectedSupervisorRoleName, setSelectedSupervisorRoleName] = useState<string | null>(null);
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const { request: fetchSchedule, error, loading} = useHttp();
    const { request: fetchScheduleByTasksByRoles, error: errorFetchScheduleByTasksByRoles, loading: loadingFetchScheduleByTasksByRoles} = useHttp();
    const { request: fetchSupervisorRoles, error: errorFetchSupervisorRoles, loading: loadingSupervisorRoles } = useHttp();
    const navigate = useNavigate();
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
        fetchSchedule(null, (data) => {
            const newData = data.map((user : UserSchedulesOnDaysDTO) => ({
                ...user,
                schedules: new Map(Object.entries(user.schedules))
            }));
            setUsersSchedule(newData);
        }, false, `${backendUrl}/api/schedules/users/days?from=${format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}&to=${format(endOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}`, 'GET');
        fetchSupervisorRoles(null, (data: Role[]) => setSupervisorRoles(data), false, `${backendUrl}/api/roles/types/SUPERVISOR`, 'GET');
    }, [fetchSchedule, fetchSupervisorRoles, standardDateRefresher, currentWeek]);

    useEffect(() => {
        if (selectedSupervisorRoleName && showStandardDateSelector) {
            fetchScheduleByTasksByRoles(null, (data) => {
                    const newData = data.map((user : UserSchedulesOnDaysDTO) => ({
                        ...user,
                        schedules: new Map(Object.entries(user.schedules))
                    }));
                    setUsersScheduleByTaskSupervisorRole(newData);
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

        fetchSchedule(null, (data) => {
            const newData = data.map((user : UserSchedulesOnDaysDTO) => ({
                ...user,
                schedules: new Map(Object.entries(user.schedules))
            }));
                setUsersSchedule(newData)
        }, false,
            `${backendUrl}/api/schedules/users/days?from=${format(nonStandardStartDate, 'dd-MM-yyyy')}&to=${format(nonStandardEndDate, 'dd-MM-yyyy')}`, 'GET');
        if(selectedSupervisorRoleName) {
            fetchScheduleByTasksByRoles(null, (data) => {
                const newData = data.map((user : UserSchedulesOnDaysDTO) => ({
                    ...user,
                    schedules: new Map(Object.entries(user.schedules))
                }));
                    setUsersScheduleByTaskSupervisorRole(newData)
            }, false,
                `${backendUrl}/api/schedules/byRole/${selectedSupervisorRoleName}/users/days?from=${format(nonStandardStartDate, 'dd-MM-yyyy')}&to=${format(nonStandardEndDate, 'dd-MM-yyyy')}`, 'GET');
        }
    }

    const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedRoleName = event.target.value;
        if (!selectedRoleName) {
            setUsersScheduleByTaskSupervisorRole([]);
            setSelectedSupervisorRoleName(null)
        } else {
            setSelectedSupervisorRoleName(selectedRoleName);
            let targetUrl;
            if(showStandardDateSelector) {
                targetUrl = `${backendUrl}/api/schedules/byRole/${selectedRoleName}/users/days?from=${format(startOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}&to=${format(endOfWeek(currentWeek, { weekStartsOn: 0 }), 'dd-MM-yyyy')}`
            } else {
                targetUrl = `${backendUrl}/api/schedules/byRole/${selectedRoleName}/users/days?from=${format(nonStandardStartDate, 'dd-MM-yyyy')}&to=${format(nonStandardEndDate, 'dd-MM-yyyy')}`
            }
            fetchScheduleByTasksByRoles(null, (data) => {
                const newData = data.map((user : UserSchedulesOnDaysDTO) => ({
                    ...user,
                    schedules: new Map(Object.entries(user.schedules))
                }));
                console.log(newData);
                console.log("selectedSupervisorRoleName: " + selectedSupervisorRoleName);
                console.log("selectedRoleName: + " + selectedRoleName);
                setUsersScheduleByTaskSupervisorRole(newData)
            }, false,
                targetUrl, 'GET');
        }
    }

    const renderUsersSchedule = () => {
        if(loading) return <LoadingSpinner />;
        if(error) return <AlertBox text={error} type="danger" width={'500px'} />;

        return (
            <>
                <div className={"d-flex justify-content-center"}>
                    <button className="btn btn-dark mb-1" type="button" onClick={() => {changeTableState("collapseUsersSchedule")}}
                    >
                        <FontAwesomeIcon icon={isTableOpened.get("collapseUsersSchedule") ? faChevronUp : faChevronDown}/>
                        {isTableOpened.get("collapseUsersSchedule") ? " Ukryj harmonogram " : " Pokaż "}
                        <FontAwesomeIcon icon={isTableOpened.get("collapseUsersSchedule") ? faChevronUp : faChevronDown}/>
                    </button>
                </div>
                <div style={{display: isTableOpened.get("collapseUsersSchedule") ? 'block' : 'none'}}>
                    <div className="d-flex-no-media-resize justify-content-center">
                        <div className="table-responsive-fit-content-height100vh">
                            <table className="table table-hover table-striped table-rounded table-shadow mb-0">
                                <thead className="table-dark sticky-top">
                                <tr>
                                    <th>Brat</th>
                                    {usersSchedule[0]?.schedules && Array.from(usersSchedule[0]?.schedules?.keys()).sort()
                                        .map(date => {
                                            const day = new Date(date);
                                            const englishDayOfWeek = daysOrder[day.getDay()];
                                            const polishAbbreviation = daysOfWeekAbbreviation[englishDayOfWeek];

                                            return (
                                                <th className="column-width-100" key={date}>
                                                    {polishAbbreviation}<br/>
                                                    {format(date, 'dd.MM.yyyy')}
                                                </th>
                                            );
                                        })}
                                </tr>
                                </thead>
                                <tbody>
                                {usersSchedule.map(userScheduleDTO => (
                                    <tr key={userScheduleDTO.userShortInfo.id}>
                                        <td>{userScheduleDTO.userShortInfo.name + " " + userScheduleDTO.userShortInfo.surname}</td>

                                        {Array.from(userScheduleDTO.schedules.keys()).sort().map(day => (
                                            <td className="column-width-100"
                                                key={day}>{userScheduleDTO.schedules.get(day)?.join(', ')}</td>
                                        ))}
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

    const renderUsersScheduleByTaskSupervisorRole = () => {
        if (loadingFetchScheduleByTasksByRoles || loadingSupervisorRoles) return <LoadingSpinner/>;
        if (errorFetchScheduleByTasksByRoles || errorFetchSupervisorRoles) return <AlertBox text={errorFetchScheduleByTasksByRoles || errorFetchSupervisorRoles} type="danger" width={'500px'} />;

        return (
            <>
                <div className={"d-flex justify-content-center"}>
                    <button className="btn btn-dark mb-1" type="button" onClick={() => {changeTableState("collapseUsersScheduleByTaskSupervisorRole")}}
                            disabled={selectedSupervisorRoleName == null}
                    >
                        <FontAwesomeIcon icon={isTableOpened.get("collapseUsersScheduleByTaskSupervisorRole") ? faChevronUp : faChevronDown}/>
                        {isTableOpened.get("collapseUsersScheduleByTaskSupervisorRole") ? " Ukryj harmonogram " : " Pokaż "}
                        <FontAwesomeIcon icon={isTableOpened.get("collapseUsersScheduleByTaskSupervisorRole") ? faChevronUp : faChevronDown}/>
                    </button>
                </div>
                <div style={{display: isTableOpened.get("collapseUsersScheduleByTaskSupervisorRole") ? 'block' : 'none'}}>
                    <div className="d-flex-no-media-resize justify-content-center">
                        <div className="table-responsive-fit-content-height100vh">
                            <table className="table table-hover table-striped table-rounded table-shadow mb-0">
                                <thead className="table-dark sticky-top">
                                <tr>
                                    <th>Brat</th>
                                    {usersScheduleByTaskSupervisorRole[0]?.schedules && Array.from(usersScheduleByTaskSupervisorRole[0]?.schedules?.keys()).sort()
                                        .map(day => {
                                            const date = new Date(day);
                                            const englishDayOfWeek = daysOrder[date.getDay()];
                                            const polishAbbreviation = daysOfWeekAbbreviation[englishDayOfWeek];

                                            return (
                                                <th className="column-width-100" key={day}>
                                                    {polishAbbreviation}<br/>
                                                    {format(day, 'dd.MM.yyyy')}
                                                </th>
                                            );
                                        })}
                                </tr>
                                </thead>
                                <tbody>
                                {usersScheduleByTaskSupervisorRole.map(userScheduleDTO => (
                                    <tr key={userScheduleDTO.userShortInfo.id}>
                                        <td>{userScheduleDTO.userShortInfo.name + " " + userScheduleDTO.userShortInfo.surname}</td>

                                        {Array.from(userScheduleDTO.schedules.keys()).sort().map(day => (
                                            <td className="column-width-100"
                                                key={day}>{userScheduleDTO.schedules.get(day)?.join(', ')}</td>
                                        ))}
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
                {nonStandardDateValidationError &&
                    <AlertBox text={nonStandardDateValidationError} type="danger" width={'500px'}/>}
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
                        setUsersSchedule([]);
                        setUsersScheduleByTaskSupervisorRole([]);
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
                <button className="btn btn-success my-2" onClick={downloadSchedulePdfForUsers}
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
                <button className="btn btn-success my-2" onClick={downloadSchedulePdfForUsersByTaskSupervisorRole}
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
