import { Routes, Route, Outlet } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
// import SignIn from "./pages/Sigin"
import Home from "./pages/Home"
import PageNotFound from "./components/pageNotFound"
import Dashboard from "./pages/Dashboard/dashboard_page"
import TripDashboard from "./pages/Dashboard/trip_page"
import LiveList from "./pages/live/list_page"
import Trail from "./pages/trail/trail_page"
import Alarm from "./pages/Alarm/aconfig_page"
import Report from "./pages/Reports/report_page"
import Schedule from "./pages/Reports/schedule_page"
import GConfig from "./pages/geofence/gconfig_page"
import GeofenceGroupPage from "./pages/geofence/ggroup_page"
import GeofenceStats from "./pages/geofence/gstats_page"
import UserManagement from "./pages/usermanage/user_page"
import Responsibility from "./pages/usermanage/responsibility_page"
import Entities from "./pages/Manage/entity_page"
import Group from "./pages/Manage/group_page"
import Vendor from "./pages/Manage/vendor_page"
import CustomerGroup from "./pages/Manage/customergroup_page"
import LogisticsLayout from "./components/LogisticsLayout"
import { ProfilePage } from "./pages/profile"
import "./index.css"

import { ThemeProvider } from "./context/ThemeContext"

const Appp = () => {
  return (
    <div className="font-sans min-h-screen">
      <ThemeProvider>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#10B981",
                secondary: "#fff",
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: "#EF4444",
                secondary: "#fff",
              },
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/signin" element={<SignIn />} /> */}

          <Route
            element={
              <ProtectedRoute>
                <LogisticsLayout>
                  <Outlet />
                </LogisticsLayout>
              </ProtectedRoute>
            }
          >
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trip-dashboard" element={<TripDashboard />} />
            <Route path="/live/vehicles" element={<LiveList />} />
            <Route path="/trail" element={<Trail />} />
            <Route path="/alarm/Config" element={<Alarm />} />
            <Route path="/geofence/Config" element={<GConfig />} />
            <Route path="/geofence/Group" element={<GeofenceGroupPage />} />
            <Route path="/geofence/Stats" element={<GeofenceStats />} />
            <Route path="/reports/report" element={<Report />} />
            <Route path="/reports/schedule" element={<Schedule />} />
            
            <Route path="/user-management/responsibility" element={<Responsibility />} />
            <Route path="/user-management/user" element={<UserManagement />} />
            <Route path="/manage/vehicles" element={<Entities />} />
            <Route path="/manage/group" element={<Group />} />
            <Route path="/manage/vendor" element={<Vendor />} />
            <Route path="/manage/customer" element={<CustomerGroup />} />
          </Route>

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </AuthProvider>
      </ThemeProvider>
    </div>
  )
}

export default Appp