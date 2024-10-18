import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {Role} from "../../../models/Interfaces";

export const RoleComp = ({ role } : {role: Role}) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: role.id });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="card my-2 p-3"
        >
            {role.name}
        </div>
    );
};