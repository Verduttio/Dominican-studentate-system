import React from 'react';
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingScreen";
import AlertBox from "../../components/AlertBox";
import useIsFunkcyjny, {UNAUTHORIZED_PAGE_TEXT} from "../../services/UseIsFunkcyjny";
import useGetOrCreateCurrentUser from "../../services/UseGetOrCreateCurrentUser";

function AddScheduleRoleSelection() {
    const { isFunkcyjny, isFunkcyjnyLoading, isFunkcyjnyInitialized } = useIsFunkcyjny();
    const navigate = useNavigate();
    const {currentUser} = useGetOrCreateCurrentUser();

    if(isFunkcyjnyLoading || isFunkcyjnyInitialized) {
        return <LoadingSpinner/>;
    } else if(!isFunkcyjny) return <AlertBox text={UNAUTHORIZED_PAGE_TEXT} type="danger" width={'500px'} />;

    return (
        <div className="fade-in d-flex flex-column align-items-center" style={{minHeight: '80vh'}}>
            {currentUser?.roles.filter((role) => (role.type === "SUPERVISOR")).map((role) => (
                <div className="card mb-4 mw-100" style={{width: "600px"}} id="button-scale">
                    <div className="card-body text-center" onClick={() => {
                        navigate(`/add-schedule/weekly?roleName=${role.name}`)
                    }}>
                        {role.name}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default AddScheduleRoleSelection;
