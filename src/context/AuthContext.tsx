import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, AuthState } from '../types';
import { auth } from '../firebaseConfig';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';

export const ADMIN_EMAIL = 'admin@habitflow.com';

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
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const firebaseUserToUser = (firebaseUser: FirebaseUser): User => {
  const role = firebaseUser.email === ADMIN_EMAIL ? 'admin' : 'user';
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    role,
    blocked: false,
    createdAt: firebaseUser.metadata.creationTime ? new Date(firebaseUser.metadata.creationTime) : new Date(),
    lastLoginAt: firebaseUser.metadata.lastSignInTime ? new Date(firebaseUser.metadata.lastSignInTime) : new Date(),
  };
};

const getErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/email-already-in-use':
      return 'Email already in use.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/weak-password':
      return 'Password too weak.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Try again later.';
    default:
      return 'Authentication failed. Please try again.';
  }
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
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const user = firebaseUserToUser(firebaseUser);
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (
    email: string,
    password: string,
    options?: { adminOnly?: boolean; allowAdmin?: boolean }
  ) => {
    dispatch({ type: 'LOGIN_START' });

    if (email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase() && options?.adminOnly !== true) {
      dispatch({ type: 'LOGIN_ERROR', payload: 'Admin login is available only on /admin.' });
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // User mapped by onAuthStateChanged
    } catch (error: any) {
      dispatch({ type: 'LOGIN_ERROR', payload: getErrorMessage(error.code) });
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    dispatch({ type: 'LOGIN_START' });

    if (email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase()) {
      dispatch({ type: 'LOGIN_ERROR', payload: 'Admin account cannot be created from sign up.' });
      return;
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      // User mapped by onAuthStateChanged
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      result;
    } catch (error: any) {
      dispatch({ type: 'LOGIN_ERROR', payload: getErrorMessage(error.code) });
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('todos');
      localStorage.removeItem('habits');
    } catch (error) {
      console.error('Logout error:', error);
    }
    dispatch({ type: 'LOGOUT' });
  };

  const loginWithGoogle = async () => {
    dispatch({ type: 'LOGIN_START' });
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // User mapped by onAuthStateChanged
    } catch (error: any) {
      dispatch({ type: 'LOGIN_ERROR', payload: getErrorMessage(error.code) });
    }
  };

  const loginWithFacebook = async () => {
    dispatch({ type: 'LOGIN_START' });
    const provider = new FacebookAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // User mapped by onAuthStateChanged
    } catch (error: any) {
      dispatch({ type: 'LOGIN_ERROR', payload: getErrorMessage(error.code) });
    }
  };

  return (
    <AuthContext.Provider value={{ state, login, signup, logout, loginWithGoogle, loginWithFacebook }}>
      {children}
    </AuthContext.Provider>
  );
};
