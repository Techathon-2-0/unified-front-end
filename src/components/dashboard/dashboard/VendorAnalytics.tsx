import type React from "react"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, Building2 } from "lucide-react"
import { mockVehicles } from "../../../data/live/vehicle"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom";

const StatusIndicator: React.FC<{ status: string; uptime: string }> = ({ status, uptime }) => {
  const configs = {
    operational: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-100", label: "Operational" },
    degraded: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-100", label: "Degraded" },
    down: { icon: XCircle, color: "text-red-500", bg: "bg-red-100", label: "Down" },
  }

  const config = configs[status as keyof typeof configs] || configs.operational
  const Icon = config.icon

  return (
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center space-x-2">
      <div className={`p-1.5 rounded-lg ${config.bg}`}>
        <Icon size={14} className={config.color} />
      </div>
      <div>
        <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
        <div className="text-xs text-gray-500">{uptime} uptime</div>
      </div>
    </motion.div>
  )
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

// Helper function to determine vendor status based on vehicle data
const determineVendorStatus = (vehicles: any[], vendorName: string) => {
  const vendorVehicles = vehicles.filter(v => v.vendorName === vendorName)
  const disconnectedCount = vendorVehicles.filter(v => 
    v.gpsStatus === "Disconnected" || 
    v.gprsStatus === "Disconnected" || 
    v.status === "No Data"
  ).length
  
  const activeCount = vendorVehicles.filter(v => v.status === "Active").length
  const totalCount = vendorVehicles.length
  
  // If more than 30% vehicles are disconnected/no data, status is down
  if (disconnectedCount / totalCount > 0.3) {
    return "down"
  }
  
  // If less than 50% vehicles are active, status is degraded
  if (activeCount / totalCount < 0.5) {
    return "degraded"
  }
  
  return "operational"
}

// Helper function to calculate uptime based on vehicle connectivity
const calculateUptime = (vehicles: any[], vendorName: string) => {
  const vendorVehicles = vehicles.filter(v => v.vendorName === vendorName)
  const connectedCount = vendorVehicles.filter(v => 
    v.gpsStatus === "Connected" && 
    v.gprsStatus === "Connected" && 
    v.status !== "No Data"
  ).length
  
  const uptime = (connectedCount / vendorVehicles.length) * 100
  return `${uptime.toFixed(1)}%`
}

const VendorAnalytics: React.FC = () => {
  // Group vehicles by vendor with enhanced analytics using real data
  const vendorStats = mockVehicles.reduce(
    (acc, vehicle) => {
      const vendor = vehicle.vendorName
      if (!acc[vendor]) {
        acc[vendor] = {
          name: vendor,
          vehicles: 0,
          active: 0,
          idle: 0,
          stopped: 0,
          noData: 0,
          status: "operational",
          uptime: "100%",
          efficiency: 0,
          connectedDevices: 0,
          totalDevices: 0,
        }
      }
      
      acc[vendor].vehicles++
      acc[vendor].totalDevices++
      
      // Count vehicle statuses
      if (vehicle.status === "Active") acc[vendor].active++
      if (vehicle.status === "Idle") acc[vendor].idle++
      if (vehicle.status === "Stopped") acc[vendor].stopped++
      if (vehicle.status === "No Data") acc[vendor].noData++
      
      // Count connected devices
      if (vehicle.gpsStatus === "Connected" && vehicle.gprsStatus === "Connected" && vehicle.status !== "No Data") {
        acc[vendor].connectedDevices++
      }

      return acc
    },
    {} as Record<string, any>,
  )

  // Calculate derived metrics for each vendor
  Object.values(vendorStats).forEach((vendor: any) => {
    // Calculate efficiency (percentage of active vehicles)
    vendor.efficiency = Math.round((vendor.active / vendor.vehicles) * 100)
    
    // Determine status based on real data
    vendor.status = determineVendorStatus(mockVehicles, vendor.name)
    
    // Calculate uptime based on connected devices
    vendor.uptime = calculateUptime(mockVehicles, vendor.name)
  })

  const vendors = Object.values(vendorStats)
  const operationalCount = vendors.filter((v: any) => v.status === "operational").length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-[500px] flex flex-col backdrop-blur-sm"
    >
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 p-4 sm:p-6 border-b border-gray-100 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Building2 className="text-purple-600" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Vendor Performance</h3>
              <p className="text-sm text-gray-600">Partner analytics & monitoring</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {operationalCount}/{vendors.length} Operational
            </Badge>
            <Link to="/live/list">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200 shadow-md text-sm font-medium"
              >
                <span>View All</span>
                <ExternalLink size={14} />
              </motion.button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scrollable Table */}
      <ScrollArea className="flex-1">
        <motion.div variants={container} initial="hidden" animate="show" className="min-w-full">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Fleet
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Efficiency
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vendors.map((vendor: any, index) => (
                <motion.tr
                  key={vendor.name}
                  variants={item}
                  className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Building2 size={16} className="text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{vendor.name}</div>
                        <div className="text-xs text-gray-500">Logistics Partner</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <StatusIndicator status={vendor.status} uptime={vendor.uptime} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">{vendor.vehicles} vehicles</div>
                      <div className="flex space-x-2 text-xs flex-wrap">
                        <span className="text-green-600">{vendor.active} active</span>
                        <span className="text-yellow-600">{vendor.idle} idle</span>
                        <span className="text-red-600">{vendor.stopped} stopped</span>
                        {vendor.noData > 0 && (
                          <span className="text-gray-600">{vendor.noData} no data</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            vendor.efficiency >= 80
                              ? "bg-gradient-to-r from-green-400 to-green-600"
                              : vendor.efficiency >= 60
                              ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                              : "bg-gradient-to-r from-red-400 to-red-600"
                          }`}
                          style={{ width: `${vendor.efficiency}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{vendor.efficiency}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge
                      variant="outline"
                      className={`${
                        vendor.efficiency >= 80
                          ? "bg-green-50 text-green-700 border-green-200"
                          : vendor.efficiency >= 60
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {vendor.efficiency >= 80 ? "Excellent" : vendor.efficiency >= 60 ? "Good" : "Needs Attention"}
                    </Badge>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </ScrollArea>

      {/* Enhanced Footer */}
      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{vendors.length} vendor partners</span>
          <Link to="/live/list">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              Detailed Analytics →
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default VendorAnalytics