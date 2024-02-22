import React from 'react';
import { Role } from "../../../models/Interfaces";

interface RoleCheckboxListProps {
    roles: Role[];
    selectedRoles: string[];
    onRoleChange: (roleName: string, checked: boolean) => void;
}

export const RoleCheckboxList: React.FC<RoleCheckboxListProps> = ({ roles, selectedRoles, onRoleChange }) => {
    return (
        <div className="fade-in">
            {roles.map(role => (
                <label key={role.id}>
                    <input
                        type="checkbox"
                        value={role.id}
                        checked={selectedRoles.includes(role.name)}
                        onChange={(e) => onRoleChange(role.name, e.target.checked)}
                    />
                    {role.name}
                </label>
            ))}
        </div>
    );
};
