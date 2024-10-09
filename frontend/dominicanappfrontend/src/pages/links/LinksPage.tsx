import React from 'react';
import {useNavigate} from "react-router-dom";
import documents from "../../models/Interfaces";


const LinksPage: React.FC = () => {

    const navigate = useNavigate();

    return (
        <div className="fade-in">
            <h2 className="entity-header-dynamic-size mb-0">Linki</h2>
            <div className="d-flex justify-content-center">
                <button className="btn btn-secondary mt-2" onClick={() => {navigate("/links/settings")}}>
                    Ustawienia
                </button>
            </div>
            {documents.map((doc, index) => (
                <div key={index} className="mb-5">
                    <h4 className="entity-header-dynamic-size mt-2">{doc.title}</h4>
                    <iframe
                        src={doc.url}
                        title={doc.title}
                        style={{ width: '100%', height: '600px', border: 'none' }}
                    ></iframe>
                </div>
            ))}
        </div>
    );
};

export default LinksPage;
