import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";
import {Provider, Role, User} from "../../models/Interfaces";
import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import LoadingSpinner from "../../components/LoadingScreen";
import ChangePasswordPopup from "./ChangePasswordPopup";
import AlertBox from "../../components/AlertBox";
import useIsAdmin from "../../services/UseIsAdmin";
import {UNAUTHORIZED_PAGE_TEXT} from "../../services/UseIsAdmin";
import ChangeNameSurnamePopup from "./ChangeNameSurnamePopup";
import ConfirmDeletionPopup from "../../components/ConfirmDeletionPopup";

function VerifyUserPage() {
    const { id: userId } = useParams();

    const { request: fetchSupervisorRoles, error: errorFetchSupervisorRoles, loading: loadingSupervisorRoles } = useHttp(`${backendUrl}/api/roles/types/SUPERVISOR`, 'GET');
    const { request: fetchTaskPerformerRoles, error: errorFetchTaskPerformerRoles, loading: loadingTaskPerformerRoles } = useHttp(`${backendUrl}/api/roles/types/TASK_PERFORMER`, 'GET');
    const { request: fetchUser, error: errorFetchUser, loading: loadingUser} = useHttp(`${backendUrl}/api/users/${userId}`, 'GET');
    const { request: deleteUserRequest, error: deleteUserError, loading: deleteUserLoading} = useHttp(`${backendUrl}/api/users/${userId}`, 'DELETE');
    const { request: verifyUserRequest, error: requestError, loading: requestLoading} = useHttp(`${backendUrl}/api/users/${userId}/verification/assignRoles`, 'PUT');
    const { request: updateRolesRequest, error: updateRolesError, loading: updateRolesLoading } = useHttp(`${backendUrl}/api/users/${userId}/roles`, 'PATCH');
    const { isAdmin, isAdminLoading, isAdminInitialized } = useIsAdmin();

    const [user, setUser] = useState<User | null>(null);
    const [rolesSupervisor, setRolesSupervisor] = useState<Role[]>([]);
    const [rolesTaskPerformer, setRolesTaskPerformer] = useState<Role[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showChangeNameSurname, setShowChangeNameSurname] = useState(false);
    const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUser(null, (data: User) => {
            setUser(data);
            setSelectedRoles(data.roles.map(role => role.name));
        });
        fetchSupervisorRoles(null, (data: Role[]) => setRolesSupervisor(data));
        fetchTaskPerformerRoles(null, (data: Role[]) => setRolesTaskPerformer(data));
    }, [fetchUser, fetchSupervisorRoles, fetchTaskPerformerRoles]);

    const handleRoleChange = (roleName: string, isChecked: boolean) => {
        if (isChecked) {
            setSelectedRoles(prev => [...prev, roleName]);
        } else {
            setSelectedRoles(prev => prev.filter(role => role !== roleName));
        }
    };

    const handleSubmit = () => {
        verifyUserRequest(selectedRoles, () => {
            navigate('/users', { state: { message: 'Brat został zweryfikowany' } });
        });
    };

    const handleUpdateRoles = () => {
        updateRolesRequest(selectedRoles, () => {
            navigate('/users', { state: { message: 'Role brata zostały zaktualizowane' } });
        });
    };

    const handleDelete = () => {
        deleteUserRequest(null, () => {
            navigate('/users', { state: { message: 'Brat został usunięty' } });
        });
    }

    if(isAdminLoading || isAdminInitialized) {
        return <LoadingSpinner/>;
    } else if(!isAdmin) return <AlertBox text={UNAUTHORIZED_PAGE_TEXT} type="danger" width={'500px'} />;

    if(loadingSupervisorRoles || loadingTaskPerformerRoles || loadingUser) return <LoadingSpinner/>;
    if(errorFetchSupervisorRoles || errorFetchTaskPerformerRoles || errorFetchUser) return <AlertBox text={errorFetchSupervisorRoles || errorFetchTaskPerformerRoles || errorFetchUser} type="danger" width={'500px'} />;

    return (
        <div className="fade-in">
            <div className="page-header">
                {user?.enabled ? <h1>Edycja brata</h1> : <h1>Weryfikacja brata</h1>}
            </div>
            <div className="table-responsive d-flex justify-content-center">
                <div className="table-responsive" style={{maxWidth: '500px'}}>
                    <table className="table table-hover table-striped table-rounded table-shadow">
                        <tbody>
                        <tr>
                            <th className="table-dark">Id</th>
                            <td>{user?.id}</td>
                        </tr>
                        <tr>
                            <th className="table-dark">Imię</th>
                            <td>{user?.name}</td>
                        </tr>
                        <tr>
                            <th className="table-dark">Nazwisko</th>
                            <td>{user?.surname}</td>
                        </tr>
                        <tr>
                            <th className="table-dark">Email</th>
                            <td>{user?.email}</td>
                        </tr>
                        <tr>
                            <th className="table-dark">Role</th>
                            <td className="max-column-width">{user?.roles.map(role => role.name).join(", ")}</td>
                        </tr>
                        <tr>
                            <th className="table-dark">Rejestracja</th>
                            <td>{user?.provider}</td>
                        </tr>
                        <tr>
                            <th className="table-dark">Weryfikacja</th>
                            <td>
                                <span className={
                                    user?.enabled ? '' : 'highlighted-text-not-verified'}
                                >
                                    {user?.enabled ? "Tak" : "Nie"}
                                </span>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="edit-entity-container mw-100 my-1" style={{width: '400px'}}>
                <div className="d-flex justify-content-between">
                    <button className="btn btn-info m-1"
                            disabled={requestLoading || deleteUserLoading || updateRolesLoading}
                            onClick={() => setShowChangeNameSurname(true)}>
                        Edytuj imię i nazwisko
                    </button>
                    {user?.provider === Provider.LOCAL &&
                        <button className="btn btn-warning m-1"
                                disabled={requestLoading || deleteUserLoading || updateRolesLoading}
                                onClick={() => setShowChangePassword(true)}>
                            Zmień hasło
                        </button>
                    }
                </div>
            </div>
            <div className="edit-entity-container mw-100" style={{width: '400px'}}>
                {requestError && <AlertBox text={requestError} type="danger" width={'500px'}/>}
                {deleteUserError && <AlertBox text={deleteUserError} type="danger" width={'500px'}/>}
                {updateRolesError && <AlertBox text={updateRolesError} type="danger" width={'500px'}/>}
                <div className="mb-3">
                    <label className="form-label">Role systemowe:</label>
                        <label className="form-check custom-checkbox">
                            <input
                                className={"form-check-input"}
                                type="checkbox"
                                checked={selectedRoles.includes("ROLE_ADMIN")}
                                onChange={(e) => handleRoleChange("ROLE_ADMIN", e.target.checked)}
                            />
                            ROLE_ADMIN
                        </label>
                </div>
                <div className="mb-3">
                    <label className="form-label">Role funkcyjne:</label>
                    {rolesSupervisor.map((role) => (
                        <label className="form-check custom-checkbox">
                            <input
                                className={"form-check-input"}
                                type="checkbox"
                                checked={selectedRoles.includes(role.name)}
                                onChange={(e) => handleRoleChange(role.name, e.target.checked)}
                            />
                            {role.name}
                        </label>
                    ))}
                </div>
                <div className="mb-3">
                    <label className="form-label">Role wykonujące:</label>
                    {rolesTaskPerformer.map((role) => (
                        <label className="form-check custom-checkbox">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                checked={selectedRoles.includes(role.name)}
                                onChange={(e) => handleRoleChange(role.name, e.target.checked)}/>
                            {role.name}
                        </label>
                    ))}
                </div>
                <div className="d-flex justify-content-between">
                    {user?.enabled ?
                        <button className="btn btn-success m-1"
                                onClick={handleUpdateRoles}
                                disabled={deleteUserLoading || updateRolesLoading}
                        >
                            {updateRolesLoading ? (
                                <>
                                    <span>Zapisywanie </span>
                                    <span className="spinner-border spinner-border-sm"></span>
                                </>
                            ) : 'Zapisz zmiany'}
                        </button>
                        :
                        <button className="btn btn-success m-1" onClick={handleSubmit}
                                disabled={requestLoading || deleteUserLoading}>
                            {requestLoading ? (
                                <>
                                    <span>Weryfikowanie </span>
                                    <span className="spinner-border spinner-border-sm"></span>
                                </>
                            ) : 'Zweryfikuj użytkownika'}
                        </button>
                    }
                    {showChangePassword &&
                        <ChangePasswordPopup userId={user?.id ? user.id : 0}
                                             onClose={() => setShowChangePassword(false)}/>}
                    {showChangeNameSurname &&
                        <ChangeNameSurnamePopup userId={user?.id ? user.id : 0}
                                                onClose={() => setShowChangeNameSurname(false)}/>}
                    <button className="btn btn-danger m-1" onClick={() => setShowConfirmationPopup(true)}
                            disabled={requestLoading || deleteUserLoading || updateRolesLoading}>Usuń użytkownika
                    </button>
                    {showConfirmationPopup && <ConfirmDeletionPopup onHandle={handleDelete} onClose={() => setShowConfirmationPopup(false)}/>}
                </div>
            </div>
        </div>
    );
}

export default VerifyUserPage;
