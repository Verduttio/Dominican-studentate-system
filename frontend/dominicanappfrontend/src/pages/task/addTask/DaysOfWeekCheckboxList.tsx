import React from 'react';
import { daysOfWeekMap } from '../../../utils/DaysOfWeekMap';

interface DaysOfWeekCheckboxListProps {
    selectedDays: string[];
    onDayChange: (dayEnglish: string, checked: boolean) => void;
}

export const DaysOfWeekCheckboxList: React.FC<DaysOfWeekCheckboxListProps> = ({ selectedDays, onDayChange }) => {
    return (
        <>
            {Object.entries(daysOfWeekMap).map(([polishDay, englishDay]) => (
                <label className="form-check custom-checkbox" key={polishDay}>
                    <input
                        className="form-check-input"
                        type="checkbox"
                        value={polishDay}
                        checked={selectedDays.includes(englishDay)}
                        onChange={(e) => onDayChange(englishDay, e.target.checked)}
                    />
                    {polishDay}
                </label>
            ))}
        </>
    );
};
