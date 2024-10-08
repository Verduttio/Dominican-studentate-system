import React, { useEffect, useState } from "react";
import { RoleType, User } from "../../models/Interfaces";
import useHttp from "../../services/UseHttp";
import { backendUrl } from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";
import AlertBox from "../../components/AlertBox";

function UsersRolesByCategory() {
    const [users, setUsers] = useState<User[]>([]);
    const { request: getUsers, error: getUsersError, loading: getUsersLoading } = useHttp(
        `${backendUrl}/api/users`,
        "GET"
    );

    useEffect(() => {
        getUsers(null, (data: User[]) => {
            setUsers(data);
        });
    }, [getUsers]);

    if (getUsersLoading) return <LoadingSpinner />;
    if (getUsersError) return <AlertBox text={getUsersError} type={"danger"} width={"500px"} />;

    return (
        <div className="fade-in">
            <h3 className="entity-header-dynamic-size mb-0">
                Role braci z podziałem na kategorie
            </h3>
            <div className="d-flex-no-media-resize justify-content-center mt-4">
                <div className="table-responsive-fit-content-height100vh">
                    <table className="table table-hover table-striped table-rounded table-shadow table-bordered mb-0">
                        <thead className="table-dark sticky-top">
                        <tr>
                            <th>Brat</th>
                            <th>Funkcyjne</th>
                            <th>Wykonujące</th>
                            <th>Systemowe</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.name + " " + user.surname}</td>
                                <td className="max-column-width-200">
                                    <ul className="list-unstyled mb-0">
                                        {user.roles
                                            .filter((role) => role.type === RoleType.SUPERVISOR)
                                            .map((role, index) => (
                                                <li key={index}>• {role.name}</li>
                                            ))}
                                    </ul>
                                </td>
                                <td className="max-column-width-200">
                                    <ul className="list-unstyled mb-0">
                                        {user.roles
                                            .filter((role) => role.type === RoleType.TASK_PERFORMER)
                                            .map((role, index) => (
                                                <li key={index}>• {role.name}</li>
                                            ))}
                                    </ul>
                                </td>
                                <td className="max-column-width-200">
                                    <ul className="list-unstyled mb-0">
                                        {user.roles
                                            .filter((role) => role.type === RoleType.SYSTEM)
                                            .map((role, index) => (
                                                <li key={index}>• {role.name}</li>
                                            ))}
                                    </ul>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default UsersRolesByCategory;
