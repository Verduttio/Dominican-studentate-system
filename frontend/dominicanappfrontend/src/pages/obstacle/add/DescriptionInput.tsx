import React from 'react';

interface DescriptionInputProps {
    applicantDescription: string;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const DescriptionInput: React.FC<DescriptionInputProps> = ({ applicantDescription, handleInputChange }) => {
    return (
        <div className="mb-3">
            <label htmlFor="applicantDescription" className="form-label">
                Opis wniosku (opcjonalnie):
            </label>
            <textarea
                className="form-control"
                id="applicantDescription"
                name="applicantDescription"
                value={applicantDescription}
                onChange={handleInputChange}
            />
        </div>
    );
};

export default DescriptionInput;
