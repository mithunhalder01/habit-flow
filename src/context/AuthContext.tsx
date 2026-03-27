import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, AuthState } from '../types';

export const ADMIN_USERNAME = 'admin';
export const ADMIN_EMAIL = 'admin@habitflow.com';
export const ADMIN_PASSWORD = 'admin123';
const USER_LIST_STORAGE_KEY = 'users';
const CURRENT_USER_STORAGE_KEY = 'user';

type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { user: action.payload, isAuthenticated: true, loading: false, error: null };
    case 'LOGIN_ERROR':
      return { user: null, isAuthenticated: false, loading: false, error: action.payload };
    case 'LOGOUT':
      return { user: null, isAuthenticated: false, loading: false, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null };
    default:
      return state;
  }
};

interface AuthContextType {
  state: AuthState;
  login: (
    email: string,
    password: string,
    options?: { adminOnly?: boolean; allowAdmin?: boolean }
  ) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isAdminIdentifier = (identifier: string): boolean => {
  const normalized = identifier.trim().toLowerCase();
  return normalized === ADMIN_USERNAME || normalized === ADMIN_EMAIL;
};

const createAdminUser = (): User => ({
  id: 'admin-1',
  email: ADMIN_EMAIL,
  name: ADMIN_USERNAME,
  role: 'admin',
  blocked: false,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  lastLoginAt: new Date(),
});

const normalizeUser = (user: any): User => ({
  ...user,
  role: user.role || getUserRole(user.email || ''),
  blocked: Boolean(user.blocked),
});

const readUsers = (): User[] => {
  const savedUsers = localStorage.getItem(USER_LIST_STORAGE_KEY);
  if (!savedUsers) return [];

  try {
    const parsedUsers = JSON.parse(savedUsers);
    if (!Array.isArray(parsedUsers)) return [];
    return parsedUsers.map((user) => normalizeUser(user));
  } catch (error) {
    return [];
  }
};

const writeUsers = (users: User[]) => {
  localStorage.setItem(USER_LIST_STORAGE_KEY, JSON.stringify(users));
};

const ensureAdminInUsers = (users: User[]): User[] => {
  const adminIndex = users.findIndex(
    (user) => user.role === 'admin' || user.email?.toLowerCase() === ADMIN_EMAIL
  );

  if (adminIndex === -1) {
    return [...users, createAdminUser()];
  }

  const existingAdmin = users[adminIndex];
  const normalizedAdmin: User = {
    ...existingAdmin,
    id: existingAdmin.id || 'admin-1',
    email: ADMIN_EMAIL,
    name: ADMIN_USERNAME,
    role: 'admin',
    blocked: false,
  };

  return users.map((user, index) => (index === adminIndex ? normalizedAdmin : user));
};

const getUserRole = (identifier: string): 'admin' | 'user' => {
  return isAdminIdentifier(identifier) ? 'admin' : 'user';
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const users = ensureAdminInUsers(readUsers());
    writeUsers(users);

    const savedUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (savedUser) {
      const parsedUser = normalizeUser(JSON.parse(savedUser));
      const storedUser = users.find(
        (user) =>
          user.id === parsedUser.id || user.email?.toLowerCase() === parsedUser.email?.toLowerCase()
      );

      if (!storedUser) {
        localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      if (storedUser.blocked) {
        localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
        dispatch({ type: 'LOGIN_ERROR', payload: 'Your account is blocked by admin.' });
        return;
      }

      const normalizedSessionUser: User = {
        ...storedUser,
        blocked: false,
      };
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(normalizedSessionUser));
      dispatch({ type: 'LOGIN_SUCCESS', payload: normalizedSessionUser });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (
    email: string,
    password: string,
    options?: { adminOnly?: boolean; allowAdmin?: boolean }
  ) => {
    dispatch({ type: 'LOGIN_START' });
    
    setTimeout(() => {
      const trimmedIdentifier = email.trim().toLowerCase();
      const isAdminLogin = isAdminIdentifier(trimmedIdentifier);
      let users = ensureAdminInUsers(readUsers());
      const allowAdmin = options?.allowAdmin ?? true;
      const adminOnly = options?.adminOnly ?? false;

      if (adminOnly && !isAdminLogin) {
        dispatch({ type: 'LOGIN_ERROR', payload: 'Use admin username/email for admin access.' });
        return;
      }

      if (!allowAdmin && isAdminLogin) {
        dispatch({ type: 'LOGIN_ERROR', payload: 'Admin login is available only on /admin.' });
        return;
      }

      if (isAdminLogin && password !== ADMIN_PASSWORD) {
        dispatch({ type: 'LOGIN_ERROR', payload: 'Invalid admin credentials.' });
        return;
      }

      let user: User | undefined;

      if (isAdminLogin) {
        const adminUser = users.find((item) => item.role === 'admin') || createAdminUser();
        user = {
          ...adminUser,
          email: ADMIN_EMAIL,
          name: ADMIN_USERNAME,
          role: 'admin',
          blocked: false,
          lastLoginAt: new Date(),
        };

        users = users.map((item) => (item.id === adminUser.id ? user! : item));
      } else {
        const existingUser = users.find(
          (item) => item.email?.toLowerCase() === trimmedIdentifier
        );

        if (existingUser?.blocked) {
          dispatch({ type: 'LOGIN_ERROR', payload: 'Your account is blocked by admin.' });
          return;
        }

        if (existingUser) {
          user = {
            ...existingUser,
            lastLoginAt: new Date(),
            role: existingUser.role || 'user',
            blocked: Boolean(existingUser.blocked),
          };
          users = users.map((item) => (item.id === existingUser.id ? user! : item));
        } else {
          user = {
            id: Date.now().toString(),
            email: email.trim(),
            name: email.split('@')[0],
            role: 'user',
            blocked: false,
            createdAt: new Date(),
            lastLoginAt: new Date(),
          };
          users = [...users, user];
        }
      }

      writeUsers(users);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    }, 1000);
  };

  const signup = async (email: string, password: string, name: string) => {
    dispatch({ type: 'LOGIN_START' });
    
    setTimeout(() => {
      const trimmedEmail = email.trim().toLowerCase();

      if (isAdminIdentifier(trimmedEmail)) {
        dispatch({ type: 'LOGIN_ERROR', payload: 'Admin account cannot be created from sign up.' });
        return;
      }

      let users = ensureAdminInUsers(readUsers());
      const userAlreadyExists = users.some(
        (user) => user.email?.toLowerCase() === trimmedEmail
      );

      if (userAlreadyExists) {
        dispatch({ type: 'LOGIN_ERROR', payload: 'Account already exists. Please sign in.' });
        return;
      }

      const user: User = {
        id: Date.now().toString(),
        email: email.trim(),
        name,
        role: 'user',
        blocked: false,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };

      users = [...users, user];
      writeUsers(users);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    }, 1000);
  };

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    localStorage.removeItem('todos');
    localStorage.removeItem('habits');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
