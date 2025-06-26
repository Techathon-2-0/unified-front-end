import { useEffect, useState } from "react"
import { Activity, Zap, Clock, Target } from "lucide-react"
import { fetchAlertsByUser } from "@/data/alarm/alert"
import DashboardCard from "./DashboardCard"
import { fetchVehicles } from "../../../data/live/list"
import type { Vehicle } from "../../../types/live/list_type"
import { useAuth } from "../../../context/AuthContext"

// interface PerformanceHistory {
//   fleetUtilization: number[]
//   avgSpeed: number[]
//   efficiencyScore: number[]
//   onTimeDelivery: number[]
// }

const PerformanceMetrics = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  // const [performanceHistory, setPerformanceHistory] = useState<PerformanceHistory>({
  //   fleetUtilization: [],
  //   avgSpeed: [],
  //   efficiencyScore: [],
  //   onTimeDelivery: []
  // })
  const { user } = useAuth()

  useEffect(() => {
    const loadData = async () => {
      try {
        const vehiclesData = await fetchVehicles(String(user?.id))
        const vehiclesArray = Array.isArray(vehiclesData) ? vehiclesData : []
        setVehicles(vehiclesArray)

        // Fetch alerts for the user
        const alertsRes = await fetchAlertsByUser(String(user?.id))
        if (alertsRes && Array.isArray(alertsRes.alerts)) {
          setAlerts(alertsRes.alerts)
        } else if (Array.isArray(alertsRes)) {
          setAlerts(alertsRes)
        } else {
          setAlerts([])
        }

        // Update performance history (in real app, this would come from API)
        updatePerformanceHistory(vehiclesArray)
      } catch (error) {
        console.error("Failed to fetch vehicles or alerts", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  const updatePerformanceHistory = (vehicleData: Vehicle[]) => {
    // Defensive: ensure vehicleData is an array
    if (!Array.isArray(vehicleData)) return

    // Calculate current metrics
    // const totalVehicles = vehicleData.length
    // const activeVehicles = vehicleData.filter((v) => v.status === "Active").length
    // const currentUtilization = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0
    // const currentAvgSpeed = totalVehicles > 0 ? Math.round(vehicleData.reduce((sum, v) => sum + v.speed, 0) / totalVehicles) : 0
    
    // Calculate efficiency based on vehicle performance
    // const criticalAlerts = alertData.filter((a) => a.severityType === "Critical").length
    // const alertRate = totalVehicles > 0 ? Math.round((criticalAlerts / totalVehicles) * 100) : 0
    // const currentEfficiency = 100 - alertRate
    
    // Calculate on-time delivery based on vehicle statuses and speeds
    // const onTimeVehicles = vehicleData.filter(v => 
    //   v.status === "Active" && v.speed > 0 && v.speed <= 80 // Reasonable speed range
    // ).length
    // const currentOnTime = totalVehicles > 0 ? Math.round((onTimeVehicles / totalVehicles) * 100) : 0
    
    // // Update history (keep last 10 entries for trend calculation)
    // setPerformanceHistory(prev => ({
    //   fleetUtilization: [...prev.fleetUtilization.slice(-9), currentUtilization],
    //   avgSpeed: [...prev.avgSpeed.slice(-9), currentAvgSpeed],
    //   efficiencyScore: [...prev.efficiencyScore.slice(-9), currentEfficiency],
    //   onTimeDelivery: [...prev.onTimeDelivery.slice(-9), currentOnTime]
    // }))
  }

  // const calculateTrend = (values: number[]): { trend: string; isPositive: boolean } => {
  //   if (values.length < 2) return { trend: "0.0%", isPositive: true }
    
  //   const current = values[values.length - 1]
  //   const previous = values[values.length - 2]
  //   const change = ((current - previous) / previous) * 100
    
  //   return {
  //     trend: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
  //     isPositive: change >= 0
  //   }
  // }

  if (loading) {
    return (
      <DashboardCard title="Performance Analytics" delay={0.3}>
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading...</span>
          </div>
        </div>
      </DashboardCard>
    )
  }

  const totalVehicles = vehicles.length
  const activeVehicles = vehicles.filter((v) => v.status === "Active").length
  const avgSpeed = totalVehicles > 0
  ? Math.round(
      vehicles.reduce((sum, v) => {
        const speed = Number(v.speed);
        return isFinite(speed) ? sum + speed : sum;
      }, 0) / totalVehicles
    )
  : 0;

  // Count all critical alerts
  const criticalAlerts = alerts.filter((a) => a.severity_type === "Critical").length

  // Count unique vehicles with at least one critical alert
  const criticalAlertVehicleSet = new Set(
    alerts
      .filter((a) => a.severity_type === "Critical")
      .map((a) => a.vehicleNumber)
  );
  const vehiclesWithCriticalAlert = criticalAlertVehicleSet.size;

  const fleetUtilization = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0
  // Alert rate: percent of vehicles with at least one critical alert
  const alertRate = totalVehicles > 0 ? Math.round((vehiclesWithCriticalAlert / totalVehicles) * 100) : 0
  const efficiencyScore = 100 - alertRate

  // Use trip_status for active trips
  // Consider these trip_status values as active:
  const activeTripStatuses = ["in_transit", "at_stop_delivery", "at_stop_pickup"];
  const activeTrips = vehicles.filter(v => activeTripStatuses.includes(v.trip_status)).length
  const activeTripsPercent = totalVehicles > 0 ? Math.round((activeTrips / totalVehicles) * 100) : 0

  // Overall performance is calculated using only:
  // - Fleet Utilization
  // - Efficiency Score
  // - Average Speed
  // - Active Trips Percent
  // Each metric is weighted and combined for the final score.
  const calculateOverallPerformance = () => {
    const utilizationScore = fleetUtilization * 0.3
    const efficiencyWeight = efficiencyScore * 0.25
    // Replace onTimeWeight with activeTripsPercent
    const activeTripWeight = activeTripsPercent * 0.25
    //const speedScore = Math.min((avgSpeed / 60) * 100, 100) * 0.2

    const totalScore = utilizationScore + efficiencyWeight + activeTripWeight
    

    if (totalScore >= 75) {
      return { 
        rating: "Excellent", 
        lightBg: "from-green-50 to-green-100",
        darkBg: "dark:from-green-900/20 dark:to-green-800/20",
        lightIcon: "text-green-600",
        darkIcon: "dark:text-green-400",
        lightText: "text-green-600",
        darkText: "dark:text-green-400"
      }
    } else if (totalScore >= 50) {
      return { 
        rating: "Good", 
        lightBg: "from-blue-50 to-blue-100",
        darkBg: "dark:from-blue-900/20 dark:to-blue-800/20",
        lightIcon: "text-blue-600",
        darkIcon: "dark:text-blue-400",
        lightText: "text-blue-600",
        darkText: "dark:text-blue-400"
      }
    } else if (totalScore >= 25) {
      return { 
        rating: "Average", 
        lightBg: "from-yellow-50 to-yellow-100",
        darkBg: "dark:from-yellow-900/20 dark:to-yellow-800/20",
        lightIcon: "text-yellow-600",
        darkIcon: "dark:text-yellow-400",
        lightText: "text-yellow-600",
        darkText: "dark:text-yellow-400"
      }
    } else {
      return { 
        rating: "Poor", 
        lightBg: "from-red-50 to-red-100",
        darkBg: "dark:from-red-900/20 dark:to-red-800/20",
        lightIcon: "text-red-600",
        darkIcon: "dark:text-red-400",
        lightText: "text-red-600",
        darkText: "dark:text-red-400"
      }
    }
  }

  const performanceRating = calculateOverallPerformance()


  const metrics = [
    {
      icon: Activity,
      value: `${fleetUtilization}%`,
      label: "Fleet Utilization",
      lightBg: "bg-gradient-to-br from-green-50 to-green-100",
      darkBg: "dark:bg-gradient-to-br dark:from-green-900/20 dark:to-green-800/20",
      lightIcon: "text-green-600",
      darkIcon: "dark:text-green-400"
    },
    {
      icon: Zap,
      value: `${Number(Math.round(avgSpeed))}`,
      label: "Avg Speed (km/h)",
      lightBg: "bg-gradient-to-br from-blue-50 to-blue-100",
      darkBg: "dark:bg-gradient-to-br dark:from-blue-900/20 dark:to-blue-800/20",
      lightIcon: "text-blue-600",
      darkIcon: "dark:text-blue-400"
    },
    {
      icon: Target,
      value: `${efficiencyScore}%`,
      label: "Efficiency Score",
      lightBg: "bg-gradient-to-br from-purple-50 to-purple-100",
      darkBg: "dark:bg-gradient-to-br dark:from-purple-900/20 dark:to-purple-800/20",
      lightIcon: "text-purple-600",
      darkIcon: "dark:text-purple-400"
    },
    {
      icon: Clock,
      value: `${activeTripsPercent}%`,
      label: "On Trip",
      lightBg: "bg-gradient-to-br from-orange-50 to-orange-100",
      darkBg: "dark:bg-gradient-to-br dark:from-orange-900/20 dark:to-orange-800/20",
      lightIcon: "text-orange-600",
      darkIcon: "dark:text-orange-400"
    },
  ]

  return (
    <DashboardCard title="Performance Analytics" delay={0.3}>
      
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="text-center group cursor-pointer"
            >
              <div
                className={`mx-auto w-14 h-14 rounded-2xl ${metric.lightBg} ${metric.darkBg} flex items-center justify-center mb-3 group-hover:shadow-lg transition-all duration-300`}
              >
                <metric.icon
                  className={`${metric.lightIcon} ${metric.darkIcon} group-hover:scale-110 transition-transform duration-300`}
                  size={24}
                />
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{metric.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{metric.label}</p>
            </div>
          ))}
        </div>

        <div
          className={`bg-gradient-to-r ${performanceRating.lightBg} ${performanceRating.darkBg} rounded-xl p-4 border border-gray-100 dark:border-gray-700/50`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Target 
                className={`${performanceRating.lightIcon} ${performanceRating.darkIcon}`} 
                size={18} 
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Overall Performance
              </span>
            </div>
            <span className={`text-lg font-bold ${performanceRating.lightText} ${performanceRating.darkText}`}>
              {performanceRating.rating}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Fleet Status:</span> {activeVehicles}/{totalVehicles} active ({fleetUtilization}%)
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Alert:</span> {criticalAlerts} critical alerts ({alertRate}%)
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  )
}

export default PerformanceMetrics