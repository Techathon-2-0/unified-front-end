import { motion } from "framer-motion"
import { AlertCircle, AlertTriangle, Info, Shield, Activity } from "lucide-react"
import { mockAlarms } from "../../../data/alarm/aconfig"
import DashboardCard from "./DashboardCard"

const AlertSummary = () => {
  const alertStats = {
    total: mockAlarms.length,
    critical: mockAlarms.filter((a) => a.severityType === "Critical").length,
    warning: mockAlarms.filter((a) => a.severityType === "Warning").length,
    general: mockAlarms.filter((a) => a.severityType === "General").length,
  }

  const criticalRate = Math.round((alertStats.critical / alertStats.total) * 100)

  const statItems = [
    {
      icon: Shield,
      value: alertStats.total,
      label: "Total Alerts",
      color: "blue",
      bg: "bg-gradient-to-br from-blue-50 to-blue-100",
    },
    {
      icon: AlertCircle,
      value: alertStats.critical,
      label: "Critical",
      color: "red",
      bg: "bg-gradient-to-br from-red-50 to-red-100",
    },
    {
      icon: AlertTriangle,
      value: alertStats.warning,
      label: "Warning",
      color: "yellow",
      bg: "bg-gradient-to-br from-yellow-50 to-yellow-100",
    },
    {
      icon: Info,
      value: alertStats.general,
      label: "General",
      color: "green",
      bg: "bg-gradient-to-br from-green-50 to-green-100",
    },
  ]

  return (
    <DashboardCard title="Alert Management" delay={0.2}>
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
                delay: 0.3 + index * 0.1,
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

        {/* Critical Alert Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-gradient-to-r from-gray-50 to-red-50 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Activity className="text-red-600" size={18} />
              <span className="text-sm font-medium text-gray-700">Critical Alert Rate</span>
            </div>
            <span className="text-lg font-bold text-red-600">{criticalRate}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${criticalRate}%` }}
              transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full relative"
            >
              <div className="absolute inset-0 bg-white opacity-30 animate-pulse rounded-full"></div>
            </motion.div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {alertStats.critical} critical alerts require immediate attention
          </p>
        </motion.div>
      </div>
    </DashboardCard>
  )
}

export default AlertSummary
