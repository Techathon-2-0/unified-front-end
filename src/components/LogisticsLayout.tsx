import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
import LogisticsSidebar from './sidebar';
import Footer from './footer';
import Loader from './loader';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '../context/AuthContext';
import PageNotFound from './pageNotFound'
import { fetchRolesByUserId } from '@/data/usermanage/responsibility'

interface LayoutProps {
  children: React.ReactNode;
}

const LogisticsLayout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  // New: Store allowed tabs for this user
  const [allowedTabs, setAllowedTabs] = useState<string[]>([]);
  const [accessChecked, setAccessChecked] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  useEffect(() => {
    const fetchAccess = async () => {
      if (user && user.id) {
        try {
          const roles = await fetchRolesByUserId(user.id);
          if (roles && roles.length > 0) {
            // Tabs
            // Tabs
            const tabs = roles[0].tabs_access.map((tab: any) => Object.keys(tab)[0]);
            setAllowedTabs(tabs);
          }
        } catch {
          setAllowedTabs([]);
        } finally {
          setAccessChecked(true);
        }
        setAccessChecked(true);
      }
    };
    fetchAccess();
  }, [user]);

  // Route-to-tab mapping
  const routeTabMap: Record<string, string> = {
    "/dashboard": "dashboard",
    "/trip-dashboard": "trip_dashboard",
    "/live/vehicles": "list_map",
    "/trail": "trail",
    "/alarm/Config": "alarm",
    "/geofence/Config": "geofence_config",
    "/geofence/Group": "geofence_group",
    "/geofence/Stats": "geofence_stats",
    "/reports/report": "report", // use "report" for tab check
    "/reports/schedule": "schedule_report",
    "/user-management/responsibility": "user_reponsibility",
    "/user-management/user": "user_access",
    "/manage/vehicles": "entities",
    "/manage/group": "group",
    "/manage/vendor": "vendors",
    "/manage/customer": "customer",
  };


  // Only check access after roles are loaded
  if (authLoading || !accessChecked) {
    return <Loader />;
  }

  if (!user) {
    return null;
  }

  // Check tab/report access for current route
  const pathname = location.pathname;
  let hasAccess = true;

  // Only allow /reports/* routes if "report" tab is present
  if (
    pathname.startsWith("/reports/") &&
    !allowedTabs.includes("report")
  ) {
    hasAccess = false;
  } else if (routeTabMap[pathname]) {
    const tabKey = routeTabMap[pathname];
    if (!allowedTabs.includes(tabKey)) {
      hasAccess = false;
    }
  }

  if (!hasAccess) {
    return <PageNotFound />;
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