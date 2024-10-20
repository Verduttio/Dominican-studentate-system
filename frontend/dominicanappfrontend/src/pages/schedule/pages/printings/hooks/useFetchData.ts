import { useState, useEffect } from 'react';
import useHttp from '../../../../../services/UseHttp';

const useFetchData = <T,>(url: string | null) => {
    const [data, setData] = useState<T | null>(null);
    const { request, error, loading } = useHttp();

    useEffect(() => {
        if (!url) return; // Avoid making a request if URL is null
        request(null, (responseData: T) => setData(responseData), false, url, 'GET');
    }, [request, url]);

    return { data, error, loading };
};

export default useFetchData;
