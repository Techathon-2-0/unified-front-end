import { useMemo } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import Logo from "../assets/BigLogo.png"
import { User, ChevronDown, Menu, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useAuth } from "../context/AuthContext"
import DayNightToggleButton from './ui/dark-mode-button';

interface NavbarProps {
  toggleSidebar: () => void
}

function Navbar({ toggleSidebar }: NavbarProps) {
  const location = useLocation()
  const navigate = useNavigate()
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
