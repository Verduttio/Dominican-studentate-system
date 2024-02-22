import React from 'react';
import { TaskShortInfo } from "../../models/Interfaces";

interface ConflictFormFieldsProps {
    tasks: TaskShortInfo[];
    formData: {
        task1Id: number;
        task2Id: number;
    };
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const ConflictFormFields: React.FC<ConflictFormFieldsProps> = ({ tasks, formData, onChange }) => {
    const { task1Id, task2Id } = formData;

    return (
        <>
            <div className="mb-3">
                <label htmlFor="task1Id" className="form-label">Zadanie 1:</label>
                <select
                    id="task1Id"
                    name="task1Id"
                    className="form-select"
                    value={task1Id?.toString()}
                    onChange={onChange}
                >
                    <option value="">Wybierz zadanie 1</option>
                    {tasks.map(task => <option key={task.id} value={task.id}>{task.name}</option>)}
                </select>
            </div>
            <div className="mb-3">
                <label htmlFor="task2Id" className="form-label">Zadanie 2:</label>
                <select
                    id="task2Id"
                    name="task2Id"
                    className="form-select"
                    value={task2Id?.toString()}
                    onChange={onChange}
                >
                    <option value="">Wybierz zadanie 2</option>
                    {tasks.map(task => <option key={task.id} value={task.id}>{task.name}</option>)}
                </select>
            </div>
        </>
    );
};

export default ConflictFormFields;
