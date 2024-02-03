import React, { useState } from 'react';
import useHttp from '../../services/UseHttp';
import { RoleType } from '../../models/interfaces';
import { backendUrl } from '../../utils/constants';
import {useNavigate} from "react-router-dom";

function AddRole() {
    const [roleName, setRoleName] = useState('');
    const [roleType, setRoleType] = useState<RoleType | ''>('');
    const [validationError, setValidationError] = useState<string>('');
    const { request, error } = useHttp(`${backendUrl}/api/roles`, 'POST');
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setValidationError('');

        if (name === 'roleName') {
            setRoleName(value);
        } else if (name === 'roleType') {
            setRoleType(value as RoleType);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleName || !roleType) {
            setValidationError("Wszystkie pola muszą być wypełnione.");
            return;
        }

        const roleData = { name: roleName, type: roleType };
        request(roleData, () => {
            navigate('/roles');
        });
    };

    return (
        <div>
            <h1>Dodaj Rolę</h1>
            {error && <div className="error-message">{error}</div>}
            {validationError && <div className="error-message">{validationError}</div>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="roleName">Nazwa roli:</label>
                    <input
                        id="roleName"
                        name="roleName"
                        type="text"
                        value={roleName}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label htmlFor="roleType">Typ roli:</label>
                    <select
                        id="roleType"
                        name="roleType"
                        value={roleType}
                        onChange={handleChange}
                    >
                        <option value="">Wybierz typ roli</option>
                        {Object.values(RoleType).map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
                <button type="submit">Zapisz Rolę</button>
            </form>
        </div>
    );
}

export default AddRole;
