import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {Obstacle, ObstacleStatus, obstacleStatusTranslation, User} from "../../models/Interfaces";
import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";
import useIsAdmin, {UNAUTHORIZED_PAGE_TEXT} from "../../services/UseIsAdmin";
import LoadingSpinner from "../../components/LoadingScreen";
import AlertBox from "../../components/AlertBox";
import ConfirmDeletionPopup from "../../components/ConfirmDeletionPopup";

function MyObstacleDetails() {
    const { obstacleId } = useParams();
    const navigate = useNavigate();
    const [obstacle, setObstacle] = useState<Obstacle | null>(null);
    const {request: getRequest, error: getError, loading: getLoading} = useHttp(`${backendUrl}/api/obstacles/${obstacleId}`, 'GET');
    const {request: deleteRequest, error: deleteError, loading: deleteLoading} = useHttp(`${backendUrl}/api/obstacles/${obstacleId}`, 'DELETE');
    const [showConfirmationPopup, setShowConfirmationPopup] = useState<boolean>(false);

    useEffect(() => {
        getRequest( null, setObstacle);
    }, [getRequest]);

    const deleteObstacle = () => {
        deleteRequest(null, () => {
            navigate('/home', {state: {message: 'Pomyślnie usunięto przeszkodę'}});
        }).then(() => setShowConfirmationPopup(false));
    };

    if (getLoading) return <LoadingSpinner/>;
    if (getError) return <AlertBox text={getError} type={'danger'} width={'500px'}/>;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Szczegóły przeszkody</h1>
            </div>
            {deleteError && <AlertBox text={deleteError} type={'danger'} width={'500px'}/>}
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
                            <th className="table-dark">Oficja</th>
                            <td>{obstacle?.tasks.map(task => task.nameAbbrev).join(", ")}</td>
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
                                {obstacleStatusTranslation[obstacle ? obstacle.status : ""]}
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
                        <tr>
                            <th className="table-dark">Akcja</th>
                            <td>
                                <button className={"btn btn-danger"} onClick={() => setShowConfirmationPopup(true)} disabled={deleteLoading}>
                                    <span>Usuń </span>
                                    {deleteLoading && <span className="spinner-border spinner-border-sm"></span>}
                                </button>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            {showConfirmationPopup &&
                <ConfirmDeletionPopup onClose={() => setShowConfirmationPopup(false)}
                                      onHandle={() => deleteObstacle()}/>}

        </div>
    );
}

export default MyObstacleDetails;