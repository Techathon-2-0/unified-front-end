import { motion } from "framer-motion"
import { Car, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react"
import { mockVehicles } from "../../../data/live/vehicle"
import DashboardCard from "./DashboardCard"

const VehicleSummary = () => {
  const vehicleStats = {
    total: mockVehicles.length,
    active: mockVehicles.filter((v) => v.status === "Active").length,
    idle: mockVehicles.filter((v) => v.status === "Idle").length,
    stopped: mockVehicles.filter((v) => v.status === "Stopped").length,
    noData: mockVehicles.filter((v) => v.status === "No Data").length,
  }

  const utilizationRate = Math.round((vehicleStats.active / vehicleStats.total) * 100)

  const statItems = [
    {
      icon: Car,
      value: vehicleStats.total,
      label: "Total Fleet",
      color: "blue",
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-gradient-to-br from-blue-50 to-blue-100",
    },
    {
      icon: CheckCircle,
      value: vehicleStats.active,
      label: "Active",
      color: "green",
      gradient: "from-green-500 to-green-600",
      bg: "bg-gradient-to-br from-green-50 to-green-100",
    },
    {
      icon: Clock,
      value: vehicleStats.idle,
      label: "Idle",
      color: "yellow",
      gradient: "from-yellow-500 to-yellow-600",
      bg: "bg-gradient-to-br from-yellow-50 to-yellow-100",
    },
    {
      icon: XCircle,
      value: vehicleStats.stopped,
      label: "Stopped",
      color: "red",
      gradient: "from-red-500 to-red-600",
      bg: "bg-gradient-to-br from-red-50 to-red-100",
    },
  ]

  return (
    <DashboardCard title="Fleet Overview" delay={0.1}>
      <div className="p-4 sm:p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {statItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.2 + index * 0.1,
                type: "spring",
                stiffness: 200,
              }}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.2 },
              }}
              className="text-center group cursor-pointer"
            >
              <div
                className={`mx-auto w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center mb-3 group-hover:shadow-lg transition-all duration-300`}
              >
                <item.icon
                  className={`text-${item.color}-600 group-hover:scale-110 transition-transform duration-300`}
                  size={24}
                />
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-1">{item.value}</p>
              <p className="text-sm text-gray-600">{item.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Utilization Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="text-blue-600" size={18} />
              <span className="text-sm font-medium text-gray-700">Fleet Utilization</span>
            </div>
            <span className="text-lg font-bold text-blue-600">{utilizationRate}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${utilizationRate}%` }}
              transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full relative"
            >
              <div className="absolute inset-0 bg-white opacity-30 animate-pulse rounded-full"></div>
            </motion.div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {vehicleStats.active} of {vehicleStats.total} vehicles currently active
          </p>
        </motion.div>
      </div>
    </DashboardCard>
  )
}

export default VehicleSummary
