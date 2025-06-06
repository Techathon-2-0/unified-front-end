import type React from "react"
import { Link } from "react-router-dom"
import { Shield, MapPin, Truck, Bell, LayoutDashboard, Map, FileText } from "lucide-react"
import Logo from "../assets/Logo.png"

interface FooterProps {
  version?: string
}

const Footer: React.FC<FooterProps> = ({ version = "v2.4.1" }) => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-b from-gray-800 to-gray-900 border-t border-gray-700 text-gray-300 py-6 px-4">
      <div className="w-full max-w-[1400px] mx-auto">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row md:justify-between gap-8 flex-wrap break-words w-full">
          {/* Company Info */}
          <div className="flex flex-col max-w-full md:max-w-md">
            <div className="flex items-center mb-3">
              <div className="h-12 w-12 rounded-lg bg-[#d5233b] flex items-center justify-center text-white shadow-lg mr-3 border border-[#d5233b]">
                <div className="flex-shrink-0 bg-white rounded-md p-1.5 shadow-md">
                {/* <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 17h4V5H2v12h3m15-5 5-5v12h-5" />
                  <path d="M7 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M17 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                </svg> */}
                <img src={Logo} alt="Logo" className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-white text-xl tracking-tight">M-GPS</h3>
                <p className="text-sm text-white-300">Vehicle Tracking Portal</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed ml-1 hidden md:block">
              GPS tracking solution for real-time vehicle monitoring and fleet management.
            </p>
          </div>

          {/* Quick Access */}
          <div className="flex-1 min-w-[250px]">
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Quick Access</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {[
                { icon: LayoutDashboard, label: "Trip Dashboard", path: "/trip-dashboard" },
                { icon: Truck, label: "Live List", path: "/live/list" },
                { icon: Map, label: "Live Map", path: "/live/list" },
                { icon: MapPin, label: "Geofence Config", path: "/geofence/config" },
                { icon: FileText, label: "Reports", path: "/reports" },
                { icon: Bell, label: "Alarms", path: "/alarm" },
              ].map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="flex items-center text-sm group hover:text-[#d5233b] transition-colors"
                >
                  <div className="w-7 h-7 rounded-md bg-gray-700/50 flex items-center justify-center mr-2.5 group-hover:bg-red-900/30 transition-colors">
                    <item.icon size={15} className="text-gray-300 group-hover:text-[#d5233b]" />
                  </div>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        {/* Bottom Bar */}
<div className="mt-8 pt-4 border-t border-gray-700/70 flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-4 w-full text-xs sm:text-sm">
  {/* Left: System Online + Build */}
  <div className="flex flex-wrap items-center gap-3 min-w-0">
    <div className="flex items-center px-2.5 py-1 rounded-full bg-gray-700/50">
      <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2 animate-pulse"></div>
      <span className="text-gray-300 whitespace-nowrap">System Online</span>
    </div>
    <div className="flex items-center bg-gray-700/50 px-3 py-1 rounded-full">
      <span className="text-gray-400 mr-1.5">Build:</span>
      <span className="text-white font-mono">{version}</span>
    </div>
  </div>

  {/* Right: © M-GPS | Privacy | Terms */}
  <div className="flex flex-wrap items-center gap-3 min-w-0 text-gray-400">
    <div className="whitespace-nowrap">© {currentYear} M-GPS</div>
    <div className="hidden sm:block h-3 w-px bg-gray-600" />
    <p className="hover:text-[#d5233b] transition-colors flex items-center">
      <Shield size={12} className="mr-1.5" />
      <span>Privacy</span>
    </p>
    <p className="hover:text-[#d5233b] transition-colors">
      Terms
    </p>
  </div>
</div>

      </div>
    </footer>
  )
}

export default Footer
