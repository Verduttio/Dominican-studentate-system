import React from 'react';
import {Role, RoleType, roleTypeTranslation} from '../../models/Interfaces';

interface RoleFormFieldsProps {
    roleData: Role | null;
    setRoleData: React.Dispatch<React.SetStateAction<Role | null>>;
}

const RoleFormFields: React.FC<RoleFormFieldsProps> = ({ roleData, setRoleData }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        console.log(`Name: ${name}, Value: ${value}, Checked: ${target.checked}`); // Logowanie wartości

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
                    {Object.values([RoleType.SUPERVISOR, RoleType.TASK_PERFORMER]).map((type) => (
                        <option key={type} value={type}>{roleTypeTranslation[type]}</option>
                    ))}
                </select>
            </div>
            {roleData?.type === RoleType.SUPERVISOR && (
                <div className="mb-3">
                    <div className="d-flex justify-content-between">
                        <label className="form-check-label me-2" htmlFor="defaultCreatorSelection">
                            <strong>Kreator tygodniowy jako domyślny</strong>
                        </label>
                        <div className="form-check form-switch">
                            <input
                                className="form-check-input"
                                name="weeklyScheduleCreatorDefault"
                                type="checkbox"
                                id="defaultCreatorSelection"
                                checked={roleData?.weeklyScheduleCreatorDefault}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RoleFormFields;
