import React from 'react';
import { motion } from 'framer-motion';
import { useTodo } from '../context/TodoContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  FireIcon, 
  TrophyIcon, 
  ChartBarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const AnalyticsPage: React.FC = () => {
  const { state } = useTodo();

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const getMonthlyData = () => {
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthStartStr = monthStart.toISOString().split('T')[0];
    
    const todosThisMonth = state.todos.filter(todo => 
      new Date(todo.createdAt).toISOString().split('T')[0] >= monthStartStr
    );
    
    const completedThisMonth = todosThisMonth.filter(todo => todo.completed);
    
    const categoryData = ['personal', 'work', 'health', 'learning', 'finance'].map(cat => ({
      name: cat,
      todos: todosThisMonth.filter(t => t.category === cat).length,
      completed: completedThisMonth.filter(t => t.category === cat).length,
    }));

    const weeklyData = getLast7Days().map(date => {
      const dayTodos = state.todos.filter(todo => {
        const todoDate = new Date(todo.createdAt).toISOString().split('T')[0];
        return todoDate === date;
      });
      
      const dayCompleted = state.todos.filter(todo => {
        if (!todo.completedAt) return false;
        const completedDate = new Date(todo.completedAt).toISOString().split('T')[0];
        return completedDate === date;
      });

      return {
        date: new Date(date).toLocaleDateString('en', { weekday: 'short' }),
        created: dayTodos.length,
        completed: dayCompleted.length,
      };
    });

    const habitCompletionData = state.habits.map(habit => {
      const completionRate = habit.targetDays > 0 
        ? (habit.completedDates.length / habit.targetDays) * 100
        : 0;
      
      return {
        name: habit.title,
        rate: Math.round(completionRate),
        streak: habit.currentStreak,
      };
    });

    return {
      categoryData,
      weeklyData,
      habitCompletionData,
      totalTodos: todosThisMonth.length,
      completedTodos: completedThisMonth.length,
      completionRate: todosThisMonth.length > 0 
        ? Math.round((completedThisMonth.length / todosThisMonth.length) * 100)
        : 0,
    };
  };

  const data = getMonthlyData();

  const bestStreak = Math.max(...state.habits.map(h => h.bestStreak), 0);
  const totalStreakDays = state.habits.reduce((sum, habit) => sum + habit.currentStreak, 0);

  return (
    <div className="mobile-container px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold blue-gradient-text mb-2">Progress</h1>
        <p className="text-gray-400">Track your habit journey and achievements</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3 mb-6"
      >
        <div className="mobile-card text-center p-3">
          <ChartBarIcon className="h-5 w-5 text-accent-cyan mx-auto mb-1" />
          <div className="text-xl font-bold text-white">{data.completionRate}%</div>
          <div className="text-xs text-gray-400">Completion Rate</div>
        </div>
        
        <div className="mobile-card text-center p-3">
          <FireIcon className="h-5 w-5 text-accent-amber mx-auto mb-1" />
          <div className="text-xl font-bold text-white">{bestStreak}</div>
          <div className="text-xs text-gray-400">Best Streak</div>
        </div>
        
        <div className="mobile-card text-center p-3">
          <TrophyIcon className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
          <div className="text-xl font-bold text-white">{totalStreakDays}</div>
          <div className="text-xs text-gray-400">Total Streak Days</div>
        </div>
        
        <div className="mobile-card text-center p-3">
          <CalendarIcon className="h-5 w-5 text-accent-emerald mx-auto mb-1" />
          <div className="text-xl font-bold text-white">{data.completedTodos}</div>
          <div className="text-xs text-gray-400">Completed This Month</div>
        </div>
      </motion.div>

      <div className="space-y-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mobile-card"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }} 
              />
              <Line type="monotone" dataKey="created" stroke="#1D4ED8" strokeWidth={2} />
              <Line type="monotone" dataKey="completed" stroke="#22D3EE" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mobile-card"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="todos" fill="#1E3A8A" />
              <Bar dataKey="completed" fill="#22D3EE" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {state.habits.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mobile-card"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Habit Progress</h3>
            <div className="space-y-3">
              {data.habitCompletionData.map((habit, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium text-sm">{habit.name}</span>
                      <span className="text-sm text-gray-400">{habit.rate}%</span>
                    </div>
                    <div className="w-full bg-glass-border rounded-full h-2">
                      <div 
                        className="blue-gradient h-2 rounded-full transition-all duration-300"
                        style={{ width: `${habit.rate}%` }}
                      />
                    </div>
                  </div>
                    <div className="ml-4 text-right">
                      <div className="flex items-center space-x-1">
                      <FireIcon className="h-4 w-4 text-accent-amber" />
                      <span className="text-sm text-accent-amber">{habit.streak}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
