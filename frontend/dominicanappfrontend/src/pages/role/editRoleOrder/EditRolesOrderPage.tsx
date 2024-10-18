import React, { useState, useEffect } from 'react';
import useHttp from "../../../services/UseHttp";
import {Role, Task} from "../../../models/Interfaces";
import {useNavigate} from "react-router-dom";
import {backendUrl} from "../../../utils/constants";
import LoadingSpinner from "../../../components/LoadingScreen";
import useIsAdmin, {UNAUTHORIZED_PAGE_TEXT} from "../../../services/UseIsFunkcyjny";
import AlertBox from "../../../components/AlertBox";
import {
    closestCorners,
    DndContext,
    DragEndEvent, KeyboardSensor,
    PointerSensor,
    UniqueIdentifier,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import {arrayMove, sortableKeyboardCoordinates} from "@dnd-kit/sortable";
import {Column} from "./Column";
import Instruction from "./Instruction";


function EditRolesOrder () {
    const [roles, setRoles] = useState<Role[]>([]);
    const [initialRoles, setInitialRoles] = useState<Task[]>([]);
    const { error, loading, request } = useHttp(`${backendUrl}/api/roles/types/SUPERVISOR`, 'GET');
    const { error: patchError, request: patchTaskOrder, loading: patchLoading } = useHttp(`${backendUrl}/api/roles`, 'PATCH');
    const { isFunkcyjny, isFunkcyjnyLoading, isFunkcyjnyInitialized } = useIsAdmin();
    const navigate = useNavigate();

    useEffect(() => {
        request(null, (data) => {
            setRoles(data);
            setInitialRoles(data);
        })
            .then(() => {});
    }, [request]);

    const hasOrderChanged = JSON.stringify(roles) !== JSON.stringify(initialRoles);

    const updateTaskOrder = () => {
        const minSortOrder = Math.min(...roles.map(role => role.sortOrder));

        const updatedRoles = roles.map((role, index) => {
            return {
                ...role,
                sortOrder: minSortOrder + index
            };
        });

        const dto = updatedRoles.map((role) => {
            return {
                id: role.id,
                sortOrder: role.sortOrder
            };
        });

        patchTaskOrder(dto)
            .then(() => {
                navigate('/roles', { state: { message: 'Kolejność ról została zaktualizowana.' } })
            });
    }


    const getRolePos = (id: UniqueIdentifier) => roles.findIndex((role) => role.id === id);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over == null) return;

        if (active.id === over.id) return;

        setRoles((roles) => {
            const originalPos = getRolePos(active.id);
            const newPos = getRolePos(over.id);

            return arrayMove(roles, originalPos, newPos);
        });
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    if(isFunkcyjnyLoading || isFunkcyjnyInitialized) {
        return <LoadingSpinner/>;
    } else if(!isFunkcyjny) return <AlertBox text={UNAUTHORIZED_PAGE_TEXT} type="danger" width={'500px'} />;
    if (loading) return <LoadingSpinner/>;
    if (error) return <AlertBox text={error} type={'danger'} width={'500px'}/>;

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <h1 className="entity-header">Edycja kolejności ról</h1>
            </div>
            <Instruction/>
            <div className="d-flex justify-content-center">
                {patchError && <AlertBox text={patchError} type={'danger'} width={'500px'}/>}
            </div>
            <div className="d-flex justify-content-center">
                <button className="btn btn-primary" onClick={updateTaskOrder} disabled={!hasOrderChanged || patchLoading}>
                    Zaktualizuj kolejność {patchLoading && <span className="spinner-border spinner-border-sm"></span>}
                </button>
            </div>
            <div className="d-flex justify-content-center">
                <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners} sensors={sensors}>
                    <Column roles={roles} />
                </DndContext>
            </div>
        </div>
    );
}

export default EditRolesOrder;