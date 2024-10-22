// hooks/useFetchUsers.ts
import { useState, useEffect } from 'react';
import useHttp from "../../../../services/UseHttp";
import { UserShortInfo } from "../../../../models/Interfaces";
import { backendUrl } from "../../../../utils/constants";

export const useFetchUsers = () => {
    const [data, setData] = useState<UserShortInfo[]>([]);
    const { request, error, loading } = useHttp(`${backendUrl}/api/users/shortInfo`, 'GET');

    useEffect(() => {
        request(null, (response) => setData(response));
    }, [request]);

    return { data, error, loading };
};
