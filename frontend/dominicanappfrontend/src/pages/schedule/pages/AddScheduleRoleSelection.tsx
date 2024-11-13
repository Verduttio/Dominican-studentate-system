import React, {useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../../components/LoadingScreen";
import AlertBox from "../../../components/AlertBox";
import useIsFunkcyjny, {UNAUTHORIZED_PAGE_TEXT} from "../../../services/UseIsFunkcyjny";
import useGetOrCreateCurrentUser from "../../../services/UseGetOrCreateCurrentUser";
import {Role} from "../../../models/Interfaces";
import useHttp from "../../../services/UseHttp";
import {backendUrl} from "../../../utils/constants";

function AddScheduleRoleSelection() {
    const { isFunkcyjny, isFunkcyjnyLoading, isFunkcyjnyInitialized } = useIsFunkcyjny();
    const {request: requestGetSupervisorRoles, loading: loadingGetSupervisorRoles} = useHttp(`${backendUrl}/api/roles/types/SUPERVISOR`, 'GET');
    const [supervisorRoles, setSupervisorRoles] = useState<Role[]>();
    const navigate = useNavigate();
    const {currentUser} = useGetOrCreateCurrentUser();

    useEffect(() => {
        requestGetSupervisorRoles(null, (data: Role[]) => {
            setSupervisorRoles(data);
        });
    }, [requestGetSupervisorRoles]);

    const navigateToDefaultScheduleCreator = (roleName: string) => {
        const selectedRole: Role | undefined = currentUser?.roles.filter((role) => (role.name === roleName))[0];
        if(selectedRole) {
            if(selectedRole.weeklyScheduleCreatorDefault) {
                navigate(`/add-schedule/weekly?roleName=${roleName}`);
            } else {
                navigate(`/add-schedule/weekly/by-all-days/?roleName=${roleName}`);
            }
        } else {
            console.error("Role not found");
        }
    }

    if(isFunkcyjnyLoading || isFunkcyjnyInitialized || loadingGetSupervisorRoles) {
        return <LoadingSpinner/>;
    } else if(!isFunkcyjny) return <AlertBox text={UNAUTHORIZED_PAGE_TEXT} type="danger" width={'500px'} />;

    if (currentUser?.roles.filter((role) => (role.type === "SUPERVISOR")).length === 0) {
        return <AlertBox text={"Brak ról funkcyjnych"} type="info" width={'500px'} />;
    }

    return (
        <div className="fade-in d-flex flex-column align-items-center" style={{minHeight: '80vh'}}>
            {currentUser?.roles
                .filter((role) => role.type === "SUPERVISOR")
                .sort((a, b) => {
                    const indexA = supervisorRoles?.findIndex(sRole => sRole.name === a.name) ?? -1;
                    const indexB = supervisorRoles?.findIndex(sRole => sRole.name === b.name) ?? -1;
                    return indexA - indexB;
                })
                .map((role) => (
                    <div
                        className="card mb-4 mw-100"
                        style={{ width: "600px" }}
                        id="button-scale"
                        key={role.id}
                    >
                        <div
                            className="card-body text-center"
                            onClick={() => {
                                navigateToDefaultScheduleCreator(role.name);
                            }}
                        >
                            {role.name}
                        </div>
                    </div>
                ))}
        </div>
    );
}

export default AddScheduleRoleSelection;
