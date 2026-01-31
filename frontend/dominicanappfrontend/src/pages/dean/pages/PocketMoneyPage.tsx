import React, { useEffect, useState } from 'react';
import { addMonths, subMonths, format } from 'date-fns';
import { pl } from 'date-fns/locale';
import axios from 'axios';
import { backendUrl } from '../../../utils/constants'; // Dopasuj ścieżkę importu!
import { PocketMoneyResponseDTO } from '../../../models/Interfaces'; // Dopasuj ścieżkę!
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faSave, faSpinner, faList } from '@fortawesome/free-solid-svg-icons';
import AlertBox from '../../../components/AlertBox';

const PocketMoneyPage = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [data, setData] = useState<PocketMoneyResponseDTO | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Stan dla stawek (inputy na dole)
    const [rates, setRates] = useState({ pocketMoney: 100, namedayMoney: 50 });
    const [savingRates, setSavingRates] = useState(false);

    // 1. Pobierz dane tabeli dla wybranego miesiąca
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Backend w Javie liczy miesiące od 1 do 12, JS od 0 do 11. Dlatego +1.
            const month = currentDate.getMonth() + 1;
            const response = await axios.get(`${backendUrl}/api/dean/pocket-money?month=${month}`, { withCredentials: true });
            setData(response.data);
        } catch (err: any) {
            setError("Nie udało się pobrać danych kieszonkowego.");
        } finally {
            setLoading(false);
        }
    };

    // 2. Pobierz aktualne stawki (tylko raz przy starcie)
    const fetchRates = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/dean/pocket-money/rates`, { withCredentials: true });
            if (response.data) {
                setRates(response.data);
            }
        } catch (err) {
            console.error("Błąd pobierania stawek", err);
        }
    };

    // Pobierz stawki przy pierwszym renderze
    useEffect(() => {
        fetchRates();
    }, []);

    // Pobierz tabelę za każdym razem, gdy zmienimy miesiąc
    useEffect(() => {
        fetchData();
    }, [currentDate]);

    // Obsługa zapisu stawek
    const handleSaveRates = async () => {
        setSavingRates(true);
        try {
            await axios.post(
                `${backendUrl}/api/dean/pocket-money/rates`,
                null,
                {
                    params: {
                        pocketMoney: rates.pocketMoney,
                        namedayMoney: rates.namedayMoney
                    },
                    withCredentials: true
                }
            );
            // Po zapisie odświeżamy tabelę, bo kwoty mogły się zmienić
            fetchData();
            alert("Stawki zaktualizowane!");
        } catch (err) {
            alert("Błąd podczas zapisywania stawek.");
        } finally {
            setSavingRates(false);
        }
    };

    // Obsługa zmiany miesiąca
    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    return (
        <div className="container mt-4 fade-in">
            <h3 className="text-center mb-4">Rozliczenie miesięczne</h3>

            {/* --- SEKCJA WYBORU MIESIĄCA --- */}
            <div className="d-flex justify-content-center align-items-center mb-4">
                <div className="d-flex align-items-center bg-white shadow-sm rounded p-2 px-3">
                    <button className="btn btn-outline-primary" onClick={handlePrevMonth}>
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <h4 className="mx-4 mb-0" style={{ minWidth: '200px', textAlign: 'center' }}>
                        {format(currentDate, 'LLLL yyyy', { locale: pl }).toUpperCase()}
                    </h4>
                    <button className="btn btn-outline-primary" onClick={handleNextMonth}>
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>
            </div>

            {error && <AlertBox text={error} type="danger" width="100%"/>}

            {loading ? (
                <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <>
                    {/* --- TABELA GŁÓWNA --- */}
                    {data && (
                        <div className="table-responsive shadow-sm p-3 mb-4 bg-white rounded">
                            <table className="table table-hover table-bordered text-center align-middle">
                                <thead className="table-light">
                                <tr>
                                    <th>Rok</th>
                                    <th>Liczba braci</th>
                                    <th>Suma kieszonkowego</th>
                                    <th>Liczba solenizantów</th>
                                    <th>Suma imieninowego</th>
                                    <th className="fw-bold">RAZEM</th>
                                </tr>
                                </thead>
                                <tbody>
                                {data.tableRows.map((row) => (
                                    <tr key={row.romanYear}>
                                        <td className="fw-bold">{row.romanYear}</td>
                                        <td>{row.brotherCount}</td>
                                        <td>{row.pocketMoneyTotal} zł</td>
                                        <td>{row.namedayCount}</td>
                                        <td>{row.namedayMoneyTotal} zł</td>
                                        <td className="fw-bold table-active">{row.rowTotal} zł</td>
                                    </tr>
                                ))}
                                {/* WIERSZ PODSUMOWANIA */}
                                <tr className="table-dark fw-bold">
                                    <td>SUMA</td>
                                    <td>-</td>
                                    <td>{data.totalPocketMoney} zł</td>
                                    <td>-</td>
                                    <td>{data.totalNamedayMoney} zł</td>
                                    <td style={{ fontSize: '1.2em' }}>{data.grandTotal} zł</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* --- LISTA SOLENIZANTÓW --- */}
                    <div className="card mb-4 shadow-sm">
                        <div className="card-header bg-dark text-white">
                            <h5 className="mb-0">Solenizanci w tym miesiącu</h5>
                        </div>
                        <div className="card-body">
                            {data?.namedayBoys && data.namedayBoys.length > 0 ? (
                                <ul className="list-group list-group-flush">
                                    {data.namedayBoys.map((boy) => (
                                        <li key={boy.id} className="list-group-item">
                                            {/* Tutaj wyświetlamy to co skleiłeś na backendzie: Imię Nazwisko (Rok) */}
                                            {boy.name} {boy.surname}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted mb-0">Brak solenizantów w wybranym miesiącu.</p>
                            )}
                        </div>
                    </div>

                    {/* --- USTAWIENIA STAWEK --- */}
                    <div className="card mb-5 border-secondary">
                        <div className="card-header">Ustawienia stawek</div>
                        <div className="card-body">
                            <div className="row g-3 align-items-end">
                                <div className="col-md-4">
                                    <label className="form-label">Kieszonkowe (na osobę)</label>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={rates.pocketMoney}
                                            onChange={(e) => setRates({ ...rates, pocketMoney: parseInt(e.target.value) || 0 })}
                                        />
                                        <span className="input-group-text">zł</span>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Imieninowe (na osobę)</label>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={rates.namedayMoney}
                                            onChange={(e) => setRates({ ...rates, namedayMoney: parseInt(e.target.value) || 0 })}
                                        />
                                        <span className="input-group-text">zł</span>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <button
                                        className="btn btn-success w-100"
                                        onClick={handleSaveRates}
                                        disabled={savingRates}
                                    >
                                        {savingRates ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />} Zapisz i Przelicz
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {data && (
                        <div className="mt-5">
                            <h4 className="text-center mb-3">
                                <FontAwesomeIcon icon={faList} className="me-2"/>
                                Skład roczników
                            </h4>
                            <div className="table-responsive shadow-sm bg-white rounded">
                                <table className="table table-bordered mb-0 align-middle">
                                    <thead className="table-light text-center">
                                    <tr>
                                        <th style={{ width: '100px' }}>Rocznik</th>
                                        <th>Bracia</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {data.tableRows.map((row) => (
                                        <tr key={row.romanYear}>
                                            <td className="text-center fw-bold bg-light">
                                                {row.romanYear}
                                            </td>
                                            <td>
                                                <div className="d-flex flex-wrap gap-2">
                                                    {(row as any).brothers && (row as any).brothers.length > 0 ? (
                                                        (row as any).brothers.map((brother: any) => (
                                                            <span key={brother.id} className="badge bg-light text-dark border p-2 fw-normal" style={{fontSize: '0.9rem'}}>
                                                                {brother.name} {brother.surname}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-muted small fst-italic ps-2">Brak braci</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PocketMoneyPage;