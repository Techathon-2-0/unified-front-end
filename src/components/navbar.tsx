import { useMemo, useState, useRef, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import Logo from "../assets/BigLogo.png"
import { Bell, User, ChevronDown, Menu, X, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { mockAlarms } from "../data/alarm/aconfig"
import { useAuth } from "../context/AuthContext"

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
    <nav className="fixed top-0 left-0 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 w-full z-50">
      <div className="px-4 py-2 flex items-center justify-between">
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
            <img src={Logo || "/placeholder.svg"} alt="Logo" className="h-8 w-auto" />

            <div className="ml-5 hidden sm:flex items-center">
              <div className="font-bold text-xl text-black">{pageTitle}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              ref={bellRef}
              className="p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-[#d5233b] rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div
                ref={notificationRef}
                className={cn(
                  "fixed inset-x-0 top-[56px] mx-auto bg-white dark:bg-gray-800 overflow-hidden z-50 border-b border-gray-200 dark:border-gray-700 animate-in fade-in-50 zoom-in-95 duration-150 shadow-xl",
                  "sm:absolute sm:inset-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80 sm:rounded-lg sm:border",
                )}
                style={{ maxHeight: isMobile ? "calc(100vh - 56px)" : "450px" }}
              >
                <div className="sticky top-0 z-10 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-red-50 to-green-50 dark:from-gray-800 dark:to-gray-750">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">Notifications</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      You have {unreadCount} unread {unreadCount === 1 ? "notification" : "notifications"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-xs font-medium text-[#d5233b] hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 bg-white dark:bg-gray-700 px-2 py-1 rounded-md shadow-sm transition-colors">
                      Mark all read
                    </button>
                    <button
                      className="sm:hidden p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
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
                            "p-4 hover:bg-gray-50 dark:hover:bg-gray-700/70 transition-colors cursor-pointer border-l-4",
                            !alarm.read ? "border-l-red-500 bg-red-50/50 dark:bg-gray-700/40" : "border-l-transparent",
                          )}
                        >
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {alarm.type.includes("alert") ? (
                                <div className="h-9 w-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-[#d5233b] dark:text-red-400">
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
                                <div className="h-9 w-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-[#d5233b] dark:text-red-400">
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

                <div className="sticky bottom-0 p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 text-center">
                  <button className="w-full py-2 px-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none group">
              <div className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#d5233b] to-red-700 flex items-center justify-center text-white font-medium shadow-md transition-transform group-hover:scale-105">
                  {user.username.substring(0, 2).toUpperCase()}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 transition-transform group-data-[state=open]:rotate-180 hidden sm:block" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 mt-1 overflow-hidden animate-in zoom-in-90 duration-200 shadow-lg">
              {/* Enhanced Profile Header */}
              <div className="relative">
                <div className="h-20 bg-gradient-to-r from-[#d5233b] to-red-700"></div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#d5233b] to-red-700 flex items-center justify-center text-white text-xl font-medium border-4 border-white shadow-lg">
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="pt-10 pb-4 px-4 text-center border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{user.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.active
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {user.active ? "Active" : "Inactive"}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {user.roles}
                  </span>
                </div>
              </div>

              <DropdownMenuGroup className="p-1">
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={handleProfileClick}
                >
                  <User className="mr-3 h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium">View Profile</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20 m-1 rounded-md"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span className="font-medium">Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
