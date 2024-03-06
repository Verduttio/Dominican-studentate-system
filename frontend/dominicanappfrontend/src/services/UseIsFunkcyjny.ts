import { useState, useEffect } from 'react';
import useHttp from '../services/UseHttp';
import {backendUrl} from "../utils/constants";

const useIsFunkcyjny = () => {
    const [isFunkcyjny, setIsFunkcyjny] = useState(false);
    const { request, loading: isFunkcyjnyLoading, error: isFunkcyjnyError } = useHttp(`${backendUrl}/api/users/checkRole/ROLE_FUNKCYJNY`, 'GET');

    useEffect(() => {
        request(null, (value) => {
            setIsFunkcyjny(value);
        });
    }, [request]);

    return { isFunkcyjny, isFunkcyjnyLoading, isFunkcyjnyError };
};

export default useIsFunkcyjny;
