import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AlertCircle, AlertTriangle, Info, Clock, ExternalLink, TrendingUp, Loader2 } from "lucide-react"
import { fetchAlertsByUser } from "../../../data/alarm/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

interface AlertType {
  id: number
  alarm_type_id: number
  alarm_category: string
  alarm_value: number
  rest_duration: number | null
  geofence_status: number | null
  alarm_generation: boolean
  active_start_time_range: string
  active_end_time_range: string
  active_trip: boolean
  alarm_status: boolean
  description: string
}

interface Shipment {
  id: number
  shipment_id: string
  route_name: string
  status: string
  current_location: string
  current_latitude: number
  current_longitude: number
  alert_method: number
}

interface Entity {
  id: number
  vehicleNumber: string
  type: string
}

interface NotificationSent {
  emails: string[]
  phone_numbers: string[]
}

interface Alert {
  id: number
  alert_type: AlertType
  status: number
  status_text: string
  created_at: string
  updated_at: string
  duration: string
  shipments: Shipment[]
  entity: Entity
  notification_sent: NotificationSent
  severity_type?: string // Add optional severity_type field
}

// interface ApiResponse {
//   success: boolean
//   data: {
//     alerts: Alert[]
//     pagination: {
//       total: number
//       page: number
//       limit: number
//       pages: number
//     }
//   }
// }

const AlertIcon: React.FC<{ severityType: string; type: string }> = ({ severityType }) => {
  const baseClasses = "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"

  if (severityType === "Critical") {
    return (
      <div className={`${baseClasses} bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 text-red-600 dark:text-red-400`}>
        <AlertCircle size={20} />
      </div>
    )
  } else if (severityType === "Warning") {
    return (
      <div className={`${baseClasses} bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/40 text-yellow-600 dark:text-yellow-400`}>
        <AlertTriangle size={20} />
      </div>
    )
  } else {
    return (
      <div className={`${baseClasses} bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-600 dark:text-blue-400`}>
        <Info size={20} />
      </div>
    )
  }
}

const getTimeAgo = (dateString: string) => {
  const alertDate = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - alertDate.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  } else {
    return "Just now"
  }
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
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
}



interface AlertsListProps {
  userId: string;
}

const AlertsList: React.FC<AlertsListProps> = ({ userId }) => {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalAlerts, setTotalAlerts] = useState(0)
  const { user } = useAuth()

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log("Auth user:", user) // Debug: log user
        if (!user) {
          setError("User not found. Please log in again.");
          setAlerts([]);
          setTotalAlerts(0);
          setLoading(false);
          return;
        }
        const response = await fetchAlertsByUser(String(user.id))
        console.log("API response:", response) // Debug: log API response
        // If response is the new format (array of alerts with alertId, status, alarmId, createdAt, severity_type)
        if (Array.isArray(response?.data)) {
          // Map the new API response to the Alert type used in this component
          const mappedAlerts: Alert[] = response.data.map((item: any) => ({
            id: item.alertId,
            alert_type: {
              id: item.alarmId,
              alarm_type_id: item.alarmId,
              alarm_category: "", // Not provided in new API, fallback or fetch if needed
              alarm_value: 0,
              rest_duration: null,
              geofence_status: null,
              alarm_generation: false,
              active_start_time_range: "",
              active_end_time_range: "",
              active_trip: false,
              alarm_status: false,
              description: "", // Not provided
            },
            status: item.status,
            status_text: item.status === 1 ? "Active" : item.status === 2 ? "Manually Closed" : "Inactive",
            created_at: item.createdAt,
            updated_at: item.createdAt,
            duration: "", // Not provided
            shipments: [],
            entity: {
              id: 0,
              vehicleNumber: "", // Not provided
              type: "", // Not provided
            },
            notification_sent: {
              emails: [],
              phone_numbers: [],
            },
            // Add severity_type for easier access
            severity_type: item.severity_type,
          }))
          setAlerts(mappedAlerts)
          setTotalAlerts(mappedAlerts.length)
        } else if (response && response.success && response.data && Array.isArray(response.data)) {
          // Defensive: handle if response.data is already an array
          const mappedAlerts: Alert[] = response.data.map((item: any) => ({
            id: item.alertId,
            alert_type: {
              id: item.alarmId,
              alarm_type_id: item.alarmId,
              alarm_category: "",
              alarm_value: 0,
              rest_duration: null,
              geofence_status: null,
              alarm_generation: false,
              active_start_time_range: "",
              active_end_time_range: "",
              active_trip: false,
              alarm_status: false,
              description: "",
            },
            status: item.status,
            status_text: item.status === 1 ? "Active" : item.status === 2 ? "Manually Closed" : "Inactive",
            created_at: item.createdAt,
            updated_at: item.createdAt,
            duration: "",
            shipments: [],
            entity: {
              id: 0,
              vehicleNumber: "",
              type: "",
            },
            notification_sent: {
              emails: [],
              phone_numbers: [],
            },
            severity_type: item.severity_type,
          }))
          setAlerts(mappedAlerts)
          setTotalAlerts(mappedAlerts.length)
        } else if (response && response.success && response.data && response.data.alerts) {
          setAlerts(response.data.alerts || [])
          setTotalAlerts(response.data.pagination?.total || 0)
        } else if (Array.isArray(response)) {
          setAlerts(response)
          setTotalAlerts(response.length)
        } else {
          setAlerts([])
          setTotalAlerts(0)
          setError("Unexpected API response format.") // Add error for unexpected format
        }
      } catch (err) {
        console.error("Failed to fetch alerts:", err)
        setError("Failed to load alerts. Please try again later.")
        setAlerts([])
        setTotalAlerts(0)
      } finally {
        setLoading(false)
      }
    }

    loadAlerts()
  }, [userId])

  const recentAlarms = alerts.slice(0, 8)
  // Use severity_type from alert if present, fallback to old logic if not
  const criticalCount = recentAlarms.filter((a) =>
    (a as any).severity_type
      ? (a as any).severity_type === "Critical"
      : a.status === 1
  ).length

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden h-[500px] flex flex-col backdrop-blur-sm"
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400">
            <Loader2 className="animate-spin" size={24} />
            <span>Loading alerts...</span>
          </div>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden h-[500px] flex flex-col backdrop-blur-sm"
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-500 dark:text-red-400">
            <AlertCircle size={48} className="mx-auto mb-3" />
            <p className="text-lg font-medium mb-2">Error Loading Alerts</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </motion.div>
    )
  }

  if (alerts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden h-[500px] flex flex-col backdrop-blur-sm"
      >
        <div className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/30 dark:via-orange-950/30 dark:to-yellow-950/30 p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-xl">
              <TrendingUp className="text-red-600 dark:text-red-400" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">Recent Alerts</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Real-time system notifications</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <Info size={48} className="mx-auto mb-3" />
            <p className="text-lg font-medium mb-2">No Alerts Found</p>
            <p className="text-sm">There are no alerts for this user at the moment.</p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden h-[500px] flex flex-col backdrop-blur-sm"
    >
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/30 dark:via-orange-950/30 dark:to-yellow-950/30 p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-xl">
              <TrendingUp className="text-red-600 dark:text-red-400" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">Recent Alerts</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Real-time system notifications</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">
                {criticalCount} Critical
              </Badge>
            )}
            <Link to="/alarm/config">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 shadow-md text-sm font-medium"
              >
                <span>View All</span>
                <ExternalLink size={14} />
              </motion.button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1 p-2">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
          {recentAlarms.map((alarm) => {
            // Use severity_type from API if present, fallback to old logic
            const severityType = (alarm as any).severity_type
              ? (alarm as any).severity_type
              : alarm.status === 1
                ? "Critical"
                : alarm.status === 2
                  ? "Warning"
                  : "Info"
            return (
              <motion.div
                key={alarm.id}
                variants={item}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
                  transition: { duration: 0.2 },
                }}
                className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 bg-gradient-to-r from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-800/80 cursor-pointer"
              >
                <div className="flex items-start space-x-4">
                  <AlertIcon severityType={severityType} type={alarm.alert_type.alarm_category} />

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                          {alarm.alert_type.alarm_category} - {alarm.entity.vehicleNumber}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {alarm.alert_type.description}
                        </p>
                        {alarm.shipments.length > 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            Route: {alarm.shipments[0].route_name} • Location: {alarm.shipments[0].current_location}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        <Clock size={12} className="mr-1" />
                        {getTimeAgo(alarm.created_at)}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center mt-3 gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          severityType === "Critical"
                            ? "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50"
                            : severityType === "Warning"
                              ? "bg-yellow-50 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50"
                              : "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50"
                        }`}
                      >
                        {alarm.status_text}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600/50">
                        {alarm.alert_type.alarm_category}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/50">
                        {alarm.entity.type}
                      </Badge>
                      {alarm.duration && (
                        <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50">
                          {alarm.duration}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </ScrollArea>

      {/* Enhanced Footer */}
      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/80 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Showing {recentAlarms.length} of {totalAlerts} alerts
          </span>
          <Link to="/alarm/config">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors"
            >
              Load More →
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default AlertsList