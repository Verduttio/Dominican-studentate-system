interface Role {
    id: number;
    name: string;
}

interface Task {
    id: number;
    name: string;
    category: string;
    participantsLimit: number;
    permanent: boolean;
    participantForWholePeriod: boolean;
    allowedRoles: Role[];
    daysOfWeek: string[];
}

interface User {
    id: number;
    email: string;
    name: string;
    surname: string;
    roles: Role[];
    provider: string;
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

export type {Role, Task, User, Obstacle, Conflict}