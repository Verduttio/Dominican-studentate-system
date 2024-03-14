import React from 'react';

interface AlertBoxProps {
    text: string | null;
    type: 'info' | 'danger' | 'success';
    width: string;
}

const AlertBox: React.FC<AlertBoxProps> = ({ text, type, width }) => {
    return (
        <div className="d-flex flex-column align-items-center">
            <div className={`alert alert-${type} mw-100 text-center m-2`} style={{width: width}}>
                {text}
            </div>
        </div>
    );
};

export default AlertBox;
