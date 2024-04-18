import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import useIsAdmin from "../../services/UseIsAdmin";
import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faNoteSticky} from "@fortawesome/free-solid-svg-icons";


const OtherEntities = () => {
    const navigate = useNavigate();
    const {isAdmin} = useIsAdmin();
    const [numberOfAwaitingObstacles, setNumberOfAwaitingObstacles] = useState(0);
    const { request: numberOfAwaitingObstaclesRequest, error: numberOfAwaitingObstaclesError, loading: numberOfAwaitingObstaclesLoading } = useHttp(
        `${backendUrl}/api/obstacles/AWAITING/count`, 'GET'
    );

    useEffect(() => {
        numberOfAwaitingObstaclesRequest(null, ((number) => {
            setNumberOfAwaitingObstacles(number);
        }))
    }, [numberOfAwaitingObstaclesRequest]);

    return (
        <div className="fade-in d-flex flex-column align-items-center" style={{minHeight: '80vh'}}>

            {isAdmin &&
                <div className="card mb-4 mw-100" style={{width: "600px"}} id="button-scale">
                    <div className="card-body text-center" onClick={() => {
                        navigate("/obstacles")
                    }}>
                        Przeszkody
                        {numberOfAwaitingObstacles > 0 && (
                            <span className="notification-icon">
                                    <FontAwesomeIcon icon={faNoteSticky}/>
                                    <span className="notification-count">{numberOfAwaitingObstacles}</span>
                                </span>
                        )}
                    </div>
                </div>
            }

            {isAdmin &&
                <div className="card mb-4 mw-100" style={{width: "600px"}} id="button-scale">
                    <div className="card-body text-center" onClick={() => {
                        navigate("/dates")
                    }}>
                        Daty
                    </div>
                </div>
            }

            <div className="card mb-4 mw-100" style={{width: "600px"}} id="button-scale">
                <div className="card-body text-center" onClick={() => {
                    navigate("/tasks")
                }}>
                    Zadania
                </div>
            </div>

            <div className="card mb-4 mw-100" style={{width: "600px"}} id="button-scale">
                <div className="card-body text-center" onClick={() => {
                    navigate("/conflicts")
                }}>
                    Konflikty
                </div>
            </div>

            <div className="card mb-4 mw-100" style={{width: "600px"}} id="button-scale">
                <div className="card-body text-center" onClick={() => {
                    navigate("/roles")
                }}>
                    Role
                </div>
            </div>

        </div>
    );
};

export default OtherEntities;
