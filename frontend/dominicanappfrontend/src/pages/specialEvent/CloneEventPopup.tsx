import React, { useState } from 'react';
import { CloneEventRequest } from '../../models/Interfaces'; // Upewnij się, że ścieżka do Interfaces jest poprawna!

interface CloneEventPopupProps {
    sourceEventName: string;
    onConfirm: (data: CloneEventRequest) => void;
    onCancel: () => void;
}

const CloneEventPopup: React.FC<CloneEventPopupProps> = ({ sourceEventName, onConfirm, onCancel }) => {
    // Domyślnie proponujemy nazwę z dopiskiem (Kopia)
    const [newName, setNewName] = useState(`${sourceEventName} (Kopia)`);
    const [newStartDate, setNewStartDate] = useState('');
    const [newEndDate, setNewEndDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm({
            newName,
            newStartDate,
            newEndDate
        });
    };

    return (
        // Główne tło modala - przyciemnia resztę ekranu i blokuje klikanie pod spodem
        <div className="modal show d-block fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content shadow-lg border-0 rounded-3">

                    {/* Nagłówek */}
                    <div className="modal-header bg-dark text-white">
                        <h5 className="modal-title fw-bold">Klonowanie wydarzenia</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onCancel} aria-label="Zamknij"></button>
                    </div>

                    {/* Ciało (Formularz) */}
                    <div className="modal-body p-4">
                        <div className="alert alert-info small mb-4">
                            Klonujesz: <strong>{sourceEventName}</strong><br />
                            Wszystkie zadania i schematy konfliktów zostaną skopiowane na nowe daty. Zmianie nie ulegną przypisania braci.
                        </div>

                        <form onSubmit={handleSubmit} id="cloneEventForm">
                            <div className="mb-3">
                                <label className="form-label fw-bold">Nowa nazwa</label>
                                <input
                                    type="text"
                                    className="form-control shadow-sm"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="row g-2">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-bold">Nowa data początkowa</label>
                                    <input
                                        type="date"
                                        className="form-control shadow-sm"
                                        value={newStartDate}
                                        onChange={e => setNewStartDate(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-bold">Nowa data końcowa</label>
                                    <input
                                        type="date"
                                        className="form-control shadow-sm"
                                        value={newEndDate}
                                        onChange={e => setNewEndDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Stopka (Przyciski) */}
                    <div className="modal-footer bg-light">
                        <button type="button" className="btn btn-secondary shadow-sm" onClick={onCancel}>
                            Anuluj
                        </button>
                        <button type="submit" form="cloneEventForm" className="btn btn-warning fw-bold shadow-sm">
                            Sklonuj wydarzenie
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CloneEventPopup;