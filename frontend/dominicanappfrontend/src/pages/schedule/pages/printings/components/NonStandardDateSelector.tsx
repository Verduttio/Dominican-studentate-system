import React, { useState } from 'react';
import { format } from 'date-fns';
import AlertBox from '../../../../../components/AlertBox';
import PopupDatePicker from '../../../../specialDate/PopupDatePicker';

interface NonStandardDateSelectorProps {
    nonStandardStartDate: Date;
    setNonStandardStartDate: (date: Date) => void;
    nonStandardEndDate: Date;
    setNonStandardEndDate: (date: Date) => void;
    onFetchSchedule: () => void;
    validationError: string | null;
}

const NonStandardDateSelector: React.FC<NonStandardDateSelectorProps> = ({
                                                                             nonStandardStartDate,
                                                                             setNonStandardStartDate,
                                                                             nonStandardEndDate,
                                                                             setNonStandardEndDate,
                                                                             onFetchSchedule,
                                                                             validationError,
                                                                         }) => {
    const [showPopupDatePickerForStart, setShowPopupDatePickerForStart] = useState<boolean>(false);
    const [showPopupDatePickerForEnd, setShowPopupDatePickerForEnd] = useState<boolean>(false);

    return (
        <>
            {validationError && <AlertBox text={validationError} type="danger" width="500px" />}
            <div className="d-flex justify-content-center">
                <div className="card my-3">
                    <div className="card-body">
                        <div className="d-flex justify-content-between mb-2">
                            <h5 className="card-title mx-2">Początek:</h5>
                            <button
                                className="btn btn-outline-dark mx-2"
                                onClick={() => setShowPopupDatePickerForStart(true)}
                            >
                                {format(nonStandardStartDate, 'dd-MM-yyyy')}
                            </button>
                            {showPopupDatePickerForStart && (
                                <PopupDatePicker
                                    selectedDate={nonStandardStartDate}
                                    onDateChange={(date) => {
                                        setNonStandardStartDate(date);
                                        setShowPopupDatePickerForStart(false);
                                    }}
                                    handleCloseCalendar={() => setShowPopupDatePickerForStart(false)}
                                />
                            )}
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <h5 className="card-title mx-2">Koniec:</h5>
                            <button
                                className="btn btn-outline-dark mx-2"
                                onClick={() => setShowPopupDatePickerForEnd(true)}
                            >
                                {format(nonStandardEndDate, 'dd-MM-yyyy')}
                            </button>
                            {showPopupDatePickerForEnd && (
                                <PopupDatePicker
                                    selectedDate={nonStandardEndDate}
                                    onDateChange={(date) => {
                                        setNonStandardEndDate(date);
                                        setShowPopupDatePickerForEnd(false);
                                    }}
                                    handleCloseCalendar={() => setShowPopupDatePickerForEnd(false)}
                                />
                            )}
                        </div>
                        <div className="d-flex justify-content-center">
                            <button className="btn btn-success" onClick={onFetchSchedule}>
                                Wyszukaj
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NonStandardDateSelector;
