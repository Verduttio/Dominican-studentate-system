import React, {useState} from "react";
import LinkFormFields from "../LinkFormFields";
import {DocumentLink} from "../../../models/Interfaces";

function AddLinkPage() {
    const initialDocumentLinkState : DocumentLink = {
        id: 0,
        title: '',
        url: '',
        sortOrder: 0
    }

    const [documentLinkData, setDocumentLinkData] = useState<DocumentLink | null>(initialDocumentLinkState);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log(documentLinkData);
    }

    return (
        <div className="fade-in">
            <h3 className="entity-header-dynamic-size mb-0">Dodaj link</h3>
            <div className="edit-entity-container mw-100 mb-0 mt-4" style={{width: '400px'}}>
                {/*{error && <AlertBox text={error} type={"danger"} width={"500px"}/>}*/}
                {/*{validationError && <AlertBox text={validationError} type={"danger"} width={"500px"}/>}*/}
                <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                    <LinkFormFields documentLink={documentLinkData} setDocumentLink={setDocumentLinkData}/>
                    <div className="d-flex justify-content-center">
                        <button className="btn btn-success" type="submit" disabled={false}>
                            Dodaj {false && <span className="spinner-border spinner-border-sm"></span>}
                        </button>
                    </div>
                </form>
            </div>
            <h4 className="entity-header-dynamic-size mt-4">
                Podgląd linku
            </h4>
            <iframe
                src={documentLinkData?.url}
                title={documentLinkData?.title}
                style={{width: '100%', height: '600px', border: 'none'}}
            ></iframe>
        </div>
    );
}

export default AddLinkPage;