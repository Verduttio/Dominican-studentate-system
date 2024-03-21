import { useState, useEffect } from 'react';
import {isFunkcyjnyUser} from "./CurrentUserCookieService";
import {User} from "../models/Interfaces";
import useHttp from "./UseHttp";
import {backendUrl} from "../utils/constants";

const useIsFunkcyjny = () => {
    const [isFunkcyjny, setIsFunkcyjny] = useState(false);
    const [isFunkcyjnyInitialized, setIsFunkcyjnyInitialized] = useState(true);
    const [isFunkcyjnyLoading, setIsFunkcyjnyLoading] = useState(true);

    const { error: errorCurrent, request: requestCurrent } = useHttp(`${backendUrl}/api/users/current`, 'GET');

    useEffect(() => {
        const isFunkcyjnyUserValue = isFunkcyjnyUser();

        if(isFunkcyjnyUserValue === null) {
            requestCurrent(null, ((data : User) => {
                localStorage.setItem('currentUser', JSON.stringify(data));
                setIsFunkcyjny(data.roles.some(role => role.name === 'ROLE_FUNKCYJNY'));
            }));
        } else {
            setIsFunkcyjny(isFunkcyjnyUserValue);
        }
        setIsFunkcyjnyLoading(false);
        setIsFunkcyjnyInitialized(false);
    }, [isFunkcyjny, requestCurrent]);

    return { isFunkcyjny, isFunkcyjnyLoading, isFunkcyjnyError: errorCurrent, isFunkcyjnyInitialized };
};

export const UNAUTHORIZED_PAGE_TEXT = 'Nie masz uprawnień do wyświetlenia tej strony';

export default useIsFunkcyjny;
