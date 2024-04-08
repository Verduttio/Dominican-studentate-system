import React, { useState } from 'react';
import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";
import "../../components/Popup.css";
import AlertBox from "../../components/AlertBox";

interface ChangeNameSurnameCardProps {
    userId: number;
    onClose: () => void;
}
const ChangeNameSurnamePopup: React.FC<ChangeNameSurnameCardProps> = ({ userId, onClose }) => {
    const { request: changePassword, error: errorChangePassword,  loading: loadingChangePassword } = useHttp(
        `${backendUrl}/api/users/${userId}/name_surname`, 'PATCH');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [validationError, setValidationError] = useState<string>('');
    const [fieldsSuccessfullyChanged, setFieldsSuccessfullyChanged] = useState(false);

    const validateFields = () => {
        if (name === '' || surname === '') {
            setValidationError('Imię i nazwisko nie mogą być puste');
            return false;
        }

        return true;
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (validateFields()) {
            changePassword({name: name, surname: surname}, () => {
                setFieldsSuccessfullyChanged(true);
            });
        }
    };

    return (
        <div className="custom-modal-backdrop fade-in">
            <div className="card custom-modal">
                <div className="card-body">
                    <div className="card-title">
                        {fieldsSuccessfullyChanged && <AlertBox text={"Dane zostały zmienione"} type="success" width={'500px'} />}
                        {validationError && <AlertBox text={validationError} type="danger" width={'500px'} />}
                        {errorChangePassword && <AlertBox text={errorChangePassword} type="danger" width={'500px'} />}
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
                                <label htmlFor="name" className="form-label">Imię</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="name"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        setValidationError('')
                                    }}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="surname" className="form-label">Nazwisko</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="surname"
                                    value={surname}
                                    onChange={(e) => {
                                        setSurname(e.target.value);
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

export default ChangeNameSurnamePopup;
