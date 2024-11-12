import {useLocation, useNavigate} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {User} from "../../../../models/Interfaces";
import useHttp from "../../../../services/UseHttp";
import {backendUrl} from "../../../../utils/constants";
import AlertBox from "../../../../components/AlertBox";
import LoadingSpinner from "../../../../components/LoadingScreen";

function KitchenStyleGenerator() {
    const location = useLocation();
    const supervisorRoleId = location.state?.roleId;
    const supervisorRoleName = location.state?.roleName;
    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");
    const [users, setUsers] = useState<User[]>([]);
    const {request: fetchEligibleUsers, error: fetchEligibleUsersError, loading: fetchEligibleUsersLoading} = useHttp(`${backendUrl}/api/users/eligible/${supervisorRoleId}`, "GET");
    const [selectedUserId, setSelectedUserId] = useState<number>(0);
    const {request: postGenerate, error: postGenerateError, loading: postGenerateLoading} = useHttp(`${backendUrl}/api/schedules/generator/kitchen-style/${supervisorRoleId}?startingFromUserId=${selectedUserId}&from=${fromDate}&to=${toDate}`, "POST");
    const navigate = useNavigate();

    useEffect(() => {
        fetchEligibleUsers(null, (data: User[]) => {
            setUsers(data);
        });
    }, [fetchEligibleUsers, supervisorRoleId]);

    const handleInputChange = (name: string, value: string) => {
        if (name === 'fromDate') {
            setFromDate(value);
        } else {
            setToDate(value);
        }
    };

    const handleGenerate = () => {
        console.log(selectedUserId, fromDate, toDate);
        postGenerate(null, () => {
            console.log("Generated");
            navigate(`/add-schedule/weekly/by-all-days?roleName=${supervisorRoleName}`, {state: {message: "Pomyślnie wygenerowano harmonogram"}})
        });
    };

    function handleUserChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setSelectedUserId(parseInt(e.target.value));
    }

    if (fetchEligibleUsersError) return <AlertBox text={fetchEligibleUsersError} width={"500px"} type={"danger"}/>
    if (fetchEligibleUsersLoading) return <LoadingSpinner/>

    return (
        <div className="fade-in">
            {postGenerateError && <AlertBox text={postGenerateError} type={"danger"} width={"500px"}/>}
            <div className="edit-entity-container mw-100" style={{width: '400px'}}>
                <div className="mb-3">
                    <label htmlFor="userId" className="form-label">
                        Generowanie od:
                    </label>
                    <select
                        className="form-select"
                        id="userId"
                        value={selectedUserId}
                        onChange={handleUserChange}
                    >
                        <option value="">Wybierz brata</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.name} {user.surname}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="fromDate" className="form-label">
                        Początek generowania:
                    </label>
                    <input
                        className="form-control"
                        type="date"
                        id="fromDate"
                        name="fromDate"
                        value={fromDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {handleInputChange("fromDate", e.target.value)}}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="toDate" className="form-label">Koniec generowania (włącznie):</label>
                    <input
                        className="form-control"
                        type="date"
                        id="toDate"
                        name="toDate"
                        value={toDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {handleInputChange("toDate", e.target.value)}}
                    />
                </div>
                <div className="d-flex justify-content-center">
                    <button className="btn btn-primary"
                            onClick={handleGenerate}
                            disabled={postGenerateLoading}
                    >
                        Generuj {postGenerateLoading && <span className="spinner-border spinner-border-sm"></span>}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default KitchenStyleGenerator;