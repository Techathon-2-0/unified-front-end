import { motion } from "framer-motion"
import { AlertCircle, AlertTriangle, Info, Shield, Activity } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { fetchAlertsByUser } from "@/data/alarm/alert"
import { useEffect, useState } from "react"
import DashboardCard from "./DashboardCard"

const AlertSummary = () => {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    if (user?.id) {
      fetchAlertsByUser(String(user.id)).then((res) => {
        // If API returns { data: [...] }
        if (res && Array.isArray(res.data)) {
          setAlerts(res.data)
        } else if (Array.isArray(res)) {
          setAlerts(res)
        } else {
          setAlerts([])
        }
      })
    }
  }, [user])

  const alertStats = {
    total: alerts.length,
    critical: alerts.filter((a) => a.severity_type === "Critical").length,
    warning: alerts.filter((a) => a.severity_type === "Warning").length,
    general: alerts.filter((a) => a.severity_type === "General").length,
  }

  const criticalRate = alertStats.total > 0
    ? Math.round((alertStats.critical / alertStats.total) * 100)
    : 0

  const statItems = [
    {
      icon: Shield,
      value: alertStats.total,
      label: "Total Alerts",
      color: "blue",
      iconClass: "text-blue-600 dark:text-blue-400",
      bg: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40"
    },
    {
      icon: AlertCircle,
      value: alertStats.critical,
      label: "Critical",
      color: "red",
      iconClass: "text-red-600 dark:text-red-400",
      bg: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/40 dark:to-red-900/40"
    },
    {
      icon: AlertTriangle,
      value: alertStats.warning,
      label: "Warning",
      color: "yellow",
      iconClass: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/40 dark:to-yellow-900/40"
    },
    {
      icon: Info,
      value: alertStats.general,
      label: "General",
      color: "green",
      iconClass: "text-green-600 dark:text-green-400",
      bg: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/40"
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
                  className={`${item.iconClass} group-hover:scale-110 transition-transform duration-300`}
                  size={24}
                />
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{item.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{item.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Critical Alert Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-gradient-to-r from-gray-50 to-red-50 dark:from-gray-900/50 dark:to-red-950/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Activity className="text-red-600 dark:text-red-400" size={18} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Critical Alert Rate</span>
            </div>
            <span className="text-lg font-bold text-red-600 dark:text-red-400">{criticalRate}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${criticalRate}%` }}
              transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full relative"
            >
              <div className="absolute inset-0 bg-white/30 dark:bg-gray-300/20 animate-pulse rounded-full"></div>
            </motion.div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            {alertStats.critical} critical alerts require immediate attention
          </p>
        </motion.div>
      </div>
    </DashboardCard>
  )
}

export default AlertSummary