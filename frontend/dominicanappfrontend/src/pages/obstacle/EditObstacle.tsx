import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";
import {Obstacle, ObstacleStatus, User} from "../../models/Interfaces";
import ConfirmDeletionPopup from "../../components/ConfirmDeletionPopup";
import AlertBox from "../../components/AlertBox";
import useIsAdmin, {UNAUTHORIZED_PAGE_TEXT} from "../../services/UseIsAdmin";

function EditObstacle() {
    const { obstacleId } = useParams();
    const navigate = useNavigate();
    const [obstacle, setObstacle] = useState<Obstacle | null>(null);
    const {request: getRequest, error: getError, loading: getLoading} = useHttp(`${backendUrl}/api/obstacles/${obstacleId}`, 'GET');
    const {request: patchRequest, error: patchError, loading: patchLoading} = useHttp(`${backendUrl}/api/obstacles/${obstacleId}`, 'PATCH');
    const {request: deleteRequest, error: deleteError, loading: deleteLoading} = useHttp(`${backendUrl}/api/obstacles/${obstacleId}`, 'DELETE');
    const {request: getCurrent, error: getCurrentError, loading: getCurrentLoading} = useHttp(`${backendUrl}/api/users/current`, 'GET');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [recipientAnswer, setRecipientAnswer] = useState<string>('');
    const [showConfirmationPopup, setShowConfirmationPopup] = useState<boolean>(false);
    const { isAdmin, isAdminLoading, isAdminInitialized } = useIsAdmin();

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

    if(isAdminLoading || isAdminInitialized) {
        return <LoadingSpinner/>;
    } else if(!isAdmin) return <AlertBox text={UNAUTHORIZED_PAGE_TEXT} type="danger" width={'500px'} />;

    if (getLoading) return <LoadingSpinner/>;
    if (getError || getCurrentError) return <AlertBox text={getError || getCurrentError} type={'danger'} width={'500px'}/>;

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
                            <td>{obstacle?.id}</td>
                        </tr>
                        <tr>
                            <th className="table-dark">Proszący</th>
                            <td>{obstacle?.user.name} {obstacle?.user.surname}</td>
                        </tr>
                        <tr>
                            <th className="table-dark">Zadanie</th>
                            <td>{obstacle?.tasks.map(task => task.name).join(", ")}</td>
                        </tr>
                        <tr>
                            <th className="table-dark">Od</th>
                            <td>{obstacle?.fromDate}</td>
                        </tr>
                        <tr>
                            <th className="table-dark">Do</th>
                            <td>{obstacle?.toDate}</td>
                        </tr>
                        <tr>
                            <th className="table-dark">Opis</th>
                            <td>{obstacle?.applicantDescription ? obstacle.applicantDescription : "-"}</td>
                        </tr>
                        <tr>
                            <th className="table-dark">Status</th>
                            <td>
                                <span className={
                                    obstacle?.status === ObstacleStatus.AWAITING ? 'highlighted-text-awaiting' :
                                        obstacle?.status === ObstacleStatus.APPROVED ? 'highlighted-text-approved' :
                                            obstacle?.status === ObstacleStatus.REJECTED ? 'highlighted-text-rejected' : ''
                                }>
                                {obstacle?.status}
                              </span>
                            </td>
                        </tr>
                        <tr>
                            <th className="table-dark">Rozpatrujący</th>
                            <td>{obstacle?.recipientUser ? obstacle.recipientUser.name + " " + obstacle.recipientUser.surname : "-"}</td>
                        </tr>
                        <tr>
                            <th className="table-dark">Odpowiedź rozpatrującego</th>
                            <td>{obstacle?.recipientAnswer ? obstacle.recipientAnswer : "-"}</td>
                        </tr>
                        </tbody>
                    </table>
            </div>
        </div>
    <div className="edit-entity-container mw-100" style={{width: '400px'}}>
        {deleteError && <AlertBox text={deleteError} type={'danger'} width={'500px'}/>}
                {obstacle?.status === ObstacleStatus.AWAITING ? (
                    <>
                        {patchError && <AlertBox text={patchError} type={'danger'} width={'500px'}/>}
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
                            <button className="btn btn-success m-1" onClick={approveObstacle} disabled={loading}>
                                {patchLoading ? (
                                    <>
                                        <span>Zatwierdzanie </span>
                                        <span className="spinner-border spinner-border-sm"></span>
                                    </>
                                ) : 'Zatwierdź'}
                            </button>
                            <button className="btn btn-warning m-1" onClick={rejectObstacle} disabled={loading}>
                                {deleteLoading ? (
                                    <>
                                        <span>Odrzucanie </span>
                                        <span className="spinner-border spinner-border-sm"></span>
                                    </>
                                ) : 'Odrzuć'}
                            </button>
                            <button className="btn btn-danger m-1" onClick={deleteObstacle} disabled={loading}>Usuń z bazy</button>
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
