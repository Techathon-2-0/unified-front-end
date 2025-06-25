import type React from "react"
import { useEffect, useState } from "react"
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, Building2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import { fetchVehicles } from "../../../data/live/list" // Adjust path as needed
import type { Vehicle } from "../../../types/live/list_type" // Adjust path as needed
import { useAuth } from "../../../context/AuthContext" // Adjust path as needed
import DashboardCard from "./DashboardCard"

const StatusIndicator: React.FC<{ status: string }> = ({ status }) => {
  const configs = {
    operational: { 
      icon: CheckCircle, 
      color: "text-green-600 dark:text-green-400", 
      bg: "bg-green-50 dark:bg-green-900/20", 
      label: "Operational" 
    },
    degraded: { 
      icon: AlertTriangle, 
      color: "text-yellow-600 dark:text-yellow-400", 
      bg: "bg-yellow-50 dark:bg-yellow-900/20", 
      label: "Degraded" 
    },
    down: { 
      icon: XCircle, 
      color: "text-red-600 dark:text-red-400", 
      bg: "bg-red-50 dark:bg-red-900/20", 
      label: "Down" 
    },
  }

  const config = configs[status as keyof typeof configs] || configs.operational
  const Icon = config.icon

  return (
    <div className="flex items-center space-x-2">
      <div className={`p-1.5 rounded-lg ${config.bg} border border-opacity-20 ${
        status === 'operational' ? 'border-green-200 dark:border-green-700' :
        status === 'degraded' ? 'border-yellow-200 dark:border-yellow-700' :
        'border-red-200 dark:border-red-700'
      }`}>
        <Icon size={14} className={config.color} />
      </div>
      <span className={`text-sm font-medium ${config.color} whitespace-nowrap`}>{config.label}</span>
    </div>
  )
}

const determineVendorStatus = (vehicles: Vehicle[], vendorName: string) => {
  const vendorVehicles = vehicles.filter(v => (v.vendorName || 'Unknown Vendor') === vendorName)
  if (vendorVehicles.length === 0) return "operational"
  
  const disconnectedCount = vendorVehicles.filter(v =>
    v.gpsStatus === "Disconnected" ||
    v.gprsStatus === "Disconnected" ||
    (v.status || 'No Data') === "No Data"
  ).length

  const activeCount = vendorVehicles.filter(v => (v.status || 'No Data') === "Active").length
  const totalCount = vendorVehicles.length

  if (disconnectedCount / totalCount > 0.3) return "down"
  if (activeCount / totalCount < 0.5) return "degraded"
  return "operational"
}

// const calculateUptime = (vehicles: Vehicle[], vendorName: string) => {
//   const vendorVehicles = vehicles.filter(v => (v.vendorName || 'Unknown Vendor') === vendorName)
//   if (vendorVehicles.length === 0) return "100.0%"
  
//   const connectedCount = vendorVehicles.filter(v =>
//     v.gpsStatus === "Connected" &&
//     v.gprsStatus === "Connected" &&
//     (v.status || 'No Data') !== "No Data"
//   ).length

//   const uptime = (connectedCount / vendorVehicles.length) * 100
//   return `${uptime.toFixed(1)}%`
// }

const VendorAnalytics: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const data = await fetchVehicles(String(user?.id))
        // Ensure vehicles is always an array
        setVehicles(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Failed to fetch vehicles:", error)
      } finally {
        setLoading(false)
      }
    }

    loadVehicles()
  }, [])

  // Enhanced loading state with dark mode support
  if (loading) {
    return (
      <DashboardCard title="Vendor Performance" delay={0.3}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 h-[500px] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 dark:border-purple-400"></div>
          <span className="text-gray-600 dark:text-gray-300 text-sm">Loading vehicle data...</span>
        </div>
      </div>
      </DashboardCard>
    )
  }

  // Group vehicles by vendor with only three statuses: Active, No Update (skip No Data), and only for fixed vendor names
  const vendorStats = (Array.isArray(vehicles) ? vehicles : []).reduce((acc, vehicle) => {
    // Only consider vehicles with a vendorName and not "No Data"
    if (!vehicle.vendorName || vehicle.status === "No Data") return acc
    const vendor = vehicle.vendorName
    if (!acc[vendor]) {
      acc[vendor] = {
        name: vendor,
        vehicles: 0,
        active: 0,
        noUpdate: 0,
        status: "operational",
        efficiency: 0,
        connectedDevices: 0,
        totalDevices: 0,
      }
    }

    acc[vendor].vehicles++
    acc[vendor].totalDevices++

    // Only two statuses
    const status = vehicle.status || "No Data"
    if (status === "Active") acc[vendor].active++
    else if (status === "No Update") acc[vendor].noUpdate++

    if (vehicle.gpsStatus === "Connected" && vehicle.gprsStatus === "Connected" && status !== "No Data") {
      acc[vendor].connectedDevices++
    }

    return acc
  }, {} as Record<string, any>)

  Object.values(vendorStats).forEach((vendor: any) => {
    vendor.efficiency = vendor.vehicles > 0 ? Math.round((vendor.active / vendor.vehicles) * 100) : 0
    vendor.status = determineVendorStatus(vehicles, vendor.name)
    // uptime removed
  })

  const vendors = Object.values(vendorStats)
  const operationalCount = vendors.filter((v: any) => v.status === "operational").length

  // Enhanced empty state with dark mode support
  if (vendors.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 h-[500px] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Building2 className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto" />
          <div>
            <p className="text-gray-600 dark:text-gray-300 font-medium">No vendor data available</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Check back when vehicles are added</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden h-[500px] flex flex-col backdrop-blur-sm">
      {/* Enhanced Header with better dark mode gradients */}
      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 dark:bg-gradient-to-r dark:from-purple-900/10 dark:via-pink-900/10 dark:to-indigo-900/10 p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl border border-purple-200 dark:border-purple-800 flex-shrink-0">
              <Building2 className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">Vendor Performance</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">Partner analytics & monitoring</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 flex-shrink-0">
            <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700 whitespace-nowrap">
              {operationalCount}/{vendors.length} Operational
            </Badge>
            <Link to="/live/vehicles">
              <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 dark:bg-red-600 text-white rounded-xl hover:bg-red-700 dark:hover:bg-red-700 transition-all duration-200 shadow-md text-sm font-medium hover:scale-105 active:scale-95 whitespace-nowrap">
                <span>View All</span>
                <ExternalLink size={14} />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scrollable Table Container */}
      <div className="flex-1 overflow-hidden">
        {/* Responsive overflow: horizontal scroll only on small screens */}
        <div className="h-full overflow-x-auto">
          <div className="w-full h-full" style={{ maxHeight: "340px", overflowY: "auto" }}>
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 min-w-[180px]">
                    Vendor
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 min-w-[140px]">
                    Status
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 min-w-[140px]">
                    Fleet
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 min-w-[150px]">
                    Performance
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 min-w-[140px]">
                    Efficiency
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {vendors.map((vendor: any) => (
                  <tr
                    key={vendor.name}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 group"
                  >
                    <td className="px-3 sm:px-4 py-4 min-w-[180px]">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 group-hover:border-gray-300 dark:group-hover:border-gray-500 transition-colors flex-shrink-0">
                          <Building2 size={16} className="text-gray-600 dark:text-gray-300" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{vendor.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">Logistics Partner</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-4 min-w-[140px]">
                      <StatusIndicator status={vendor.status} />
                    </td>
                    <td className="px-3 sm:px-4 py-4 min-w-[140px]">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{vendor.vehicles} vehicles</div>
                        <div className="flex space-x-2 text-xs flex-wrap">
                          <span className="text-green-600 dark:text-green-400 font-medium whitespace-nowrap">{vendor.active} active</span>
                          <span className="text-yellow-600 dark:text-yellow-400 font-medium whitespace-nowrap">{vendor.noUpdate} no update</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-4 min-w-[150px]">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600 flex-shrink-0">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              vendor.efficiency >= 80
                                ? "bg-gradient-to-r from-green-400 to-green-600 dark:from-green-500 dark:to-green-700"
                                : vendor.efficiency >= 60
                                ? "bg-gradient-to-r from-yellow-400 to-yellow-600 dark:from-yellow-500 dark:to-yellow-700"
                                : "bg-gradient-to-r from-red-400 to-red-600 dark:from-red-500 dark:to-red-700"
                            }`}
                            style={{ width: `${vendor.efficiency}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{vendor.efficiency}%</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-4 min-w-[140px]">
                      <Badge
                        variant="outline"
                        className={`font-medium whitespace-nowrap ${
                          vendor.efficiency >= 80
                            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700"
                            : vendor.efficiency >= 60
                              ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700"
                              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700"
                        }`}
                      >
                        {vendor.efficiency >= 80 ? "Excellent" : vendor.efficiency >= 60 ? "Good" : "Needs Attention"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Enhanced Footer with better dark mode styling */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{vendors.length} vendor partners</span>
          <Link to="/live/list">
            <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors hover:scale-105 active:scale-95 flex items-center space-x-1 group whitespace-nowrap">
              <span>Detailed Analytics</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default VendorAnalytics