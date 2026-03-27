export interface User {
  id: string;
  email: string;
  name: string;
  role?: 'admin' | 'user';
  blocked?: boolean;
  avatar?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: Date;
  createdAt: Date;
  completedAt?: Date;
  userId: string;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  targetDays: number;
  currentStreak: number;
  bestStreak: number;
  completedDates: string[];
  createdAt: Date;
  userId: string;
  category: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  userId: string;
}

export interface MonthlyStats {
  month: string;
  year: number;
  totalTodos: number;
  completedTodos: number;
  totalHabits: number;
  habitCompletionRate: number;
  mostProductiveDay: string;
  categoriesCompleted: { [key: string]: number };
  streakData: { date: string; count: number }[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error?: string | null;
}
