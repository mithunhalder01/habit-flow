import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTodo } from '../context/TodoContext';
import TodoCard from './TodoCard';
import HabitCard from './HabitCard';
import AddTodoModal from './AddTodoModal';
import { Todo } from '../types';
import { 
  CheckCircleIcon, 
  ListBulletIcon, 
  FireIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'todos' | 'habits'>('all');
  const [showCompleted, setShowCompleted] = useState(true);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const { state, updateTodo, deleteTodo, deleteHabit } = useTodo();

  const filteredTodos = state.todos.filter(todo => {
    if (!showCompleted && todo.completed) return false;
    return true;
  });

  const filteredHabits = state.habits;

  const today = new Date().toISOString().split('T')[0];
  const completedHabitsToday = state.habits.filter(habit => 
    habit.completedDates.includes(today)
  ).length;

  const stats = {
    totalTodos: state.todos.length,
    completedTodos: state.todos.filter(t => t.completed).length,
    totalHabits: state.habits.length,
    completedHabitsToday,
    activeStreaks: state.habits.filter(h => h.currentStreak > 0).length,
  };

  return (
    <div className="mobile-container px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="mobile-card text-center p-3">
            <ListBulletIcon className="h-5 w-5 text-accent-cyan mx-auto mb-1" />
            <div className="text-xl font-bold text-white">{stats.totalTodos}</div>
            <div className="text-xs text-gray-400">Todos</div>
          </div>
          
          <div className="mobile-card text-center p-3">
            <CheckCircleIcon className="h-5 w-5 text-accent-emerald mx-auto mb-1" />
            <div className="text-xl font-bold text-white">{stats.completedTodos}</div>
            <div className="text-xs text-gray-400">Done</div>
          </div>
          
          <div className="mobile-card text-center p-3">
            <FireIcon className="h-5 w-5 text-accent-amber mx-auto mb-1" />
            <div className="text-xl font-bold text-white">{stats.activeStreaks}</div>
            <div className="text-xs text-gray-400">Streaks</div>
          </div>
          
          <div className="mobile-card text-center p-3">
            <CheckCircleIcon className="h-5 w-5 text-accent-emerald mx-auto mb-1" />
            <div className="text-xl font-bold text-white">{stats.completedHabitsToday}/{stats.totalHabits}</div>
            <div className="text-xs text-gray-400">Today</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="mobile-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-4 w-4 text-gray-400" />
              <span className="text-white font-medium text-sm">Filter</span>
            </div>
            
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className={`px-3 py-1 rounded-lg text-xs transition-all ${
                showCompleted
                  ? 'bg-glass-border text-blue-accent'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Completed
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                filter === 'all'
                  ? 'blue-gradient text-white'
                  : 'glass-button text-gray-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('todos')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                filter === 'todos'
                  ? 'blue-gradient text-white'
                  : 'glass-button text-gray-400'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('habits')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                filter === 'habits'
                  ? 'blue-gradient text-white'
                  : 'glass-button text-gray-400'
              }`}
            >
              Habits
            </button>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6 pb-8">
        {(filter === 'all' || filter === 'todos') && filteredTodos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-white mb-3">Todos</h2>
            <AnimatePresence>
              {filteredTodos.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  onUpdate={updateTodo}
                  onDelete={deleteTodo}
                  onEdit={(todo) => setEditingTodo(todo)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {(filter === 'all' || filter === 'habits') && filteredHabits.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-white mb-3">Habits</h2>
            <AnimatePresence>
              {filteredHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onUpdate={() => {}}
                  onDelete={deleteHabit}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {filteredTodos.length === 0 && filteredHabits.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="mobile-card max-w-sm mx-auto">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No tasks yet
              </h3>
              <p className="text-gray-400 text-sm">
                Tap the + button to add your first todo or habit
              </p>
            </div>
          </motion.div>
        )}
      </div>

      <AddTodoModal
        isOpen={Boolean(editingTodo)}
        onClose={() => setEditingTodo(null)}
        editItem={editingTodo}
        editType={editingTodo ? 'todo' : null}
      />
    </div>
  );
};

export default HomePage;
