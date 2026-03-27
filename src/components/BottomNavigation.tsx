import React from 'react';
import { motion } from 'framer-motion';
import { 
  HomeIcon, 
  UserIcon,
  PlusIcon,
  CalendarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

interface BottomNavigationProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  onAddClick: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentPage, setCurrentPage, onAddClick }) => {
  const navItems = [
    { id: 'home', label: 'Habits', icon: HomeIcon },
    { id: 'today', label: 'Today', icon: CalendarIcon },
    { id: 'analytics', label: 'Progress', icon: TrophyIcon },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <>
      {/* Bottom Navigation Bar - Clean Design */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, type: "spring" }}
        className="fixed bottom-0 left-0 right-0 z-40"
      >
        <div className="mx-4 mb-4">
          <div className="glass-morphism rounded-[2rem] px-5 py-1.5 relative">
            {/* Subtle blue glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/25 via-blue-800/10 to-blue-900/25 rounded-[2rem]"></div>
            
            {/* Navigation items with center plus button */}
            <div className="flex items-center justify-around relative">
              {/* Left side items */}
              {navItems.slice(0, 2).map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`flex flex-col items-center space-y-1 transition-all duration-300 py-0.5 px-2 rounded-xl ${
                      isActive
                        ? 'text-blue-400 scale-110'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className={`p-1.5 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-blue-500/20 shadow-lg shadow-blue-500/20'
                        : 'hover:bg-white/5'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium">
                      {item.label}
                    </span>
                  </button>
                );
              })}

              {/* Center Plus Button */}
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2, type: "spring" }}
                onClick={onAddClick}
                className="w-[3.25rem] h-[3.25rem] blue-gradient rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 relative"
                whileTap={{ scale: 0.95 }}
              >
                <PlusIcon className="h-6 w-6 text-white" />
                
                {/* Enhanced blue glow effect */}
                <div className="absolute inset-0 blue-gradient rounded-full blur-xl opacity-60"></div>
                {/* Additional glow ring */}
                <div className="absolute inset-0 blue-gradient rounded-full blur-2xl opacity-30 scale-150"></div>
              </motion.button>

              {/* Right side items */}
              {navItems.slice(2).map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`flex flex-col items-center space-y-1 transition-all duration-300 py-0.5 px-2 rounded-xl ${
                      isActive
                        ? 'text-blue-400 scale-110'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className={`p-1.5 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-blue-500/20 shadow-lg shadow-blue-500/20'
                        : 'hover:bg-white/5'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Add padding to prevent content from being hidden behind bottom nav */}
      <div className="h-20"></div>
    </>
  );
};

export default BottomNavigation;
