import React, { useState } from 'react';
import useHttp from '../../services/UseHttp';
import {Role} from '../../models/Interfaces';
import { backendUrl } from '../../utils/constants';
import {useNavigate} from "react-router-dom";
import RoleFormFields from "./RoleFormFields";
import '../../components/AddEditForm.css';
import LoadingSpinner from "../../components/LoadingScreen";
import AlertBox from "../../components/AlertBox";
import useIsFunkcyjny, {UNAUTHORIZED_PAGE_TEXT} from "../../services/UseIsFunkcyjny";

function AddRole() {
    const initialRoleState : Role= {
        id: 0,
        name: '',
        type: ''
    }

    const [roleData, setRoleData] = useState<Role | null>(initialRoleState);
    const [validationError, setValidationError] = useState<string>('');
    const { request, error, loading } = useHttp(`${backendUrl}/api/roles`, 'POST');
    const { isFunkcyjny, isFunkcyjnyLoading, isFunkcyjnyInitialized } = useIsFunkcyjny();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleData?.name || !roleData?.type) {
            setValidationError("Wszystkie pola muszą być wypełnione.");
            return;
        }

        request(roleData, () => {
            navigate('/roles', { state: { message: 'Pomyślnie dodano rolę' } });
        });
    };

    if(isFunkcyjnyLoading || isFunkcyjnyInitialized) {
        return <LoadingSpinner/>;
    } else if(!isFunkcyjny) return <AlertBox text={UNAUTHORIZED_PAGE_TEXT} type="danger" width={'500px'} />;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Dodaj Rolę</h1>
            </div>
            <div className="edit-entity-container mw-100" style={{width: '400px'}}>
                {error && <div className="alert alert-danger">{error}</div>}
                {validationError && <div className="alert alert-danger">{validationError}</div>}
                <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                    <RoleFormFields roleData={roleData} setRoleData={setRoleData}/>
                    <div className="d-flex justify-content-center">
                        <button className="btn btn-success" type="submit" disabled={loading}>Dodaj</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddRole;
