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
