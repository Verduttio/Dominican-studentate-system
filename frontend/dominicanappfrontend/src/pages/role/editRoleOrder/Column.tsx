import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {RoleComp} from "./RoleComp";
import {Role} from "../../../models/Interfaces";

export const Column = ({ roles } : {roles: Role[]}) => {
    return (
        <div className="edit-entity-container mw-100 bg-secondary-subtle" style={{width: '450px'}}>
            <SortableContext items={roles} strategy={verticalListSortingStrategy}>
                {roles.map((role) => (
                    <RoleComp key={role.id} role={role}/>
                ))}
            </SortableContext>
        </div>
    );
};