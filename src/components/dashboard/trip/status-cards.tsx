import { motion } from "framer-motion"
import { Activity, Clock, MapPin, Truck, AlertTriangle, Zap, Navigation, Shield, Radio, Target, Bell, BarChart2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { TripStatusCardsProps } from "../../../types/dashboard/trip_type"

export function TripStatusCards({ statusCounts, onStatusClick, onAlarmClick, selectedStatus, selectedAlarm }: TripStatusCardsProps) {
  // Helper to compare arrays
  const isArrayEqual = (a: any, b: any) =>
    Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i]);

  const tripStatusCards = [
    {
      title: "Active",
      value: statusCounts.active,
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      onClick: () => onStatusClick("active"),
      isSelected: isArrayEqual(selectedStatus, ["at_stop_pickup", "at_stop_delivery", "in_transit"]),
    },
    {
      title: "Inactive",
      value: statusCounts.inactive,
      icon: Clock,
      color: "text-gray-600",
      bgColor: "bg-gray-50 dark:bg-gray-900/20",
      borderColor: "border-gray-200 dark:border-gray-800",
      onClick: () => onStatusClick("inactive"),
      isSelected: selectedStatus === "inactive",
    },
    {
      title: "At Pickup",
      value: statusCounts.atPickup,
      icon: MapPin,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      onClick: () => onStatusClick("pickup"),
      isSelected: selectedStatus === "at_stop_pickup",
    },
    {
      title: "At Delivery",
      value: statusCounts.atDelivery,
      icon: Truck,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      borderColor: "border-purple-200 dark:border-purple-800",
      onClick: () => onStatusClick("delivery"),
      isSelected: selectedStatus === "at_stop_delivery",
    },
    {
      title: "In Transit",
      value: statusCounts.inTransit,
      icon: Navigation,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      borderColor: "border-orange-200 dark:border-orange-800",
      onClick: () => onStatusClick("transit"),
      isSelected: selectedStatus === "in_transit",
    },
    {
      title: "On Time",
      value: statusCounts.onTime,
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      onClick: () => onStatusClick("ontime"),
      isSelected: selectedStatus === "ontime",
    },
    {
      title: "Delayed",
      value: statusCounts.delayed,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-200 dark:border-red-800",
      onClick: () => onStatusClick("delayed"),
      isSelected: selectedStatus === "delayed",
    },
  ]

  const alarmCards = [
    {
      title: "Stoppage",
      value: statusCounts.stoppage,
      icon: Clock,
      color: "text-yellow-600",
      onClick: () => onAlarmClick("stoppage"),
      isSelected: selectedAlarm === "stoppage",
    },
    {
      title: "Speeding",
      value: statusCounts.overspeeding,
      icon: Zap,
      color: "text-red-600",
      onClick: () => onAlarmClick("overspeeding"),
      isSelected: selectedAlarm === "overspeeding",
    },
    {
      title: "Driving",
      value: statusCounts.continuousDriving,
      icon: Activity,
      color: "text-orange-600",
      onClick: () => onAlarmClick("continuous_driving"),
      isSelected: selectedAlarm === "continuous_driving",
    },
    {
      title: "Deviation",
      value: statusCounts.routeDeviation,
      icon: Navigation,
      color: "text-purple-600",
      onClick: () => onAlarmClick("route_deviation"),
      isSelected: selectedAlarm === "route_deviation",
    },
    {
      title: "Geofence",
      value: statusCounts.geofence,
      icon: Shield,
      color: "text-blue-600",
      onClick: () => onAlarmClick("geofence"),
      isSelected: selectedAlarm === "geofence",
    },
    {
      title: "Reached Stop",
      value: statusCounts.reachedStopAlarm,
      icon: Target,
      color: "text-green-600",
      onClick: () => onAlarmClick("reached_stop_alarm"),
      isSelected: selectedAlarm === "reached_stop_alarm",
    },
    {
      title: "No GPS Feed",
      value: statusCounts.noGpsFeed,
      icon: Radio,
      color: "text-gray-600",
      onClick: () => onAlarmClick("no_gps_feed"),
      isSelected: selectedAlarm === "no_gps_feed",
    },
  ]

  return (
    <div className="px-6 py-4 space-y-8">
      {/* Trip Status Cards */}
      <div>
        <div className="flex items-center gap-2 mb-5 px-4 py-2 rounded-xl
          bg-gradient-to-r from-blue-50/80 via-white/80 to-green-50/80
          dark:from-[#1e293b]/80 dark:via-[#0f172a]/80 dark:to-green-900/30
          shadow-sm border border-blue-100 dark:border-blue-900/40
        ">
          <BarChart2 className="h-6 w-6 text-blue-600 dark:text-blue-300" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Trip Status</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6">
          {tripStatusCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.01 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card
                className={`
                  cursor-pointer
                  transition-all duration-200
                  border-0
                  shadow-lg
                  rounded-2xl
                  bg-white/70 dark:bg-[#1e293b]/80
                  backdrop-blur-md
                  hover:shadow-2xl
                  hover:ring-2 hover:ring-offset-2 hover:ring-blue-200 dark:hover:ring-blue-700
                  ${card.bgColor}
                  ${card.isSelected ? "ring-2 ring-blue-500 dark:ring-blue-400" : ""}
                `}
                onClick={card.onClick}
                style={{ minHeight: 120 }}
              >
                <CardContent className="p-5 flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">{card.title}</p>
                      <p className={`text-xl font-extrabold ${card.color} dark:drop-shadow-lg`}>{card.value}</p>
                    </div>
                    <div className="flex items-center justify-center rounded-full bg-white/80 dark:bg-gray-800/80 shadow-inner p-2">
                      <card.icon className={`h-8 w-8 ${card.color} dark:text-inherit`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Alarm Status Cards */}
      <div>
        <div className="flex items-center gap-2 mb-5 px-4 py-2 rounded-xl
          bg-gradient-to-r from-red-50/80 via-white/80 to-yellow-50/80
          dark:from-[#1e293b]/80 dark:via-[#0f172a]/80 dark:to-yellow-900/30
          shadow-sm border border-red-100 dark:border-yellow-900/40
        ">
          <Bell className="h-6 w-6 text-red-600 dark:text-yellow-300" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Active Alerts</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6">
          {alarmCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 + 0.6 }}
              whileHover={{ scale: 1.05 }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card
                      className={`
                        cursor-pointer
                        transition-all duration-200
                        border-0
                        shadow-lg
                        rounded-2xl
                        bg-white/70 dark:bg-[#1e293b]/80
                        backdrop-blur-md
                        hover:shadow-2xl
                        hover:ring-2 hover:ring-offset-2 hover:ring-red-200 dark:hover:ring-yellow-700
                        mb-2
                        ${card.isSelected ? "ring-2 ring-yellow-500 dark:ring-yellow-400" : ""}
                      `}
                      onClick={card.onClick}
                      style={{ minHeight: 110 }}
                    >
                      <CardContent className="p-5 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">{card.title}</p>
                            <p className={`text-xl font-extrabold ${card.color} dark:drop-shadow-lg`}>{card.value}</p>
                          </div>
                          <div className="flex items-center justify-center rounded-full bg-white/80 dark:bg-gray-800/80 shadow-inner p-2">
                            <card.icon className={`h-6 w-6 ${card.color} dark:text-inherit`} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
