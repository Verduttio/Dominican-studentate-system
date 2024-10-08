import React, { useState } from 'react';
import useHttp from "../../services/UseHttp";
import { backendUrl } from "../../utils/constants";
import "../../components/Popup.css";
import AlertBox from "../../components/AlertBox";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";
import AlertBoxTimed from "../../components/AlertBoxTimed";
import { registerLocale } from "react-datepicker";
import { pl } from 'date-fns/locale';


registerLocale('pl', pl);

interface ChangeEntryDatePopupProps {
    userId: number;
    initialDateTime: string;
    onClose: () => void;
}

const ChangeEntryDatePopup: React.FC<ChangeEntryDatePopupProps> = ({ userId, initialDateTime, onClose }) => {
    const { request: changeEntryDate, error: errorChangeEntryDate, loading: loadingChangeEntryDate } = useHttp(
        `${backendUrl}/api/users/${userId}/entry_date`, 'PATCH');
    const [selectedDate, setSelectedDate] = useState<Date | null>(initialDateTime ? new Date(initialDateTime) : null);
    const [selectedTime, setSelectedTime] = useState<string>(initialDateTime ? initialDateTime.split('T')[1].split(':')[0] + ':' + initialDateTime.split('T')[1].split(':')[1] : '');
    const [validationError, setValidationError] = useState<string>('');
    const [fieldsSuccessfullyChanged, setFieldsSuccessfullyChanged] = useState(false);

    const validateFields = () => {
        if (!selectedDate || !selectedTime) {
            setValidationError('Data i godzina nie mogą być puste');
            return false;
        }

        const selectedDateTime = new Date(`${selectedDate?.toISOString().split('T')[0]}T${selectedTime}:00`);
        const now = new Date();

        if (selectedDateTime > now) {
            setValidationError('Data i godzina nie mogą być w przyszłości');
            return false;
        }

        return true;
    };

    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedTime(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (validateFields()) {
            const dateStr = selectedDate?.toISOString().split('T')[0]; // YYYY-MM-DD
            const dateTimeStr = `${dateStr}T${selectedTime}:00`; // "YYYY-MM-DD HH:mm:00"

            try {
                changeEntryDate({ entryDate: dateTimeStr }, () => {
                    setFieldsSuccessfullyChanged(true);
                });
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <div className="custom-modal-backdrop fade-in">
            <div className="card custom-modal">
                <div className="card-body">
                    <div className="card-title">
                        {fieldsSuccessfullyChanged && <AlertBox text={"Dane zostały zmienione"} type="success" width={'500px'} />}
                        {validationError && <AlertBoxTimed text={validationError} type="danger" width={'500px'} onClose={() => { setValidationError("") }} />}
                        {errorChangeEntryDate && <AlertBox text={errorChangeEntryDate} type="danger" width={'500px'} />}
                    </div>
                    {fieldsSuccessfullyChanged ? (
                        <div className="d-flex justify-content-center">
                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={onClose}
                            >
                                Zamknij
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="date" className="form-label">Data</label>
                                <div className="d-flex justify-content-center">
                                    <div className="p-2 border rounded">
                                        <DatePicker
                                            selected={selectedDate}
                                            onChange={handleDateChange}
                                            dateFormat="yyyy-MM-dd"
                                            locale="pl"
                                            className="form-control"
                                            inline
                                            showYearDropdown
                                            yearDropdownItemNumber={20}
                                            scrollableYearDropdown
                                            showMonthDropdown
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="time" className="form-label">Godzina</label>
                                <div className="input-group">
                                    <input
                                        type="time"
                                        id="time"
                                        className="form-control"
                                        value={selectedTime}
                                        onChange={handleTimeChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="d-flex justify-content-between">
                                <button
                                    type="button"
                                    className="btn btn-secondary m-1"
                                    onClick={onClose}
                                    disabled={loadingChangeEntryDate}
                                >
                                    Anuluj
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-danger m-1"
                                    disabled={loadingChangeEntryDate}
                                >
                                    Zmień
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChangeEntryDatePopup;
