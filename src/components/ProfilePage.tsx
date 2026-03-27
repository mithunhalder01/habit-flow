import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTodo } from '../context/TodoContext';
import { 
  UserIcon, 
  CalendarIcon, 
  TrophyIcon,
  FireIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const ProfilePage: React.FC = () => {
  const { state: authState, logout } = useAuth();
  const { state } = useTodo();
  const [showSettings, setShowSettings] = useState(false);

  const totalTodos = state.todos.length;
  const completedTodos = state.todos.filter(t => t.completed).length;
  const totalHabits = state.habits.length;
  const activeHabits = state.habits.filter(h => h.currentStreak > 0).length;
  const bestStreak = Math.max(...state.habits.map(h => h.bestStreak), 0);
  const totalStreakDays = state.habits.reduce((sum, habit) => sum + habit.currentStreak, 0);

  const joinDate = authState.user?.createdAt 
    ? new Date(authState.user.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'Unknown';

  const completionRate = totalTodos > 0 
    ? Math.round((completedTodos / totalTodos) * 100)
    : 0;

  const achievements = [
    {
      id: 1,
      name: 'First Steps',
      description: 'Complete your first todo',
      icon: '🎯',
      unlocked: completedTodos > 0,
    },
    {
      id: 2,
      name: 'Habit Builder',
      description: 'Create your first habit',
      icon: '🔥',
      unlocked: totalHabits > 0,
    },
    {
      id: 3,
      name: 'Consistency King',
      description: 'Maintain a 7-day streak',
      icon: '👑',
      unlocked: bestStreak >= 7,
    },
    {
      id: 4,
      name: 'Productivity Master',
      description: 'Complete 50 todos',
      icon: '🏆',
      unlocked: completedTodos >= 50,
    },
    {
      id: 5,
      name: 'Habit Warrior',
      description: 'Maintain a 30-day streak',
      icon: '⚔️',
      unlocked: bestStreak >= 30,
    },
    {
      id: 6,
      name: 'Perfect Week',
      description: 'Complete all habits for 7 days',
      icon: '✨',
      unlocked: false,
    },
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked).length;

  return (
    <div className="mobile-container px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold blue-gradient-text mb-2">Profile</h1>
        <p className="text-gray-400">Your personal dashboard</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mobile-card p-6 mb-6"
      >
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 blue-gradient rounded-full flex items-center justify-center">
            <UserIcon className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">
              {authState.user?.name}
            </h2>
            <p className="text-gray-400 text-sm">{authState.user?.email}</p>
            <div className="flex items-center space-x-2 mt-2">
              <CalendarIcon className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-400">Joined {joinDate}</span>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg glass-button text-gray-400 hover:text-white"
          >
            <CogIcon className="h-5 w-5" />
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3 mb-6"
      >
        <div className="mobile-card text-center p-3">
          <ChartBarIcon className="h-5 w-5 text-accent-cyan mx-auto mb-1" />
          <div className="text-xl font-bold text-white">{completionRate}%</div>
          <div className="text-xs text-gray-400">Success Rate</div>
        </div>
        
        <div className="mobile-card text-center p-3">
          <TrophyIcon className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
          <div className="text-xl font-bold text-white">{unlockedAchievements}/{achievements.length}</div>
          <div className="text-xs text-gray-400">Achievements</div>
        </div>
        
        <div className="mobile-card text-center p-3">
          <FireIcon className="h-5 w-5 text-accent-amber mx-auto mb-1" />
          <div className="text-xl font-bold text-white">{bestStreak}</div>
          <div className="text-xs text-gray-400">Best Streak</div>
        </div>
        
        <div className="mobile-card text-center p-3">
          <CalendarIcon className="h-5 w-5 text-accent-emerald mx-auto mb-1" />
          <div className="text-xl font-bold text-white">{totalStreakDays}</div>
          <div className="text-xs text-gray-400">Total Days</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mobile-card p-4 mb-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Total Todos</span>
            <span className="text-white font-medium">{totalTodos}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Completed Todos</span>
            <span className="text-white font-medium">{completedTodos}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Total Habits</span>
            <span className="text-white font-medium">{totalHabits}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Active Habits</span>
            <span className="text-white font-medium">{activeHabits}</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mobile-card p-4 mb-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-3 rounded-lg text-center transition-all ${
                achievement.unlocked
                  ? 'bg-glass-border'
                  : 'opacity-50'
              }`}
            >
              <div className="text-2xl mb-1">{achievement.icon}</div>
              <h4 className={`text-sm font-medium ${
                achievement.unlocked ? 'text-white' : 'text-gray-400'
              }`}>
                {achievement.name}
              </h4>
              <p className={`text-xs mt-1 ${
                achievement.unlocked ? 'text-gray-300' : 'text-gray-500'
              }`}>
                {achievement.description}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="pb-8"
      >
        <button
          onClick={logout}
          className="w-full glass-button text-red-400 hover:text-red-300 hover:bg-red-900/20"
        >
          <div className="flex items-center justify-center space-x-2">
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span>Sign Out</span>
          </div>
        </button>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
