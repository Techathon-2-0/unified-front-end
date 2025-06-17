import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
import LogisticsSidebar from './sidebar';
import Footer from './footer';
import Loader from './loader';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const LogisticsLayout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  // Show loading if auth is still loading
  if (authLoading) {
    return <Loader />;
  }

  // Don't render if no user (this should be handled by ProtectedRoute, but just in case)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {loading && <Loader />}
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="flex flex-1 h-screen overflow-hidden">
        {/* Sidebar */}
        {/* Set z-40 to sidebar so it's above the backdrop */}
        <div className={cn(sidebarOpen && isMobile ? "z-40 fixed inset-y-0 left-0" : "z-40", "relative")}>
          <LogisticsSidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
        </div>
        
        {/* Backdrop for mobile */}
        {sidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 bg-gray-900/50 dark:bg-black/60 z-30" // removed backdrop-blur-sm
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Main Content */}
        <main className={cn(
          "flex-1 transition-all duration-300 ease-in-out pt-14",
          "md:ml-16", // Always have margin for icon-only sidebar on md+
          isMobile ? (sidebarOpen ? "ml-0" : "ml-0") : "",
          "overflow-hidden"
        )}>
          <div className="w-full mx-auto p-4 dark:text-gray-200">
            {children}
          </div>
          <Footer version="v2.4.1"/>
        </main>
      </div>
    </div>
  );
};

export default LogisticsLayout;