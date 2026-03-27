import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTodo } from '../context/TodoContext';
import { ADMIN_EMAIL, ADMIN_USERNAME } from '../context/AuthContext';
import { User } from '../types';
import {
  UsersIcon,
  ChartBarIcon,
  BellIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckIcon,
  CheckCircleIcon,
  ClockIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface AdminPanelProps {
  onBack?: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const NOTIFICATION_STORAGE_KEY = 'adminNotifications';
const USER_STORAGE_KEY = 'users';
const CURRENT_USER_STORAGE_KEY = 'user';

const safeDate = (value?: Date | string | null): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDate = (value?: Date | string | null): string => {
  const parsed = safeDate(value);
  if (!parsed) return '--';
  return parsed.toLocaleString();
};

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const { state: todoState } = useTodo();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newNotification, setNewNotification] = useState({ title: '', message: '' });
  const [users, setUsers] = useState<User[]>([]);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserForm, setEditUserForm] = useState({ name: '', email: '' });
  const [userActionError, setUserActionError] = useState<string | null>(null);

  useEffect(() => {
    const savedNotifications = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (savedNotifications) {
      setNotifications(
        JSON.parse(savedNotifications).map((notification: any) => ({
          ...notification,
          timestamp: new Date(notification.timestamp),
        }))
      );
    } else {
      const defaultNotifications: Notification[] = [
        {
          id: '1',
          title: 'Welcome to Admin Panel',
          message: 'Create notifications from here. Users can view and manage them from bell icon.',
          timestamp: new Date(),
          read: false,
        },
      ];
      setNotifications(defaultNotifications);
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(defaultNotifications));
    }

    const savedUsers = localStorage.getItem(USER_STORAGE_KEY);
    let parsedUsers: User[] = [];

    if (savedUsers) {
      try {
        parsedUsers = JSON.parse(savedUsers).map((user: any) => ({
          ...user,
          role: user.role === 'admin' ? 'admin' : 'user',
          blocked: Boolean(user.blocked),
          createdAt: safeDate(user.createdAt) || new Date(),
          lastLoginAt: safeDate(user.lastLoginAt) || undefined,
        }));
      } catch (error) {
        parsedUsers = [];
      }
    }

    if (!parsedUsers.some((user) => user.role === 'admin' || user.email === ADMIN_EMAIL)) {
      parsedUsers.push({
        id: 'admin-1',
        email: ADMIN_EMAIL,
        name: ADMIN_USERNAME,
        role: 'admin',
        blocked: false,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      });
    }

    setUsers(parsedUsers);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(parsedUsers));
  }, []);

  const syncNotifications = (nextNotifications: Notification[]) => {
    setNotifications(nextNotifications);
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(nextNotifications));
  };

  const syncUsers = (nextUsers: User[]) => {
    setUsers(nextUsers);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUsers));
  };

  const addNotification = () => {
    if (!newNotification.title.trim() || !newNotification.message.trim()) return;

    const notification: Notification = {
      id: Date.now().toString(),
      title: newNotification.title.trim(),
      message: newNotification.message.trim(),
      timestamp: new Date(),
      read: false,
    };

    syncNotifications([notification, ...notifications]);
    setNewNotification({ title: '', message: '' });
  };

  const markAsRead = (id: string) => {
    syncNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const deleteNotification = (id: string) => {
    syncNotifications(notifications.filter((notification) => notification.id !== id));
  };

  const toggleBlockUser = (userId: string) => {
    setUserActionError(null);
    const targetUser = users.find((user) => user.id === userId);
    if (!targetUser || targetUser.role === 'admin') return;

    const nextUsers = users.map((user) =>
      user.id === userId ? { ...user, blocked: !user.blocked } : user
    );
    syncUsers(nextUsers);

    const activeSession = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (!activeSession) return;

    try {
      const loggedInUser = JSON.parse(activeSession);
      if (loggedInUser.id === userId && !targetUser.blocked) {
        localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
      }
    } catch (error) {
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    }
  };

  const startEditUser = (user: User) => {
    if (user.role === 'admin') return;
    setUserActionError(null);
    setEditingUserId(user.id);
    setEditUserForm({
      name: user.name || '',
      email: user.email || '',
    });
  };

  const cancelEditUser = () => {
    setEditingUserId(null);
    setEditUserForm({ name: '', email: '' });
  };

  const saveUserEdits = (userId: string) => {
    const targetUser = users.find((user) => user.id === userId);
    if (!targetUser || targetUser.role === 'admin') return;

    const nextName = editUserForm.name.trim();
    const nextEmail = editUserForm.email.trim().toLowerCase();

    if (!nextName || !nextEmail) {
      setUserActionError('Name and email are required.');
      return;
    }

    const emailExists = users.some(
      (user) => user.id !== userId && user.email?.toLowerCase() === nextEmail
    );

    if (emailExists) {
      setUserActionError('Email already used by another user.');
      return;
    }

    const nextUsers = users.map((user) =>
      user.id === userId ? { ...user, name: nextName, email: nextEmail } : user
    );
    syncUsers(nextUsers);
    setUserActionError(null);
    cancelEditUser();

    const activeSession = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (!activeSession) return;

    try {
      const loggedInUser = JSON.parse(activeSession);
      if (loggedInUser.id === userId) {
        localStorage.setItem(
          CURRENT_USER_STORAGE_KEY,
          JSON.stringify({
            ...loggedInUser,
            name: nextName,
            email: nextEmail,
          })
        );
      }
    } catch (error) {
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    }
  };

  const deleteUser = (userId: string) => {
    const targetUser = users.find((user) => user.id === userId);
    if (!targetUser || targetUser.role === 'admin') return;

    const shouldDelete = window.confirm(`Delete user "${targetUser.name}"?`);
    if (!shouldDelete) return;

    const nextUsers = users.filter((user) => user.id !== userId);
    syncUsers(nextUsers);
    setUserActionError(null);

    if (editingUserId === userId) {
      cancelEditUser();
    }

    const activeSession = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (!activeSession) return;

    try {
      const loggedInUser = JSON.parse(activeSession);
      if (loggedInUser.id === userId) {
        localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
      }
    } catch (error) {
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    }
  };

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const totalTodos = todoState.todos.length;
  const totalHabits = todoState.habits.length;
  const completedTodos = todoState.todos.filter((todo) => todo.completed).length;
  const activeHabits = todoState.habits.filter((habit) => habit.currentStreak > 0).length;
  const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  const totalUsers = users.length;
  const blockedUsers = users.filter((user) => user.blocked).length;
  const adminUsers = users.filter((user) => user.role === 'admin').length;
  const activeUsers = users.filter((user) => !user.blocked).length;

  const analyticsCards = useMemo(
    () => [
      { icon: UsersIcon, value: totalUsers, label: 'Total Users' },
      { icon: CheckCircleIcon, value: activeUsers, label: 'Active Users' },
      { icon: FireIcon, value: blockedUsers, label: 'Blocked Users' },
      { icon: ArrowTrendingUpIcon, value: `${completionRate}%`, label: 'Completion Rate' },
    ],
    [activeUsers, blockedUsers, completionRate, totalUsers]
  );

  const userStatusChartData = useMemo(
    () => [
      { name: 'Active', count: activeUsers },
      { name: 'Blocked', count: blockedUsers },
      { name: 'Admins', count: adminUsers },
    ],
    [activeUsers, blockedUsers, adminUsers]
  );

  const userActivityTrend = useMemo(() => {
    const days = [];

    for (let index = 6; index >= 0; index--) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - index);
      const dateKey = currentDate.toISOString().split('T')[0];

      const registrations = users.filter((user) => {
        const createdDate = safeDate(user.createdAt);
        return createdDate && createdDate.toISOString().split('T')[0] === dateKey;
      }).length;

      const logins = users.filter((user) => {
        const lastLogin = safeDate(user.lastLoginAt);
        return lastLogin && lastLogin.toISOString().split('T')[0] === dateKey;
      }).length;

      days.push({
        day: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
        registrations,
        logins,
      });
    }

    return days;
  }, [users]);

  const sortedUsers = useMemo(
    () =>
      [...users].sort((userA, userB) => {
        if (userA.role === 'admin' && userB.role !== 'admin') return -1;
        if (userB.role === 'admin' && userA.role !== 'admin') return 1;

        const dateA = safeDate(userA.createdAt)?.getTime() || 0;
        const dateB = safeDate(userB.createdAt)?.getTime() || 0;
        return dateB - dateA;
      }),
    [users]
  );

  return (
    <div className="min-h-screen mobile-container px-4 py-6 pb-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="glass-morphism rounded-3xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 blue-gradient rounded-full flex items-center justify-center">
                <ChartBarIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Admin Panel</h2>
                <p className="text-sm text-gray-400">Manage users, analytics and notifications</p>
              </div>
            </div>

            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span className="text-sm">Back</span>
              </button>
            )}
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(100vh-150px)]">
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <ChartBarIcon className="h-5 w-5 text-blue-400" />
                <span>Analytics Overview</span>
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {analyticsCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div key={card.label} className="mobile-card text-center p-4">
                      <Icon className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{card.value}</div>
                      <div className="text-xs text-gray-400">{card.label}</div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="mobile-card p-4">
                  <h4 className="font-medium text-white mb-3">User Activity (7 Days)</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={userActivityTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="day" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.85)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                        }}
                      />
                      <Line type="monotone" dataKey="registrations" stroke="#60A5FA" strokeWidth={2} />
                      <Line type="monotone" dataKey="logins" stroke="#34D399" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mobile-card p-4">
                  <h4 className="font-medium text-white mb-3">User Status</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={userStatusChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.85)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="count" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mobile-card p-4">
                  <h4 className="font-medium text-white mb-3 flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-blue-400" />
                    <span>Tasks & Habits</span>
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Todos</span>
                      <span className="text-white font-medium">{totalTodos}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Completed Todos</span>
                      <span className="text-blue-400 font-medium">{completedTodos}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Habits</span>
                      <span className="text-white font-medium">{totalHabits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Active Habits</span>
                      <span className="text-blue-400 font-medium">{activeHabits}</span>
                    </div>
                  </div>
                </div>

                <div className="mobile-card p-4">
                  <h4 className="font-medium text-white mb-3 flex items-center space-x-2">
                    <ClockIcon className="h-4 w-4 text-blue-400" />
                    <span>System Snapshot</span>
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Admins</span>
                      <span className="text-white font-medium">{adminUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Blocked Users</span>
                      <span className="text-red-400 font-medium">{blockedUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Unread Notifications</span>
                      <span className="text-yellow-400 font-medium">{unreadCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Data Updated</span>
                      <span className="text-white font-medium">{new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <UsersIcon className="h-5 w-5 text-blue-400" />
                <span>User List</span>
              </h3>
              {userActionError && (
                <p className="text-sm text-red-400 mb-4">{userActionError}</p>
              )}

              <div className="space-y-3">
                {sortedUsers.length === 0 ? (
                  <div className="mobile-card text-center py-8">
                    <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400">No users found</p>
                  </div>
                ) : (
                  sortedUsers.map((user) => (
                    <div key={user.id} className="mobile-card p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start space-x-3 min-w-0">
                          <div className="w-10 h-10 rounded-full blue-gradient flex items-center justify-center text-white font-semibold shrink-0">
                            {user.name?.slice(0, 1).toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0">
                            {editingUserId === user.id ? (
                              <div className="space-y-2">
                                <input
                                  value={editUserForm.name}
                                  onChange={(event) =>
                                    setEditUserForm({ ...editUserForm, name: event.target.value })
                                  }
                                  className="glass-input w-full py-2 text-sm"
                                  placeholder="Name"
                                />
                                <input
                                  value={editUserForm.email}
                                  onChange={(event) =>
                                    setEditUserForm({ ...editUserForm, email: event.target.value })
                                  }
                                  className="glass-input w-full py-2 text-sm"
                                  placeholder="Email"
                                />
                              </div>
                            ) : (
                              <>
                                <p className="text-white font-medium truncate">{user.name}</p>
                                <p className="text-sm text-gray-400 truncate">{user.email}</p>
                              </>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-300'}`}>
                                {user.role === 'admin' ? 'Admin' : 'User'}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${user.blocked ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                                {user.blocked ? 'Blocked' : 'Active'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Created: {formatDate(user.createdAt)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Last Login: {formatDate(user.lastLoginAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {editingUserId === user.id ? (
                            <>
                              <button
                                onClick={() => saveUserEdits(user.id)}
                                className="p-2 rounded-lg text-green-300 hover:text-white hover:bg-green-500/20 transition-all"
                                aria-label="Save user"
                              >
                                <CheckIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={cancelEditUser}
                                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                aria-label="Cancel edit"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditUser(user)}
                                disabled={user.role === 'admin'}
                                className={`p-2 rounded-lg transition-all ${
                                  user.role === 'admin'
                                    ? 'text-gray-500 cursor-not-allowed'
                                    : 'text-blue-300 hover:text-white hover:bg-blue-500/20'
                                }`}
                                aria-label="Edit user"
                              >
                                <PencilSquareIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteUser(user.id)}
                                disabled={user.role === 'admin'}
                                className={`p-2 rounded-lg transition-all ${
                                  user.role === 'admin'
                                    ? 'text-gray-500 cursor-not-allowed'
                                    : 'text-red-300 hover:text-white hover:bg-red-500/20'
                                }`}
                                aria-label="Delete user"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => toggleBlockUser(user.id)}
                                disabled={user.role === 'admin'}
                                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                                  user.role === 'admin'
                                    ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                                    : user.blocked
                                      ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                                      : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                                }`}
                              >
                                {user.role === 'admin' ? 'Protected' : user.blocked ? 'Unblock' : 'Block'}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <BellIcon className="h-5 w-5 text-blue-400" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h3>

              <div className="mobile-card p-4 mb-4">
                <h4 className="font-medium text-white mb-3">Add New Notification</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Notification title"
                    value={newNotification.title}
                    onChange={(event) =>
                      setNewNotification({ ...newNotification, title: event.target.value })
                    }
                    className="glass-input w-full"
                  />
                  <textarea
                    placeholder="Notification message"
                    value={newNotification.message}
                    onChange={(event) =>
                      setNewNotification({ ...newNotification, message: event.target.value })
                    }
                    className="glass-input w-full h-20 resize-none"
                  />
                  <button
                    onClick={addNotification}
                    className="glass-button blue-gradient text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    Add Notification
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="mobile-card text-center py-8">
                    <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`mobile-card p-4 cursor-pointer transition-all ${
                        !notification.read ? 'border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`font-medium ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {notification.timestamp.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              deleteNotification(notification.id);
                            }}
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
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPanel;
