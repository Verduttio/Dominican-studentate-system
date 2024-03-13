import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";
import {Obstacle, ObstacleStatus, User} from "../../models/Interfaces";
import ConfirmDeletionPopup from "../../components/ConfirmDeletionPopup";

function EditObstacle() {
    const { obstacleId } = useParams();
    const navigate = useNavigate();
    const [obstacle, setObstacle] = useState<Obstacle | null>(null);
    const {request: getRequest, error: getError} = useHttp(`${backendUrl}/api/obstacles/${obstacleId}`, 'GET');
    const {request: patchRequest, error: patchError, loading: patchLoading} = useHttp(`${backendUrl}/api/obstacles/${obstacleId}`, 'PATCH');
    const {request: deleteRequest, error: deleteError, loading: deleteLoading} = useHttp(`${backendUrl}/api/obstacles/${obstacleId}`, 'DELETE');
    const {request: getCurrent, error: getCurrentError, loading: getCurrentLoading} = useHttp(`${backendUrl}/api/users/current`, 'GET');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [recipientAnswer, setRecipientAnswer] = useState<string>('');
    const [showConfirmationPopup, setShowConfirmationPopup] = useState<boolean>(false);

    let loading = patchLoading || deleteLoading || getCurrentLoading;

    useEffect(() => {
        getRequest( null, setObstacle);
        getCurrent(null, setCurrentUser);
    }, [getRequest, getCurrent]);

    const approveObstacle = () => {
        patchRequest({status: 'APPROVED', recipientAnswer: recipientAnswer, recipientUserId: currentUser?.id}, () => {
            navigate('/obstacles', {state: {message: 'Pomyślnie zatwierdzono przeszkodę'}});
        });
    };

    const rejectObstacle = () => {
        patchRequest({status: 'REJECTED', recipientAnswer: recipientAnswer, recipientUserId: currentUser?.id}, () => {
            navigate('/obstacles', {state: {message: 'Pomyślnie odrzucono przeszkodę'}});
        });
    };

    const deleteObstacle = () => {
        deleteRequest(null, () => {
            navigate('/obstacles', {state: {message: 'Pomyślnie usunięto przeszkodę'}});
        }).then(() => setShowConfirmationPopup(false));
    };

    if (!obstacle) return <LoadingSpinner/>;
    if (getError || getCurrentError) return <div className="alert alert-danger">{getError || getCurrentError}</div>;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Modyfikuj przeszkodę</h1>
            </div>
            <div className="table-responsive d-flex justify-content-center">
                <div className="table-responsive" style={{maxWidth: '500px'}}>
                    <table className="table table-hover table-striped table-rounded table-shadow">
                        <tbody>
                        <tr>
                            <th className="table-dark">Id</th>
                            <td>{obstacle.id}</td>
                        </tr>
                        <tr>
                            <th className="table-dark">Proszący</th>
                            <td>{obstacle.user.name} {obstacle.user.surname}</td>
                        </tr>
                        <tr>
                            <th className="table-dark">Zadanie</th>
                            <td>{obstacle.tasks.map(task => task.name).join(", ")}</td>
                        </tr>
                        <tr>
                            <th className="table-dark">Od</th>
                            <td>{obstacle.fromDate}</td>
                        </tr>
                        <tr>
                            <th className="table-dark">Do</th>
                            <td>{obstacle.toDate}</td>
                        </tr>
                        <tr>
                            <th className="table-dark">Opis</th>
                            <td>{obstacle.applicantDescription ? obstacle.applicantDescription : "-"}</td>
                        </tr>
                        <tr>
                            <th className="table-dark">Status</th>
                            <td>
                                <span className={
                                    obstacle.status === ObstacleStatus.AWAITING ? 'highlighted-text-awaiting' :
                                        obstacle.status === ObstacleStatus.APPROVED ? 'highlighted-text-approved' :
                                            obstacle.status === ObstacleStatus.REJECTED ? 'highlighted-text-rejected' : ''
                                }>
                                {obstacle.status}
                              </span>
                            </td>
                        </tr>
                        <tr>
                            <th className="table-dark">Funkcyjny</th>
                            <td>{obstacle.recipientUser ? obstacle.recipientUser.name + " " + obstacle.recipientUser.surname : "-"}</td>
                        </tr>
                        <tr>
                            <th className="table-dark">Odpowiedź funkcyjnego</th>
                            <td>{obstacle.recipientAnswer ? obstacle.recipientAnswer : "-"}</td>
                        </tr>
                        </tbody>
                    </table>
            </div>
        </div>
    <div className="edit-entity-container mw-100" style={{width: '400px'}}>
        {deleteError && <div className="alert alert-danger">{deleteError}</div>}
                {obstacle.status === ObstacleStatus.AWAITING ? (
                    <>
                        {patchError && <div className="alert alert-danger">{patchError}</div>}
                        <div className="mb-3">
                            <label htmlFor="applicantDescription" className="form-label">Twoja argumentacja
                                (opcjonalnie):</label>
                            <textarea
                                className="form-control"
                                id="applicantDescription"
                                name="applicantDescription"
                                value={recipientAnswer}
                                onChange={event => setRecipientAnswer(event.target.value)}
                            />
                        </div>
                        <div className="d-flex justify-content-between">
                            <button className="btn btn-success" onClick={approveObstacle} disabled={loading}>Zatwierdź</button>
                            <button className="btn btn-warning" onClick={rejectObstacle} disabled={loading}>Odrzuć</button>
                            <button className="btn btn-danger" onClick={deleteObstacle} disabled={loading}>Usuń z bazy</button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="alert alert-info">Przeszkoda jest już rozpatrzona. Możesz jedynie usunąć
                            przeszkodę. Edycja przeszkody jest niedostępna. Jeśli mimo wszystko chcesz edytować przeszkodę
                            usuń aktualną i dodaj nową.
                        </div>
                        <div className="d-flex justify-content-center">
                            <button className="btn btn-danger" onClick={() => setShowConfirmationPopup(true)} disabled={loading}>Usuń z bazy</button>
                        </div>
                        {showConfirmationPopup && <ConfirmDeletionPopup onHandle={deleteObstacle} onClose={() => setShowConfirmationPopup(false)}/>}
                    </>
                )}


            </div>
        </div>
    );
}

export default EditObstacle;
