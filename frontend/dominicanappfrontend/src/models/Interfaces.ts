interface Role {
    id: number;
    name: string;
    type: string;
}

interface Task {
    id: number;
    name: string;
    nameAbbrev: string;
    participantsLimit: number;
    permanent: boolean;
    participantForWholePeriod: boolean;
    allowedRoles: Role[];
    supervisorRole: Role;
    daysOfWeek: string[];
}

interface User {
    id: number;
    email: string;
    name: string;
    surname: string;
    roles: Role[];
    provider: string;
    enabled: boolean;
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
}

interface ScheduleShortInfo {
    userId: number;
    userName: string;
    userSurname: string;
    tasksInfoStrings: string[];
}

interface ScheduleShortInfoForTask {
    taskId: number;
    taskName: string;
    usersInfoStrings: string[];
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
}

interface UserTasksScheduleInfoWeekly {
    userId: number;
    userName: string;
    assignedTasks: string[];
    userTasksScheduleInfo: UserTaskScheduleInfo[];
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
}

interface UserTaskStatistics {
    taskName: string;
    taskNameAbbrev: string;
    lastAssigned: string;
    numberOfAssignInLast30Days: number;
    numberOfAssignInLast90Days: number;
    numberOfAssignInLast365Days: number;
    totalNumberOfAssigns: number;
}

export type {Role, Task, User, Obstacle, Conflict, Schedule, UserTaskDependencyWeekly, UserTaskDependencyDaily}
export type {ObstacleData, UserShortInfo, TaskShortInfo, ScheduleShortInfo, ScheduleShortInfoForTask, UserTaskStatistics}
export type {UserTaskScheduleInfo, UserTasksScheduleInfoWeekly}
export type {DayOfWeek}