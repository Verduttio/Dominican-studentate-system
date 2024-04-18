import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface PopupDatePickerProps {
    selectedDate: Date;
    onDateChange: (newDate: Date) => void;
}


const PopupDatePicker: React.FC<PopupDatePickerProps> = ({ selectedDate, onDateChange }) => {
    const [calendarOpen, setCalendarOpen] = useState(false);

    const handleOpenCalendar = () => {
        setCalendarOpen(true);
    };

    const handleCloseCalendar = () => {
        setCalendarOpen(false);
    };

    const handleDateChange = (date: Date) => {
        onDateChange(date);
        handleCloseCalendar();
    };

    return (
        <div>
            <button className="btn btn-outline-secondary" onClick={handleOpenCalendar}>
                <strong>{selectedDate.toLocaleDateString()}</strong>
            </button>
            {calendarOpen && (
                <div className="custom-modal-backdrop fade-in">
                    <div className="card custom-modal text-center">
                        <div className="card-body">
                            <div className="modal-body">
                                <DatePicker
                                    selected={selectedDate}
                                    onChange={handleDateChange}
                                    inline
                                />
                            </div>
                            <div className="modal-footer d-flex justify-content-center">
                                <button className="btn btn-secondary" onClick={handleCloseCalendar}>Anuluj</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PopupDatePicker;
