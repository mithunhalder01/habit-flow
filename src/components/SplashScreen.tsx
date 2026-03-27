import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  SparklesIcon,
  FireIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowContent(true), 300);
    const timer2 = setTimeout(() => onComplete(), 2500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background gradient - Black to Blue */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-blue-900">
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 100 - 50, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={showContent ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.8, type: "spring" }}
        className="relative z-10 text-center"
      >
        {/* Logo container */}
        <motion.div
          initial={{ rotate: 0 }}
          animate={showContent ? { rotate: 360 } : {}}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="w-24 h-24 mx-auto mb-6 relative"
        >
          <div className="absolute inset-0 blue-gradient rounded-3xl flex items-center justify-center shadow-2xl">
            <div className="relative">
              <FireIcon className="h-12 w-12 text-white" />
              <motion.div
                initial={{ scale: 0 }}
                animate={showContent ? { scale: 1 } : {}}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
              >
                <SparklesIcon className="h-3 w-3 text-white" />
              </motion.div>
            </div>
          </div>
          
          {/* Blue glow effect */}
          <div className="absolute inset-0 blue-gradient rounded-3xl blur-xl opacity-50 scale-125"></div>
        </motion.div>

        {/* App name */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={showContent ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold text-white mb-2">
            Habit
            <span className="blue-gradient-text">Flow</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Build Better Habits, Achieve More
          </p>
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={showContent ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-8 flex justify-center space-x-6"
        >
          <div className="flex items-center space-x-2 text-gray-300">
            <CheckCircleIcon className="h-5 w-5 text-blue-400" />
            <span className="text-sm">Track</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-300">
            <FireIcon className="h-5 w-5 text-blue-400" />
            <span className="text-sm">Build</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-300">
            <SparklesIcon className="h-5 w-5 text-blue-400" />
            <span className="text-sm">Grow</span>
          </div>
        </motion.div>

        {/* Loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={showContent ? { opacity: 1 } : {}}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-12 flex justify-center space-x-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-blue-400 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom decorative elements */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-32 text-blue-400/5"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
};

export default SplashScreen;
