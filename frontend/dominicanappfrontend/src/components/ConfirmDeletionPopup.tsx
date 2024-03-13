import React from 'react';
import "./Popup.css";

interface ConfirmDeletionPopupProps {
    onHandle: () => void;
    onClose: () => void;
}

const ConfirmDeletionPopup: React.FC<ConfirmDeletionPopupProps> = ({ onHandle, onClose }) => {
    return (
        <div className="custom-modal-backdrop fade-in">
            <div className="card custom-modal">
                <div className="card-body">
                    <div className="modal-body">
                        <h5>Czy na pewno chcesz dokonać usunięcia?</h5>
                    </div>
                    <div className="modal-footer d-flex justify-content-between">
                        <button className="btn btn-secondary m-1" onClick={onClose}>Anuluj</button>
                        <button className="btn btn-danger m-1" onClick={onHandle}>Tak</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeletionPopup;
