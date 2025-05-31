import { motion } from "framer-motion"
import { Activity, Zap, Clock, Target, TrendingUp } from "lucide-react"
import { mockVehicles } from "../../../data/live/vehicle"
import { mockAlarms } from "../../../data/alarm/aconfig"
import DashboardCard from "./DashboardCard"

const PerformanceMetrics = () => {
  const totalVehicles = mockVehicles.length
  const activeVehicles = mockVehicles.filter((v) => v.status === "Active").length
  const avgSpeed = Math.round(mockVehicles.reduce((sum, v) => sum + v.speed, 0) / totalVehicles)
  const criticalAlerts = mockAlarms.filter((a) => a.severityType === "Critical").length

  const fleetUtilization = Math.round((activeVehicles / totalVehicles) * 100)
  const alertRate = Math.round((criticalAlerts / totalVehicles) * 100)
  const efficiencyScore = 100 - alertRate
  const onTimeDelivery = 98.5 // You can make this dynamic based on your data

  // Calculate overall performance based on key metrics
  const calculateOverallPerformance = () => {
    // Weighted scoring system
    const utilizationScore = fleetUtilization * 0.3 // 30% weight
    const efficiencyWeight = efficiencyScore * 0.25 // 25% weight
    const onTimeWeight = onTimeDelivery * 0.25 // 25% weight
    const speedScore = Math.min((avgSpeed / 60) * 100, 100) * 0.2 // 20% weight, normalized to 100

    const totalScore = utilizationScore + efficiencyWeight + onTimeWeight + speedScore

    // Determine rating based on total score
    if (totalScore >= 90) {
      return { rating: "Excellent", color: "green", bgColor: "from-green-50 to-green-100" }
    } else if (totalScore >= 75) {
      return { rating: "Good", color: "blue", bgColor: "from-blue-50 to-blue-100" }
    } else if (totalScore >= 60) {
      return { rating: "Average", color: "yellow", bgColor: "from-yellow-50 to-yellow-100" }
    } else {
      return { rating: "Poor", color: "red", bgColor: "from-red-50 to-red-100" }
    }
  }

  const performanceRating = calculateOverallPerformance()

  const metrics = [
    {
      icon: Activity,
      value: `${fleetUtilization}%`,
      label: "Fleet Utilization",
      color: "green",
      trend: "+5.2%",
      bg: "bg-gradient-to-br from-green-50 to-green-100",
    },
    {
      icon: Zap,
      value: `${avgSpeed}`,
      label: "Avg Speed (km/h)",
      color: "blue",
      trend: "+2.1%",
      bg: "bg-gradient-to-br from-blue-50 to-blue-100",
    },
    {
      icon: Target,
      value: `${efficiencyScore}%`,
      label: "Efficiency Score",
      color: "purple",
      trend: "+1.8%",
      bg: "bg-gradient-to-br from-purple-50 to-purple-100",
    },
    {
      icon: Clock,
      value: `${onTimeDelivery}%`,
      label: "On-Time Delivery",
      color: "orange",
      trend: "+0.9%",
      bg: "bg-gradient-to-br from-orange-50 to-orange-100",
    },
  ]

  return (
    <DashboardCard title="Performance Analytics" delay={0.3}>
      <div className="p-4 sm:p-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.4 + index * 0.1,
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
                className={`mx-auto w-14 h-14 rounded-2xl ${metric.bg} flex items-center justify-center mb-3 group-hover:shadow-lg transition-all duration-300`}
              >
                <metric.icon
                  className={`text-${metric.color}-600 group-hover:scale-110 transition-transform duration-300`}
                  size={24}
                />
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-1">{metric.value}</p>
              <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
              <div className="flex items-center justify-center space-x-1">
                <TrendingUp size={12} className="text-green-500" />
                <p className="text-xs text-green-600 font-medium">{metric.trend}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Performance Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className={`bg-gradient-to-r ${performanceRating.bgColor} rounded-xl p-4`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Target className={`text-${performanceRating.color}-600`} size={18} />
              <span className="text-sm font-medium text-gray-700">Overall Performance</span>
            </div>
            <span className={`text-lg font-bold text-${performanceRating.color}-600`}>
              {performanceRating.rating}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
            <div>
              <span className="font-medium">Fleet Status:</span> {fleetUtilization}% active
            </div>
            <div>
              <span className="font-medium">Alert Level:</span> {alertRate}% critical
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardCard>
  )
}

export default PerformanceMetrics