import type React from "react"
import { motion } from "framer-motion"
import { AlertCircle, AlertTriangle, Info, Clock, ExternalLink, TrendingUp } from "lucide-react"
import { mockAlarms } from "../../../data/alarm/aconfig"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom";

const AlertIcon: React.FC<{ severityType: string; type: string }> = ({ severityType, type }) => {
  const baseClasses = "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"

  if (severityType === "Critical") {
    return (
      <div className={`${baseClasses} bg-gradient-to-br from-red-100 to-red-200 text-red-600`}>
        <AlertCircle size={20} />
      </div>
    )
  } else if (severityType === "Warning") {
    return (
      <div className={`${baseClasses} bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-600`}>
        <AlertTriangle size={20} />
      </div>
    )
  } else {
    return (
      <div className={`${baseClasses} bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600`}>
        <Info size={20} />
      </div>
    )
  }
}

const getTimeAgo = (dateString: string) => {
  const cleanDate = dateString.replace(/[()]/g, "")
  const [datePart, timePart] = cleanDate.split("/")
  const [day, month, year] = datePart.split("-")
  const [hour, minute] = timePart.split(":")

  const alertDate = new Date(
    Number.parseInt(year),
    Number.parseInt(month) - 1,
    Number.parseInt(day),
    Number.parseInt(hour),
    Number.parseInt(minute),
  )
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

const AlertsList: React.FC = () => {
  const recentAlarms = mockAlarms.slice(0, 8)
  const criticalCount = recentAlarms.filter((a) => a.severityType === "Critical").length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-[500px] flex flex-col backdrop-blur-sm"
    >
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 p-4 sm:p-6 border-b border-gray-100 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-xl">
              <TrendingUp className="text-red-600" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Recent Alerts</h3>
              <p className="text-sm text-gray-600">Real-time system notifications</p>
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
          {recentAlarms.map((alarm) => (
            <motion.div
              key={alarm.id}
              variants={item}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
                transition: { duration: 0.2 },
              }}
              className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-200 bg-gradient-to-r from-white to-gray-50 cursor-pointer"
            >
              <div className="flex items-start space-x-4">
                <AlertIcon severityType={alarm.severityType} type={alarm.type} />

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{alarm.type}</h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{alarm.description}</p>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 whitespace-nowrap">
                      <Clock size={12} className="mr-1" />
                      {getTimeAgo(alarm.createdOn)}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center mt-3 gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        alarm.severityType === "Critical"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : alarm.severityType === "Warning"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {alarm.severityType}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                      {alarm.alarmCategory}
                    </Badge>
                    {alarm.groups.length > 0 && (
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                        {alarm.groups[0]} {alarm.groups.length > 1 && `+${alarm.groups.length - 1}`}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </ScrollArea>

      {/* Enhanced Footer */}
      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Showing {recentAlarms.length} of {mockAlarms.length} alerts
          </span>
          <Link to="/alarm/config">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
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
