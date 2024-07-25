import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {Task} from "../../../models/Interfaces";

export const TaskComp = ({ task } : {task: Task}) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: task.id });

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
            [{task.nameAbbrev}] {task.name}
        </div>
    );
};