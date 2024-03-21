import {useCallback, useState} from 'react';
import axios, {AxiosError} from 'axios';
import { useNavigate } from 'react-router-dom';
import {removeCurrentUser} from "./CurrentUserCookieService";

function useHttp<T = any>(url : string = "", method : string = 'GET') {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(true);
    const navigate = useNavigate();

    const request = useCallback(async (requestData: T | null = null, onSuccess = (_data: any) => {}, skipRedirect: boolean = false, newUrl: string ="", newMethod: string ="") => {
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
            onSuccess(response.data);
        } catch (err : any) {
            if (axios.isAxiosError(err)) {
                const serverError = err as AxiosError<{ message?: string }>;
                if(serverError && serverError.response) {
                    const status = serverError.response.status;
                    const data = serverError.response.data;

                    if (status === 403) {
                        setError("Nie posiadasz praw dostępu do tych danych");
                    } else if (status === 401 && !skipRedirect) {
                        setError("Sesja wygasła lub użytkownik nie jest zalogowany. Proszę się zalogować. Nastąpi przekierowanie.");
                        removeCurrentUser();
                        setTimeout(() => {
                            navigate('/loginForm');
                        }, 3000);
                    } else {
                        if (data.message) {
                            setError(`Wystąpił błąd: ${data.message}`);
                        } else {
                            setError(`Wystąpił błąd: ${data}`);
                        }
                    }
                } else {
                    setError("Wystąpił problem z połączeniem do serwera.");
                }
            } else {
                setError("Wystąpił nieoczekiwany błąd: " + err.toString());
            }
        } finally {
            setLoading(false);
            setInitialized(false);
        }
    }, [url, method, navigate]);

    return { error, loading, request, initialized };
}

export default useHttp;