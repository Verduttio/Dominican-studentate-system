import { useState, useEffect } from 'react';
import {isFunkcyjnyUser} from "./CurrentUserCookieService";

const useIsFunkcyjny = () => {
    const [isFunkcyjny, setIsFunkcyjny] = useState(false);
    const [isFunkcyjnyInitialized, setIsFunkcyjnyInitialized] = useState(true);
    const [isFunkcyjnyLoading, setIsFunkcyjnyLoading] = useState(true);
    const [isFunkcyjnyError, setIsFunkcyjnyError] = useState('');

    useEffect(() => {
        const isFunkcyjnyUserValue = isFunkcyjnyUser();
        setIsFunkcyjny(!!isFunkcyjnyUserValue);
        setIsFunkcyjnyLoading(false);
        setIsFunkcyjnyInitialized(false);
    }, []);

    return { isFunkcyjny, isFunkcyjnyLoading, isFunkcyjnyError, isFunkcyjnyInitialized };
};

export const UNAUTHORIZED_PAGE_TEXT = 'Nie masz uprawnień do wyświetlenia tej strony';

export default useIsFunkcyjny;
