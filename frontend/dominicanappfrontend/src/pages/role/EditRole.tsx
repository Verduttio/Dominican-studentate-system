import React, { useEffect, useState } from 'react';
import useHttp from '../../services/UseHttp';
import { Role, RoleType } from '../../models/interfaces';
import { backendUrl } from '../../utils/constants';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from "../../components/LoadingScreen";

function EditRole() {
    const { roleId } = useParams();
    const navigate = useNavigate();
    const { request: fetchRole, error: fetchError, loading: fetchLoading } = useHttp(`${backendUrl}/api/roles/${roleId}`, 'GET');
    const { request: updateRole, error: updateError } = useHttp(`${backendUrl}/api/roles/${roleId}`, 'PUT');
    const { request: deleteRole, error: deleteError } = useHttp(`${backendUrl}/api/roles/${roleId}`, 'DELETE');
    const [roleData, setRoleData] = useState<Role | null>(null);
    const [validationError, setValidationError] = useState<string>('');

    useEffect(() => {
        if (roleId) {
            fetchRole(null, (data: Role) => {
                setRoleData(data);
            });
        }
    }, [roleId, fetchRole]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setRoleData(prev => ({
            ...prev,
            [name]: value
        } as Role));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleData?.name || !roleData?.type) {
            setValidationError("Wszystkie pola muszą być wypełnione.");
            return;
        }

        updateRole(roleData, () => {
            navigate('/roles');
        });
    };

    const handleDelete = () => {
        if (roleId) {
            deleteRole(null, () => {
                navigate('/roles');
            });
        }
    };

    if (!roleData) return <LoadingSpinner/>;
    if (fetchError || updateError || deleteError) return <div className="error-message">{fetchError || updateError || deleteError}</div>;

    return (
        <div className="fade-in">
            <h1>Edytuj Rolę</h1>
            {validationError && <div className="error-message">{validationError}</div>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="roleName">Nazwa roli:</label>
                    <input
                        id="roleName"
                        name="name"
                        type="text"
                        value={roleData.name}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label htmlFor="roleType">Typ roli:</label>
                    <select
                        id="roleType"
                        name="type"
                        value={roleData.type}
                        onChange={handleChange}
                    >
                        <option value="">Wybierz typ roli</option>
                        {Object.values(RoleType).map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
                <button className="btn btn-success m-2" type="submit">Zaktualizuj rolę</button>
                <button type="button" onClick={handleDelete} className="btn btn-danger">Usuń rolę</button>
            </form>
        </div>
    );
}

export default EditRole;
