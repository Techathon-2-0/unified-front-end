import { Routes, Route, Outlet } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import SignIn from "./pages/Sigin"
import Home from "./pages/Home"
import PageNotFound from "./components/pageNotFound"
import Dashboard from "./pages/Dashboard/dashboard"
import TripDashboard from "./pages/Dashboard/trip-dashboard"
import LiveList from "./pages/live/list"
import Trail from "./pages/trail/t"
import AlarmPage from "./pages/Alarm/Alarm"
import Log from "./pages/Alarm/log"
import Report from "./pages/Reports/report"
import Schedule from "./pages/Reports/schedule"
import Back from "./pages/backoffice/b"
import GeofenceConfig from "./pages/Geofence/GeofenceConfig"
import GeofenceGroupPage from "./pages/Geofence/geofencegroup"
import GeofenceStats from "./pages/Geofence/GeofenceStats"
import UserManagement from "./pages/UserManagenment/userMan"
import Responsibility from "./pages/UserManagenment/responsibility"
import Entities from "./pages/Manage/entities"
import Group from "./pages/Manage/group"
import Vendor from "./pages/Manage/vendor"
import CustomerGroup from "./pages/Manage/customergroup"
import LogisticsLayout from "./components/LogisticsLayout"
import Profile from "./pages/profile"
import "./index.css"

const Appp = () => {
  return (
    <div className="font-sans min-h-screen">
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
          <Route path="/signin" element={<SignIn />} />

          <Route
            element={
              <ProtectedRoute>
                <LogisticsLayout>
                  <Outlet />
                </LogisticsLayout>
              </ProtectedRoute>
            }
          >
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trip-dashboard" element={<TripDashboard />} />
            <Route path="/live/list" element={<LiveList />} />
            <Route path="/trail" element={<Trail />} />
            <Route path="/alarm/Config" element={<AlarmPage />} />
            <Route path="/alarm/Logs" element={<Log />} />
            <Route path="/geofence/Config" element={<GeofenceConfig />} />
            <Route path="/geofence/Group" element={<GeofenceGroupPage />} />
            <Route path="/geofence/Stats" element={<GeofenceStats />} />
            <Route path="/reports/report" element={<Report />} />
            <Route path="/reports/schedule" element={<Schedule />} />
            <Route path="/back-office" element={<Back />} />
            <Route path="/user-management/responsibility" element={<Responsibility />} />
            <Route path="/user-management/user" element={<UserManagement />} />
            <Route path="/manage/entities" element={<Entities />} />
            <Route path="/manage/group" element={<Group />} />
            <Route path="/manage/vendor" element={<Vendor />} />
            <Route path="/manage/customer" element={<CustomerGroup />} />
          </Route>

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </AuthProvider>
    </div>
  )
}

export default Appp
