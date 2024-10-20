import React from 'react';

interface FormattedTaskListProps {
    tasks: string[];
}

const FormattedTaskList: React.FC<FormattedTaskListProps> = ({ tasks }) => {
    return (
        <>
            {tasks.map((task, index) => {
                const [taskName, daysWithParen] = task.split(' (');
                const days = daysWithParen ? daysWithParen.replace(')', '') : null;

                return (
                    <React.Fragment key={`${task}-${index}`}>
                        {index !== 0 && ', '}
                        <strong>{taskName}</strong>
                        {days && ` (${days})`}
                    </React.Fragment>
                );
            })}
        </>
    );
};

export default FormattedTaskList;
