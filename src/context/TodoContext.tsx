import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Todo, Habit } from '../types';

interface TodoState {
  todos: Todo[];
  habits: Habit[];
  loading: boolean;
}

type TodoAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TODOS'; payload: Todo[] }
  | { type: 'SET_HABITS'; payload: Habit[] }
  | { type: 'ADD_TODO'; payload: Todo }
  | { type: 'UPDATE_TODO'; payload: Todo }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'UPDATE_HABIT'; payload: Habit }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'TOGGLE_HABIT_TODAY'; payload: string };

const initialState: TodoState = {
  todos: [],
  habits: [],
  loading: true,
};

const todoReducer = (state: TodoState, action: TodoAction): TodoState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_TODOS':
      return { ...state, todos: action.payload, loading: false };
    case 'SET_HABITS':
      return { ...state, habits: action.payload, loading: false };
    case 'ADD_TODO':
      return { ...state, todos: [...state.todos, action.payload] };
    case 'UPDATE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id ? action.payload : todo
        ),
      };
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload),
      };
    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.payload] };
    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map(habit =>
          habit.id === action.payload.id ? action.payload : habit
        ),
      };
    case 'DELETE_HABIT':
      return {
        ...state,
        habits: state.habits.filter(habit => habit.id !== action.payload),
      };
    case 'TOGGLE_HABIT_TODAY':
      const today = new Date().toISOString().split('T')[0];
      return {
        ...state,
        habits: state.habits.map(habit => {
          if (habit.id === action.payload) {
            const completedDates = habit.completedDates.includes(today)
              ? habit.completedDates.filter(date => date !== today)
              : [...habit.completedDates, today];
            
            const currentStreak = calculateStreak(completedDates);
            
            return {
              ...habit,
              completedDates,
              currentStreak,
              bestStreak: Math.max(currentStreak, habit.bestStreak),
            };
          }
          return habit;
        }),
      };
    default:
      return state;
  }
};

const calculateStreak = (completedDates: string[]): number => {
  if (completedDates.length === 0) return 0;
  
  const sortedDates = completedDates.sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  
  let streak = 0;
  let currentDate = new Date(today);
  
  for (const dateStr of sortedDates) {
    const checkDate = currentDate.toISOString().split('T')[0];
    if (dateStr === checkDate) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (dateStr < checkDate) {
      break;
    }
  }
  
  return streak;
};

interface TodoContextType {
  state: TodoState;
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt'>) => void;
  updateTodo: (todo: Todo) => void;
  deleteTodo: (id: string) => void;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'bestStreak' | 'completedDates'>) => void;
  updateHabit: (habit: Habit) => void;
  deleteHabit: (id: string) => void;
  toggleHabitToday: (id: string) => void;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const useTodo = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
};

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(todoReducer, initialState);

  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    const savedHabits = localStorage.getItem('habits');
    
    if (savedTodos) {
      dispatch({ type: 'SET_TODOS', payload: JSON.parse(savedTodos) });
    }
    if (savedHabits) {
      dispatch({ type: 'SET_HABITS', payload: JSON.parse(savedHabits) });
    }
    
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  useEffect(() => {
    if (!state.loading) {
      localStorage.setItem('todos', JSON.stringify(state.todos));
      localStorage.setItem('habits', JSON.stringify(state.habits));
    }
  }, [state.todos, state.habits, state.loading]);

  const addTodo = (todo: Omit<Todo, 'id' | 'createdAt'>) => {
    const newTodo: Todo = {
      ...todo,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    dispatch({ type: 'ADD_TODO', payload: newTodo });
  };

  const updateTodo = (todo: Todo) => {
    dispatch({ type: 'UPDATE_TODO', payload: todo });
  };

  const deleteTodo = (id: string) => {
    dispatch({ type: 'DELETE_TODO', payload: id });
  };

  const addHabit = (habit: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'bestStreak' | 'completedDates'>) => {
    const newHabit: Habit = {
      ...habit,
      id: Date.now().toString(),
      createdAt: new Date(),
      currentStreak: 0,
      bestStreak: 0,
      completedDates: [],
    };
    dispatch({ type: 'ADD_HABIT', payload: newHabit });
  };

  const updateHabit = (habit: Habit) => {
    dispatch({ type: 'UPDATE_HABIT', payload: habit });
  };

  const deleteHabit = (id: string) => {
    dispatch({ type: 'DELETE_HABIT', payload: id });
  };

  const toggleHabitToday = (id: string) => {
    dispatch({ type: 'TOGGLE_HABIT_TODAY', payload: id });
  };

  return (
    <TodoContext.Provider value={{
      state,
      addTodo,
      updateTodo,
      deleteTodo,
      addHabit,
      updateHabit,
      deleteHabit,
      toggleHabitToday,
    }}>
      {children}
    </TodoContext.Provider>
  );
};
