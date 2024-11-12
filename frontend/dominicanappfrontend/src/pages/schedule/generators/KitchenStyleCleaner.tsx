import {useLocation, useNavigate} from "react-router-dom";
import React, {useState} from "react";
import useHttp from "../../../services/UseHttp";
import {backendUrl} from "../../../utils/constants";
import AlertBox from "../../../components/AlertBox";
import AlertBoxTimed from "../../../components/AlertBoxTimed";

function KitchenStyleCleaner() {
    const location = useLocation();
    const supervisorRoleId = location.state?.roleId;
    const supervisorRoleName = location.state?.roleName;
    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");
    const {request: postClean, error: postCleanError, loading: postCleanLoading} = useHttp(`${backendUrl}/api/schedules/cleaner/kitchen-style/${supervisorRoleId}?from=${fromDate}&to=${toDate}`, "POST");
    const [validationError, setValidationError] = useState<string>("");
    const navigate = useNavigate();

    const handleInputChange = (name: string, value: string) => {
        if (name === 'fromDate') {
            setFromDate(value);
        } else {
            setToDate(value);
        }
    };

    const validateInput = () => {
        if (fromDate === "" || toDate === "") {
            setValidationError("Obie daty muszą być uzupełnione")
            return false;
        }

        if (fromDate > toDate) {
            setValidationError("Data końcowa nie może być przed datą początkową")
            return false;
        }

        return true;
    }

    const handleClean = () => {
        if (!validateInput()) return false;

        postClean(null, () => {
            navigate(`/add-schedule/weekly/by-all-days?roleName=${supervisorRoleName}`, {state: {message: "Pomyślnie wyczyszczono harmonogram"}})
        });
    };

    return (
        <div className="fade-in">
            <div className="text-center">
                <h3 className="entity-header-dynamic-size mb-0">
                    Czyszczenie
                </h3>
            </div>
            {postCleanError && <AlertBox text={postCleanError} type={"danger"} width={"500px"}/>}
            <div className="edit-entity-container mw-100 mt-3" style={{width: '400px'}}>
                {validationError && <AlertBoxTimed text={validationError} type={"danger"} width={"500px"} onClose={() => {setValidationError("")}}/>}
                <div className="mb-3">
                    <label htmlFor="fromDate" className="form-label">
                        Początek czyszczenia:
                    </label>
                    <input
                        className="form-control"
                        type="date"
                        id="fromDate"
                        name="fromDate"
                        value={fromDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            handleInputChange("fromDate", e.target.value)
                        }}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="toDate" className="form-label">Koniec czyszczenia (włącznie):</label>
                    <input
                        className="form-control"
                        type="date"
                        id="toDate"
                        name="toDate"
                        value={toDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            handleInputChange("toDate", e.target.value)
                        }}
                    />
                </div>
                <div className="d-flex justify-content-center">
                    <button className="btn btn-danger"
                            onClick={handleClean}
                            disabled={postCleanLoading}
                    >
                        Wyczyść {postCleanLoading && <span className="spinner-border spinner-border-sm"></span>}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default KitchenStyleCleaner;