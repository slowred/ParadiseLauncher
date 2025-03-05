import { useState, useEffect } from 'react';
import './Notification.css';

export function Notification({ message, type = 'success', duration = 3000, onClose }) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(onClose, 300); // Время анимации
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`notification ${type} ${isClosing ? 'closing' : ''}`}>
      <div className="notification-content">
        <div className="notification-icon">
          {type === 'success' ? '✓' : '✕'}
        </div>
        <span className="notification-message">{message}</span>
      </div>
      <button className="notification-close" onClick={() => {
        setIsClosing(true);
        setTimeout(onClose, 300);
      }}>
        ×
      </button>
    </div>
  );
} 