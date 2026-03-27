import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bars3Icon,
  BellIcon
} from '@heroicons/react/24/outline';

interface TopNavbarProps {
  onSidebarClick: () => void;
  onNotificationsClick: () => void;
  unreadNotifications: number;
}

const TopNavbar: React.FC<TopNavbarProps> = ({
  onSidebarClick,
  onNotificationsClick,
  unreadNotifications,
}) => {
  return (
    <>
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, type: "spring" }}
        className="fixed top-0 left-0 right-0 z-40"
      >
        <div className="mx-4 mt-4">
          <div className="glass-morphism rounded-2xl px-4 py-3 relative">
            {/* Subtle blue glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/25 via-blue-800/10 to-blue-900/25 rounded-2xl"></div>
            
            <div className="flex items-center justify-between relative">
              {/* Left side - Hamburger menu */}
              <button
                onClick={onSidebarClick}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>

              {/* Center - Brand only */}
              <div className="absolute left-1/2 -translate-x-1/2">
                <h1 className="text-xl font-extrabold tracking-wide">
                  <span className="text-white">Habit</span>
                  <span className="text-blue-400">Flow</span>
                </h1>
              </div>

              {/* Right side - Notifications */}
              <button 
                onClick={onNotificationsClick}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 relative"
              >
                <BellIcon className="h-6 w-6" />
                {/* Notification dot */}
                {unreadNotifications > 0 && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Margin below navbar */}
      <div className="h-6"></div>
    </>
  );
};

export default TopNavbar;
