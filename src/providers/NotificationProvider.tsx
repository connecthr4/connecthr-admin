'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import NotificationContainer from '@/src/components/NotificationContainer';
import { Notification } from '@/src/components/NotificationContainer/NotificationContainer';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';

interface NotificationContextType {
  showNotification: (
    title: string,
    message: string,
    type?: NotificationType,
    duration?: number,
    position?: NotificationPosition,
    showProgress?: boolean
  ) => void;
  removeNotification: (id: number) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
let notificationId = 0;

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (
    title: string,
    message: string,
    type: NotificationType = 'info',
    duration: number = 5000,
    position: NotificationPosition = 'top-right',
    showProgress: boolean = false
  ) => {
    const id = ++notificationId;
    setNotifications((prev) => [...prev, { id, title, message, type, duration, position, showProgress }]);

    if (duration && duration > 0) {
      setTimeout(() => removeNotification(id), duration);
    }

    return id;
  };

  const removeNotification = (id: number) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  const clearAllNotifications = () => setNotifications([]);

  return (
    <NotificationContext.Provider value={{ showNotification, removeNotification, clearAllNotifications }}>
      {children}
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context; // returns { showNotification, removeNotification, clearAllNotifications }
};
