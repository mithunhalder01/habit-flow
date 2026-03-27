import React from 'react';
import { Todo } from '../types';
import { motion } from 'framer-motion';
import { 
  CheckIcon, 
  TrashIcon, 
  PencilSquareIcon,
  CalendarIcon,
  FlagIcon
} from '@heroicons/react/24/outline';

interface TodoCardProps {
  todo: Todo;
  onUpdate: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onEdit?: (todo: Todo) => void;
}

const TodoCard: React.FC<TodoCardProps> = ({ todo, onUpdate, onDelete, onEdit }) => {
  const handleToggle = () => {
    const updatedTodo = {
      ...todo,
      completed: !todo.completed,
      completedAt: !todo.completed ? new Date() : undefined,
    };
    onUpdate(updatedTodo);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
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
          className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            todo.completed
              ? 'bg-blue-primary border-blue-primary'
              : 'border-glass-border hover:border-blue-primary'
          }`}
        >
          {todo.completed && (
            <CheckIcon className="h-4 w-4 text-white" />
          )}
        </button>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Extra line for completed state */}
              {todo.completed && (
                <div className="h-0.5 bg-red-500/90 mb-2 rounded-full"></div>
              )}
              
              <h3 className={`font-medium text-base ${
                todo.completed 
                  ? 'text-red-400 line-through' 
                  : 'text-white'
              }`}>
                {todo.title}
              </h3>
              {todo.description && (
                <p className={`text-sm mt-1 ${
                  todo.completed 
                    ? 'text-red-300 line-through' 
                    : 'text-gray-400'
                }`}>
                  {todo.description}
                </p>
              )}
              
              <div className={`flex items-center space-x-3 mt-2 ${todo.completed ? 'opacity-80' : ''}`}>
                <span className="text-xs text-gray-500">
                  {todo.category}
                </span>
                
                <div className="flex items-center space-x-1">
                  <FlagIcon className={`h-3 w-3 ${getPriorityColor(todo.priority)}`} />
                  <span className={`text-xs ${getPriorityColor(todo.priority)}`}>
                    {todo.priority}
                  </span>
                </div>

                {todo.dueDate && (
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {new Date(todo.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <button
                onClick={() => onEdit?.(todo)}
                className="p-2 rounded-lg text-gray-400 hover:text-blue-400 transition-colors"
                aria-label="Edit todo"
              >
                <PencilSquareIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(todo.id)}
                className="p-2 rounded-lg text-gray-400 hover:text-red-400 transition-colors -mr-2"
                aria-label="Delete todo"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TodoCard;
