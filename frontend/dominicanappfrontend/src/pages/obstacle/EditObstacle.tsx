import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";
import {Obstacle, ObstacleStatus} from "../../models/Interfaces";

function EditObstacle() {
    const { obstacleId } = useParams();
    const navigate = useNavigate();
    const [obstacle, setObstacle] = useState<Obstacle | null>(null);
    const {request: getRequest, error: getError, loading: getLoading} = useHttp(`${backendUrl}/api/obstacles/${obstacleId}`, 'GET');
    const {request: patchRequest, error: patchError, loading: patchLoading} = useHttp(`${backendUrl}/api/obstacles/${obstacleId}`, 'PATCH');
    const {request: deleteRequest, error: deleteError, loading: deleteLoading} = useHttp(`${backendUrl}/api/obstacles/${obstacleId}`, 'DELETE');

    useEffect(() => {
        getRequest( null, setObstacle);
    }, [getRequest]);

    const approveObstacle = () => {
        patchRequest({status: 'APPROVED'}, () => {
            navigate('/obstacles', {state: {message: 'Pomyślnie zatwierdzono przeszkodę'}});
        });
    };

    const rejectObstacle = () => {
        patchRequest({status: 'REJECTED'}, () => {
            navigate('/obstacles', {state: {message: 'Pomyślnie odrzucono przeszkodę'}});
        });
    };

    const deleteObstacle = () => {
        deleteRequest(null, () => {
            navigate('/obstacles', {state: {message: 'Pomyślnie usunięto przeszkodę'}});
        });
    };

    if (!obstacle) return <LoadingSpinner/>;
    if (getError) return <div className="alert alert-danger">{getError}</div>;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Modyfikuj przeszkodę</h1>
            </div>
            <div>
                <table className="table table-hover table-striped table-responsive table-rounded table-shadow">
                    <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Proszący</th>
                        <th>Zadanie</th>
                        <th>Od</th>
                        <th>Do</th>
                        <th>Opis</th>
                        <th>Status</th>
                        <th>Funkcyjny</th>
                        <th>Odpowiedź funkcyjnego</th>
                    </tr>
                    </thead>
                    <tbody>
                        <tr key={obstacle.id}>
                            <td>{obstacle.id}</td>
                            <td>{obstacle.user.name} {obstacle.user.surname}</td>
                            <td>{obstacle.task.name}</td>
                            <td>{obstacle.fromDate}</td>
                            <td>{obstacle.toDate}</td>
                            <td>{obstacle.applicantDescription ? obstacle.applicantDescription : "-"}</td>
                            <td>
                            <span className={obstacle.status === ObstacleStatus.AWAITING ? 'highlighted-text' : ''}>
                            {obstacle.status}
                          </span>
                            </td>
                            <td>{obstacle.recipientUser ? obstacle.recipientUser.name + " " + obstacle.recipientUser.surname : "-"}</td>
                            <td>{obstacle.recipientAnswer ? obstacle.recipientAnswer : "-"}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="edit-entity-container">
                {obstacle.status === ObstacleStatus.AWAITING ? (
                    <>
                        <div className="mb-3">
                            <label htmlFor="applicantDescription" className="form-label">Twoja argumentacja
                                (opcjonalnie):</label>
                            <textarea
                                className="form-control"
                                id="applicantDescription"
                                name="applicantDescription"
                                // value={obstacleData.applicantDescription}
                                // onChange={handleChange}
                            />
                        </div>
                        <div className="d-flex justify-content-between">
                            <button className="btn btn-success" onClick={approveObstacle}>Zatwierdź</button>
                            <button className="btn btn-warning" onClick={rejectObstacle}>Odrzuć</button>
                            <button className="btn btn-danger" onClick={deleteObstacle}>Usuń z bazy</button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="alert alert-info">Przeszkoda jest już rozpatrzona. Możesz jedynie usunąć
                            przeszkodę. Edycja przeszkody jest niedostępna. Jeśli mimo wszystko chcesz edytować przeszkodę
                            usuń aktualną i dodaj nową.
                        </div>
                        <div className="d-flex justify-content-center">
                            <button className="btn btn-danger" onClick={deleteObstacle}>Usuń z bazy</button>
                        </div>
                    </>
                )}


            </div>
        </div>
    );
}

export default EditObstacle;
