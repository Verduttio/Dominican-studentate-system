import {Task, UserTasksScheduleInfoWeekly} from "../../../models/Interfaces";

export function isTaskFullyAssigned(taskId: number, tasks: Task[] | null, userDependencies: UserTasksScheduleInfoWeekly[]): boolean {
    const task = tasks?.find(task => task.id === taskId);
    const participantsLimit = task?.participantsLimit ? task.participantsLimit : 0;

    return countAssignedUsers(taskId, userDependencies) >= participantsLimit;
}

export function countAssignedUsers(taskId: number, userDependencies: UserTasksScheduleInfoWeekly[]): number {
    let count = 0;
    userDependencies.forEach(dep => {
        let taskDep = dep.userTasksScheduleInfo?.filter(udep => udep.taskId === taskId);
        if (taskDep && taskDep.length > 0 && taskDep[0].assignedToTheTask) count++;
    });
    return count;
}
