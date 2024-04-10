import React from 'react';
import { TaskShortInfo } from "../../models/Interfaces";
import {DaysOfWeekCheckboxList} from "../task/addTask/DaysOfWeekCheckboxList";

interface ConflictFormFieldsProps {
    tasks: TaskShortInfo[];
    formData: {
        task1Id: number;
        task2Id: number;
        daysOfWeek: string[];
    };
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onChangeDays: (dayEnglish: string, checked: boolean) => void;
}

const ConflictFormFields: React.FC<ConflictFormFieldsProps> = ({ tasks, formData, onChange, onChangeDays }) => {
    const { task1Id, task2Id, daysOfWeek} = formData;

    return (
        <>
            <div className="mb-3">
                <label htmlFor="task1Id" className="form-label">Oficjum 1:</label>
                <select
                    id="task1Id"
                    name="task1Id"
                    className="form-select"
                    value={task1Id?.toString()}
                    onChange={onChange}
                >
                    <option value="">Wybierz oficjum 1</option>
                    {tasks.map(task => <option key={task.id} value={task.id}>{task.name}</option>)}
                </select>
            </div>
            <div className="mb-3">
                <label htmlFor="task2Id" className="form-label">Oficjum 2:</label>
                <select
                    id="task2Id"
                    name="task2Id"
                    className="form-select"
                    value={task2Id?.toString()}
                    onChange={onChange}
                >
                    <option value="">Wybierz oficjum 2</option>
                    {tasks.map(task => <option key={task.id} value={task.id}>{task.name}</option>)}
                </select>
            </div>
            <div className="mb-3">
                <label className="form-label">Konflikt w:</label>
                <DaysOfWeekCheckboxList selectedDays={daysOfWeek} onDayChange={onChangeDays}/>
            </div>
        </>
    );
};

export default ConflictFormFields;
