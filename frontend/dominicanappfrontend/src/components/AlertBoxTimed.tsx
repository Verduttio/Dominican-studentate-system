import React, { useEffect, useState } from 'react';

interface AlertBoxTimedProps {
    text: string | null;
    type: 'info' | 'danger' | 'success';
    width: string;
    duration?: number; // Duration in milliseconds, default to 5 seconds
    onClose: () => void;
}

const AlertBoxTimed: React.FC<AlertBoxTimedProps> = ({ text, type, width, duration = 5000, onClose }) => {
    const [fadeOut, setFadeOut] = useState(false); // Used for fade-out animation
    const [progress, setProgress] = useState(100); // Controls the progress bar
    const [fadeIn, setFadeIn] = useState(true); // Used for fade-in animation

    useEffect(() => {
        // Trigger fade-in animation on mount
        setTimeout(() => setFadeIn(false), 300); // After 300ms, disable the fade-in

        const interval = setInterval(() => {
            setProgress((prev) => Math.max(0, prev - 100 / (duration / 100))); // Update progress bar
        }, 100);

        // Trigger fade-out animation after `duration` time
        const timer = setTimeout(() => {
            setFadeOut(true); // Start fade-out animation
            setTimeout(onClose, 300); // Call `onClose` after fade-out (300ms delay)
        }, duration);

        // Cleanup timers when component unmounts
        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [duration, onClose]);

    // Handle manual close when the "X" button is clicked
    const handleClose = () => {
        setFadeOut(true);
        setTimeout(onClose, 300); // Add 300ms delay for fade-out before closing
    };

    return (
        <div className={`d-flex flex-column align-items-center ${fadeIn ? 'fade-in' : ''} ${fadeOut ? 'fade-out' : ''}`} style={{ transition: 'opacity 0.3s', marginBottom: '0' }}>
            <div className={`alert alert-${type} mw-100 text-center position-relative mt-2`} style={{ width, marginBottom: '0' }}>
                <button
                    type="button"
                    className="close-btn position-absolute"
                    style={{ top: '10px', right: '10px' }}
                    onClick={handleClose}
                >
                    &times;
                </button>
                {text}
                <div className="progress" style={{ height: '4px', marginTop: '10px', marginBottom: '0' }}>
                    <div
                        className={`progress-bar bg-${type === 'danger' ? 'dark' : 'secondary'}`}
                        role="progressbar"
                        style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default AlertBoxTimed;
