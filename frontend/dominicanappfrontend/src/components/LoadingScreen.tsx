import React from 'react';
import './LoadingSpinner.css';
import './Common.css';

const LoadingSpinner = () => {
    return (
        <div className="d-flex flex-column align-items-center">
            <div className="loading-spinner m-2"></div>
        </div>
    );
}

export default LoadingSpinner;
