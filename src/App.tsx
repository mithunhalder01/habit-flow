import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TodoProvider } from './context/TodoContext';
import Login from './components/Login';
import SplashScreen from './components/SplashScreen';
import HomePage from './components/HomePage';
import TodayPage from './components/TodayPage';
import AnalyticsPage from './components/AnalyticsPage';
import ProfilePage from './components/ProfilePage';
import AddTodoModal from './components/AddTodoModal';
import TopNavbar from './components/TopNavbar';
import BottomNavigation from './components/BottomNavigation';
import Sidebar from './components/Sidebar';
import AdminPanel from './components/AdminPanel';
import NotificationPanel from './components/NotificationPanel';

const APP_BASE_PATH = (process.env.PUBLIC_URL || '').replace(/\/+$/, '');

const toAppPath = (browserPath: string): string => {
  if (!APP_BASE_PATH || APP_BASE_PATH === '/') {
    return browserPath || '/';
  }

  if (browserPath === APP_BASE_PATH) {
    return '/';
  }

  if (browserPath.startsWith(`${APP_BASE_PATH}/`)) {
    return browserPath.slice(APP_BASE_PATH.length) || '/';
  }

  return browserPath || '/';
};

const toBrowserPath = (appPath: string): string => {
  const normalizedAppPath = appPath.startsWith('/') ? appPath : `/${appPath}`;
  if (!APP_BASE_PATH || APP_BASE_PATH === '/') {
    return normalizedAppPath;
  }

  return `${APP_BASE_PATH}${normalizedAppPath === '/' ? '' : normalizedAppPath}`;
};

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [pathname, setPathname] = useState(() => toAppPath(window.location.pathname));
  const { state } = useAuth();

  const refreshUnreadNotifications = () => {
    const savedNotifications = localStorage.getItem('adminNotifications');
    if (!savedNotifications) {
      setUnreadNotifications(0);
      return;
    }

    const notifications = JSON.parse(savedNotifications);
    setUnreadNotifications(notifications.filter((notification: any) => !notification.read).length);
  };

  const navigateTo = (nextPath: string) => {
    const browserPath = toBrowserPath(nextPath);
    if (window.location.pathname !== browserPath) {
      window.history.pushState({}, '', browserPath);
      setPathname(toAppPath(browserPath));
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setPathname(toAppPath(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (state.isAuthenticated) {
      refreshUnreadNotifications();
    }
  }, [state.isAuthenticated, pathname]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const normalizedPath = pathname.replace(/\/+$/, '') || '/';

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Then show auth if not authenticated
  if (!state.isAuthenticated && !state.loading) {
    return <Login mode={normalizedPath === '/admin' ? 'admin' : 'user'} />;
  }

  // Show loading while checking auth
  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-morphism p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (normalizedPath === '/admin') {
    return <AdminPanel onBack={() => navigateTo('/')} />;
  }

  // Finally show main app
  const renderPage = () => {
    switch (currentPage) {
      case 'today':
        return <TodayPage />;
      case 'home':
        return <HomePage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <TodayPage />;
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Top Navbar */}
      <TopNavbar 
        onSidebarClick={() => setShowSidebar(true)}
        onNotificationsClick={() => setShowNotifications(true)}
        unreadNotifications={unreadNotifications}
      />
      
      {/* Main Content with top padding for navbar */}
      <div className="pt-16">
        {renderPage()}
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        onAddClick={() => setShowAddModal(true)}
      />
      
      {/* Modals */}
      <AddTodoModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
      <Sidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onAdminNavigate={() => navigateTo('/admin')}
      />

      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onUnreadCountChange={setUnreadNotifications}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <TodoProvider>
        <AppContent />
      </TodoProvider>
    </AuthProvider>
  );
}

export default App;
