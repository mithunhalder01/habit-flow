import React from 'react';
import { motion } from 'framer-motion';
import { useTodo } from '../context/TodoContext';
import { useAuth } from '../context/AuthContext';
import TodoCard from './TodoCard';
import HabitCard from './HabitCard';
import AddTodoModal from './AddTodoModal';
import { Todo } from '../types';
import { 
  CalendarIcon,
  SunIcon,
  MoonIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const TodayPage: React.FC = () => {
  const { state: todoState, updateTodo, deleteTodo, deleteHabit } = useTodo();
  const { state: authState } = useAuth();
  const [editingTodo, setEditingTodo] = React.useState<Todo | null>(null);
  
  const today = new Date().toISOString().split('T')[0];
  const currentTime = new Date().getHours();
  const isMorning = currentTime >= 5 && currentTime < 12;
  const isAfternoon = currentTime >= 12 && currentTime < 17;
  const isEvening = currentTime >= 17 && currentTime < 22;
  const isNight = currentTime >= 22 || currentTime < 5;

  const todayTodos = todoState.todos.filter(todo => {
    if (todo.dueDate) {
      return todo.dueDate.toString().split('T')[0] === today;
    }

    if (todo.completed && todo.completedAt) {
      return new Date(todo.completedAt).toISOString().split('T')[0] === today;
    }

    return !todo.completed; // Show incomplete todos without due dates
  });

  const todayHabits = todoState.habits.filter(habit => {
    if (habit.timeOfDay === 'morning' && isMorning) return true;
    if (habit.timeOfDay === 'afternoon' && isAfternoon) return true;
    if (habit.timeOfDay === 'evening' && isEvening) return true;
    if (habit.timeOfDay === 'night' && isNight) return true;
    if (!habit.timeOfDay) return true; // Show habits without time preference
    return false;
  });

  const completedHabitsToday = todayHabits.filter(habit => 
    habit.completedDates.includes(today)
  ).length;

  const getTimeGreeting = () => {
    if (isMorning) return "Good Morning";
    if (isAfternoon) return "Good Afternoon";
    if (isEvening) return "Good Evening";
    return "Good Night";
  };

  const getFormattedDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    };
    return now.toLocaleDateString('en-US', options);
  };

  const getFormattedTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getTimeIcon = () => {
    if (isMorning) return SunIcon;
    if (isAfternoon) return SunIcon;
    if (isEvening) return MoonIcon;
    return MoonIcon;
  };

  const TimeIcon = getTimeIcon();

  return (
    <div className="mobile-container px-4">
      {/* Header with time-based greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {getTimeGreeting()}, {authState.user?.name || 'User'}!
            </h1>
            <p className="text-gray-400 text-sm">
              {getFormattedDate()} • {getFormattedTime()}
            </p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-900/35 to-blue-700/25 rounded-full flex items-center justify-center">
            <TimeIcon className="h-6 w-6 text-accent-cyan" />
          </div>
        </div>
      </motion.div>

      {/* Today's Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3 mb-6"
      >
        <div className="mobile-card text-center p-4">
          <CalendarIcon className="h-5 w-5 text-accent-cyan mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{todayTodos.length}</div>
          <div className="text-xs text-gray-400">Today's Tasks</div>
        </div>
        
        <div className="mobile-card text-center p-4">
          <CheckCircleIcon className="h-5 w-5 text-accent-emerald mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{completedHabitsToday}/{todayHabits.length}</div>
          <div className="text-xs text-gray-400">Habits Done</div>
        </div>
      </motion.div>

      {/* Time-based section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="mobile-card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-900/30 rounded-full flex items-center justify-center">
              <TimeIcon className="h-5 w-5 text-accent-cyan" />
            </div>
            <div>
              <h3 className="font-semibold text-white">
                {isMorning ? 'Morning Focus' : 
                 isAfternoon ? 'Afternoon Tasks' : 
                 isEvening ? 'Evening Review' : 'Night Planning'}
              </h3>
              <p className="text-sm text-gray-400">
                {isMorning ? 'Start your day strong' : 
                 isAfternoon ? 'Keep the momentum' : 
                 isEvening ? 'Review your progress' : 'Plan for tomorrow'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Today's Habits */}
      {todayHabits.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h2 className="text-lg font-semibold text-white mb-3">Today's Habits</h2>
          <div className="space-y-3">
            {todayHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onUpdate={() => {}}
                onDelete={deleteHabit}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Today's Todos */}
      {todayTodos.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pb-8"
        >
          <h2 className="text-lg font-semibold text-white mb-3">Today's Tasks</h2>
          <div className="space-y-3">
            {todayTodos.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onUpdate={updateTodo}
                onDelete={deleteTodo}
                onEdit={(todo) => setEditingTodo(todo)}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {todayTodos.length === 0 && todayHabits.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 pb-8"
        >
          <div className="mobile-card max-w-sm mx-auto">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              All caught up!
            </h3>
            <p className="text-gray-400 text-sm">
              No tasks or habits for this time. Enjoy your {isMorning ? 'morning' : isAfternoon ? 'afternoon' : isEvening ? 'evening' : 'night'}!
            </p>
          </div>
        </motion.div>
      )}

      <AddTodoModal
        isOpen={Boolean(editingTodo)}
        onClose={() => setEditingTodo(null)}
        editItem={editingTodo}
        editType={editingTodo ? 'todo' : null}
      />
    </div>
  );
};

export default TodayPage;
