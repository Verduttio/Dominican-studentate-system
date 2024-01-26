import {useCallback, useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function useHttp (url : string, method : string = 'GET') {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [func, setFunc] = useState<Function | null>(null);
    const navigate = useNavigate();

    const request = useCallback(async (requestData = null, onSuccess = (data: any) => {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios({ url, method, data: requestData, withCredentials: true});
            onSuccess(response.data);
        } catch (err : any) {
            if (err.response && err.response.status === 403) {
                setError("Nie posiadasz praw dostępu do tych danych");
            } else if (err.response && err.response.status === 401) {
                setError(err.response.data + ". Proszę się zalogować. Nastąpi przekierowanie");
                setFunc(() => () => {
                    setTimeout(() => {
                        navigate('/login');
                    }, 3000); // in ms
                });
            } else {
                setError("Wystąpił błąd: " + err.message);
            }
        } finally {
            setLoading(false);
        }
    }, [url, method, navigate]);

    return { error, func, loading, request };
}

export default useHttp;