import React from 'react';
import "../../components/Popup.css";

interface ConfirmAssignmentPopupProps {
    onHandle: () => void;
    onClose: () => void;
    text: string;
}

const ConfirmAssignmentPopup: React.FC<ConfirmAssignmentPopupProps> = ({ onHandle, onClose, text }) => {
    return (
        <div className="custom-modal-backdrop fade-in">
            <div className="card custom-modal">
                <div className="card-body">
                    <div className="modal-header">
                        <h5 className="modal-title">Potwierdzenie wyznaczenia zadania</h5>
                    </div>
                    <div className="modal-body">
                        <p>{text}</p>
                    </div>
                    <div className="modal-footer d-flex justify-content-between">
                        <button className="btn btn-secondary m-1" onClick={onClose}>Anuluj</button>
                        <button className="btn btn-danger m-1" onClick={onHandle}>Wyznacz</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmAssignmentPopup;
