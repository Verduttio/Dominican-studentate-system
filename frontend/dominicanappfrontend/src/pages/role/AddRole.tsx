import React, { useState } from 'react';
import useHttp from '../../services/UseHttp';
import {Role, RoleType} from '../../models/interfaces';
import { backendUrl } from '../../utils/constants';
import {useNavigate} from "react-router-dom";

interface RoleFormData extends Omit<Role, 'id'> {}

function AddRole() {
    const initialRoleState : RoleFormData = {
        name: '',
        type: ''
    }

    const [roleData, setRoleData] = useState(initialRoleState);
    const [validationError, setValidationError] = useState<string>('');
    const { request, error } = useHttp(`${backendUrl}/api/roles`, 'POST');
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setValidationError('');

        setRoleData({
            ...roleData,
            [name]: value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleData.name || !roleData.type) {
            setValidationError("Wszystkie pola muszą być wypełnione.");
            return;
        }

        request(roleData, () => {
            navigate('/roles');
        });
    };

    return (
        <div className="fade-in">
            <h1>Dodaj Rolę</h1>
            {error && <div className="error-message">{error}</div>}
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
                <button type="submit">Zapisz Rolę</button>
            </form>
        </div>
    );
}

export default AddRole;
