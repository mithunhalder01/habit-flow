import React from 'react';
import { Habit } from '../types';
import { motion } from 'framer-motion';
import { 
  CheckIcon, 
  TrashIcon, 
  FireIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useTodo } from '../context/TodoContext';

interface HabitCardProps {
  habit: Habit;
  onUpdate: (habit: Habit) => void;
  onDelete: (id: string) => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onUpdate, onDelete }) => {
  const { toggleHabitToday } = useTodo();
  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = habit.completedDates.includes(today);

  const handleToggle = () => {
    toggleHabitToday(habit.id);
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-accent-cyan';
    if (streak >= 14) return 'text-blue-400';
    if (streak >= 7) return 'text-accent-emerald';
    if (streak >= 3) return 'text-accent-amber';
    return 'text-gray-400';
  };

  const getTimeIcon = (timeOfDay?: string) => {
    switch (timeOfDay) {
      case 'morning': return '🌅';
      case 'afternoon': return '☀️';
      case 'evening': return '🌆';
      case 'night': return '🌙';
      default: return '⏰';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="mobile-card"
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start space-x-3">
        <button
          onClick={handleToggle}
          className={`mt-1 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
            isCompletedToday
              ? 'bg-green-500 border-green-500'
              : 'border-glass-border hover:border-green-400'
          }`}
        >
          {isCompletedToday && (
            <CheckIcon className="h-4 w-4 text-white" />
          )}
        </button>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-white text-base">
                  {habit.title}
                </h3>
                <span className="text-lg">{getTimeIcon(habit.timeOfDay)}</span>
              </div>
              
              {habit.description && (
                <p className="text-sm mt-1 text-gray-400">
                  {habit.description}
                </p>
              )}
              
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-1">
                  <FireIcon className={`h-4 w-4 ${getStreakColor(habit.currentStreak)}`} />
                  <span className={`text-sm font-medium ${getStreakColor(habit.currentStreak)}`}>
                    {habit.currentStreak} day streak
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400">
                    Best: {habit.bestStreak}
                  </span>
                </div>

                <span className="text-xs text-gray-500">
                  {habit.category}
                </span>
              </div>

              {habit.targetDays > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{habit.completedDates.length}/{habit.targetDays} days</span>
                  </div>
                  <div className="w-full bg-glass-border rounded-full h-2">
                    <div 
                      className="blue-gradient h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((habit.completedDates.length / habit.targetDays) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => onDelete(habit.id)}
              className="p-2 rounded-lg text-gray-400 hover:text-red-400 transition-colors -mr-2"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HabitCard;
