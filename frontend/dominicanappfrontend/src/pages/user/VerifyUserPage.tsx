import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";
import {Role} from "../../models/interfaces";
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";

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

    if(loadingSupervisorRoles || loadingTaskPerformerRoles) return <div>Ładowanie...</div>;
    if(errorFetchSupervisorRoles || errorFetchTaskPerformerRoles) return <div className="error-message">{errorFetchSupervisorRoles || errorFetchTaskPerformerRoles}</div>;

    return (
        <div>
            <h1>Verify User Page</h1>
            {requestError && <div className="error-message">{requestError}</div>}
            <p>Supervisor Roles:</p>
            <ul>
                {rolesSupervisor.map((role) => (
                    <li key={role.id}>
                        <label>
                            <input
                                type="checkbox"
                                checked={selectedRoles.includes(role.name)}
                                onChange={(e) => handleRoleChange(role.name, e.target.checked)} />
                            {role.name}
                        </label>
                    </li>
                ))}
            </ul>
            <p>Task Performer Roles:</p>
            <ul>
                {rolesTaskPerformer.map((role) => (
                    <li key={role.id}>
                        <label>
                            <input
                                type="checkbox"
                                checked={selectedRoles.includes(role.name)}
                                onChange={(e) => handleRoleChange(role.name, e.target.checked)} />
                            {role.name}
                        </label>
                    </li>
                ))}
            </ul>
            <button onClick={handleSubmit} disabled={requestLoading}>Zweryfikuj</button>
        </div>
    );
}

export default VerifyUserPage;
