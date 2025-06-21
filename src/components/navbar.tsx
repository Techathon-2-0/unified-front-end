import { useMemo, useState, useRef, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import Logo from "../assets/BigLogo.png"
import { Bell, User, ChevronDown, Menu, X, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { mockAlarms } from "../data/alarm/aconfig"
import { useAuth } from "../context/AuthContext"
import DayNightToggleButton from './ui/dark-mode-button';

interface NavbarProps {
  toggleSidebar: () => void
}

function Navbar({ toggleSidebar }: NavbarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLButtonElement>(null)
  const { user, logout } = useAuth()

  // Generate page title from current path
  const pageTitle = useMemo(() => {
    const path = location.pathname
    if (path === "/") return "Home"

    const pathSegments = path.split("/").filter(Boolean)
    const lastSegment = pathSegments[pathSegments.length - 1] || ""

    return (
      lastSegment
        .replace(/-|_/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ") || "Dashboard"
    )
  }, [location])

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        bellRef.current &&
        !notificationRef.current.contains(event.target as Node) &&
        !bellRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const unreadCount = mockAlarms.filter((n) => !n.read).length

  const handleProfileClick = () => {
    navigate("/profile")
  }

  const handleLogout = () => {
    logout()
  }

  if (!user) {
    return null
  }

  return (
    <nav className="fixed top-0 w-full bg-white dark:bg-gray-900 z-40 border-b shadow-sm">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left side - Logo and sidebar toggle */}
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className={cn(
              "mr-2 p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none",
              "md:hidden",
            )}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center">

            <img src={Logo} alt="Logo" className="h-8 w-auto cursor-pointer" onClick={() => navigate("/dashboard")} />

            <div className="ml-5 hidden sm:flex items-center">
              <div className="font-bold text-xl text-black dark:text-white">{pageTitle}</div>
            </div>
          </div>
        </div>

        {/* Right side - User actions and theme toggle */}
        <div className="flex items-center space-x-4">
          {/* Add the dark mode toggle here */}
          <DayNightToggleButton className="ml-6" /> {/* Adjust size as needed */}

          <div className="relative">
            <button
              ref={bellRef}
              className="p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 transition-colors"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-red-600 dark:bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div
                ref={notificationRef}
                className={cn(
                  "fixed inset-x-0 top-[56px] mx-auto bg-white dark:bg-gray-900 overflow-hidden z-50 border-b border-gray-200 dark:border-gray-700 animate-in fade-in-50 zoom-in-95 duration-150 shadow-xl dark:shadow-2xl",
                  "sm:absolute sm:inset-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80 sm:rounded-lg sm:border sm:border-gray-200 sm:dark:border-gray-600",
                )}
                style={{ maxHeight: isMobile ? "calc(100vh - 56px)" : "450px" }}
              >
                <div className="sticky top-0 z-10 p-4 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center bg-red-50 dark:bg-gray-900">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">Notifications</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      You have {unreadCount} unread {unreadCount === 1 ? "notification" : "notifications"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 px-2 py-1 rounded-md shadow-sm border border-gray-200 dark:border-gray-600 transition-colors">
                      Mark all read
                    </button>
                    <button
                      className="sm:hidden p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setShowNotifications(false)}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="overflow-y-auto" style={{ maxHeight: isMobile ? "calc(100vh - 170px)" : "350px" }}>
                  {mockAlarms.length > 0 ? (
                    <div>
                      {mockAlarms.map((alarm) => (
                        <div
                          key={alarm.id}
                          className={cn(
                            "p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer border-l-4",
                            !alarm.read
                              ? "border-l-red-500 dark:border-l-red-400 bg-red-50/50 dark:bg-red-900/10"
                              : "border-l-transparent",
                          )}
                        >
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {alarm.type.includes("alert") ? (
                                <div className="h-9 w-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                                    <path d="M12 9v4"></path>
                                    <path d="M12 17h.01"></path>
                                  </svg>
                                </div>
                              ) : alarm.type.includes("update") ? (
                                <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
                                    <path d="M21 3v5h-5"></path>
                                  </svg>
                                </div>
                              ) : (
                                <div className="h-9 w-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                                    <path d="m9 12 2 2 4-4"></path>
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                                  {alarm.type}
                                </p>
                                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                                  {alarm.createdOn}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                {alarm.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 px-4 text-center">
                      <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
                        <Bell className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 font-medium">No notifications yet</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        We'll notify you when something arrives
                      </p>
                    </div>
                  )}
                </div>

                <div className="sticky bottom-0 p-3 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/90 backdrop-blur-sm text-center">
                  <button className="w-full py-2 px-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 dark:from-red-600 dark:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 text-white text-sm font-medium rounded-md transition-all duration-200 shadow-sm hover:shadow-md">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none group">
              <div className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-all duration-200 ease-out">
                <div className="relative">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#d5233b] via-red-600 to-red-700 flex items-center justify-center text-white font-semibold shadow-lg ring-2 ring-white dark:ring-gray-800 transition-all duration-200 group-hover:scale-105 group-hover:shadow-xl">
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>
                  {user.active && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"></div>
                  )}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-24">
                    {user.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user.roles}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 transition-all duration-200 group-data-[state=open]:rotate-180 group-data-[state=open]:text-gray-600 dark:group-data-[state=open]:text-gray-300 hidden sm:block ml-1" />
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-80 mt-2 mr-2 overflow-hidden animate-in slide-in-from-top-2 fade-in-0 zoom-in-95 duration-200 shadow-2xl border-0 bg-white dark:bg-gray-900 rounded-2xl">
              {/* Enhanced Profile Header with Glassmorphism Effect */}
              <div className="relative">
                <div className="h-24 bg-gradient-to-br from-[#d5233b] via-red-600 to-red-700 relative rounded-t-2xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-t-2xl"></div>
                </div>


                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                  <div>
                    <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-[#d5233b] via-red-600 to-red-700 flex items-center justify-center text-white text-2xl font-bold border-4 border-white dark:border-gray-900 shadow-2xl ring-4 ring-gray-100/50 dark:ring-gray-800/50">
                      {user.username.substring(0, 2).toUpperCase()}
                    </div>
                    {/* {user.active && (
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-3 border-white dark:border-gray-900 shadow-lg flex items-center justify-center">
                        <div className="h-2 w-2 bg-white rounded-full"></div>
                      </div>
                    )} */}
                  </div>
                </div>
              </div>

              {/* Profile Information */}
              <div className="pt-12 pb-6 px-6 text-center border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {user.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">
                  {user.email}
                </p>

                <div className="flex items-center justify-center gap-3">
                  <div
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs transition-all duration-200 ${user.active
                      ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-400 shadow-sm"
                      : "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 dark:from-red-900/30 dark:to-rose-900/30 dark:text-red-400 shadow-sm"
                      }`}
                  >
                    <div className={`w-2 h-2 rounded-full mr-2 ${user.active ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                    {user.active ? "Active" : "Inactive"}
                  </div>

                  <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-400 shadow-sm">
                    <div className="w-2 h-2 rounded-full mr-2 bg-blue-500"></div>
                    {user.roles}
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <DropdownMenuItem
                  className="group cursor-pointer rounded-xl p-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                  onClick={handleProfileClick}
                >
                  <div className="flex items-center">
                    <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-3 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors duration-200">
                      <User className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">View Profile</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Manage your account settings</span>
                    </div>
                  </div>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className="mx-2 bg-gray-100 dark:bg-gray-800" />

              {/* Sign Out Button */}
              <div className="p-2">
                <DropdownMenuItem
                  className="group cursor-pointer rounded-xl p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20 transition-all duration-200 border border-transparent hover:border-red-200 dark:hover:border-red-800"
                  onClick={handleLogout}
                >
                  <div className="flex items-center">
                    <div className="h-9 w-9 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center mr-3 group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors duration-200">
                      <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">Sign Out</span>
                      <span className="text-xs text-red-400 dark:text-red-500">End your current session</span>
                    </div>
                  </div>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
