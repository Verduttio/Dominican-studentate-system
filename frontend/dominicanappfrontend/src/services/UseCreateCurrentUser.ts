import {useEffect, useState} from "react";
import useHttp from "./UseHttp";
import {backendUrl} from "../utils/constants";
import {User} from "../models/Interfaces";

const useCreateCurrentUserCookie = () => {
    const { error: errorCurrent, loading: loadingCurrent, initialized: initializedCurrent, request: requestCurrent } = useHttp(`${backendUrl}/api/users/current`, 'GET');
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        requestCurrent(null, ((data : User) => {
            setCurrentUser(data);
            localStorage.setItem('currentUser', JSON.stringify(data));
            console.log("FETCH USER");
        }));
    }, [requestCurrent]);

    return { currentUser, initializedCurrent, loadingCurrent, errorCurrent };
};

export default useCreateCurrentUserCookie;