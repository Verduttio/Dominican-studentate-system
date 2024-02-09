import {useCallback, useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function useHttp<T = any>(url : string, method : string = 'GET') {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const request = useCallback(async (requestData: T | null = null, onSuccess = (data: any) => {}, skipRedirect: boolean = false) => {
        setLoading(true);
        setError(null);
        try {
            console.log(requestData)
            console.log(url)
            const response = await axios({ url, method, data: requestData, withCredentials: true});
            onSuccess(response.data);
        } catch (err : any) {
            if (err.response && err.response.status === 403) {
                setError("Nie posiadasz praw dostępu do tych danych");
            } else if (err.response && err.response.status === 401 && !skipRedirect) {
                setError(err.response.data + ". Proszę się zalogować. Nastąpi przekierowanie");
                setTimeout(() => {
                    navigate('/login');
                }, 3000); // in ms
            } else {
                setError("Wystąpił błąd: " + err.response.data);
            }
        } finally {
            setLoading(false);
        }
    }, [url, method, navigate]);

    return { error, loading, request };
}

export default useHttp;