import React from 'react';

interface DescriptionInputProps {
    applicantDescription: string;
    handleInputChange: (name: string, value: string) => void;
}

const DescriptionInput: React.FC<DescriptionInputProps> = ({ applicantDescription, handleInputChange }) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        handleInputChange(name, value);
    };

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
                onChange={handleChange}
            />
        </div>
    );
};

export default DescriptionInput;
