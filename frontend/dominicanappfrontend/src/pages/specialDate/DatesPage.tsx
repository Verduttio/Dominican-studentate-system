import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";
import AlertBox from "../../components/AlertBox";
import LoadingSpinner from "../../components/LoadingScreen";
import React, {useEffect, useState} from "react";
import {SpecialDate} from "../../models/Interfaces";
import PopupDatePicker from "./PopupDatePicker";
import {format} from "date-fns";
import Pagination from "../../components/Pagination";
import ConfirmDeletionPopup from "../../components/ConfirmDeletionPopup";


function DatesPage() {
    const { request: requestStatsDate, error: errorStatsDate, loading: loadingStatsDate } = useHttp(`${backendUrl}/api/dates/stats`, 'GET');
    const [date, setDate] = useState(new Date());
    const {request: patchStatsDate, error: errorPatchStatsDate, loading: loadingPatchStatsDate} = useHttp(`${backendUrl}/api/dates/stats?date=${format(date, 'dd-MM-yyyy')}`, 'PATCH');
    const [statsSpecialDate, setStatsSpecialDate] = useState<SpecialDate>();
    const [refresh, setRefresh] = useState(false);
    const [refreshMessage, setRefreshMessage] = useState('');
    const [validationError, setValidationError] = useState<string>('');
    const [showUpdateStatsDatePopup, setShowUpdateStatsDatePopup] = useState(false);

    const [datesPage, setDatesPage] = useState<{ content: SpecialDate[], totalPages: number }>({ content: [], totalPages: 0 });
    const { error: errorRequestFeastDates, loading: loadingRequestFeastDates, request: requestFeastDates } = useHttp();
    const [currentPage, setCurrentPage] = useState<number>(0);
    const pageSize = 10;
    const [showAddFeastDateForm, setShowAddFeastDateForm] = useState(false)
    const [showAddFeastDatePopup, setShowAddFeastDatePopup] = useState(false);
    const [feastDate, setFeastDate] = useState(new Date());
    const { request: postFeastDate, error: errorPostFeastDate, loading: loadingPostFeastDate } = useHttp(`${backendUrl}/api/dates/feast?date=${format(feastDate, 'dd-MM-yyyy')}`, 'POST');
    const [refreshFeastDates, setRefreshFeastDates] = useState(false);

    const { request: requestDeleteFeastDate, error: errorDeleteFeastDate, loading: loadingDeleteFeastDate } = useHttp();
    const [showConfirmDeletionPopup, setShowConfirmDeletionPopup] = useState(false);

    useEffect(() => {
        requestStatsDate(null, (data) => {
            setStatsSpecialDate(data);
            setDate(new Date(data.date));
        });
    }, [requestStatsDate, refresh]);

    useEffect(() => {
        const baseUrl = `${backendUrl}/api/dates/pageable/feast`;
        const requestUrl = `${baseUrl}?page=${currentPage}&size=${pageSize}`;
        requestFeastDates(null, (data) => setDatesPage({ content: data.content, totalPages: data.totalPages }), false, requestUrl, 'GET')
            .then(() => {});
    }, [requestFeastDates, currentPage, pageSize, refreshFeastDates]);

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

    const handleAddFeastDate = () => {
        let fullDayDate = new Date().setHours(0, 0, 0, 0);
        if (feastDate < new Date(fullDayDate)) {
            setValidationError('Data nie może być z przeszłości');
            return;
        } else {
            setValidationError('');
        }

        postFeastDate(null, () => {
            setRefreshMessage('Data została dodana');
            setShowAddFeastDateForm(false);
            setRefreshFeastDates(!refreshFeastDates);
        });
    }

    const handleDeleteFeastDate = (id: number) => {
        requestDeleteFeastDate(null, () => {
            setShowConfirmDeletionPopup(false);
            setRefreshMessage('Data została usunięta');
            setRefreshFeastDates(!refreshFeastDates);
        }, false, `${backendUrl}/api/dates/feast/${id}`, 'DELETE');
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
                                    <p className="card-title p-2">
                                        <button className="btn btn-outline-secondary" onClick={() => setShowUpdateStatsDatePopup(true)}>
                                            <strong>{date.toLocaleDateString()}</strong>
                                        </button>
                                    </p>
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

    const renderAddFeastDateForm = () => {
        return (
            <div className="d-flex fade-in">
                <div className="card my-3 w-100" style={{maxWidth: '400px'}}>
                    <div className="card-body p-0">
                        <div className="d-flex-no-media-resize justify-content-between">
                            <h6 className="card-title p-2">Data święta:</h6>
                            <p className="card-title p-2">
                                <button className="btn btn-outline-secondary"
                                        onClick={() => setShowAddFeastDatePopup(true)}>
                                    <strong>{feastDate.toLocaleDateString()}</strong>
                                </button>
                            </p>
                        </div>
                        <div className="d-flex justify-content-between">
                            <button className="btn btn-success m-2" onClick={handleAddFeastDate}
                                    disabled={loadingPostFeastDate}>
                                <span>Dodaj</span>
                                {loadingPostFeastDate &&
                                    <span className="spinner-border spinner-border-sm"></span>}
                            </button>
                            <button className="btn btn-secondary m-2" onClick={() => setShowAddFeastDateForm(false)}>Anuluj</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const renderFeastDates = () => {
        if (loadingRequestFeastDates) return <LoadingSpinner/>;
        if (errorRequestFeastDates) return <AlertBox text={errorRequestFeastDates} type={'danger'} width={'500px'}/>;

        return (
            <div className="fade-in">
                <div className="d-flex justify-content-center">
                    {errorDeleteFeastDate && <AlertBox text={errorDeleteFeastDate} type={'danger'} width={'500px'}/>}
                    <div className="table-responsive" style={{maxWidth: '400px'}}>
                        <table className="table table-hover table-striped table-rounded table-shadow text-center">
                            <thead className="table-dark">
                            <tr>
                                <th>Data</th>
                                <th>Akcja</th>
                            </tr>
                            </thead>
                            <tbody>
                            {datesPage.content.map((date) => {
                                return (
                                    <tr key={date.id}>
                                        <td>{date.date}</td>
                                        <td>
                                            <button className="btn btn-danger" onClick={() => {setShowConfirmDeletionPopup(true)}}>
                                                Usuń
                                            </button>
                                            {showConfirmDeletionPopup && <ConfirmDeletionPopup onHandle={() => handleDeleteFeastDate(date.id)} onClose={() => setShowConfirmDeletionPopup(false)}/>}
                                        </td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
                <Pagination currentPage={currentPage} totalPages={datesPage.totalPages} onPageChange={(page) => setCurrentPage(page)}/>
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
            {validationError && <AlertBox text={validationError} type={'danger'} width={'500px'}/>}
            {renderStatsDate()}
            <div className="d-flex justify-content-center">
                <h3 className="entity-header-dynamic-size mt-4 mb-0">Daty świąt</h3>
            </div>
            <div className="d-flex justify-content-center">
                {showAddFeastDateForm ? (
                    renderAddFeastDateForm()
                ) : (
                    <button className="btn btn-success m-2" onClick={() => {
                        setShowAddFeastDateForm(true)
                    }}>
                        Dodaj święto
                    </button>
                )
                }
            </div>
            {renderFeastDates()}
            {showUpdateStatsDatePopup && <PopupDatePicker selectedDate={date} onDateChange={setDate}
                                                          handleCloseCalendar={() => setShowUpdateStatsDatePopup(false)}/>}
            {showAddFeastDatePopup && <PopupDatePicker selectedDate={feastDate} onDateChange={setFeastDate}
                                                       handleCloseCalendar={() => setShowAddFeastDatePopup(false)}/>}
        </div>
    )
}

export default DatesPage;