import type React from "react"
import { useState, useEffect } from "react"
import { cn } from "../lib/utils"
import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Activity,
  MapPin,
  Bell,
  Map,
  FileText,
  Briefcase,
  Users,
  ChevronDown,
  ChevronRight,
  X,
  Truck,
  Settings,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../components/ui/collapsible"
import { useIsMobile } from "@/hooks/use-mobile"
import Logo from "../assets/Logo.png"
import { useAuth } from "../context/AuthContext"

// Define navigation items structure with nested items for dropdowns
const navItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/dashboard",
    hasChildren: true,
    children: [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Trip Dashboard", path: "/trip-dashboard" },
    ],
  },
  {
    icon: Activity,
    label: "Live",
    path: "/live/list",
  },
  {
    icon: MapPin,
    label: "Trail",
    path: "/trail",
  },
  {
    icon: Bell,
    label: "Alarm",
    path: "/alarm",
    hasChildren: true,
    children: [
      { label: "Config", path: "/alarm/Config" },
      { label: "Logs", path: "/alarm/Logs" },
    ],
  },
  {
    icon: Map,
    label: "Geofence",
    path: "/geofence",
    hasChildren: true,
    children: [
      { label: "Config", path: "/geofence/Config" },
      { label: "Group", path: "/geofence/Group" },
      { label: "Stats", path: "/geofence/Stats" },
    ],
  },
  {
    icon: Users,
    label: "User Management",
    path: "/user-management",
    hasChildren: true,
    children: [
      { label: "Responsibility", path: "/user-management/responsibility" },
      { label: "User", path: "/user-management/user" },
    ],
  },
  {
    icon: FileText,
    label: "Reports",
    path: "/reports",
    hasChildren: true,
    children: [
      { label: "Report", path: "/reports/report" },
      { label: "Schedule", path: "/reports/schedule" },
    ],
  },
  // {
  //   icon: Briefcase,
  //   label: "Back Office",
  //   path: "/back-office",
  // },
  {
    icon: Settings,
    label: "Manage",
    path: "/manage",
    hasChildren: true,
    children: [
      { label: "Entities", path: "/manage/entities" },
      { label: "Groups", path: "/manage/group" },
      { label: "Vendors", path: "/manage/vendor" },
      { label: "Customer Groups", path: "/manage/customer" },
    ],
  },
]

interface LogisticsSidebarProps {
  isOpen: boolean
  closeSidebar: () => void
}

const LogisticsSidebar: React.FC<LogisticsSidebarProps> = ({ isOpen, closeSidebar }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [openMenus, setOpenMenus] = useState<string[]>([])
  const isMobile = useIsMobile()
  const location = useLocation()

  const { user, logout } = useAuth()
  // Handle expansion logic differently for mobile and desktop
  useEffect(() => {
    if (isMobile) {
      // On mobile, sidebar expanded state matches isOpen prop
      setIsExpanded(isOpen)
    }
  }, [isOpen, isMobile])

  // Auto-expand parent menu when a child route is active
  useEffect(() => {
    const currentPath = location.pathname

    // Find if any parent menu should be expanded based on current path
    navItems.forEach((item) => {
      if (item.hasChildren && item.children) {
        const shouldExpand = item.children.some(
          (child) => currentPath === child.path || currentPath.startsWith(child.path + "/"),
        )

        if (shouldExpand && !openMenus.includes(item.label)) {
          setOpenMenus((prev) => [...prev, item.label])
        }
      }
    })
  }, [location.pathname])

  const toggleMenu = (label: string) => {
    if (openMenus.includes(label)) {
      setOpenMenus(openMenus.filter((item) => item !== label))
    } else {
      setOpenMenus([...openMenus, label])
    }
  }

  // Check if a menu item is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/")
  }

  // Check if a parent menu has an active child
  const hasActiveChild = (item: any) => {
    if (!item.hasChildren || !item.children) return false
    return item.children.some((child: any) => isActive(child.path))
  }


  if (!user) {
    return null
  }

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out overflow-hidden",
        // Mobile: fully open or fully closed based on isOpen
        isMobile
          ? isOpen
            ? "w-64"
            : "w-0"
          : // Desktop: mini (16) or expanded (64) based on hover
            isExpanded
            ? "w-64"
            : "w-16",
        "pt-14 bg-gray-800", // Add padding-top to account for navbar
      )}
      style={{ height: "100vh" }} // Ensure full viewport height
      onMouseEnter={() => !isMobile && setIsExpanded(true)}
      onMouseLeave={() => {
        if (!isMobile) {
          setIsExpanded(false)
          // Don't close open menus when collapsing if they have active children
          const menusToKeep = openMenus.filter((menu) => {
            const menuItem = navItems.find((item) => item.label === menu)
            return menuItem && hasActiveChild(menuItem)
          })
          setOpenMenus(menusToKeep)
        }
      }}
    >
      {/* Mobile close button */}
      {isMobile && isOpen && (
        <button className="absolute top-3 right-3 text-gray-300 hover:text-white" onClick={closeSidebar}>
          <X size={20} />
        </button>
      )}

      {/* Logistics Panel Header */}
      <div className="px-3 py-4">
        <div
          className={cn(
            "transition-all duration-300 overflow-hidden",
            isExpanded || (isMobile && isOpen)
              ? "bg-gradient-to-r from-[#d5233b] to-red-800 rounded-lg shadow-lg p-3"
              : "bg-red-700 rounded-md p-2 flex justify-center",
          )}
        >
          {isExpanded || (isMobile && isOpen) ? (
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-white rounded-md p-1.5 shadow-md">
                {/* <Truck size={24} className="text-[#d5233b]" /> */}
                <img src={Logo} alt="Logo" className="w-8 h-8" />
              </div>
              <div className="ml-3">
                <h2 className="text-white font-bold text-lg leading-tight">M-GPS</h2>
                <p className="text-red-100 text-xs">Vehicle Tracking Portal</p>
              </div>
            </div>
          ) : (
            <div className="flex-shrink-0 bg-white rounded-md p-1 shadow-md">
              {/* <Truck size={16} className="text-[#d5233b]" /> */}
              <img src={Logo} alt="Logo" className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 py-2 overflow-y-auto overflow-x-hidden hide-scrollbar"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {navItems.map((item, index) => {
          const isItemActive = isActive(item.path) || hasActiveChild(item)

          return (
            <div key={index} className="w-full px-2 mb-1">
              {item.hasChildren ? (
                <Collapsible
                  open={(isExpanded || (isMobile && isOpen)) && openMenus.includes(item.label)}
                  onOpenChange={() => {
                    if (isExpanded || (isMobile && isOpen)) {
                      toggleMenu(item.label)
                    }
                  }}
                >
                  <CollapsibleTrigger asChild>
                    <div
                      className={cn(
                        "flex items-center py-2.5 px-3 rounded-md text-white transition-colors duration-200 cursor-pointer",
                        isItemActive ? "bg-red-600/20 text-white font-medium" : "hover:bg-gray-700 hover:text-white",
                        "focus:outline-none w-full",
                      )}
                    >
                      <div
                        className={cn(
                          "flex items-center justify-center w-6 h-6 rounded-md",
                          isItemActive ? "text-[#d5233b]" : "text-white",
                        )}
                      >
                        <item.icon size={18} />
                      </div>
                      <span
                        className={cn(
                          "ml-3 flex-1 transition-opacity duration-300 whitespace-nowrap text-sm",
                          isExpanded || (isMobile && isOpen) ? "opacity-100" : "opacity-0",
                        )}
                      >
                        {item.label}
                      </span>
                      {(isExpanded || (isMobile && isOpen)) &&
                        (openMenus.includes(item.label) ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-9 pr-2 py-1 space-y-1">
                    {item.children?.map((child, childIndex) => {
                      const isChildActive = isActive(child.path)

                      return (
                        <Link
                          key={childIndex}
                          to={child.path}
                          className={cn(
                            "flex items-center py-2 px-3 rounded-md text-sm transition-colors duration-200",
                            isChildActive
                              ? "bg-red-600/30 text-white font-medium"
                              : "text-white hover:bg-gray-700 hover:text-white",
                            "focus:outline-none w-full",
                          )}
                          onClick={() => isMobile && closeSidebar()}
                        >
                          <span
                            className={cn(
                              "transition-opacity duration-300 whitespace-nowrap",
                              isExpanded || (isMobile && isOpen) ? "opacity-100" : "opacity-0",
                            )}
                          >
                            {child.label}
                          </span>
                        </Link>
                      )
                    })}
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center py-2.5 px-3 rounded-md text-white transition-colors duration-200",
                    isActive(item.path)
                      ? "bg-red-600/20 text-white font-medium"
                      : "hover:bg-gray-700 hover:text-white",
                    "focus:outline-none w-full",
                  )}
                  onClick={() => isMobile && closeSidebar()}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-6 h-6 rounded-md",
                      isActive(item.path) ? "text-[#d5233b]" : "text-white",
                    )}
                  >
                    <item.icon size={18} />
                  </div>
                  <span
                    className={cn(
                      "ml-3 transition-opacity duration-300 whitespace-nowrap text-sm",
                      isExpanded || (isMobile && isOpen) ? "opacity-100" : "opacity-0",
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              )}
            </div>
          )
        })}
      </div>

      <div className="border-t border-gray-700 p-3">
        <div
          className={cn(
            "flex items-center rounded-md p-2 bg-gray-700/50 hover:bg-gray-700 transition-all duration-200",
            isExpanded || (isMobile && isOpen) ? "justify-between" : "justify-center",
          )}
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#d5233b] to-red-700 flex items-center justify-center text-white shadow-md">
            {user.username.substring(0, 2).toUpperCase()}
          </div>
          <div
            className={cn(
              "transition-opacity duration-300 overflow-hidden",
              isExpanded || (isMobile && isOpen) ? "opacity-100 ml-2 flex-1" : "opacity-0 w-0",
            )}
          >
            <p className="text-white text-sm font-medium truncate">{user.name}</p>
            <p className="text-gray-400 text-xs truncate">{user.roles}</p>
          </div>
          {/* {(isExpanded || (isMobile && isOpen)) && (
            <button className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-600/50">
              <ChevronDown size={16} />
            </button>
          )} */}
        </div>
      </div>
    </div>
  )
}

export default LogisticsSidebar
