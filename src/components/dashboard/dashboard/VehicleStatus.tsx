import type React from "react"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, AlertTriangle, Clock, ExternalLink, Car, MapPin } from "lucide-react"
import { mockVehicles } from "../../../data/live/vehicle"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom";

const StatusIndicator: React.FC<{ status: string }> = ({ status }) => {
  const configs = {
    Active: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-100", label: "Active" },
    Idle: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-100", label: "Idle" },
    Stopped: { icon: XCircle, color: "text-red-500", bg: "bg-red-100", label: "Stopped" },
    "No Data": { icon: AlertTriangle, color: "text-gray-500", bg: "bg-gray-100", label: "No Data" },
  }

  const config = configs[status as keyof typeof configs] || configs["No Data"]
  const Icon = config.icon

  return (
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center space-x-2">
      <div className={`p-1.5 rounded-lg ${config.bg}`}>
        <Icon size={14} className={config.color} />
      </div>
      <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
    </motion.div>
  )
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

const VehicleStatus: React.FC = () => {
  const activeCount = mockVehicles.filter((v) => v.status === "Active").length
  const totalCount = mockVehicles.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-[500px] flex flex-col backdrop-blur-sm"
    >
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 border-b border-gray-100 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Car className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Fleet Status</h3>
              <p className="text-sm text-gray-600">Real-time vehicle monitoring</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {activeCount}/{totalCount} Active
            </Badge>
            <Link to="/live/list">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md text-sm font-medium"
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
                  Vehicle
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Speed
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Location
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockVehicles.map((vehicle, index) => (
                <motion.tr
                  key={vehicle.id}
                  variants={item}
                  className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Car size={16} className="text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{vehicle.vehicleNumber}</div>
                        <div className="text-xs text-gray-500">{vehicle.deviceName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <StatusIndicator status={vehicle.status} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{vehicle.speed}</span>
                      <span className="text-xs text-gray-500">km/h</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{vehicle.driverName}</div>
                      <div className="text-xs text-gray-500">{vehicle.driverMobile}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-1 max-w-[200px]">
                      <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-600 truncate">{vehicle.address}</span>
                    </div>
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
          <span className="text-sm text-gray-600">{mockVehicles.length} vehicles total</span>
          <Link to="/live/list">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              View Details →
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default VehicleStatus