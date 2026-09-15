interface Role {
    id: number;
    name: string;
    type: string;
    weeklyScheduleCreatorDefault: boolean;
    assignedTasksGroupName: string;
    sortOrder: number;
    areTasksVisibleInPrints: boolean;
}

interface Task {
    id: number;
    name: string;
    nameAbbrev: string;
    participantsLimit: number;
    permanent: boolean;
    allowedRoles: Role[];
    supervisorRole: Role;
    daysOfWeek: string[];
    sortOrder: number;
    visibleInObstacleFormForUserRole: boolean;
    specialEvent?: SpecialEvent;
    description?: string;
    specialEventId?: number;
    specialEventName?: string;
    isSpecial?: boolean;
    taskSections?: TaskSection[];
}

interface User {
    id: number;
    email: string;
    name: string;
    surname: string;
    entryDate: string;
    roles: Role[];
    provider: string;
    enabled: boolean;
    academicYear: number; // Znak zapytania, bo może być nullem
    namedayDate: string;  // Data przychodzi jako string "YYYY-MM-DD"
}

interface Obstacle {
    id: number;
    user: User;
    tasks: Task[];
    fromDate: string;
    toDate: string;
    applicantDescription: string;
    status: string;
    recipientAnswer: string;
    recipientUser: User;
    taskSections?: TaskSection[];
}

interface Conflict {
    id: number;
    task1: Task;
    task2: Task;
    daysOfWeek: string[];
}

interface Schedule {
    id: number;
    task: Task;
    user: User;
    date: string;
    taskSection?: TaskSection | null;
}

interface SpecialDate {
    id: number;
    date: string;
    type: string;
}

interface ScheduleShortInfo {
    userId: number;
    userName: string;
    userSurname: string;
    tasksInfoStrings: string[];
}

interface GroupedScheduleShortInfo {
    userId: number;
    userName: string;
    userSurname: string;
    groupedTasksInfoStrings: Map<string, string[]>; // key: role name, value: task info strings
}

interface ScheduleShortInfoForTask {
    taskId: number;
    taskName: string;
    usersInfoStrings: string[];
}

interface UserSchedulesOnDaysDTO {
    userShortInfo: UserShortInfo;
    schedules: Map<string, string[]>; // key: day of week, value: task names
}

interface UserTaskDependencyWeekly {
    userId: number;
    userName: string;
    lastAssigned: string;
    numberOfAssignsInLastYear: number;
    assignedTasks: string[];
    isInConflict: boolean;
    hasObstacle: boolean;
    assignedToTheTask: boolean;
}

interface UserTaskDependencyDaily {
    userId: number;
    userName: string;
    lastAssigned: string;
    numberOfAssignsInLastYear: number;
    assignedTasks: string[];
    isInConflict: string[];
    hasObstacle: string[];
    assignedToTheTask: string[];
}

interface UserTaskScheduleInfo {
    taskName: string;
    taskId: number;
    lastAssignedWeeksAgo: number;
    numberOfWeeklyAssignsFromStatsDate: number;
    hasRoleForTheTask: boolean;
    isInConflict: boolean;
    hasObstacle: boolean;
    assignedToTheTask: boolean;
    partiallyAssigned?: boolean;
    visible: boolean;
}

interface UserTasksScheduleInfoWeekly {
    userId: number;
    userName: string;
    assignedTasks: string[];
    userTasksScheduleInfo: UserTaskScheduleInfo[];
    totalEventAssignments?: number;
}

interface UserTasksScheduleInfoWeeklyByAllDays {
    userId: number;
    userName: string;
    assignedTasks: string[];
    userTasksScheduleInfo: Map<string, UserTaskScheduleInfo[]>; // key: day of week
}

type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

export enum ObstacleStatus {
    AWAITING = "AWAITING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}

interface ObstacleStatusTranslation {
    [key: string]: string;
}

export const obstacleStatusTranslation: ObstacleStatusTranslation = {
    "AWAITING": "Oczekująca",
    "APPROVED": "Zaakceptowana",
    "REJECTED": "Odrzucona"
};


export enum RoleType {
    SYSTEM = "SYSTEM",
    SUPERVISOR = "SUPERVISOR",
    TASK_PERFORMER = "TASK_PERFORMER",
    OTHER = "OTHER"
}

interface RoleTypeTranslation {
    [key: string]: string;
}

export const roleTypeTranslation: RoleTypeTranslation = {
    "SYSTEM": "System",
    "SUPERVISOR": "Funkcyjny",
    "TASK_PERFORMER": "Wykonujący",
    "OTHER": "Inny"
}

export enum Provider {
    GOOGLE = "GOOGLE",
    LOCAL = "LOCAL"
}

///Models for transferring data
interface ObstacleData {
    userId: number;
    tasksIds: number[];
    fromDate: string;
    toDate: string;
    applicantDescription: string;
}

interface UserShortInfo {
    id: number;
    name: string;
    surname: string;
}

interface TaskShortInfo {
    id: number;
    name: string;
    nameAbbrev: string;
    supervisorRoleId: number;
}

interface UserTaskStatistics {
    taskName: string;
    taskAbbrev: string;
    lastAssignmentDate: string;
    normalizedOccurrencesFromStatsDate: number;
    normalizedOccurrencesAllTime: number;
}

interface DocumentLink {
    id: number;
    title: string;
    url: string;
    sortOrder: number;
    preview: boolean;
}


export type {Role, Task, User, Obstacle, Conflict, Schedule, SpecialDate, UserTaskDependencyWeekly, UserTaskDependencyDaily, UserTasksScheduleInfoWeeklyByAllDays, UserSchedulesOnDaysDTO}
export type {ObstacleData, UserShortInfo, TaskShortInfo, ScheduleShortInfo, ScheduleShortInfoForTask, UserTaskStatistics}
export type {UserTaskScheduleInfo, UserTasksScheduleInfoWeekly}
export type {DayOfWeek, DocumentLink, GroupedScheduleShortInfo}
export interface PocketMoneySummaryDTO {
    romanYear: string;
    brotherCount: number;
    pocketMoneyTotal: number;
    namedayCount: number;
    namedayMoneyTotal: number;
    rowTotal: number;
    brothers: UserShortInfo[];
}

export interface PocketMoneyResponseDTO {
    tableRows: PocketMoneySummaryDTO[];
    namedayBoys: UserShortInfo[]; // To już masz w projekcie
    totalPocketMoney: number;
    totalNamedayMoney: number;
    grandTotal: number;
}

export interface SpecialEvent {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    collectionDates?: string[];
}

export interface CloneEventRequest {
    newName: string;
    newStartDate: string;
    newEndDate: string;
}

export interface TaskSection {
    id: number;
    name: string;
}