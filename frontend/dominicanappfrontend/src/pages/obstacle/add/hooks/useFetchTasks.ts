import { useState, useEffect } from 'react';
import useHttp from "../../../../services/UseHttp";
import {Task} from "../../../../models/Interfaces";
import { backendUrl } from "../../../../utils/constants";

export const useFetchTasks = () => {
    const [data, setData] = useState<Task[]>([]);
    const { request, error, loading } = useHttp(`${backendUrl}/api/tasks`, 'GET');

    useEffect(() => {
        request(null, (response) => setData(response));
    }, [request]);

    return { data, error, loading };
};
