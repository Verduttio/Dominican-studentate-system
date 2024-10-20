import React from 'react';
import { GroupedScheduleShortInfo, Role } from '../../../../../../models/Interfaces';
import LoadingSpinner from '../../../../../../components/LoadingScreen';
import AlertBox from '../../../../../../components/AlertBox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import FormattedTaskList from "../FormattedTaskList";

interface Props {
    data: GroupedScheduleShortInfo[];
    roles: Role[];
    loading: boolean;
    error: string | null;
    isOpen: boolean;
    toggle: () => void;
}

const UsersGroupedTasksScheduleTable: React.FC<Props> = ({
                                                             data,
                                                             roles,
                                                             loading,
                                                             error,
                                                             isOpen,
                                                             toggle,
                                                         }) => {
    if (loading) return <LoadingSpinner />;
    if (error) return <AlertBox text={error} type="danger" width="500px" />;

    return (
        <>
            <div className="d-flex justify-content-center">
                <button className="btn btn-dark mb-1" type="button" onClick={toggle}>
                    <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
                    {isOpen ? ' Ukryj harmonogram ' : ' Pokaż '}
                    <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
                </button>
            </div>
            {isOpen && (
                <div className="d-flex justify-content-center">
                    <div className="table-responsive" style={{ maxWidth: '700px' }}>
                        <table className="table table-hover table-striped table-rounded table-shadow table-bordered mb-0">
                            <thead className="table-dark">
                            <tr>
                                <th>Brat</th>
                                {roles.map((role) => (
                                    <th key={role.id}>{role.assignedTasksGroupName}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {data.map((info) => (
                                <tr key={info.userId}>
                                    <td>
                                        {info.userName} {info.userSurname}
                                    </td>
                                    {roles.map((role) => (
                                        <td key={role.name}>
                                            <FormattedTaskList
                                                tasks={info.groupedTasksInfoStrings.get(role.name) || []}
                                            />
                                        </td>
                                    ))}
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

export default UsersGroupedTasksScheduleTable;
