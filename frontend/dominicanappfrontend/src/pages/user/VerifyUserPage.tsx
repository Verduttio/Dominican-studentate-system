import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";
import {Role, User} from "../../models/Interfaces";
import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import LoadingSpinner from "../../components/LoadingScreen";
import "./VerifyUsersPage.css";

function VerifyUserPage() {
    const { id: userId } = useParams();

    const { request: fetchSupervisorRoles, error: errorFetchSupervisorRoles, loading: loadingSupervisorRoles } = useHttp(`${backendUrl}/api/roles/types/SUPERVISOR`, 'GET');
    const { request: fetchTaskPerformerRoles, error: errorFetchTaskPerformerRoles, loading: loadingTaskPerformerRoles } = useHttp(`${backendUrl}/api/roles/types/TASK_PERFORMER`, 'GET');
    const { request: fetchUser, error: errorFetchUser, loading: loadingUser} = useHttp(`${backendUrl}/api/users/${userId}`, 'GET');
    const { request: deleteUserRequest, error: deleteUserError, loading: deleteUserLoading} = useHttp(`${backendUrl}/api/users/${userId}`, 'DELETE');
    const { request: verifyUserRequest, error: requestError, loading: requestLoading} = useHttp(`${backendUrl}/api/users/${userId}/verification/assignRoles`, 'PUT');
    const { request: updateRolesRequest, error: updateRolesError, loading: updateRolesLoading } = useHttp(`${backendUrl}/api/users/${userId}/roles`, 'PATCH');

    const [user, setUser] = useState<User | null>(null);
    const [rolesSupervisor, setRolesSupervisor] = useState<Role[]>([]);
    const [rolesTaskPerformer, setRolesTaskPerformer] = useState<Role[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
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
            navigate('/users', { state: { message: 'Użytkownik został zweryfikowany' } });
        });
    };

    const handleUpdateRoles = () => {
        updateRolesRequest(selectedRoles, () => {
            navigate('/users', { state: { message: 'Role użytkownika zostały zaktualizowane' } });
        });
    };

    const handleDelete = () => {
        deleteUserRequest(null, () => {
            navigate('/users', { state: { message: 'Użytkownik został usunięty' } });
        });
    }

    if(loadingSupervisorRoles || loadingTaskPerformerRoles || !user) return <LoadingSpinner/>;
    if(errorFetchSupervisorRoles || errorFetchTaskPerformerRoles || errorFetchUser) return <div className="alert alert-danger">{errorFetchSupervisorRoles || errorFetchTaskPerformerRoles || errorFetchUser}</div>;

    return (
        <div className="fade-in">
            <div className="page-header">
                {user.enabled ? <h1>Edycja użytkownika</h1> : <h1>Weryfikacja użytkownika</h1>}

            </div>
            <table className="table table-hover table-striped table-responsive table-rounded table-shadow">
                <thead className="table-dark">
                <tr>
                    <th>ID</th>
                    <th>Imię</th>
                    <th>Nazwisko</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Provider</th>
                    <th>Zweryfikowany</th>
                </tr>
                </thead>
                <tbody>
                    <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.surname}</td>
                        <td>{user.email}</td>
                        <td className="max-column-width">{user.roles.map(role => role.name).join(', ')}</td>
                        <td>{user.provider}</td>
                        <td>
                            <span className={
                                user.enabled ? '' : 'highlighted-text-not-verified'}
                            >
                            {user.enabled ? "Tak" : "Nie"}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
                <div className="edit-entity-container">
                    {requestError && <div className="alert alert-danger">{requestError}</div>}
                    {deleteUserError && <div className="alert alert-danger">{deleteUserError}</div>}
                    {updateRolesError && <div className="alert alert-danger">{updateRolesError}</div>}
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
                        {user.enabled ?
                            <button className="btn btn-success"
                                    onClick={handleUpdateRoles}
                                    disabled={deleteUserLoading || updateRolesLoading}>Zapisz zmiany
                            </button>
                            :
                            <button className="btn btn-success" onClick={handleSubmit}
                                    disabled={requestLoading || deleteUserLoading}>Zweryfikuj
                            </button>
                        }
                        <button className="btn btn-warning" disabled={requestLoading || deleteUserLoading || updateRolesLoading}>
                            Zmień hasło
                        </button>
                        <button className="btn btn-danger" onClick={handleDelete}
                                disabled={requestLoading || deleteUserLoading || updateRolesLoading}>Usuń użytkownika
                        </button>
                    </div>
                </div>
        </div>
    );
}

export default VerifyUserPage;
