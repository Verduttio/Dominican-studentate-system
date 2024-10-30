import React, {useState} from "react";
import LinkFormFields from "../LinkFormFields";
import {DocumentLink} from "../../../models/Interfaces";
import useHttp from "../../../services/UseHttp";
import {backendUrl} from "../../../utils/constants";
import {useNavigate} from "react-router-dom";
import AlertBoxTimed from "../../../components/AlertBoxTimed";
import AlertBox from "../../../components/AlertBox";
import useIsAdmin, {UNAUTHORIZED_PAGE_TEXT} from "../../../services/UseIsAdmin";
import useIsFunkcyjny from "../../../services/UseIsFunkcyjny";

function AddLinkPage() {
    const initialDocumentLinkState : DocumentLink = {
        id: 0,
        title: '',
        url: '',
        sortOrder: 1,
        preview: true,
    }

    const [documentLinkData, setDocumentLinkData] = useState<DocumentLink | null>(initialDocumentLinkState);
    const { request: postDocumentLinks, error: errorPostDocumentLinks, loading: loadingPostDocumentLinks } = useHttp(`${backendUrl}/api/document-links`, 'POST');
    const [validationError, setValidationError] = useState<string>();
    const navigate = useNavigate();
    const {isAdmin, isAdminLoading} = useIsAdmin();
    const {isFunkcyjny, isFunkcyjnyLoading} = useIsFunkcyjny();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log(documentLinkData);
        if (!documentLinkData?.title || !documentLinkData?.url) {
            setValidationError("Wszystkie pola muszą być wypełnione.");
            return;
        }

        postDocumentLinks(documentLinkData, () => {
            navigate('/links/settings', { state: { message: 'Pomyślnie dodano nowy link' } });
        });
    }

    if ((!isAdminLoading && !isFunkcyjnyLoading) && (!isAdmin && !isFunkcyjny)) return <AlertBox text={UNAUTHORIZED_PAGE_TEXT} type="danger" width={'500px'} />;

    return (
        <div className="fade-in">
            <h3 className="entity-header-dynamic-size mb-0">Dodaj link</h3>
            <div className="edit-entity-container mw-100 mb-0 mt-4" style={{width: '400px'}}>
                {errorPostDocumentLinks && <AlertBox text={errorPostDocumentLinks} type={"danger"} width={"500px"}/>}
                {validationError && <AlertBoxTimed text={validationError} type={"danger"} width={"500px"} onClose={() => {setValidationError("")}}/>}
                <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                    <LinkFormFields documentLink={documentLinkData} setDocumentLink={setDocumentLinkData}/>
                    <div className="d-flex justify-content-center">
                        <button className="btn btn-success" type="submit" disabled={false}>
                            Dodaj {loadingPostDocumentLinks && <span className="spinner-border spinner-border-sm"></span>}
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