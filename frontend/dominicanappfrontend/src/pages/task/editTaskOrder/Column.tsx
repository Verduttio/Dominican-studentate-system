import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {TaskComp} from "./TaskComp";
import {Task} from "../../../models/Interfaces";

export const Column = ({ tasks } : {tasks: Task[]}) => {
    return (
        <div className="edit-entity-container mw-100 bg-secondary-subtle" style={{width: '450px'}}>
            <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
                {tasks.map((task) => (
                    <TaskComp key={task.id} task={task}/>
                ))}
            </SortableContext>
        </div>
    );
};