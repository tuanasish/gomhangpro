import React from 'react';
import { Notification } from '../../context/NotificationContext';

interface ToastProps {
  notification: Notification;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
  const { type, message } = notification;

  const icons = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
    warning: 'warning',
  };

  const colors = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-600 dark:text-green-400',
      icon: 'text-green-600 dark:text-green-400',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-600 dark:text-red-400',
      icon: 'text-red-600 dark:text-red-400',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-600 dark:text-blue-400',
      icon: 'text-blue-600 dark:text-blue-400',
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-600 dark:text-yellow-400',
      icon: 'text-yellow-600 dark:text-yellow-400',
    },
  };

  const colorClass = colors[type];

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg ${colorClass.bg} ${colorClass.border} animate-in slide-in-from-top-5 fade-in duration-300`}
      role="alert"
    >
      <span className={`material-symbols-outlined flex-shrink-0 ${colorClass.icon}`}>
        {icons[type]}
      </span>
      <p className={`flex-1 text-sm font-medium ${colorClass.text}`}>{message}</p>
      <button
        onClick={onClose}
        className={`flex-shrink-0 ${colorClass.text} hover:opacity-70 transition-opacity`}
        aria-label="Đóng thông báo"
      >
        <span className="material-symbols-outlined text-xl">close</span>
      </button>
    </div>
  );
};

export default Toast;

