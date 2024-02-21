import React, {useEffect} from 'react';
import useHttp from "../services/UseHttp";
import {backendUrl} from "../utils/constants";
import LoadingSpinner from "../components/LoadingScreen";

function Home () {
    const { error, loading, request } = useHttp(`${backendUrl}/api/users/current/check`, 'GET');

    useEffect(() => {
        request()
            .then(() => {});
    }, [request]);

    if (loading) return <LoadingSpinner />
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="fade-in">
            <h1 className="mt-1">Ekran domyślny</h1>
        </div>
    );
}

export default Home;