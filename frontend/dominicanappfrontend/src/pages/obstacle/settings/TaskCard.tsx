import React from "react";
import { Task } from "../../../models/Interfaces";

interface TaskCardProps {
    tasks: Task[];
    selectedTasks: number[];
    toggleTaskSelection: (taskId: number) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ tasks, selectedTasks, toggleTaskSelection }) => {
    const columnSize = Math.ceil(tasks.length / 3);

    return (
        <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
            <div className="card-body">
                <div className="row">
                    <div className="col-12 col-md-6 col-lg-4 d-flex flex-column">
                        {tasks.slice(0, columnSize).map((task) => (
                            <button
                                key={task.id}
                                className={`btn mb-3 ${selectedTasks.includes(task.id) ? 'btn-success' : 'btn-outline-success'}`}
                                onClick={() => toggleTaskSelection(task.id)}
                            >
                                {task.nameAbbrev}
                            </button>
                        ))}
                    </div>

                    <div className="col-12 col-md-6 col-lg-4 d-flex flex-column">
                        {tasks.slice(columnSize, 2 * columnSize).map((task) => (
                            <button
                                key={task.id}
                                className={`btn mb-3 ${selectedTasks.includes(task.id) ? 'btn-success' : 'btn-outline-success'}`}
                                onClick={() => toggleTaskSelection(task.id)}
                            >
                                {task.nameAbbrev}
                            </button>
                        ))}
                    </div>

                    <div className="col-12 col-md-6 col-lg-4 d-flex flex-column">
                        {tasks.slice(2 * columnSize).map((task) => (
                            <button
                                key={task.id}
                                className={`btn mb-3 ${selectedTasks.includes(task.id) ? 'btn-success' : 'btn-outline-success'}`}
                                onClick={() => toggleTaskSelection(task.id)}
                            >
                                {task.nameAbbrev}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
