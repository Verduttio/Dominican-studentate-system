import React, {useEffect, useState} from "react";
import {Role} from "../../models/Interfaces";
import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";
import AlertBox from "../../components/AlertBox";
import {useNavigate} from "react-router-dom";


function TasksVisibilitySettingsPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRolesIds, setSelectedRolesIds] = useState<number[]>([]);
    const { error: errorGetRoles, loading: loadingGetRoles, request: requestGetRoles } = useHttp(`${backendUrl}/api/roles/types/SUPERVISOR`, 'GET');
    const { error: errorPatchRoles, loading: loadingPatchRoles, request: requestPatchRoles } = useHttp(`${backendUrl}/api/roles/visibilityInPrint`, 'PATCH');
    const navigate = useNavigate();

    useEffect(() => {
        requestGetRoles(null, (data) => {
            const roles: Role[] = data;
            setRoles(roles);
            setSelectedRolesIds(roles.filter(role => role.areTasksVisibleInPrints).map(role => role.id));
        });
    }, [requestGetRoles]);

    const handleRoleChange = (roleId: number, isChecked: boolean) => {
        if (isChecked) {
            setSelectedRolesIds(prev => [...prev, roleId]);
        } else {
            setSelectedRolesIds(prev => prev.filter(role => role !== roleId));
        }
    };

    const handleSave = () => {
        requestPatchRoles(selectedRolesIds, () => {
            navigate('/tasks', {state: {message: 'Zapisano zmiany'}});
        });
    }

    if (loadingGetRoles) return <LoadingSpinner/>;
    if (errorGetRoles) return <AlertBox text={errorGetRoles} type={"danger"} width={"500px"}/>;

    return (
        <div className="fade-in">
            <h3 className="entity-header-dynamic-size">Ustawienia widoczności oficjów</h3>
            <h6 className="entity-header-dynamic-size">
                W tym miejscu możesz ustawić widoczność oficjów dla poszczególnych ról.<br/>
                Zaznaczone role będą wyświetlały się w wydrukach, oraz w kreatorach oficjów w miejscu wyświetlania
                oficjów, do których dani bracia są już przypisani.
            </h6>
            {errorPatchRoles && <AlertBox text={errorPatchRoles} type={"danger"} width={"500px"}/>}
            <div className="edit-entity-container mw-100" style={{width: '300px'}}>
                <div className="mb-3">
                    {roles.map((role) => (
                        <label className="form-check custom-checkbox">
                            <input
                                className={"form-check-input"}
                                type="checkbox"
                                checked={selectedRolesIds.includes(role.id)}
                                onChange={(e) => handleRoleChange(role.id, e.target.checked)}
                            />
                            {role.name}
                        </label>
                    ))}
                    <div className="d-flex justify-content-center">
                        <button className="btn btn-primary mt-3" onClick={() => {
                            handleSave();
                        }}
                        disabled={loadingPatchRoles}>
                            Zapisz{" "} {loadingPatchRoles && <span className="spinner-border spinner-border-sm"></span>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TasksVisibilitySettingsPage;