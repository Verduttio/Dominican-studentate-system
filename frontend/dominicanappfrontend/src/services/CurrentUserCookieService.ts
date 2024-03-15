import {User} from "../models/Interfaces";

export const getCurrentUser = () => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        return JSON.parse(currentUser) as User;
    }
    return null;
};

export const removeCurrentUser = () => {
    localStorage.removeItem('currentUser');
}

export const isFunkcyjnyUser = () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
        return currentUser.roles.some(role => role.name === 'ROLE_FUNKCYJNY');
    }
    return null;
}
