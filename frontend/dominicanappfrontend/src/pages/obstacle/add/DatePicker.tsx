import React from 'react';

interface DatePickerProps {
    fromDate: string;
    toDate: string;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ fromDate, toDate, handleInputChange }) => {
    return (
        <>
            <div className="mb-3">
                <label htmlFor="fromDate" className="form-label">Data początkowa:</label>
                <input
                    className="form-control"
                    type="date"
                    id="fromDate"
                    name="fromDate"
                    value={fromDate}
                    onChange={handleInputChange}
                />
            </div>
            <div className="mb-3">
                <label htmlFor="toDate" className="form-label">Data końcowa:</label>
                <input
                    className="form-control"
                    type="date"
                    id="toDate"
                    name="toDate"
                    value={toDate}
                    onChange={handleInputChange}
                />
            </div>
        </>
    );
};

export default DatePicker;
