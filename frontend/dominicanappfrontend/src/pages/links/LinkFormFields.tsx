import documents, {DocumentLink} from "../../models/Interfaces";
import React from "react";

interface LinkFormFieldsProps {
    documentLink: DocumentLink | null;
    setDocumentLink: React.Dispatch<React.SetStateAction<DocumentLink | null>>;
}

const LinkFormFields: React.FC<LinkFormFieldsProps> = ({ documentLink, setDocumentLink }) => {
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
                    {Object.values(documents).map((document) => (
                        <option key={document.id} value={document.sortOrder}>{document.title}</option>
                    ))}
                    <option value={documents.length}>{'{--Wstaw na koniec--}'}</option>
                </select>
            </div>
        </>
    );
};

export default LinkFormFields;
