import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4500, action }) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newToast = { id, type, title, message, duration, action };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const toast = {
    success: (message, title = 'Success', options = {}) =>
      addToast({ type: 'success', title, message, ...options }),
    error: (message, title = 'Error', options = {}) =>
      addToast({ type: 'error', title, message, ...options }),
    warning: (message, title = 'Attention', options = {}) =>
      addToast({ type: 'warning', title, message, ...options }),
    info: (message, title = 'Info', options = {}) =>
      addToast({ type: 'info', title, message, ...options }),
    conflict: (message, title = 'Seat Unavailable', options = {}) =>
      addToast({ type: 'conflict', title, message, duration: 6000, ...options }),
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
