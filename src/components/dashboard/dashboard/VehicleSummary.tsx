import { useEffect, useState } from "react"
import { Car, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react"
import DashboardCard from "./DashboardCard"
import { fetchVehicles } from "../../../data/live/list" // adjust path as needed
import type { Vehicle } from "../../../types/live/list_type" // assuming you have a Vehicle type
import { useAuth } from "../../../context/AuthContext" // adjust path as needed

const VehicleSummary = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const getVehicles = async () => {
      try {
        const data = await fetchVehicles(String(user?.id))
        // Ensure vehicles is always an array
        setVehicles(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Failed to fetch vehicles", error)
      } finally {
        setLoading(false)
      }
    }

    getVehicles()
  }, [user?.id])

  if (loading) {
    return (
      <DashboardCard title="Fleet Overview">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading...</span>
          </div>
        </div>
      </DashboardCard>
    )
  }

  const vehicleStats = {
    total: vehicles.length,
    active: vehicles.filter((v) => v.status === "Active").length,
    noUpdate: vehicles.filter((v) => v.status === "No Update").length,
    noData: vehicles.filter((v) => v.status === "No Data").length,
  }

  const utilizationRate = vehicleStats.total > 0 ? Math.round((vehicleStats.active / vehicleStats.total) * 100) : 0

  const statItems = [
    {
      icon: Car,
      value: vehicleStats.total,
      label: "Total Fleet",
      color: "blue",
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: CheckCircle,
      value: vehicleStats.active,
      label: "Active",
      color: "green",
      gradient: "from-green-500 to-green-600",
      bg: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30",
      iconColor: "text-green-600 dark:text-green-400"
    },
    {
      icon: Clock,
      value: vehicleStats.noUpdate,
      label: "No Update",
      color: "yellow",
      gradient: "from-yellow-500 to-yellow-600",
      bg: "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30",
      iconColor: "text-yellow-600 dark:text-yellow-400"
    },
    {
      icon: XCircle,
      value: vehicleStats.noData,
      label: "No Data",
      color: "red",
      gradient: "from-red-500 to-red-600",
      bg: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30",
      iconColor: "text-red-600 dark:text-red-400"
    },
  ]

  return (
    <DashboardCard title="Fleet Overview">
      <div className="p-4 sm:p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {statItems.map((item) => (
            <div
              key={item.label}
              className="text-center group cursor-pointer hover:scale-105 transition-transform duration-200"
            >
              <div
                className={`mx-auto w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center mb-3 group-hover:shadow-lg transition-all duration-300`}
              >
                <item.icon
                  className={`${item.iconColor} group-hover:scale-110 transition-transform duration-300`}
                  size={24}
                />
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{item.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Utilization Rate */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800/50 dark:to-blue-900/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="text-blue-600 dark:text-blue-400" size={18} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fleet Utilization</span>
            </div>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{utilizationRate}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              style={{ width: `${utilizationRate}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full relative transition-all duration-1000 ease-out"
            >
              <div className="absolute inset-0 bg-white/30 dark:bg-white/20 animate-pulse rounded-full"></div>
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            {vehicleStats.active} of {vehicleStats.total} vehicles currently active
          </p>
        </div>
      </div>
    </DashboardCard>
  )
}

export default VehicleSummary