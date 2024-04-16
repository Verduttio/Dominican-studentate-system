import React, {useEffect, useState} from "react";
import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";
import AlertBox from "../../components/AlertBox";

interface UserShortScheduleHistoryPopupProps {
    userId: number;
    date: string;
    weeks: number;
    onClose: () => void;
}

const UserShortScheduleHistoryPopup: React.FC<UserShortScheduleHistoryPopupProps> = ({ userId, date, weeks, onClose }) => {
    const { request, error, loading } = useHttp(`${backendUrl}/api/schedules/users/${userId}/history?date=${date}&weeks=${weeks}`, 'GET');
    const [userScheduleHistory, setUserScheduleHistory] = useState<Map<number, string[]>>(new Map());

    useEffect(() => {
        request(null, (data) => {
            if (typeof data === 'object' && data !== null) {
                const mapData = new Map();
                for (const [key, value] of Object.entries(data)) {
                    if (Array.isArray(value)) {
                        mapData.set(Number(key), value);
                    }
                }
                setUserScheduleHistory(mapData);
            }
        });
    }, [request]);


    if (loading) return <LoadingSpinner/>;
    if (error) return <AlertBox text={error } type={'danger'} width={'500px'}/>;

    return (
        <div className="custom-modal-backdrop fade-in">
            <div className="card custom-modal">
                <div className="card-body">
                    <div className="modal-body text-center">
                        <h5>Historia oficjów brata</h5>
                    </div>
                    <div className="modal-body">
                        {userScheduleHistory && (
                            <div className="d-flex justify-content-center">
                                <div className="table-responsive" style={{maxWidth: '400px'}}>
                                    <table
                                        className="table table-hover table-striped table-rounded table-shadow">
                                        <thead className="table-dark">
                                        <tr>
                                            <th>
                                                <strong>N</strong> tygodni temu
                                            </th>
                                            <th>
                                                Oficja
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {Array.from(userScheduleHistory.entries()).map(([weekAgo, taskStrings]) => (
                                            <tr key={weekAgo}>
                                                <td>{weekAgo}</td>
                                                <td>{taskStrings.length !== 0 ? taskStrings.join(', ') : 'brak'}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="modal-footer d-flex justify-content-center">
                        <button className="btn btn-secondary m-1" onClick={onClose}>OK</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserShortScheduleHistoryPopup;