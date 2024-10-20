import useHttp from "../../../../services/UseHttp";
import {backendUrl} from "../../../../utils/constants";
import {Role} from "../../../../models/Interfaces";
import React, {useEffect, useState} from "react";
import LoadingSpinner from "../../../../components/LoadingScreen";
import AlertBox from "../../../../components/AlertBox";
import {useLocation} from "react-router-dom";
import {format} from "date-fns";
import axios, {AxiosError} from "axios";

function NonStandardPdfPrinterPage() {
    const { request: fetchSupervisorRoles, error: errorFetchSupervisorRoles, loading: loadingSupervisorRoles } = useHttp(`${backendUrl}/api/roles/types/SUPERVISOR`, 'GET');
    const [supervisorRoles, setSupervisorRoles] = useState<Role[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const location = useLocation();
    const startDate = location.state?.startDate;
    const endDate = location.state?.endDate;
    const [loadingDownloadSchedulePdfForTasksByRole, setLoadingDownloadSchedulePdfForTasksByRole] = useState<boolean>(false);
    const [errorDownloadSchedulePdfForTasksByRole, setErrorDownloadSchedulePdfForTasksByRole] = useState<string | null>(null);

    async function downloadSchedulePdfForTasksByRoles() {
        setLoadingDownloadSchedulePdfForTasksByRole(true);
        let targetUrl = `${backendUrl}/api/pdf/schedules/tasks/byRoles/scheduleShortInfo/week?from=${format(startDate, 'dd-MM-yyyy')}&to=${format(endDate, 'dd-MM-yyyy')}`;

        try {
            const response = await axios({
                url: targetUrl,
                method: 'POST',
                responseType: 'blob',
                withCredentials: true,
                data: selectedRoles
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Harmonogram_oficjów_wg_ról_${format(startDate, 'dd-MM-yyyy')}-${format(endDate, 'dd-MM-yyyy')}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const serverError = err as AxiosError<{ message?: string }>;
                if (serverError.response) {
                    setErrorDownloadSchedulePdfForTasksByRole('Błąd podczas pobierania PDF:' + serverError.response.data);
                } else {
                    setErrorDownloadSchedulePdfForTasksByRole('Problem z połączeniem sieciowym');
                }
            } else {
                setErrorDownloadSchedulePdfForTasksByRole('Nieoczekiwany błąd:' + err);
            }
        } finally {
            setLoadingDownloadSchedulePdfForTasksByRole(false);
        }
    }

    useEffect(() => {
        fetchSupervisorRoles(null, (data: Role[]) => {
            setSupervisorRoles(data);
        });
    }, [fetchSupervisorRoles]);

    const handleRoleChange = (roleName: string, isChecked: boolean) => {
        if (isChecked) {
            setSelectedRoles(prev => [...prev, roleName]);
        } else {
            setSelectedRoles(prev => prev.filter(role => role !== roleName));
        }
    };
    if (loadingSupervisorRoles) return <LoadingSpinner/>;
    if (errorFetchSupervisorRoles) return <AlertBox text={errorFetchSupervisorRoles} type={'danger'} width={'400px'}/>

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <h2 className="entity-header-dynamic-size">{format(startDate, "dd-MM-yyyy")} - {format(endDate, "dd-MM-yyyy")}</h2>
            </div>
            <div className="edit-entity-container mw-100" style={{width: '300px'}}>
                <div className="mb-3">
                    <label className="form-label">Zaznacz role, których oficja mają znaleźć się na wydruku</label>
                    {supervisorRoles.map((role) => (
                        <label className="form-check custom-checkbox">
                            <input
                                className={"form-check-input"}
                                type="checkbox"
                                checked={selectedRoles.includes(role.name)}
                                onChange={(e) => handleRoleChange(role.name, e.target.checked)}
                            />
                            {role.name}
                        </label>
                    ))}
                    <div className="d-flex justify-content-center">
                        <button className="btn btn-primary mt-3" onClick={() => {downloadSchedulePdfForTasksByRoles()}}>Pobierz</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NonStandardPdfPrinterPage;