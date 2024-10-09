import React from "react";
import documents from "../../models/Interfaces";
import {useNavigate} from "react-router-dom";


function LinksSettingsPage() {

    const navigate = useNavigate();

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-center">
                <h3 className="entity-header-dynamic-size mb-0">Ustawienia linków</h3>
            </div>
            <div className="d-flex justify-content-center mt-3">
                <button className="btn btn-success" onClick={() => {navigate("/links/settings/add")}}>
                    Dodaj link
                </button>
            </div>
            <div className="d-flex justify-content-center mt-3">
                <div className="table-responsive" style={{maxWidth: '400px'}}>
                    <table className="table table-hover table-striped table-rounded table-shadow">
                        <thead className="table-dark">
                        <tr>
                            <th>Tytuł</th>
                            <th>Edytuj</th>
                        </tr>
                        </thead>
                        <tbody>
                        {documents.map(document => (
                            <tr key={document.id}>
                                <td>{document.title}</td>
                                <td>
                                    <button className="btn btn-dark">
                                        Edytuj
                                    </button>
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

export default LinksSettingsPage;