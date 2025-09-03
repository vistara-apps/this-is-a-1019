import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

export const UIProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  // Add a toast notification
  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now().toString();
    const newToast = {
      id,
      message,
      type, // 'info', 'success', 'warning', 'error'
      duration
    };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  };

  // Remove a toast notification
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Show success toast
  const showSuccess = (message, duration = 5000) => {
    return addToast(message, 'success', duration);
  };

  // Show error toast
  const showError = (message, duration = 5000) => {
    return addToast(message, 'error', duration);
  };

  // Show warning toast
  const showWarning = (message, duration = 5000) => {
    return addToast(message, 'warning', duration);
  };

  // Show info toast
  const showInfo = (message, duration = 5000) => {
    return addToast(message, 'info', duration);
  };

  // Set global loading state
  const setLoading = (loading) => {
    setIsLoading(loading);
  };

  // Set global error
  const setError = (error) => {
    setGlobalError(error);
    
    if (error) {
      showError(typeof error === 'string' ? error : 'An error occurred');
    }
  };

  // Clear global error
  const clearError = () => {
    setGlobalError(null);
  };

  const value = {
    toasts,
    isLoading,
    globalError,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    setLoading,
    setError,
    clearError
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

