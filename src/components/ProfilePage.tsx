import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTodo } from '../context/TodoContext';
import { 
  UserIcon, 
  CalendarIcon, 
  TrophyIcon,
  FireIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const ProfilePage: React.FC = () => {
  const { state: authState, logout } = useAuth();
  const { state } = useTodo();

  const user = authState.user;
  if (!user) return null;

  const totalTodos = state.todos.length;
  const completedTodos = state.todos.filter(t => t.completed).length;
  const totalHabits = state.habits.length;
  const activeHabits = state.habits.filter(h => h.currentStreak > 0).length;
  const bestStreak = Math.max(...state.habits.map(h => h.bestStreak), 0);
  const totalStreakDays = state.habits.reduce((sum, habit) => sum + habit.currentStreak, 0);

  const joinDate = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'Unknown';

  const completionRate = totalTodos > 0 
    ? Math.round((completedTodos / totalTodos) * 100)
    : 0;

  const getProviderIcon = (email: string) => {
    if (email.includes('google.com')) {
      return 'https://developers.google.com/identity/images/g-logo.png';
    }
    if (email.includes('facebook.com')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg';
    }
    return '/user-placeholder.png'; // or UserIcon
  };

  return (
    <div className="mobile-container px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold blue-gradient-text mb-2">Profile</h1>
        <p className="text-gray-400">Your progress and achievements</p>
      </motion.div>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mobile-card p-8 mb-8 text-center"
      >
        <div className="mb-6">
          <img 
            src={getProviderIcon(user.email)} 
            alt="Profile" 
            className="w-24 h-24 rounded-full mx-auto shadow-2xl border-4 border-white/20 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name) + '&size=192&background=1e40af&color=fff&bold=true';
            }}
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
          <p className="text-gray-400 text-lg mb-4">{user.email}</p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-400 mb-4">
            <div className="flex items-center space-x-1">
              <CalendarIcon className="h-4 w-4" />
              <span>Joined {joinDate}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FireIcon className="h-4 w-4" />
              <span>Role: {user.role}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-4 mb-8"
      >
        <div className="mobile-card p-6 text-center">
          <ChartBarIcon className="h-8 w-8 text-blue-400 mx-auto mb-3" />
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {completionRate}%
          </div>
          <p className="text-gray-400 mt-1">Completion Rate</p>
        </div>
        <div className="mobile-card p-6 text-center">
          <TrophyIcon className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
          <div className="text-3xl font-bold text-yellow-400">{bestStreak}d</div>
          <p className="text-gray-400 mt-1">Best Streak</p>
        </div>
        <div className="mobile-card p-6 text-center">
          <FireIcon className="h-8 w-8 text-orange-400 mx-auto mb-3" />
          <div className="text-3xl font-bold text-orange-400">{totalStreakDays}d</div>
          <p className="text-gray-400 mt-1">Total Streak Days</p>
        </div>
        <div className="mobile-card p-6 text-center">
          <UserIcon className="h-8 w-8 text-green-400 mx-auto mb-3" />
          <div className="text-3xl font-bold text-green-400">{completedTodos}</div>
          <p className="text-gray-400 mt-1">Todos Done</p>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mobile-card p-6 mb-6"
      >
        <h3 className="text-xl font-bold text-white mb-6 text-center">Quick Stats</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
            <span className="text-gray-300">Total Tasks</span>
            <span className="text-xl font-bold text-white">{totalTodos}</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
            <span className="text-gray-300">Active Habits</span>
            <span className="text-xl font-bold text-white">{activeHabits}</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
            <span className="text-gray-300">Total Habits</span>
            <span className="text-xl font-bold text-white">{totalHabits}</span>
          </div>
        </div>
      </motion.div>

      {/* Logout Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={logout}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-4 px-6 rounded-2xl shadow-2xl hover:from-red-600 hover:to-red-700 transform hover:scale-[1.02] transition-all duration-200 mb-6"
        >
          <div className="flex items-center justify-center space-x-3">
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span>Sign Out</span>
          </div>
        </button>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
