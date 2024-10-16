import {DocumentLink} from "../../models/Interfaces";
import React, {useEffect, useState} from "react";
import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";
import AlertBox from "../../components/AlertBox";

interface LinkFormFieldsProps {
    documentLink: DocumentLink | null;
    setDocumentLink: React.Dispatch<React.SetStateAction<DocumentLink | null>>;
}

const LinkFormFields: React.FC<LinkFormFieldsProps> = ({ documentLink, setDocumentLink }) => {
    const [documentLinks, setDocumentLinks] = useState<DocumentLink[]>([]);
    const { request: getDocumentLinks, error: errorGetDocumentLinks, loading: loadingGetDocumentLinks } = useHttp(`${backendUrl}/api/document-links`, 'GET');

    useEffect(() => {
        getDocumentLinks(null, (data: DocumentLink[]) => {
            setDocumentLinks(data);
        });
    }, [getDocumentLinks]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        setDocumentLink((prev: DocumentLink | null) => {
            if (prev === null) return null;
            return {
                ...prev,
                [name]: value
            };
        });
    };

    if (loadingGetDocumentLinks) return <LoadingSpinner/>;
    if (errorGetDocumentLinks) return <AlertBox text={errorGetDocumentLinks} type={"danger"} width={"500px"}/>;

    return (
        <>
            <div className="mb-3">
                <label htmlFor="linkTitle" className="form-label">Tytuł linku:</label>
                <input
                    id="linkTitle"
                    name="title"
                    type="text"
                    className="form-control"
                    value={documentLink?.title}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="mb-3">
                <label htmlFor="linkUrl" className="form-label">URL:</label>
                <input
                    id="linkUrl"
                    name="url"
                    type="text"
                    className="form-control"
                    value={documentLink?.url}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="mb-3">
                <label htmlFor="linkSortOrder" className="form-label">Wstaw w kolejności przed:</label>
                <select
                    id="linkSortOrder"
                    name="sortOrder"
                    className="form-select"
                    value={documentLink?.sortOrder}
                    onChange={handleChange}
                    required
                >
                    {Object.values(documentLinks).map((document) => (
                        <option key={document.id} value={document.sortOrder}>{document.title}</option>
                    ))}
                    <option key={documentLinks.length+1} value={documentLinks.length+1}>{'{--Wstaw na koniec--}'}</option>
                </select>
            </div>
        </>
    );
};

export default LinkFormFields;
