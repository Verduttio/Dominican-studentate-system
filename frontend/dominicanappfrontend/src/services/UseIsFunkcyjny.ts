import { useState, useEffect } from 'react';
import useHttp from './UseHttp';
import {backendUrl} from "../utils/constants";

const useIsFunkcyjny = () => {
    const [isFunkcyjny, setIsFunkcyjny] = useState(false);
    const { request, loading: isFunkcyjnyLoading, error: isFunkcyjnyError, initialized: isFunkcyjnyInitialized } = useHttp(`${backendUrl}/api/users/checkRole/ROLE_FUNKCYJNY`, 'GET');

    useEffect(() => {
        request(null, (value) => {
            setIsFunkcyjny(value);
        });
    }, [request]);

    return { isFunkcyjny, isFunkcyjnyLoading, isFunkcyjnyError, isFunkcyjnyInitialized };
};

export const UNAUTHORIZED_PAGE_TEXT = 'Nie masz uprawnień do wyświetlenia tej strony';

export default useIsFunkcyjny;
