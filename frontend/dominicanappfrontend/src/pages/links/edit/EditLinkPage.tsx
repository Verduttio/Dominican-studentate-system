import React, { useState, useEffect } from "react";
import LinkFormFields from "../LinkFormFields";
import { DocumentLink } from "../../../models/Interfaces";
import useHttp from "../../../services/UseHttp";
import { backendUrl } from "../../../utils/constants";
import { useNavigate, useParams } from "react-router-dom";
import AlertBoxTimed from "../../../components/AlertBoxTimed";
import AlertBox from "../../../components/AlertBox";
import LoadingSpinner from "../../../components/LoadingScreen";

function EditLinkPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [documentLinkData, setDocumentLinkData] = useState<DocumentLink | null>(null);
    const [validationError, setValidationError] = useState<string>();

    const {
        request: getDocumentLink,
        error: errorGetDocumentLink,
        loading: loadingGetDocumentLink,
    } = useHttp(`${backendUrl}/api/document-links/${id}`, "GET");

    const {
        request: updateDocumentLink,
        error: errorUpdateDocumentLink,
        loading: loadingUpdateDocumentLink,
    } = useHttp(`${backendUrl}/api/document-links/${id}`, "PUT");

    useEffect(() => {
        getDocumentLink(null, (data: DocumentLink) => {
            setDocumentLinkData(data);
        });
    }, [getDocumentLink]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!documentLinkData?.title || !documentLinkData?.url) {
            setValidationError("Wszystkie pola muszą być wypełnione");
            return;
        }

        updateDocumentLink(documentLinkData, () => {
            navigate("/links/settings", { state: { message: "Pomyślnie zaktualizowano link" } });
        });
    };

    if (loadingGetDocumentLink) {
        return <LoadingSpinner/>;
    }

    if (errorGetDocumentLink) {
        return (
            <div className="fade-in">
                <AlertBox text={errorGetDocumentLink} type={"danger"} width={"500px"} />
            </div>
        );
    }

    return (
        <div className="fade-in">
            <h3 className="entity-header-dynamic-size mb-0">Edytuj link</h3>
            <div className="edit-entity-container mw-100 mb-0 mt-4" style={{ width: "400px" }}>
                {errorUpdateDocumentLink && (
                    <AlertBox text={errorUpdateDocumentLink} type={"danger"} width={"500px"} />
                )}
                {validationError && (
                    <AlertBoxTimed
                        text={validationError}
                        type={"danger"}
                        width={"500px"}
                        onClose={() => {
                            setValidationError("");
                        }}
                    />
                )}
                <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                    <LinkFormFields documentLink={documentLinkData} setDocumentLink={setDocumentLinkData} />
                    <div className="d-flex justify-content-center">
                        <button className="btn btn-primary" type="submit" disabled={loadingUpdateDocumentLink}>
                            Zapisz zmiany{" "}
                            {loadingUpdateDocumentLink && (
                                <span className="spinner-border spinner-border-sm"></span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <h4 className="entity-header-dynamic-size mt-4">Podgląd linku</h4>
            <iframe
                src={documentLinkData?.url}
                title={documentLinkData?.title}
                style={{ width: "100%", height: "600px", border: "none" }}
            ></iframe>
        </div>
    );
}

export default EditLinkPage;
