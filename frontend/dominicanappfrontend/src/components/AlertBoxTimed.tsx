import React, { useEffect, useState } from 'react';

interface AlertBoxTimedProps {
    text: string | null;
    type: 'info' | 'danger' | 'success';
    width: string;
    duration?: number;
    onClose: () => void;
}

const AlertBoxTimed: React.FC<AlertBoxTimedProps> = ({ text, type, width, duration = 5000, onClose }) => {
    const [fadeOut, setFadeOut] = useState(false);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => Math.max(0, prev - 100 / (duration / 100)));
        }, 100);

        const timer = setTimeout(() => {
            setFadeOut(true);
            setTimeout(onClose, 300); // 300ms is the duration of the fade-out transition
        }, duration);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [duration, onClose]);

    const handleClose = () => {
        setFadeOut(true);
        setTimeout(onClose, 300);
    };

    return (
        <div className={`d-flex flex-column align-items-center mt-2 ${fadeOut ? 'fade-out' : ''}`} style={{ transition: 'opacity 0.3s' }}>
            <div className={`alert alert-${type} mw-100 text-center position-relative mb-0`} style={{ width }}>
                <button type="button" className="close-btn position-absolute" style={{ top: '5px', right: '5px' }} onClick={handleClose}>
                    <span>&times;</span>
                </button>
                {text}
                <div className="progress" style={{ height: '4px', marginTop: '10px' }}>
                    <div
                        className={`progress-bar bg-${type === 'success' ? 'success' : type === 'info' ? 'info' : 'danger'}`}
                        role="progressbar"
                        style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default AlertBoxTimed;
