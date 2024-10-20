import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';

import {
    useGroupedScheduleShortInfo,
    useScheduleShortInfo,
    useScheduleShortInfoForTasks,
    useScheduleShortInfoForTasksByRole,
    useSupervisorRoles,
    useRolesVisibleInPrints,
} from './hooks/useScheduleData';

import useIsFunkcyjny from '../../../../services/UseIsFunkcyjny';

import WeekSelector from '../../../../components/WeekSelector';
import LoadingSpinner from '../../../../components/LoadingScreen';
import AlertBox from '../../../../components/AlertBox';
import PopupDatePicker from '../../../specialDate/PopupDatePicker';

import UsersGroupedTasksScheduleTable from './components/tables/UsersGroupedTasksScheduleTable';
// Import other table components similarly

import { backendUrl } from '../../../../utils/constants';
import { downloadPdf } from './utils/downloadPdf';
import NonStandardDateSelector from "./components/NonStandardDateSelector";
import TasksScheduleTable from "./components/tables/TasksScheduleTable";

function SchedulePage() {
    const navigate = useNavigate();
    const { isFunkcyjny } = useIsFunkcyjny();

    // State variables
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [showStandardDateSelector, setShowStandardDateSelector] = useState<boolean>(true);

    // State for non-standard date selector
    const [nonStandardStartDate, setNonStandardStartDate] = useState<Date>(new Date());
    const [nonStandardEndDate, setNonStandardEndDate] = useState<Date>(new Date());
    const [nonStandardDateValidationError, setNonStandardDateValidationError] = useState<string | null>(null);

    const [selectedSupervisorRoleName, setSelectedSupervisorRoleName] = useState<string | null>(null);

    // Opened state for tables
    const [isGroupedTasksScheduleOpened, setIsGroupedTasksScheduleOpened] = useState(false);
    const [isTasksScheduleOpened, setIsTasksScheduleOpened] = useState(false);
    // Similar state for other tables

    // Date range
    const fromDate = showStandardDateSelector ? startOfWeek(currentWeek, { weekStartsOn: 0 }) : nonStandardStartDate;
    const toDate = showStandardDateSelector ? endOfWeek(currentWeek, { weekStartsOn: 0 }) : nonStandardEndDate;

    // Convert dates to strings
    const fromDateString = format(fromDate, 'dd-MM-yyyy');
    const toDateString = format(toDate, 'dd-MM-yyyy');

    // Data fetching using custom hooks
    const {
        data: groupedScheduleShortInfo,
        error: groupedScheduleError,
        loading: groupedScheduleLoading,
    } = useGroupedScheduleShortInfo(fromDateString, toDateString);
    const {
        data: scheduleShortInfo,
        error: scheduleError,
        loading: scheduleLoading,
    } = useScheduleShortInfo(fromDateString, toDateString);
    const {
        data: scheduleShortInfoForTasks,
        error: tasksScheduleError,
        loading: tasksScheduleLoading,
    } = useScheduleShortInfoForTasks(fromDateString, toDateString);
    const {
        data: supervisorRoles,
        error: supervisorRolesError,
        loading: supervisorRolesLoading,
    } = useSupervisorRoles();
    const {
        data: rolesVisibleInPrints,
        error: rolesVisibleInPrintsError,
        loading: rolesVisibleInPrintsLoading,
    } = useRolesVisibleInPrints();

    const {
        data: scheduleShortInfoForTasksByRoles,
        error: tasksByRoleError,
        loading: tasksByRoleLoading,
    } = useScheduleShortInfoForTasksByRole(selectedSupervisorRoleName, fromDateString, toDateString);

    // Download PDF state variables
    const [loadingDownloadSchedulePdfForUsers, setLoadingDownloadSchedulePdfForUsers] = useState<boolean>(false);
    const [errorDownloadSchedulePdfForUsers, setErrorDownloadSchedulePdfForUsers] = useState<string | null>(null);

    const [loadingDownloadSchedulePdfForTasks, setLoadingDownloadSchedulePdfForTasks] = useState<boolean>(false);
    const [errorDownloadSchedulePdfForTasks, setErrorDownloadSchedulePdfForTasks] = useState<string | null>(null);

    // Similar state variables for other PDFs

    // Functions for toggling table visibility
    const toggleGroupedTasksSchedule = () => setIsGroupedTasksScheduleOpened(!isGroupedTasksScheduleOpened);
    const toggleTasksSchedule = () => setIsTasksScheduleOpened(!isTasksScheduleOpened);
    // Similar toggle functions for other tables

    // Handle role change
    const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSupervisorRoleName(event.target.value || null);
    };

    // Validate non-standard date range
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
    };

    // Handle fetching schedule for non-standard date
    const handleFetchScheduleByNonStandardDate = () => {
        if (!validateNonStandardDate()) return;
        // Data fetching is automatically handled by hooks due to dependency changes
    };

    // Functions for downloading PDFs
    const downloadSchedulePdfForUsers = async () => {
        let targetUrl = `${backendUrl}/api/pdf/schedules/users/groupedTasksByRoles/week?from=${fromDateString}&to=${toDateString}`;
        const filename = `Harmonogram_bracia_${fromDateString}-${toDateString}.pdf`;
        await downloadPdf(targetUrl, filename, setErrorDownloadSchedulePdfForUsers, setLoadingDownloadSchedulePdfForUsers);
    };

    const downloadSchedulePdfForTasks = async () => {
        let targetUrl = `${backendUrl}/api/pdf/schedules/tasks/scheduleShortInfo/week?from=${fromDateString}&to=${toDateString}`;
        const filename = `Harmonogram_oficja_${fromDateString}-${toDateString}.pdf`;
        await downloadPdf(targetUrl, filename, setErrorDownloadSchedulePdfForTasks, setLoadingDownloadSchedulePdfForTasks);
    };

    // Similar functions for other PDFs

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <button className="btn btn-info mt-3" onClick={() => navigate('/schedule/by-days')}>
          <span>
            <FontAwesomeIcon icon={faArrowsRotate}/>{' '}
          </span>
                    Zmień na harmonogram według dni
                </button>
            </div>

            {showStandardDateSelector ? (
                <WeekSelector currentWeek={currentWeek} setCurrentWeek={setCurrentWeek}/>
            ) : (
                <NonStandardDateSelector
                    nonStandardStartDate={nonStandardStartDate}
                    setNonStandardStartDate={setNonStandardStartDate}
                    nonStandardEndDate={nonStandardEndDate}
                    setNonStandardEndDate={setNonStandardEndDate}
                    onFetchSchedule={handleFetchScheduleByNonStandardDate}
                    validationError={nonStandardDateValidationError}
                />
            )}

            <div className="d-flex justify-content-center">
                <button
                    className="btn btn-primary mt-0 mb-3"
                    onClick={() => {
                        setShowStandardDateSelector(!showStandardDateSelector);
                        if (showStandardDateSelector) {
                            // Reset non-standard date-related state when switching to standard
                            setNonStandardStartDate(new Date());
                            setNonStandardEndDate(new Date());
                            setNonStandardDateValidationError(null);
                        }
                    }}
                >
          <span>
            <FontAwesomeIcon icon={faArrowsRotate}/>{' '}
          </span>
                    {showStandardDateSelector ? 'Zmień na datę niestandardową' : 'Zmień na datę standardową'}
                </button>
            </div>

            {/* Render Tables and Download Buttons */}
            {/* Example: */}
            <div className="d-flex justify-content-center">
                <h4 className="entity-header-dynamic-size my-2">Harmonogram według braci</h4>
            </div>
            {errorDownloadSchedulePdfForUsers && (
                <AlertBox text={errorDownloadSchedulePdfForUsers} type="danger" width="500px"/>
            )}
            <UsersGroupedTasksScheduleTable
                data={groupedScheduleShortInfo || []}
                roles={rolesVisibleInPrints || []}
                loading={groupedScheduleLoading || rolesVisibleInPrintsLoading}
                error={groupedScheduleError || rolesVisibleInPrintsError}
                isOpen={isGroupedTasksScheduleOpened}
                toggle={toggleGroupedTasksSchedule}
            />
            <div className="text-center">
                <button
                    className="btn btn-success my-2"
                    onClick={downloadSchedulePdfForUsers}
                    disabled={loadingDownloadSchedulePdfForUsers}
                >
                    <span>Pobierz harmonogram według braci </span>
                    {loadingDownloadSchedulePdfForUsers && <span className="spinner-border spinner-border-sm"></span>}
                </button>
            </div>

            <div className="d-flex justify-content-center">
                <h4 className="entity-header-dynamic-size my-2">Harmonogram według oficjów</h4>
            </div>
            {errorDownloadSchedulePdfForTasks && (
                <AlertBox text={errorDownloadSchedulePdfForTasks} type="danger" width="500px"/>
            )}
            <TasksScheduleTable
                data={scheduleShortInfoForTasks || []}
                loading={tasksScheduleLoading}
                error={tasksScheduleError}
                isOpen={isTasksScheduleOpened}
                toggle={toggleTasksSchedule}
            />
            <div className="text-center">
                <button
                    className="btn btn-success my-2"
                    onClick={downloadSchedulePdfForTasks}
                    disabled={loadingDownloadSchedulePdfForTasks}
                >
                    <span>Pobierz harmonogram według oficjów </span>
                    {loadingDownloadSchedulePdfForTasks && <span className="spinner-border spinner-border-sm"></span>}
                </button>
            </div>

            {/* Similar sections for other tables and PDFs */}
        </div>
    );
}

export default SchedulePage;