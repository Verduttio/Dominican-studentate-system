import {useCallback, useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function useHttp<T = any>(url : string = "", method : string = 'GET') {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const request = useCallback(async (requestData: T | null = null, onSuccess = (data: any) => {}, skipRedirect: boolean = false, newUrl: string ="", newMethod: string ="") => {
        if(newUrl !== "" && newMethod !== "") {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            url = newUrl;
            // eslint-disable-next-line react-hooks/exhaustive-deps
            method = newMethod;
        }

        setLoading(true);
        setError(null);
        try {
            console.log(requestData)
            console.log(url)
            const response = await axios({ url, method, data: requestData, withCredentials: true});
            if(response !== undefined) {
                onSuccess(response.data);
            }
        } catch (err : any) {
            if (err.response.status === 403 ) {
                if (err.response.data === null) {
                    setError("Nie posiadasz praw dostępu do tych danych");
                } else {
                    setError(err.response.data);
                }
            } else if (err.response && err.response.status === 401 && !skipRedirect) {
                setError(err.response.data + ". Proszę się zalogować. Nastąpi przekierowanie");
                setTimeout(() => {
                    navigate('/login');
                }, 3000); // in ms
            } else {
                if(err.response && err.response.data) {
                    setError("Wystąpił błąd: " + err.response.data);
                } else {
                    setError("Wystąpił błąd: " + err.response);
                }
            }
        } finally {
            setLoading(false);
        }
    }, [url, method, navigate]);

    return { error, loading, request };
}

export default useHttp;