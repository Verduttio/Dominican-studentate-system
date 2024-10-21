import LoadingSpinner from "../../components/LoadingScreen";
import React, {useEffect, useState} from "react";
import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";
import {UserTaskStatistics} from "../../models/Interfaces";
import AlertBox from "../../components/AlertBox";
import {format} from "date-fns";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleInfo} from "@fortawesome/free-solid-svg-icons";

interface UserTasksStatisticsProps {
    userId: number;
}

const UserTasksStatistics: React.FC<UserTasksStatisticsProps> = ({userId}) => {
    const { error: errorFetchUserStatisticsForTasks, loading: loadingFetchUserStatisticsForTasks, request: requestFetchUserStatisticsForTasks } = useHttp(
        `${backendUrl}/api/schedules/users/${userId}/statistics/tasks`, 'GET'
    );
    const [userStatisticsForTasks, setUserStatisticsForTasks] = useState<UserTaskStatistics[]>([]);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        requestFetchUserStatisticsForTasks(null, (data: UserTaskStatistics[]) => {
            setUserStatisticsForTasks(data);
            console.log(data)
        });
    }, [requestFetchUserStatisticsForTasks]);

    const handleIconClick = () => {
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            setShowPopup(false);
        }
    };


    if (loadingFetchUserStatisticsForTasks) return <LoadingSpinner />;
    if (errorFetchUserStatisticsForTasks) return <AlertBox text={errorFetchUserStatisticsForTasks} type={'danger'} width={'500px'}/>;
    return (
        <div className="fade-in d-flex justify-content-center">
            <div className="table-responsive" style={{maxWidth: '450px'}}>
                <table className="table table-hover table-striped table-rounded table-shadow mb-0">
                    <thead className="table-dark">
                    <tr>
                        <th>Oficjum</th>
                        <th>Ostatnio wyznaczony</th>
                        <th className="max-column-width-150">Pełne wyznaczenia od daty sys.</th>
                        <th className="max-column-width-150">
                            Pełne wyznaczenia łącznie{" "}
                            <span
                                style={{cursor: "pointer"}}
                                onClick={handleIconClick}
                                title="Kliknij po więcej informacji"
                            >
                                <FontAwesomeIcon icon={faCircleInfo}/>
                            </span>
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {userStatisticsForTasks.map(userStatisticsForTask => (
                        <tr key={userStatisticsForTask.taskName}>
                            <td>{userStatisticsForTask.taskAbbrev}</td>
                            {userStatisticsForTask.lastAssignmentDate ? <td>{format(userStatisticsForTask.lastAssignmentDate, 'dd.MM.yyyy')}</td> : <td>Brak</td>}
                            <td>{userStatisticsForTask.normalizedOccurrencesFromStatsDate}</td>
                            <td>{userStatisticsForTask.normalizedOccurrencesAllTime}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            {showPopup && (
                <div
                    className="custom-modal-backdrop fade-in"
                    onClick={handleBackdropClick}
                >
                    <div className="card custom-modal">
                        <div className="card-body">
                            <h5 className="card-title">Sposób liczenia</h5>
                            <p className="card-text">
                                Wartości w tej i poprzedniej kolumnie odzwierciedlają liczbę pełnych wyznaczeń do danego oficjum.
                                Pełnych wyznaczeń czyli, w przypadku gdy oficjum jest "tygodniowe" czyli brat przypisany jest do niego na cały okres tygodnia,
                                to wtedy liczone jest jako jedno wyznaczenie. W przypadku gdy brat zostanie przypisany np. do Psalmów tylko na dwa dni, wtedy jego wyznaczenie
                                liczby się jako zaokrąglona wartość, czyli w tym wypadku 0. <br />
                                W przypadku oficjum "dziennego" czyli np. Zmywania naczyń, liczone jest to na podstawie liczby przypisań do tego oficjum. <br/>
                                Zatem podsumowując, dla oficjów tygodniowych wartość jest wyznaczana: <br />
                                <code>liczba_wszystkich_wyznaczeń_do_oficjum / liczba_dni_w_ktorych_wystepuje_oficjum</code><br/>
                                Z kolei dla oficjów dziennych wartość jest wyznaczana: <br />
                                <code>liczba_wszystkich_wyznaczeń_do_oficjum</code>
                            </p>
                            <div className="text-center">
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleClosePopup}
                                >
                                    Zamknij
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserTasksStatistics;