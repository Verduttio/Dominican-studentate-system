import React, { useEffect, useState } from 'react';
import useHttp from '../../services/UseHttp';
import {Role, RoleType, roleTypeTranslation} from '../../models/Interfaces';
import { backendUrl } from '../../utils/constants';
import {useLocation, useNavigate} from "react-router-dom";
import LoadingSpinner from "../../components/LoadingScreen";
import useIsAdmin from "../../services/UseIsAdmin";
import AlertBox from "../../components/AlertBox";

function ViewRoles() {
    const [roles, setRoles] = useState<Role[]>([]);
    const { request, error, loading } = useHttp(`${backendUrl}/api/roles`, 'GET');
    const { isAdmin } = useIsAdmin();
    const navigate = useNavigate();
    const location = useLocation();
    const locationStateMessage = location.state?.message;

    useEffect(() => {
        request(null, (data: Role[]) => {
            setRoles(data);
            console.log(data);
        });
    }, [request]);

    if (loading) return <LoadingSpinner/>;
    if (error) return <AlertBox text={error} type={'danger'} width={'500px'}/>;

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <div>
                    <h1 className="entity-header">Role</h1>
                </div>
            </div>
            <div className="d-flex justify-content-center">
                {locationStateMessage && <AlertBox text={locationStateMessage} type={'success'} width={'500px'}/>}
            </div>
            <div className="d-flex justify-content-center">
                <div className="table-responsive" style={{maxWidth: '600px'}}>
                    <table className="table table-hover table-striped table-rounded table-shadow">
                        <thead className="table-dark">
                        <tr>
                            <th>Nazwa</th>
                            <th>Typ</th>
                            <th>Kreator</th>
                            {isAdmin && <th>Edytuj</th>}
                        </tr>
                        </thead>
                        <tbody>
                        {roles.map(role => (
                            <tr key={role.id}>
                                <td>{role.name}</td>
                                <td>{roleTypeTranslation[role.type]}</td>
                                <td>{role.type === 'SUPERVISOR' ? role.weeklyScheduleCreatorDefault ? 'Tygodniowy' : 'Dzienny' : 'Nie dotyczy'}</td>
                                {isAdmin &&
                                    <td>
                                        {role.type !== RoleType.SYSTEM && <button className="btn btn-primary"
                                                                                  onClick={() => navigate(`/edit-role/${role.id}`)}>Edytuj</button>}
                                    </td>
                                }
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isAdmin &&
                <div className="d-flex justify-content-center">
                    <button className="btn btn-primary m-1" onClick={() => navigate('/add-role')}>Dodaj rolę</button>
                </div>
            }
        </div>
    );
}

export default ViewRoles;
