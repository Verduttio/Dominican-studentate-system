import React from 'react';
import { daysOfWeekMap } from '../../../utils/DaysOfWeekMap';

interface DaysOfWeekCheckboxListProps {
    selectedDays: string[];
    onDayChange: (dayEnglish: string, checked: boolean) => void;
}

export const DaysOfWeekCheckboxList: React.FC<DaysOfWeekCheckboxListProps> = ({ selectedDays, onDayChange }) => {
    return (
        <div className="fade-in">
            {Object.entries(daysOfWeekMap).map(([polishDay, englishDay]) => (
                <label key={polishDay}>
                    <input
                        type="checkbox"
                        value={polishDay}
                        checked={selectedDays.includes(englishDay)}
                        onChange={(e) => onDayChange(englishDay, e.target.checked)}
                    />
                    {polishDay}
                </label>
            ))}
        </div>
    );
};
