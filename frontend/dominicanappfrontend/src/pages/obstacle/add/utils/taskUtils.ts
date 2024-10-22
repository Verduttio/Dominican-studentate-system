import { Task, TaskShortInfo } from "../../../../models/Interfaces";

export const getUniqueRolesOfVisibleTasks = (
    visibleTasks: TaskShortInfo[],
    allTasks: Task[]
): number[] => {
    const uniqueRoles = new Set<number>();
    visibleTasks.forEach(task => {
        const foundTask = allTasks.find(t => t.id === task.id);
        if (foundTask) {
            uniqueRoles.add(foundTask.supervisorRole.id);
        }
    });
    return Array.from(uniqueRoles);
};

export const getRolesWhichHaveAllTasksVisible = (visibleTasks: TaskShortInfo[], allTasks: Task[]): number[] => {
    const uniqueRoles = getUniqueRolesOfVisibleTasks(visibleTasks, allTasks);
    return uniqueRoles.filter(roleId => {
        const tasksOfRole = allTasks.filter(task => task.supervisorRole.id === roleId);
        return tasksOfRole.every(task => visibleTasks.some(t => t.id === task.id));
    });
};

export const getRolesWhichHaveIncompleteTasksSelected = (
    visibleTasks: TaskShortInfo[],
    selectedTaskIds: number[],
    allTasks: Task[]
): number[] => {
    const uniqueRoles = getRolesWhichHaveAllTasksVisible(visibleTasks, allTasks);

    return uniqueRoles.filter(roleId => {
        const visibleTasksOfRole = visibleTasks.filter(task => {
            const fullTask = allTasks.find(t => t.id === task.id);
            return fullTask && fullTask.supervisorRole.id === roleId;
        });

        const selectedTasksOfRole = visibleTasksOfRole.filter(task =>
            selectedTaskIds.includes(task.id)
        );

        return selectedTasksOfRole.length < visibleTasksOfRole.length;
    });
};

export const getIncompleteRoleNames = (
    visibleTasks: TaskShortInfo[],
    selectedTaskIds: number[],
    allTasks: Task[]
): string[] => {
    const roleIds = getRolesWhichHaveIncompleteTasksSelected(
        visibleTasks,
        selectedTaskIds,
        allTasks
    );

    return roleIds
        .map(roleId => {
            const task = allTasks.find(task => task.supervisorRole.id === roleId);
            return task ? task.supervisorRole.assignedTasksGroupName : '';
        })
        .filter(name => name !== '');
};
