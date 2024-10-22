import { Task, TaskShortInfo } from "../../../../models/Interfaces";

export const getUniqueRolesOfVisibleTasks = (visibleTasks: TaskShortInfo[], allTasks: Task[]): number[] => {
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

export const getRoleNamesByRoleIds = (roleIds: number[], allTasks: Task[]): string[] => {
    return roleIds.map(roleId => {
        const task = allTasks.find(task => task.supervisorRole.id === roleId);
        return task ? task.supervisorRole.assignedTasksGroupName : '';
    }).filter(name => name !== '');
};

export const getRoleNamesOfTasksWhichAreAllVisibleInGroup = (visibleTasks: TaskShortInfo[], allTasks: Task[]): string[] => {
    const roleIds = getRolesWhichHaveAllTasksVisible(visibleTasks, allTasks);
    return getRoleNamesByRoleIds(roleIds, allTasks);
};
