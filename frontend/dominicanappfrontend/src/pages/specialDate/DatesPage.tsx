import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";
import AlertBox from "../../components/AlertBox";
import LoadingSpinner from "../../components/LoadingScreen";
import React, {useEffect, useState} from "react";
import {SpecialDate} from "../../models/Interfaces";
import PopupDatePicker from "./PopupDatePicker";
import {format} from "date-fns";


function DatesPage() {
    const { request: requestStatsDate, error: errorStatsDate, loading: loadingStatsDate } = useHttp(`${backendUrl}/api/dates/stats`, 'GET');
    const [date, setDate] = useState(new Date());
    const {request: patchStatsDate, error: errorPatchStatsDate, loading: loadingPatchStatsDate} = useHttp(`${backendUrl}/api/dates/stats?date=${format(date, 'dd-MM-yyyy')}`, 'PATCH');
    const [statsSpecialDate, setStatsSpecialDate] = useState<SpecialDate>();
    const [refresh, setRefresh] = useState(false);
    const [refreshMessage, setRefreshMessage] = useState('');
    const [validationError, setValidationError] = useState<string>('');

    useEffect(() => {
        requestStatsDate(null, (data) => {
            setStatsSpecialDate(data);
            setDate(new Date(data.date));
        });
    }, [requestStatsDate, refresh]);

    const handleUpdateStatsDate = () => {
        if (date > new Date()) {
            setValidationError('Data nie może być z przyszłości');
            return;
        } else {
            setValidationError('');
        }

        patchStatsDate(null, () => {
            setRefreshMessage('Data statystyk została zaktualizowana');
            setRefresh(!refresh);
        });
    }

    const renderStatsDate = () => {
        if (loadingStatsDate) return <LoadingSpinner/>;
        if (errorStatsDate) return <AlertBox text={errorStatsDate} type={'danger'} width={'500px'}/>;

        return (
            <div className="fade-in">
                <div className="d-flex">
                    <div className="card mt-4 w-100" style={{maxWidth: '400px'}}>
                        <div className="card-body p-0">
                            <div className="d-flex-no-media-resize justify-content-between">
                                    <h6 className="card-title p-2">Data zbierania statystyk:</h6>
                                    <p className="card-title p-2"> <PopupDatePicker selectedDate={date} onDateChange={setDate} /></p>
                            </div>
                            {statsSpecialDate?.date !== format(date, 'yyyy-MM-dd') && (
                                <div className="d-flex justify-content-center">
                                    <button className="btn btn-success mb-2" onClick={handleUpdateStatsDate}
                                            disabled={loadingPatchStatsDate}>
                                        <span>Zatwierdź</span>
                                        {loadingPatchStatsDate && <span className="spinner-border spinner-border-sm"></span>}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <h1 className="entity-header">Daty systemowe</h1>
            </div>
            {refreshMessage && <AlertBox text={refreshMessage} type={'success'} width={'500px'}/>}
            {errorPatchStatsDate && <AlertBox text={errorPatchStatsDate} type={'danger'} width={'500px'}/>}
            {validationError && <AlertBox text={validationError} type={'danger'} width={'500px'}/> }
            {renderStatsDate()}
        </div>
    )
}

export default DatesPage;