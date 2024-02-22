import React from 'react';
import {Role, RoleType} from '../../models/Interfaces';

interface RoleFormFieldsProps {
    roleData: Role | null;
    setRoleData: React.Dispatch<React.SetStateAction<Role | null>>;
}

const RoleFormFields: React.FC<RoleFormFieldsProps> = ({ roleData, setRoleData }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setRoleData((prev: Role | null) => {
            if (prev === null) return null;
            return {
                ...prev,
                [name]: value
            };
        });
    };

    return (
        <>
            <div className="mb-3">
                <label htmlFor="roleName" className="form-label">Nazwa roli:</label>
                <input
                    id="roleName"
                    name="name"
                    type="text"
                    className="form-control"
                    value={roleData?.name}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="mb-3">
                <label htmlFor="roleType" className="form-label">Typ roli:</label>
                <select
                    id="roleType"
                    name="type"
                    className="form-select"
                    value={roleData?.type}
                    onChange={handleChange}
                    required
                >
                    <option value="">Wybierz typ roli</option>
                    {Object.values(RoleType).map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>
        </>
    );
};

export default RoleFormFields;
