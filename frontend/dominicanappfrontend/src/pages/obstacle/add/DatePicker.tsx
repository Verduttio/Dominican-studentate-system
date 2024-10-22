import React, {useState} from 'react';

interface DatePickerProps {
    fromDate: string;
    toDate: string;
    handleInputChange: (name: string, value: string) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ fromDate, toDate, handleInputChange }) => {
    const [isSingleDay, setIsSingleDay] = useState<boolean>(true);

    const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setIsSingleDay(isChecked);

        if (isChecked) {
            handleInputChange('toDate', fromDate);
        }
    };

    const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        handleInputChange('fromDate', value);

        if (isSingleDay) {
            handleInputChange('toDate', value);
        }
    };

    const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleInputChange('toDate', e.target.value);
    };

    return (
        <>
            <div className="d-flex justify-content-between">
                <label className="form-label" htmlFor="singleDaySwitch">
                    Jeden dzień
                </label>
                <div className="form-check form-switch">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="singleDaySwitch"
                        checked={isSingleDay}
                        onChange={handleToggleChange}
                    />
                </div>
            </div>
            <div className="mb-3">
                <label htmlFor="fromDate" className="form-label">
                    {!isSingleDay ? 'Data początkowa:' : 'Data:'}
                </label>
                <input
                    className="form-control"
                    type="date"
                    id="fromDate"
                    name="fromDate"
                    value={fromDate}
                    onChange={handleFromDateChange}
                />
            </div>
            {!isSingleDay && (
                <div className="mb-3">
                    <label htmlFor="toDate" className="form-label">Data końcowa:</label>
                    <input
                        className="form-control"
                        type="date"
                        id="toDate"
                        name="toDate"
                        value={toDate}
                        onChange={handleToDateChange}
                    />
                </div>
            )}
        </>
    );
};

export default DatePicker;
