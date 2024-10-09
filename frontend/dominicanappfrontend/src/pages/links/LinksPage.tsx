import React from 'react';

interface DocumentLink {
    title: string;
    url: string;
}

const documents: DocumentLink[] = [
    {
        title: 'Regulamin PDF',
        url: 'https://docs.google.com/viewer?url=https://example.com/sample.pdf&embedded=true',
    },
    {
        title: 'Google Spreadsheet',
        url: 'https://docs.google.com/spreadsheets/d/1GqPfvxNlo-lsjXWtovIOpsCOh1z8WuUaiM/pubhtml?widget=true&headers=false',
    },
    {
        title: 'Google Doc',
        url: 'https://docs.google.com/document/d/1aA_6_F6LhtX_w9e7m2JvPqR7Al1zfp0M/pub?embedded=true',
    },
    {
        title: 'Błędny link',
        url: 'https://wrong-url.com/invalid.pdf',
    },
];

const LinksPage: React.FC = () => {

    return (
        <div className="container">
            <h2 className="entity-header-dynamic-size mb-0">Linki</h2>
            <div className="d-flex justify-content-center">
                <button className="btn btn-secondary mt-2">
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