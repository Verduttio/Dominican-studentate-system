import React, {useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../../components/LoadingScreen";
import AlertBox from "../../../components/AlertBox";
import useIsFunkcyjny, {UNAUTHORIZED_PAGE_TEXT} from "../../../services/UseIsFunkcyjny";
import useGetOrCreateCurrentUser from "../../../services/UseGetOrCreateCurrentUser";
import {Role} from "../../../models/Interfaces";
import useHttp from "../../../services/UseHttp";
import {backendUrl} from "../../../utils/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendarCheck,
    faBookBible,
    faMusic,
    faUtensils,
    faTshirt,
    faHandHoldingDollar,
    faWineGlass,
    faScroll
} from "@fortawesome/free-solid-svg-icons";

function AddScheduleRoleSelection() {
    const { isFunkcyjny, isFunkcyjnyLoading, isFunkcyjnyInitialized } = useIsFunkcyjny();
    const {request: requestGetSupervisorRoles, loading: loadingGetSupervisorRoles} = useHttp(`${backendUrl}/api/roles/types/SUPERVISOR`, 'GET');
    const [supervisorRoles, setSupervisorRoles] = useState<Role[]>();
    const navigate = useNavigate();
    const {currentUser} = useGetOrCreateCurrentUser();
    const roleDefinitions: Record<string, { icon: any, description: string, customName?: string }> = {
        "Liturgista": {
            icon: faBookBible,
            description: "Harmonogram dla asysty na mszy i liturgii godzin."
        },
        "Kantor": {
            icon: faMusic,
            description: "Obsada scholi i psalmów."
        },
        "Kantor gregoriański": {
            icon: faScroll,
            description: "Funkcje śpiewające na nieszporach."
        },
        "Dziekan kuchenny": {
            icon: faUtensils,
            description: "Dyżury przy posiłkach na obiedzie i kolacji."
        },
        "Dziekan": {
            icon: faTshirt,
            description: "Rekreacje i kosze z praniem."
        },
        "Dziekan Tacowy": {
            icon: faHandHoldingDollar,
            description: "Wyznaczanie tac na niedzielę i święta."
        },
        "Dziekan komunijny": {
            icon: faWineGlass,
            description: "Wyznaczanie komunii na niedzielę i święta."
        }
    };
    const defaultConfig = {
        icon: faCalendarCheck,
        description: "Kliknij, aby zarządzać grafikami dla tej roli."
    };

    const colors = [
        "text-primary",   // Niebieski
        "text-success",   // Zielony
        "text-danger",    // Czerwony
        "text-warning",   // Żółty/Pomarańczowy
        // "text-info",      // Błękitny
        "text-dark",      // Ciemny
        "text-secondary"  // Szary
    ];

    useEffect(() => {
        requestGetSupervisorRoles(null, (data: Role[]) => {
            setSupervisorRoles(data);
        });
    }, [requestGetSupervisorRoles]);

    const navigateToDefaultScheduleCreator = (roleName: string) => {
        const selectedRole: Role | undefined = currentUser?.roles.filter((role) => (role.name === roleName))[0];
        if(selectedRole) {
            if(selectedRole.weeklyScheduleCreatorDefault) {
                navigate(`/add-schedule/weekly?roleName=${roleName}`);
            } else {
                navigate(`/add-schedule/weekly/by-all-days/?roleName=${roleName}`);
            }
        } else {
            console.error("Role not found");
        }
    }

    if(isFunkcyjnyLoading || isFunkcyjnyInitialized || loadingGetSupervisorRoles) {
        return <LoadingSpinner/>;
    } else if(!isFunkcyjny) return <AlertBox text={UNAUTHORIZED_PAGE_TEXT} type="danger" width={'500px'} />;

    if (currentUser?.roles.filter((role) => (role.type === "SUPERVISOR")).length === 0) {
        return <AlertBox text={"Brak ról funkcyjnych"} type="info" width={'500px'} />;
    }

    return (
        <div className="container mt-4 fade-in">
            <h2 className="text-center mb-5">Wybierz sekcję do wyznaczania</h2>
            <div className="row justify-content-center">
            {currentUser?.roles
                .filter((role) => role.type === "SUPERVISOR")
                .sort((a, b) => {
                    const indexA = supervisorRoles?.findIndex(sRole => sRole.name === a.name) ?? -1;
                    const indexB = supervisorRoles?.findIndex(sRole => sRole.name === b.name) ?? -1;
                    return indexA - indexB;
                })
                .map((role, index) => {
                    const config = roleDefinitions[role.name] || defaultConfig;
                    const colorClass = colors[index % colors.length];

                    return (
                    <div className="col-md-6 col-lg-4 mb-4" key={role.id}>
                        <div
                            className="card text-center p-4 shadow-sm hover-effect h-100"
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                navigateToDefaultScheduleCreator(role.name);
                            }}>
                            <div className="card-body">
                                <FontAwesomeIcon icon={config.icon} size="3x" className={`mb-3 ${colorClass}`} />
                                <h4 className="card-title text-dark">{config.customName || role.name}</h4>
                                <p className="card-text text-muted">
                                    {config.description}
                                </p>
                            </div>
                        </div>
                    </div>
                    );
                })}
            </div>
        </div>
    );
}

export default AddScheduleRoleSelection;
