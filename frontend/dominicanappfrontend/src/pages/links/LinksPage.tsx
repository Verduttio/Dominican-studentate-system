import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import {DocumentLink} from "../../models/Interfaces";
import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";
import AlertBox from "../../components/AlertBox";
import useIsAdmin from "../../services/UseIsAdmin";
import useIsFunkcyjny from "../../services/UseIsFunkcyjny";


const LinksPage: React.FC = () => {
    const [documentLinks, setDocumentLinks] = useState<DocumentLink[]>([]);
    const { request: getDocumentLinks, error: errorGetDocumentLinks, loading: loadingGetDocumentLinks } = useHttp(`${backendUrl}/api/document-links`, 'GET');
    const {isAdmin, isAdminLoading} = useIsAdmin();
    const {isFunkcyjny, isFunkcyjnyLoading} = useIsFunkcyjny();

    useEffect(() => {
        getDocumentLinks(null, (data: DocumentLink[]) => {
            setDocumentLinks(data);
        });
    }, [getDocumentLinks]);

    const navigate = useNavigate();

    if (loadingGetDocumentLinks || isAdminLoading || isFunkcyjnyLoading) return <LoadingSpinner/>;
    if (errorGetDocumentLinks) return <AlertBox text={errorGetDocumentLinks} type={"danger"} width={"500px"}/>;

    return (
        <div className="fade-in">
            <h2 className="entity-header-dynamic-size mb-0">Linki</h2>
            <div className="d-flex justify-content-center">
                {(isFunkcyjny || isAdmin) &&
                    <button className="btn btn-secondary mt-2" onClick={() => {navigate("/links/settings")}}>
                        Ustawienia
                    </button>
                }
            </div>
            {documentLinks.map((doc, index) => (
                <div key={index} className="my-1">
                    {doc.preview ? (
                        <>
                            <h4 className="entity-header-dynamic-size mt-3">{doc.title}</h4>
                            <iframe
                                src={doc.url}
                                title={doc.title}
                                style={{width: '100%', height: '600px', border: 'none'}}
                            ></iframe>
                        </>
                    ) : (
                        <div className="d-flex justify-content-center">
                            <button className="btn btn-success mt-3">
                                <h4 className="entity-header-dynamic-size m-0" onClick={() => {
                                    window.open(doc.url, '_blank');
                                }}>{doc.title}</h4>
                            </button>
                        </div>
                    )}
                </div>
                )
            )}
        </div>
    );
};

export default LinksPage;
