import { useState, useEffect } from 'react';
import {isAdminUser} from "./CurrentUserCookieService";
import {User} from "../models/Interfaces";
import useHttp from "./UseHttp";
import {backendUrl} from "../utils/constants";

const useIsAdmin = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAdminInitialized, setIsAdminInitialized] = useState(true);
    const [isAdminLoading, setIsAdminLoading] = useState(true);

    const { error: errorCurrent, request: requestCurrent } = useHttp(`${backendUrl}/api/users/current`, 'GET');

    useEffect(() => {
        const isAdminUserValue = isAdminUser();

        if(isAdminUserValue === null) {
            requestCurrent(null, ((data : User) => {
                localStorage.setItem('currentUser', JSON.stringify(data));
                setIsAdmin(data.roles.some(role => role.name === 'ROLE_ADMIN'));
            }));
        } else {
            setIsAdmin(isAdminUserValue);
        }
        setIsAdminLoading(false);
        setIsAdminInitialized(false);
    }, [isAdmin, requestCurrent]);

    return { isAdmin, isAdminLoading, isAdminError: errorCurrent, isAdminInitialized };
};

export const UNAUTHORIZED_PAGE_TEXT = 'Nie masz uprawnień do wyświetlenia tej strony';

export default useIsAdmin;
