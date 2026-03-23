import React, { useState, useEffect } from 'react';
import useHttp from '../../services/UseHttp';
import { backendUrl } from '../../utils/constants';
import { Role, User } from '../../models/Interfaces';
import LoadingSpinner from '../../components/LoadingScreen';
import AlertBox from '../../components/AlertBox';

interface GuestUserModalProps {
    onClose: () => void;
    onSave: () => void;
    guestToEdit: User | null; // Jeśli null, tworzymy nowego
}

const GuestUserModal: React.FC<GuestUserModalProps> = ({ onClose, onSave, guestToEdit }) => {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);

    const { request: submitRequest, loading: submitLoading, error: submitError } = useHttp();
    const { request: rolesRequest, loading: rolesLoading } = useHttp();

    // Pobierz dostępne role i wypełnij dane (jeśli to edycja)
    useEffect(() => {
        // Pobieramy wszystkie role z systemu
        rolesRequest(null, (data: Role[]) => {
            // Odfiltrowujemy tylko role wykonawcze (TASK_PERFORMER), pomijając techniczną rolę ROLE_GUEST
            // Zakładam, że interfejs Role zdefiniowany w Interfaces.ts ma pole `type`
            const assignableRoles = data.filter(r => r.type === 'TASK_PERFORMER' && r.name !== 'ROLE_GUEST');

            setAvailableRoles(assignableRoles.sort((a, b) => a.name.localeCompare(b.name)));
        }, false, `${backendUrl}/api/roles`, 'GET');

        if (guestToEdit) {
            // Tryb EDYCJI - wczytujemy dane
            setName(guestToEdit.name);
            setSurname(guestToEdit.surname);
            setSelectedRoles(guestToEdit.roles.map(r => r.name));
        } else {
            // Tryb TWORZENIA NOWEGO - domyślnie zaznaczamy rolę "Brat"
            setSelectedRoles(['Brat']);
        }
    }, [guestToEdit, rolesRequest]);

    const handleRoleToggle = (roleName: string) => {
        setSelectedRoles(prev =>
            prev.includes(roleName)
                ? prev.filter(r => r !== roleName)
                : [...prev, roleName]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name,
            surname,
            roleNames: selectedRoles
        };

        if (guestToEdit) {
            submitRequest(payload, () => onSave(), false, `${backendUrl}/api/users/guests/${guestToEdit.id}`, 'PUT');
        } else {
            submitRequest(payload, () => onSave(), false, `${backendUrl}/api/users/guests`, 'POST');
        }
    };

    return (
        <div className="modal show d-block fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content shadow-lg border-0 rounded-3">
                    <div className="modal-header bg-info text-dark">
                        <h5 className="modal-title fw-bold">
                            {guestToEdit ? "Edytuj Gościa" : "Dodaj Gościa (Wydarzenie Specjalne)"}
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body p-4">
                        {submitError && <AlertBox type="danger" text={submitError} width="100%" />}

                        <form id="guestForm" onSubmit={handleSubmit}>
                            <div className="row g-2 mb-3">
                                <div className="col-6">
                                    <label className="form-label fw-bold">Imię</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        placeholder="Np. Jan"
                                    />
                                </div>
                                <div className="col-6">
                                    <label className="form-label fw-bold">Nazwisko</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={surname}
                                        onChange={(e) => setSurname(e.target.value)}
                                        required
                                        placeholder="Np. Kowalski"
                                    />
                                </div>
                            </div>

                            <label className="form-label fw-bold mt-2">Uprawnienia gościa (co może robić?)</label>
                            <div className="border rounded p-3 bg-light" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {rolesLoading ? <LoadingSpinner /> : availableRoles.length === 0 ? (
                                    <span className="text-muted small">Brak ról wykonawczych do przypisania.</span>
                                ) : (
                                    availableRoles.map(role => (
                                        <div className="form-check mb-1" key={role.id}>
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`role-${role.id}`}
                                                checked={selectedRoles.includes(role.name)}
                                                onChange={() => handleRoleToggle(role.name)}
                                            />
                                            <label className="form-check-label" htmlFor={`role-${role.id}`} style={{ cursor: 'pointer' }}>
                                                {role.name}
                                            </label>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="form-text small mt-1">
                                Gość pojawi się na liście wyznaczania tylko dla wybranych wyżej ról. Nie będzie widoczny w standardowych grafikach poza wydarzeniami specjalnymi.
                            </div>
                        </form>
                    </div>

                    <div className="modal-footer bg-light">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Anuluj</button>
                        <button type="submit" form="guestForm" className="btn btn-info fw-bold" disabled={submitLoading}>
                            {submitLoading ? <span className="spinner-border spinner-border-sm"></span> : "Zapisz Gościa"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuestUserModal;