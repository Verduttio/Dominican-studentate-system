import React, { useEffect, useState } from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import useHttp from '../../services/UseHttp';
import { Role } from '../../models/Interfaces';
import { backendUrl } from '../../utils/constants';
import LoadingSpinner from "../../components/LoadingScreen";
import AlertBox from "../../components/AlertBox";
import useIsFunkcyjny, {UNAUTHORIZED_PAGE_TEXT} from "../../services/UseIsFunkcyjny";

const ScheduleCreatorRoleSelection: React.FC = () => {
    const [supervisorRoles, setSupervisorRoles] = useState<Role[]>([]);
    const { request, error, loading } = useHttp(`${backendUrl}/api/roles/types/SUPERVISOR`, 'GET');
    const { isFunkcyjny, isFunkcyjnyLoading, isFunkcyjnyInitialized } = useIsFunkcyjny();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        request(null, setSupervisorRoles);
    }, [request]);

    const queryParams = new URLSearchParams(location.search);
    const from = queryParams.get('from');
    const to = queryParams.get('to');

    if(isFunkcyjnyLoading || isFunkcyjnyInitialized) {
        return <LoadingSpinner/>;
    } else if(!isFunkcyjny) return <AlertBox text={UNAUTHORIZED_PAGE_TEXT} type="danger" width={'500px'} />;

    if (loading) return <LoadingSpinner/>;
    if (error) return <AlertBox text={error} type={'danger'} width={'500px'}/>;

    return (
        <div className="fade-in d-flex flex-column align-items-center">
            <h2 className="entity-header-dynamic-size">Wybierz rolę, aby przejść do przypisanych jej zadań</h2>
            <h4 className=" fw-bold entity-header-dynamic-size">Tworzysz harmonogram od: {from}, do: {to}</h4>
                {supervisorRoles.map((role) => (
                    <div className="card mb-4 mw-100" style={{width: "600px"}} id="button-scale">
                        <div className="card-body text-center" onClick={() => {navigate(`/schedule-creator/tasks?roleName=${role.name}&from=${from}&to=${to}`)}}>
                            {role.name}
                        </div>
                    </div>
                ))}
        </div>
    );
};

export default ScheduleCreatorRoleSelection;
