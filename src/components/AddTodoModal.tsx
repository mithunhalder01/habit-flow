import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useTodo } from '../context/TodoContext';
import { useAuth } from '../context/AuthContext';
import { Todo, Habit } from '../types';

interface AddTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: Todo | Habit | null;
  editType?: 'todo' | 'habit' | null;
}

const AddTodoModal: React.FC<AddTodoModalProps> = ({ isOpen, onClose, editItem, editType }) => {
  const [type, setType] = useState<'todo' | 'habit'>('todo');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('personal');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [targetDays, setTargetDays] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');
  
  const { addTodo, addHabit, updateTodo, updateHabit, deleteTodo, deleteHabit } = useTodo();
  const { state } = useAuth();

  // Populate form when editing
  React.useEffect(() => {
    if (editItem && editType) {
      setType(editType);
      setTitle(editItem.title);
      setDescription(editItem.description || '');
      setCategory(editItem.category);
      
      if (editType === 'todo' && 'priority' in editItem) {
        setPriority(editItem.priority);
        setDueDate(editItem.dueDate ? new Date(editItem.dueDate).toISOString().split('T')[0] : '');
      } else if (editType === 'habit' && 'targetDays' in editItem) {
        setTargetDays(editItem.targetDays.toString());
        setTimeOfDay(editItem.timeOfDay || 'morning');
      }
    }
  }, [editItem, editType]);

  const isEditing = editItem && editType;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    if (isEditing && editItem && editType) {
      // Update existing item
      if (editType === 'todo') {
        updateTodo({
          ...editItem as Todo,
          title,
          description,
          category,
          priority,
          dueDate: dueDate ? new Date(dueDate) : undefined,
        });
      } else {
        updateHabit({
          ...editItem as Habit,
          title,
          description,
          category,
          targetDays: targetDays ? parseInt(targetDays) : 0,
          timeOfDay,
        });
      }
    } else {
      // Add new item
      if (type === 'todo') {
        addTodo({
          title,
          description,
          category,
          priority,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          completed: false,
          userId: state.user?.id || '',
        });
      } else {
        addHabit({
          title,
          description,
          category,
          targetDays: targetDays ? parseInt(targetDays) : 0,
          timeOfDay,
          userId: state.user?.id || '',
        });
      }
    }

    handleClose();
  };

  const handleDelete = () => {
    if (isEditing && editItem && editType) {
      if (editType === 'todo') {
        deleteTodo(editItem.id);
      } else {
        deleteHabit(editItem.id);
      }
      handleClose();
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setCategory('personal');
    setPriority('medium');
    setDueDate('');
    setTargetDays('');
    setTimeOfDay('morning');
    setType('todo');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-end justify-center"
        onClick={handleClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="glass-morphism w-full max-w-lg rounded-t-3xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <div className="flex justify-center py-3">
            <div className="w-12 h-1 bg-glass-border rounded-full"></div>
          </div>

          <div className="px-6 pb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {isEditing ? `Edit ${editType === 'todo' ? 'Todo' : 'Habit'}` : `Add New ${type === 'todo' ? 'Todo' : 'Habit'}`}
              </h2>
              <div className="flex items-center space-x-2">
                {isEditing && (
                  <button
                    onClick={handleDelete}
                    className="p-2 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {!isEditing && (
              <div className="flex space-x-2 mb-6">
                <button
                  onClick={() => setType('todo')}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                    type === 'todo'
                      ? 'blue-gradient text-white'
                      : 'glass-button text-gray-400'
                  }`}
                >
                  Todo
                </button>
                <button
                  onClick={() => setType('habit')}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                    type === 'habit'
                      ? 'blue-gradient text-white'
                      : 'glass-button text-gray-400'
                  }`}
                >
                  Habit
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder={type === 'todo' ? 'What needs to be done?' : 'What habit do you want to build?'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="glass-input w-full"
                  required
                />
              </div>

              <div>
                <textarea
                  placeholder="Add a description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="glass-input w-full resize-none"
                  rows={3}
                />
              </div>

              <div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="glass-input w-full"
                >
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="health">Health</option>
                  <option value="learning">Learning</option>
                  <option value="finance">Finance</option>
                </select>
              </div>

              {type === 'todo' ? (
                <>
                  <div>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                      className="glass-input w-full"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>

                  <div>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="glass-input w-full"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <input
                      type="number"
                      placeholder="Target days (optional)"
                      value={targetDays}
                      onChange={(e) => setTargetDays(e.target.value)}
                      className="glass-input w-full"
                      min="1"
                    />
                  </div>

                  <div>
                    <select
                      value={timeOfDay}
                      onChange={(e) => setTimeOfDay(e.target.value as any)}
                      className="glass-input w-full"
                    >
                      <option value="morning">🌅 Morning</option>
                      <option value="afternoon">☀️ Afternoon</option>
                      <option value="evening">🌆 Evening</option>
                      <option value="night">🌙 Night</option>
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={state.loading}
                className="glass-button w-full blue-gradient text-white font-semibold py-4"
              >
                {state.loading ? 'Please wait...' : (isEditing ? `Update ${editType === 'todo' ? 'Todo' : 'Habit'}` : `Add ${type === 'todo' ? 'Todo' : 'Habit'}`)}
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddTodoModal;
