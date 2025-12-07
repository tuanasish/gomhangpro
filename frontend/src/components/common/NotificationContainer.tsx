import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import Toast from './Toast';

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div 
      className="fixed top-20 left-4 right-4 lg:top-4 lg:left-auto lg:right-4 z-[9999] flex flex-col gap-3 max-w-md lg:w-auto w-full pointer-events-none" 
      style={{ 
        top: 'calc(4rem + env(safe-area-inset-top, 0px) + 0.5rem)'
      }}
    >
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <Toast notification={notification} onClose={() => removeNotification(notification.id)} />
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;

