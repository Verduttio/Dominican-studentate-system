import React, { useState, useEffect } from 'react';
import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";
import {User} from "../../models/Interfaces";
import {useParams} from "react-router-dom";
import UserWeekSchedule from "./UserWeekSchedule";
import UserTasksStatistics from "./UserTasksStatistics";
import AlertBox from "../../components/AlertBox";
import {formatEntryDate} from "../../utils/LocalDateTimeFormatter";

function UserDetailsViewer () {
    const [user, setUser] = useState<User | null>(null);
    const { userId } = useParams();
    const { error, loading, request } = useHttp(`${backendUrl}/api/users/${userId}`, 'GET');

    useEffect(() => {
        request(null, (data) => setUser(data))
            .then(() => {});
    }, [request]);

    if (loading) return <LoadingSpinner/>;
    if (error) return <AlertBox text={error} type="danger" width={'500px'} />;

    return (
        <div className="fade-in">
            <div className="table-responsive d-flex justify-content-center my-3">
                <div className="table-responsive" style={{maxWidth: '500px'}}>
                    <table className="table table-hover table-striped table-rounded table-shadow">
                        <tbody>
                        <tr>
                            <th className="table-dark">Imię</th>
                            <td>{user?.name}</td>
                        </tr>
                        <tr>
                            <th className="table-dark">Nazwisko</th>
                            <td>{user?.surname}</td>
                        </tr>
                        <tr>
                            <th className="table-dark">Email</th>
                            <td>{user?.email}</td>
                        </tr>
                        <tr>
                            <th className="table-dark">Data pierwszych ślubów</th>
                            <td>{user?.entryDate ? formatEntryDate(user?.entryDate) : "BRAK DANYCH"}</td>
                        </tr>
                        <tr>
                            <th className="table-dark">Role</th>
                            <td className="max-column-width">{user?.roles.filter(role => role.type !== "SYSTEM").map(role => role.name).join(", ")}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="d-flex justify-content-center">
                <h4 className="entity-header-dynamic-size my-0">Harmonogram brata</h4>
            </div>
            <UserWeekSchedule userId={user ? user.id : 0}/>
            <div className="d-flex justify-content-center">
                <h4 className="entity-header-dynamic-size">Statystyki</h4>
            </div>
            <UserTasksStatistics userId={user ? user.id : 0}/>
        </div>

    );
}

export default UserDetailsViewer;