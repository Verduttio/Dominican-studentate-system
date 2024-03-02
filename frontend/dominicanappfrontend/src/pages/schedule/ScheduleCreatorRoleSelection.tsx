import React, { useEffect, useState } from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import useHttp from '../../services/UseHttp';
import { Role } from '../../models/Interfaces';
import { backendUrl } from '../../utils/constants';

const ScheduleCreatorRoleSelection: React.FC = () => {
    const [supervisorRoles, setSupervisorRoles] = useState<Role[]>([]);
    const { request, error, loading } = useHttp(`${backendUrl}/api/roles/types/SUPERVISOR`, 'GET');
    const location = useLocation();
    useNavigate();

    useEffect(() => {
        request(null, setSupervisorRoles);
    }, [request]);

    const queryParams = new URLSearchParams(location.search);
    const from = queryParams.get('from');
    const to = queryParams.get('to');

    if (loading) return <div>Ładowanie...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="fade-in">
            <h2 className="entity-header-dynamic-size">Wybierz rolę, aby przejść do przypisanych jej zadań</h2>
            <h4 className=" fw-bold entity-header-dynamic-size">Tworzysz harmonogram od: {from}, do: {to}</h4>
                {supervisorRoles.map((role) => (
                    <div className="card mb-4" id="button-scale">
                        <div className="card-body text-center">
                            <Link to={`/schedule-creator/tasks?roleName=${role.name}&from=${from}&to=${to}`}
                                  className={"stretched-link text-decoration-none text-black"}
                            >
                                {role.name}
                            </Link>
                        </div>
                    </div>
                ))}
        </div>
    );
};

export default ScheduleCreatorRoleSelection;
