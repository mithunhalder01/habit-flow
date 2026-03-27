import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  XMarkIcon,
  HomeIcon,
  CalendarIcon,
  ChartBarIcon,
  UserIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  FireIcon,
  TrophyIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  onAdminNavigate: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentPage,
  setCurrentPage,
  onAdminNavigate,
}) => {
  const { state, logout } = useAuth();

  const menuItems = [
    { id: 'today', label: 'Today', icon: CalendarIcon },
    { id: 'home', label: 'Habits', icon: HomeIcon },
    { id: 'analytics', label: 'Progress', icon: TrophyIcon },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  const quickStats = [
    { icon: CheckCircleIcon, label: 'Tasks Done', value: '12', color: 'text-green-400' },
    { icon: FireIcon, label: 'Day Streak', value: '5', color: 'text-orange-400' },
    { icon: TrophyIcon, label: 'Achievements', value: '8', color: 'text-blue-400' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-72 z-50"
          >
            <div className="h-full glass-morphism border-r border-white/10">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-bold blue-gradient-text">Habit Flow</h2>
                  <p className="text-sm text-gray-400">Welcome back!</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* User Info */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 blue-gradient rounded-full flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{state.user?.name}</p>
                    <p className="text-sm text-gray-400">{state.user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="p-6 border-b border-white/10">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  {quickStats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon className={`h-5 w-5 ${stat.color}`} />
                          <span className="text-sm text-gray-300">{stat.label}</span>
                        </div>
                        <span className="text-sm font-medium text-white">{stat.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Menu */}
              <div className="p-6 border-b border-white/10">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Navigation</h3>
                <nav className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentPage(item.id);
                          onClose();
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                          isActive
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Settings & Logout */}
              <div className="p-6 mt-auto">
                <button
                  onClick={() => {
                    onAdminNavigate();
                    onClose();
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-blue-300 hover:text-white hover:bg-blue-500/10 transition-all duration-300 mb-2"
                >
                  <ChartBarIcon className="h-5 w-5" />
                  <span className="font-medium">Admin Panel</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 mb-2">
                  <CogIcon className="h-5 w-5" />
                  <span className="font-medium">Settings</span>
                </button>
                
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
