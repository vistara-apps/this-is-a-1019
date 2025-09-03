import { useState, useCallback } from 'react';
import { useUI } from '../context/UIContext';

/**
 * Custom hook for handling errors in async operations
 * @param {Object} options - Configuration options
 * @param {boolean} options.showToast - Whether to show error toast notifications
 * @param {boolean} options.logToConsole - Whether to log errors to console
 * @returns {Object} Error handling utilities
 */
const useErrorHandler = (options = {}) => {
  const { showToast = true, logToConsole = true } = options;
  
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showError } = useUI();

  /**
   * Wraps an async function with error handling
   * @param {Function} asyncFn - The async function to wrap
   * @param {Object} options - Options for this specific operation
   * @param {string} options.errorMessage - Custom error message to display
   * @param {boolean} options.rethrow - Whether to rethrow the error after handling
   * @returns {Function} Wrapped function with error handling
   */
  const handleAsync = useCallback((asyncFn, options = {}) => {
    const { errorMessage, rethrow = false } = options;
    
    return async (...args) => {
      try {
        setIsLoading(true);
        setError(null);
        return await asyncFn(...args);
      } catch (err) {
        const message = errorMessage || err.message || 'An error occurred';
        
        setError(err);
        
        if (logToConsole) {
          console.error(message, err);
        }
        
        if (showToast) {
          showError(message);
        }
        
        if (rethrow) {
          throw err;
        }
        
        return null;
      } finally {
        setIsLoading(false);
      }
    };
  }, [showError, logToConsole, showToast]);

  /**
   * Clear the current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    isLoading,
    handleAsync,
    clearError,
    setError
  };
};

export default useErrorHandler;

