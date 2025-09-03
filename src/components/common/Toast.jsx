import React from 'react';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useUI } from '../../context/UIContext';

const Toast = () => {
  const { toasts, removeToast } = useUI();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-0 ${
            getToastBgColor(toast.type)
          }`}
        >
          <div className="mr-3">
            {toast.type === 'success' && <CheckCircle className="text-white" size={20} />}
            {toast.type === 'error' && <AlertCircle className="text-white" size={20} />}
            {toast.type === 'warning' && <AlertTriangle className="text-white" size={20} />}
            {toast.type === 'info' && <Info className="text-white" size={20} />}
          </div>
          <div className="flex-1 text-white">{toast.message}</div>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-4 text-white hover:text-white/80 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};

// Helper function to get background color based on toast type
const getToastBgColor = (type) => {
  switch (type) {
    case 'success':
      return 'bg-green-500/90 backdrop-blur-sm';
    case 'error':
      return 'bg-red-500/90 backdrop-blur-sm';
    case 'warning':
      return 'bg-yellow-500/90 backdrop-blur-sm';
    case 'info':
    default:
      return 'bg-blue-500/90 backdrop-blur-sm';
  }
};

export default Toast;

