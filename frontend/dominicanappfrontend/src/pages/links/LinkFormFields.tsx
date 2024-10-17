import {DocumentLink} from "../../models/Interfaces";
import React, {useEffect, useState} from "react";
import useHttp from "../../services/UseHttp";
import {backendUrl} from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingScreen";
import AlertBox from "../../components/AlertBox";
import {faCircleInfo} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

interface LinkFormFieldsProps {
    documentLink: DocumentLink | null;
    setDocumentLink: React.Dispatch<React.SetStateAction<DocumentLink | null>>;
}

const LinkFormFields: React.FC<LinkFormFieldsProps> = ({ documentLink, setDocumentLink }) => {
    const [documentLinks, setDocumentLinks] = useState<DocumentLink[]>([]);
    const { request: getDocumentLinks, error: errorGetDocumentLinks, loading: loadingGetDocumentLinks } = useHttp(`${backendUrl}/api/document-links`, 'GET');
    const [showPopup, setShowPopup] = useState(false);

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

    const handleIconClick = () => {
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            setShowPopup(false);
        }
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
                <label htmlFor="linkUrl" className="form-label">URL:{" "}
                    <span
                    style={{cursor: "pointer"}}
                    onClick={handleIconClick}
                    title="Kliknij po więcej informacji"
                >
                        <FontAwesomeIcon icon={faCircleInfo}/>
                    </span>
                </label>
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
            {showPopup && (
                <div
                    className="custom-modal-backdrop fade-in"
                    onClick={handleBackdropClick}
                >
                    <div className="card custom-modal">
                        <div className="card-body">
                            <h5 className="card-title">Informacja o linku</h5>
                            <p className="card-text">
                                Upewnij się, że wpisujesz pełny adres URL zaczynający się od{" "}
                                <code>https://</code>.
                                <br />Przykład:{" "}
                                <code>https://research.google.com/pubs/archive/44678.pdf</code>
                            </p>
                            <p className="card-text">
                                W przypadku plików udostępnianych z Google Drive,
                                należy upewnić się, że plik jest widoczny publicznie, lub że osoba aktualnie zalogowana
                                ma do niego dostęp.<br/>
                                Link można skopiować bezpośrednio z przeglądarki po otwarciu pliku.
                                Lub użyć opcji "Udostępnij" i skopiować link z tamtej sekcji.<br/>
                                W przypadku plików pdf, link powinien kończyć się na <code>.pdf</code> lub <code>.../preview</code>.<br />
                                Ważne jest to szczególnie w przypadku plików pdf z Google Drive,
                                ponieważ wtedy należy skopiować link i zamienić <code>/edit</code> na <code>/preview</code>.<br/>
                                Przykład poprawnego formatu linku: <code>https://drive.google.com/file/d/1t5/<b>preview</b></code><br/>
                                <br/>
                                Pozostałe pliki jak word, excel powinny działać normalnie poprzez skopiowanie linku z przeglądarki.
                            </p>
                            <div className="text-center">
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleClosePopup}
                                >
                                    Zamknij
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LinkFormFields;
