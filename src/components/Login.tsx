import React, { useState } from 'react';
import { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USERNAME, useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface LoginProps {
  mode?: 'user' | 'admin';
}

const Login: React.FC<LoginProps> = ({ mode = 'user' }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, signup, state } = useAuth();
  const isAdminMode = mode === 'admin';

  React.useEffect(() => {
    if (isAdminMode) {
      setIsSignup(false);
    }
  }, [isAdminMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminMode && isSignup) {
      await signup(email, password, name);
    } else {
      await login(email, password, {
        adminOnly: isAdminMode,
        allowAdmin: isAdminMode,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass-morphism p-8 rounded-3xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold blue-gradient-text mb-2">
              {isAdminMode ? 'Admin Access' : 'TodoHabit'}
            </h1>
            <p className="text-gray-400">
              {isAdminMode
                ? 'Sign in to open admin panel'
                : isSignup
                  ? 'Create your account'
                  : 'Welcome back'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isAdminMode && isSignup && (
              <div>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glass-input w-full"
                  required
                />
              </div>
            )}

            <div>
              <input
                type={!isAdminMode && isSignup ? 'email' : 'text'}
                placeholder={
                  !isAdminMode && isSignup
                    ? 'Email address'
                    : isAdminMode
                      ? 'Admin username or email'
                      : 'Email or username'
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input w-full"
                required
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input w-full pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={state.loading}
              className="glass-button w-full blue-gradient text-white font-semibold py-3 rounded-xl tracking-wide"
            >
              {state.loading ? 'Please wait...' : !isAdminMode && isSignup ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          {state.error && (
            <p className="mt-4 text-sm text-red-400 text-center">
              {state.error}
            </p>
          )}

          {isAdminMode && (
            <div className="mt-4 mobile-card p-3 text-left">
              <p className="text-xs text-gray-300 font-semibold mb-1">Admin Login</p>
              <p className="text-xs text-gray-400">Username: <span className="text-white">{ADMIN_USERNAME}</span></p>
              <p className="text-xs text-gray-400">Email: <span className="text-white">{ADMIN_EMAIL}</span></p>
              <p className="text-xs text-gray-400">Password: <span className="text-white">{ADMIN_PASSWORD}</span></p>
            </div>
          )}

          {!isAdminMode && (
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                {isSignup ? 'Already have an account?' : "Don't have an account?"}
                <button
                  onClick={() => setIsSignup(!isSignup)}
                  className="ml-2 px-3 py-1 rounded-full border border-blue-700/40 bg-blue-900/20 text-accent-cyan hover:bg-blue-800/35 transition-all"
                >
                  {isSignup ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Track your habits, achieve your goals
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
