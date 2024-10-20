import React from 'react';
import {GroupedScheduleShortInfo, Role, ScheduleShortInfoForTask} from '../../../../../../models/Interfaces';
import LoadingSpinner from '../../../../../../components/LoadingScreen';
import AlertBox from '../../../../../../components/AlertBox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import FormattedTaskList from "../FormattedTaskList";

interface Props {
    data: ScheduleShortInfoForTask[];
    loading: boolean;
    error: string | null;
    isOpen: boolean;
    toggle: () => void;
}

const TasksScheduleTable: React.FC<Props> = ({
                                                             data,
                                                             loading,
                                                             error,
                                                             isOpen,
                                                             toggle,
                                                         }) => {
    if (loading) return <LoadingSpinner />;
    if(error) return <AlertBox text={error} type="danger" width={'500px'} />;
    return (
        <>
            <div className={"d-flex justify-content-center"}>
                <button className="btn btn-dark mb-1" type="button" onClick={toggle}
                >
                    <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown}/>
                    {isOpen ? " Ukryj harmonogram " : " Pokaż "}
                    <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown}/>
                </button>
            </div>
            {isOpen && (
                <div className="d-flex justify-content-center">
                    <div className="table-responsive" style={{maxWidth: '600px'}}>
                        <table className="table table-hover table-striped table-rounded table-shadow mb-0">
                            <thead className="table-dark">
                            <tr>
                                <th>Oficjum</th>
                                <th>Bracia</th>
                            </tr>
                            </thead>
                            <tbody>
                            {data.map(scheduleShortInfoForTask => (
                                <tr key={scheduleShortInfoForTask.taskId}>
                                    <td>{scheduleShortInfoForTask.taskName}</td>
                                    <td>
                                        <FormattedTaskList tasks={scheduleShortInfoForTask.usersInfoStrings} key={scheduleShortInfoForTask.taskId}/>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
};

export default TasksScheduleTable;
