import React from 'react';
import Logo from '../../logo.svg';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  HomeIcon, 
  ChartBarIcon, 
  UserIcon, 
  ArrowRightOnRectangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  onAddClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage, onAddClick }) => {
  const { state, logout } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-morphism mx-4 mt-4 p-4 mb-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
        <img src={Logo} alt="TodoHabit Logo" className="w-8 h-8 rounded-lg object-contain flex-shrink-0" />
          <h1 className="text-xl font-bold blue-gradient-text">TodoHabit</h1>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onAddClick}
            className="glass-button blue-gradient text-white p-2 rounded-lg"
          >
            <PlusIcon className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`p-2 rounded-lg transition-all ${
                    currentPage === item.id
                      ? 'bg-glass-border text-blue-accent'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-3 pl-4 border-l border-glass-border">
            <div className="text-right">
              <p className="text-sm font-medium text-white">
                {state.user?.name}
              </p>
              <p className="text-xs text-gray-400">
                {state.user?.email}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Navbar;
