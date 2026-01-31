import React from 'react';

const Button = ({ children, onClick, type = 'button', className = '', disabled = false, ...props }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
