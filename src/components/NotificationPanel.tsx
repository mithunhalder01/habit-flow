import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange: (count: number) => void;
}

const STORAGE_KEY = 'adminNotifications';

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  onUnreadCountChange,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadNotifications = useCallback(() => {
    const savedNotifications = localStorage.getItem(STORAGE_KEY);
    if (!savedNotifications) {
      setNotifications([]);
      onUnreadCountChange(0);
      return;
    }

    const parsedNotifications: Notification[] = JSON.parse(savedNotifications).map((notification: any) => ({
      ...notification,
      timestamp: new Date(notification.timestamp),
    }));

    setNotifications(parsedNotifications);
    onUnreadCountChange(parsedNotifications.filter((notification) => !notification.read).length);
  }, [onUnreadCountChange]);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, loadNotifications]);

  const syncNotifications = (nextNotifications: Notification[]) => {
    setNotifications(nextNotifications);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextNotifications));
    onUnreadCountChange(nextNotifications.filter((notification) => !notification.read).length);
  };

  const markAsRead = (id: string) => {
    const nextNotifications = notifications.map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification
    );
    syncNotifications(nextNotifications);
  };

  const markAllAsRead = () => {
    const nextNotifications = notifications.map((notification) => ({
      ...notification,
      read: true,
    }));
    syncNotifications(nextNotifications);
  };

  const deleteNotification = (id: string) => {
    const nextNotifications = notifications.filter((notification) => notification.id !== id);
    syncNotifications(nextNotifications);
  };

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-20 z-50 max-h-[75vh]"
          >
            <div className="glass-morphism rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <BellIcon className="h-5 w-5 text-blue-400" />
                  <h3 className="text-white font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-blue-500 rounded-full text-white">
                      {unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs px-2 py-1 rounded-md text-blue-300 hover:text-white hover:bg-white/10 transition-all"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[60vh] p-3 space-y-3">
                {notifications.length === 0 ? (
                  <div className="mobile-card text-center py-8">
                    <BellIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`w-full text-left mobile-card p-4 transition-all ${
                        !notification.read ? 'border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between space-x-3">
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="flex-1 text-left"
                        >
                          <h4 className={`font-medium ${notification.read ? 'text-gray-200' : 'text-white'}`}>
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {notification.timestamp.toLocaleString()}
                          </p>
                        </button>
                        <div className="flex items-center space-x-2 mt-1">
                          {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 rounded text-gray-400 hover:text-red-400 transition-colors"
                            aria-label="Delete notification"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
