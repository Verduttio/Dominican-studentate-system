import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";
import {Role} from "../../models/Interfaces";
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import LoadingSpinner from "../../components/LoadingScreen";
import "./VerifyUsersPage.css";

function VerifyUserPage() {
    const { request: fetchSupervisorRoles, error: errorFetchSupervisorRoles, loading: loadingSupervisorRoles } = useHttp(`${backendUrl}/api/roles/types/SUPERVISOR`, 'GET');
    const { request: fetchTaskPerformerRoles, error: errorFetchTaskPerformerRoles, loading: loadingTaskPerformerRoles } = useHttp(`${backendUrl}/api/roles/types/TASK_PERFORMER`, 'GET');
    const [rolesSupervisor, setRolesSupervisor] = useState<Role[]>([]);
    const [rolesTaskPerformer, setRolesTaskPerformer] = useState<Role[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const { id: userId } = useParams();
    const {error: requestError, loading: requestLoading, request: verifyUserRequest} = useHttp(`${backendUrl}/api/users/${userId}/verification/assignRoles`, 'PUT');
    const navigate = useNavigate();

    useEffect(() => {
        fetchSupervisorRoles(null, (data: Role[]) => setRolesSupervisor(data));
        fetchTaskPerformerRoles(null, (data: Role[]) => setRolesTaskPerformer(data));
    }, [fetchSupervisorRoles, fetchTaskPerformerRoles]);

    const handleRoleChange = (roleName: string, isChecked: boolean) => {
        if (isChecked) {
            setSelectedRoles(prev => [...prev, roleName]);
        } else {
            setSelectedRoles(prev => prev.filter(role => role !== roleName));
        }
    };

    const handleSubmit = () => {
        verifyUserRequest(selectedRoles, () => {
            navigate('/users');
        });
    }

    if(loadingSupervisorRoles || loadingTaskPerformerRoles) return <LoadingSpinner/>;
    if(errorFetchSupervisorRoles || errorFetchTaskPerformerRoles) return <div className="alert alert-danger">{errorFetchSupervisorRoles || errorFetchTaskPerformerRoles}</div>;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Weryfikacja użytkownika</h1>
            </div>
            {requestError && <div className="alert alert-danger">{requestError}</div>}
            <div className="edit-entity-container">
                <div className="mb-3">
                    <label className="form-label">Role funkcyjnych:</label>
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
                    <label className="form-label">Role wykonujących:</label>
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
                <div className="d-flex justify-content-center">
                    <button className="btn btn-success" onClick={handleSubmit} disabled={requestLoading}>Zweryfikuj
                    </button>
                </div>
            </div>
        </div>
    );
}

export default VerifyUserPage;
