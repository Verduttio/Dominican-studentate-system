import React, { useState } from 'react';
import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";
import "../../components/Popup.css";

interface ChangePasswordCardProps {
    userId: number;
    onClose: () => void;
}
const ChangePasswordPopup: React.FC<ChangePasswordCardProps> = ({ userId, onClose }) => {
    const { request: changePassword, error: errorChangePassword,  loading: loadingChangePassword } = useHttp(
        `${backendUrl}/api/users/${userId}/password`, 'PATCH');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [validationError, setValidationError] = useState<string>('');
    const [passwordSuccessfullyChanged, setPasswordSuccessfullyChanged] = useState(false);

    const validatePassword = () => {
        if (password !== confirmPassword) {
            setValidationError('Hasła nie są takie same');
            return false;
        }
        if (password.length < 8) {
            setValidationError('Hasło musi mieć co najmniej 8 znaków');
            return false;
        }

        return true;
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (validatePassword()) {
            changePassword({newPassword: password}, () => {
                setPasswordSuccessfullyChanged(true);
            });
        }
    };

    return (
        <div className="custom-modal-backdrop fade-in">
            <div className="card custom-modal">
                <div className="card-body">
                    <div className="card-title">
                        {passwordSuccessfullyChanged && <div className="alert alert-success text-center">Hasło zostało zmienione</div>}
                        {validationError && <div className="alert alert-danger">{validationError}</div>}
                        {errorChangePassword && <div className="alert alert-danger">{errorChangePassword}</div>}
                    </div>
                    {passwordSuccessfullyChanged ? (
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
                                <label htmlFor="password" className="form-label">Nowe hasło</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setValidationError('')
                                    }}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="confirmPassword" className="form-label">Potwierdź hasło</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        setValidationError('')
                                    }}
                                />
                            </div>
                            <div className="d-flex justify-content-between">
                                <button
                                    type="button"
                                    className="btn btn-secondary m-1"
                                    onClick={onClose}
                                    disabled={loadingChangePassword}
                                >
                                    Anuluj
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-danger m-1"
                                    onClick={e => handleSubmit}
                                    disabled={loadingChangePassword}
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

export default ChangePasswordPopup;
