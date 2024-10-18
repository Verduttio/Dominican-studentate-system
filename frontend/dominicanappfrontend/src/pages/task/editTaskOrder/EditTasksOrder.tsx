import React, {useEffect, useState} from 'react';
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
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    UniqueIdentifier,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import {arrayMove, sortableKeyboardCoordinates} from "@dnd-kit/sortable";
import {Column} from "./Column";
import Instruction from "./Instruction";


function EditTasksOrder () {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [initialTasks, setInitialTasks] = useState<Task[]>([]);
    const [supervisorRoleName, setSupervisorRoleName] = useState<string>('');
    const [roles, setRoles] = useState<Role[]>([]);
    const { error: errorGetRoles, loading: loadingGetRoles, request: requestGetRoles } = useHttp(`${backendUrl}/api/roles/types/SUPERVISOR`, 'GET');
    const { error, loading, request } = useHttp(`${backendUrl}/api/tasks/bySupervisorRole/${supervisorRoleName}`, 'GET');
    const { error: patchError, request: patchTaskOrder, loading: patchLoading } = useHttp(`${backendUrl}/api/tasks`, 'PATCH');
    const { isFunkcyjny, isFunkcyjnyLoading, isFunkcyjnyInitialized } = useIsAdmin();
    const navigate = useNavigate();

    useEffect(() => {
        requestGetRoles(null, (data) => {
            setRoles(data);
        });
    }, [requestGetRoles]);

    useEffect(() => {
        if (supervisorRoleName) {
            request(null, (data) => {
                setTasks(data);
                setInitialTasks(data);
            })
                .then(() => {});
        }
    }, [request, supervisorRoleName]);

    const hasOrderChanged = JSON.stringify(tasks) !== JSON.stringify(initialTasks);

    const updateTaskOrder = () => {
        const updatedTasks = tasks.map((task, index) => {
            return {
                ...task,
                sortOrder: index+1
            };
        });

        const dto = updatedTasks.map((task) => {
            return {
                id: task.id,
                sortOrder: task.sortOrder
            };
        });

        patchTaskOrder(dto)
            .then(() => {
                navigate('/tasks', { state: { message: 'Kolejność oficjów została zaktualizowana.' } })});
    }

    const getTaskPos = (id: UniqueIdentifier) => tasks.findIndex((task) => task.id === id);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over == null) return;

        if (active.id === over.id) return;

        setTasks((tasks) => {
            const originalPos = getTaskPos(active.id);
            const newPos = getTaskPos(over.id);

            return arrayMove(tasks, originalPos, newPos);
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

    function renderTasksOrder() {
        if (loading) return <LoadingSpinner/>;
        if (error) return <AlertBox text={error} type={'danger'} width={'500px'}/>;
        if (supervisorRoleName) {
            return (
                <div className="d-flex justify-content-center">
                    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners} sensors={sensors}>
                        <Column tasks={tasks}/>
                    </DndContext>
                </div>
            )
        }
    }

    if (loadingGetRoles) return <LoadingSpinner/>;
    if (errorGetRoles) return <AlertBox text={errorGetRoles} type={'danger'} width={'500px'}/>;

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <h1 className="entity-header">Edycja kolejności oficjów</h1>
            </div>
            <Instruction/>
            <h4 className="entity-header-dynamic-size mt-0">Oficja według roli</h4>
            <div className="d-flex justify-content-center mb-3">
                <select
                    id="supervisorRoleName"
                    name="supervisorRoleName"
                    className="form-select"
                    value={supervisorRoleName}
                    onChange={e => setSupervisorRoleName(e.target.value)}
                    style={{maxWidth: '300px'}}
                >
                    <option value="">Wybierz rolę</option>
                    {roles.map(role => (
                        <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                </select>
            </div>
            <div className="d-flex justify-content-center">
                {patchError && <AlertBox text={patchError} type={'danger'} width={'500px'}/>}
            </div>
            <div className="d-flex justify-content-center">
                <button className="btn btn-primary" onClick={updateTaskOrder}
                        disabled={!hasOrderChanged || patchLoading}>
                    Zaktualizuj kolejność {patchLoading && <span className="spinner-border spinner-border-sm"></span>}
                </button>
            </div>
            {renderTasksOrder()}
        </div>
    );
}

export default EditTasksOrder;