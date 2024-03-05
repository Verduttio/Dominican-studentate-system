interface Role {
    id: number;
    name: string;
    type: string;
}

interface Task {
    id: number;
    name: string;
    participantsLimit: number;
    permanent: boolean;
    participantForWholePeriod: boolean;
    allowedRoles: Role[];
    supervisorRoles: Role[];
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
    task: Task;
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

type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

export enum ObstacleStatus {
    AWAITING = "AWAITING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}

export enum RoleType {
    SYSTEM = "SYSTEM",
    SUPERVISOR = "SUPERVISOR",
    TASK_PERFORMER = "TASK_PERFORMER",
    OTHER = "OTHER"
}

///Models for transferring data
interface ObstacleData {
    userId: number;
    taskId: number;
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

export type {Role, Task, User, Obstacle, Conflict, Schedule, UserTaskDependencyWeekly, UserTaskDependencyDaily}
export type {ObstacleData, UserShortInfo, TaskShortInfo, ScheduleShortInfo}
export type {DayOfWeek}