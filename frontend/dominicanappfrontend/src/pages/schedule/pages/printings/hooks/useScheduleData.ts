import { useState, useEffect } from 'react'; // Dodane importy
import { backendUrl } from '../../../../../utils/constants';
import useFetchData from './useFetchData';
import useHttp from '../../../../../services/UseHttp';
import {
    GroupedScheduleShortInfo,
    ScheduleShortInfo,
    ScheduleShortInfoForTask,
    Role,
} from '../../../../../models/Interfaces';

// --- STAŁE DLA "LITURGICZNE+" ---
const LITURGICAL_PLUS_KEY = "LITURGICAL_PLUS";
// Pamiętaj: Tutaj muszą być DOKŁADNE nazwy z Twojej bazy danych!
const LITURGICAL_GROUP_ROLES = ["Liturgista", "Kantor gregoriański", "Kantor"];

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
    // ZMIANA: Używamy <any>, żeby request() przyjął naszą listę stringów (body),
    // a typowanie odpowiedzi zapewniamy w useState poniżej.
    const { request, loading, error } = useHttp<any>();

    // Tutaj pilnujemy, że dane to tablica zadań
    const [data, setData] = useState<ScheduleShortInfoForTask[] | null>(null);

    useEffect(() => {
        if (!roleName) {
            setData(null);
            return;
        }

        // SCENARIUSZ 1: Liturgiczne+ (POST)
        if (roleName === LITURGICAL_PLUS_KEY) {
            const url = `${backendUrl}/api/schedules/tasks/byRoles/week?from=${fromDateString}&to=${toDateString}`;

            request(
                LITURGICAL_GROUP_ROLES, // Teraz TS nie będzie krzyczał, bo request oczekuje 'any'
                (responseData: ScheduleShortInfoForTask[]) => setData(responseData),
                false,
                url,
                'POST'
            );
        }
        // SCENARIUSZ 2: Zwykła rola (GET)
        else {
            const url = `${backendUrl}/api/schedules/tasks/byRole/${roleName}/scheduleShortInfo/week?from=${fromDateString}&to=${toDateString}`;

            request(
                null,
                (responseData: ScheduleShortInfoForTask[]) => setData(responseData),
                false,
                url,
                'GET'
            );
        }
    }, [roleName, fromDateString, toDateString, request]);

    return { data, loading, error };
};