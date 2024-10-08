import {useEffect, useState} from "react";
import useHttp from "./UseHttp";
import {backendUrl} from "../utils/constants";
import {User} from "../models/Interfaces";
import {getCurrentUser} from "./CurrentUserCookieService";

const useGetOrCreateCurrentUser = () => {
    const { error: errorCurrent, loading: loadingCurrent, initialized: initializedCurrent, request: requestCurrent } = useHttp(`${backendUrl}/api/users/current`, 'GET');
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        const currentUserFromLocalStorage = getCurrentUser();
        if (currentUserFromLocalStorage) {
            setCurrentUser(currentUserFromLocalStorage);
        } else {
            requestCurrent(null, ((data : User) => {
                setCurrentUser(data);
                localStorage.setItem('currentUser', JSON.stringify(data));
            }));
        }
    }, [requestCurrent]);

    return { currentUser, initializedCurrent, loadingCurrent, errorCurrent };
};

export default useGetOrCreateCurrentUser;