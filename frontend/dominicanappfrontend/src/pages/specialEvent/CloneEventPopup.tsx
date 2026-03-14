import React, { useState } from 'react';
import '../../components/Popup.css'; // Zakładam, że masz globalne style do popupów
import { CloneEventRequest } from '../../models/Interfaces';

interface Props {
    sourceEventName: string;
    onConfirm: (data: CloneEventRequest) => void;
    onCancel: () => void;
}

const CloneEventPopup: React.FC<Props> = ({ sourceEventName, onConfirm, onCancel }) => {
    const [newName, setNewName] = useState(`${sourceEventName} (Kopia)`);
    const [newStartDate, setNewStartDate] = useState('');
    const [newEndDate, setNewEndDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newName && newStartDate && newEndDate) {
            onConfirm({ newName, newStartDate, newEndDate });
        }
    };

    return (
        <div className="popup-container">
            <div className="popup">
                <h3>Klonowanie wydarzenia</h3>
                <p>Klonujesz: <strong>{sourceEventName}</strong></p>
                <p className="small-text">Wszystkie zadania i schematy konfliktów zostaną skopiowane na nowe daty.</p>

                <form onSubmit={handleSubmit} className="popup-form">
                    <div className="form-group">
                        <label>Nowa nazwa:</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Nowa data początkowa:</label>
                        <input
                            type="date"
                            value={newStartDate}
                            onChange={(e) => setNewStartDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Nowa data końcowa:</label>
                        <input
                            type="date"
                            value={newEndDate}
                            onChange={(e) => setNewEndDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="popup-buttons">
                        <button type="button" className="btn-cancel" onClick={onCancel}>Anuluj</button>
                        <button type="submit" className="btn-confirm">Sklonuj</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CloneEventPopup;