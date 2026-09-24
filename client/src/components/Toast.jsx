import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, onClose, duration = 2000 }) => {
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [message, duration, onClose]);

    if (!message) return null;

    return (
        <div className="toast">
            <span className="toast__icon">✓</span>
            <span className="toast__text">{message}</span>
        </div>
    );
};

export default Toast;