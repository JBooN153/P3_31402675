import React from 'react';
import '../styles/Alert.css';

const Alert = ({ type = 'info', message, onClose }) => {
  React.useEffect(() => {
    // Solo cerrar automáticamente si es un alert de success
    // Los errores deben cerrarse manualmente
    if (onClose && type === 'success') {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [onClose, type]);

  return (
    <div className={`alert alert-${type}`}>
      <span>{message}</span>
      {onClose && (
        <button className="alert-close" onClick={onClose}>
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;
