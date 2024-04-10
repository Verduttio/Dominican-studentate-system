import React from 'react';
import { RoleCheckboxList } from './RoleCheckboxList';
import { DaysOfWeekCheckboxList } from './DaysOfWeekCheckboxList';

interface TaskFormFieldsProps {
    taskData: any;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    handleRoleChange: (roleName: string, checked: boolean) => void;
    handleSupervisorRoleChange: (roleName: string) => void;
    handleDayChange: (dayEnglish: string, checked: boolean) => void;
    rolesTaskPerformer: any[];
    rolesSupervisor: any[];
}

const TaskFormFields: React.FC<TaskFormFieldsProps> = ({ taskData, handleChange, handleRoleChange, handleSupervisorRoleChange, handleDayChange, rolesTaskPerformer, rolesSupervisor }) => {
    return (
        <>
            <div className="mb-3">
                <label htmlFor="name" className="form-label">
                    Nazwa oficjum:
                </label>
                <input
                    className="form-control-sm"
                    name="name"
                    value={taskData.name}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-3">
                <label htmlFor="name" className="form-label">
                    Skrót oficjum:
                </label>
                <input
                    className="form-control-sm"
                    name="nameAbbrev"
                    value={taskData.nameAbbrev}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-3">
                <label htmlFor="participantsLimit" className="form-label">Limit uczestników:</label>
                <input
                    className="form-control-sm"
                    id="participantsLimit"
                    name="participantsLimit"
                    type="number"
                    value={taskData.participantsLimit.toString()}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Role potrzebne do wykonania oficjum:</label>
                <RoleCheckboxList roles={rolesTaskPerformer} selectedRoles={taskData.allowedRoleNames}
                                  onRoleChange={handleRoleChange}/>
            </div>
            <div className="mb-3">
                <label className="form-label">Kto może wyznaczyć do tego oficjum:</label>
                <select
                    id="supervisorRoleName"
                    name="supervisorRoleName"
                    className="form-select"
                    value={taskData.supervisorRoleName}
                    onChange={e => handleSupervisorRoleChange(e.target.value)}
                >
                    <option value="">Wybierz funkcyjnego</option>
                    {rolesSupervisor.map(role => (
                        <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                </select>
            </div>
            <div className="mb-3">
                <label className="form-label">Dni tygodnia:</label>
                <DaysOfWeekCheckboxList selectedDays={taskData.daysOfWeek} onDayChange={handleDayChange}/>
            </div>
            <div className="mb-3">
                <label className="form-label custom-checkbox">
                    Uczestnik na cały okres:
                    <input
                        className="form-check-input"
                        name="participantForWholePeriod"
                        type="checkbox"
                        checked={taskData.participantForWholePeriod}
                        onChange={handleChange}
                    />
                </label>
            </div>
        </>
    );
}

export default TaskFormFields;