import React from 'react';
import { useToast } from '../Context/ToastContext';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  const getIcon = (type) => {
    // -
  };

  const getAlertClass = (type) => {
    switch (type) {

      case 'error':
        return 'alert-error';
      case 'warning':
        return 'alert-warning';
      default:
        return 'alert-success';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast toast-end z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`alert ${getAlertClass(toast.type)} mb-2 cursor-pointer`}
          onClick={() => removeToast(toast.id)}
        >
          {getIcon(toast.type)}
          <span>{toast.message}</span>
          <button 
            className="btn btn-sm btn-ghost ml-2"
            onClick={(e) => {
              e.stopPropagation();
              removeToast(toast.id);
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

// Hook personalizado para usar toasts fácilmente
export const useToastActions = () => {
  const { showToast } = useToast();

  return {
    showSuccess: (message, duration) => showToast(message, 'success', duration),
    showError: (message, duration) => showToast(message, 'error', duration),
    showWarning: (message, duration) => showToast(message, 'warning', duration),
    showInfo: (message, duration) => showToast(message, 'info', duration),
  };
};
