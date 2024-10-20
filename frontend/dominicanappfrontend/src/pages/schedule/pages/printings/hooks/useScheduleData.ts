import { backendUrl } from '../../../../../utils/constants';
import useFetchData from './useFetchData';
import {
    GroupedScheduleShortInfo,
    ScheduleShortInfo,
    ScheduleShortInfoForTask,
    Role,
} from '../../../../../models/Interfaces';

export const useGroupedScheduleShortInfo = (fromDateString: string, toDateString: string) => {
    const url = `${backendUrl}/api/schedules/users/groupedScheduleShortInfo/week?from=${fromDateString}&to=${toDateString}`;
    const { data, error, loading } = useFetchData<GroupedScheduleShortInfo[]>(url);

    // Transform the data if it exists
    const transformedData = data
        ? data.map((info) => ({
            ...info,
            groupedTasksInfoStrings: new Map<string, string[]>(
                Object.entries(info.groupedTasksInfoStrings)
            ),
        }))
        : null;

    return { data: transformedData, error, loading };
};

export const useScheduleShortInfo = (fromDateString: string, toDateString: string) => {
    const url = `${backendUrl}/api/schedules/users/scheduleShortInfo/week?from=${fromDateString}&to=${toDateString}`;
    return useFetchData<ScheduleShortInfo[]>(url);
};

export const useScheduleShortInfoForTasks = (fromDateString: string, toDateString: string) => {
    const url = `${backendUrl}/api/schedules/tasks/scheduleShortInfo/week?from=${fromDateString}&to=${toDateString}`;
    return useFetchData<ScheduleShortInfoForTask[]>(url);
};

export const useSupervisorRoles = () => {
    const url = `${backendUrl}/api/roles/types/SUPERVISOR`;
    return useFetchData<Role[]>(url);
};

export const useRolesVisibleInPrints = () => {
    const url = `${backendUrl}/api/roles?areTasksVisibleInPrints=true`;
    return useFetchData<Role[]>(url);
};

export const useScheduleShortInfoForTasksByRole = (
    roleName: string | null,
    fromDateString: string,
    toDateString: string
) => {
    const url = roleName
        ? `${backendUrl}/api/schedules/tasks/byRole/${roleName}/scheduleShortInfo/week?from=${fromDateString}&to=${toDateString}`
        : null;
    return useFetchData<ScheduleShortInfoForTask[]>(url);
};
