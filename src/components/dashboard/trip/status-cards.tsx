import { motion } from "framer-motion"
import {
  Info,
  Activity,
  AlertTriangle,
  MapPin,
  Truck,
  CheckCircle,
  Clock,
  TrendingUp,
  Route,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { TripStatusCardsProps } from "../../../types/dashboard/trip"


export function TripStatusCards({ statusCounts, totalTrips }: TripStatusCardsProps) {
  return (
    <div className="px-4 sm:px-6 py-6">
      <motion.div initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Main Status Card */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden col-span-1 sm:col-span-2 lg:col-span-2"
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Trip Status Overview</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Info className="h-4 w-4 text-gray-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Current status of all trips</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm text-gray-600">Active</span>
                  </div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="font-semibold text-gray-800"
                  >
                    {statusCounts.active}
                  </motion.span>
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  <Progress
                    value={(statusCounts.active / totalTrips) * 100}
                    className="h-2 bg-gray-100 [&>div]:bg-green-500"
                  />
                </motion.div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm text-gray-600">On Time</span>
                  </div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="font-semibold text-gray-800"
                  >
                    {statusCounts.onTime}
                  </motion.span>
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  <Progress
                    value={(statusCounts.onTime / totalTrips) * 100}
                    className="h-2 bg-gray-100 [&>div]:bg-blue-500"
                  />
                </motion.div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-amber-500 mr-2"></div>
                    <span className="text-sm text-gray-600">Delayed &lt; 1hr</span>
                  </div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="font-semibold text-gray-800"
                  >
                    {statusCounts.delayLessThan1Hr}
                  </motion.span>
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  <Progress
                    value={(statusCounts.delayLessThan1Hr / totalTrips) * 100}
                    className="h-2 bg-gray-100 [&>div]:bg-amber-500"
                  />
                </motion.div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-purple-500 mr-2"></div>
                    <span className="text-sm text-gray-600">Delayed &gt; 1hr</span>
                  </div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="font-semibold text-gray-800"
                  >
                    {statusCounts.delayMoreThan1Hr}
                  </motion.span>
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  <Progress
                    value={(statusCounts.delayMoreThan1Hr / totalTrips) * 100}
                    className="h-2 bg-gray-100 [&>div]:bg-purple-500"
                  />
                </motion.div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-sm text-gray-600">No Update</span>
                  </div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="font-semibold text-gray-800"
                  >
                    {statusCounts.noUpdate}
                  </motion.span>
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  <Progress
                    value={(statusCounts.noUpdate / totalTrips) * 100}
                    className="h-2 bg-gray-100 [&>div]:bg-red-500"
                  />
                </motion.div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-gray-500 mr-2"></div>
                    <span className="text-sm text-gray-600">Other</span>
                  </div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="font-semibold text-gray-800"
                  >
                    {totalTrips -
                      statusCounts.active -
                      statusCounts.onTime -
                      statusCounts.delayLessThan1Hr -
                      statusCounts.delayMoreThan1Hr -
                      statusCounts.noUpdate}
                  </motion.span>
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                >
                  <Progress
                    value={
                      ((totalTrips -
                        statusCounts.active -
                        statusCounts.onTime -
                        statusCounts.delayLessThan1Hr -
                        statusCounts.delayMoreThan1Hr -
                        statusCounts.noUpdate) /
                        totalTrips) *
                      100
                    }
                    className="h-2 bg-gray-100 [&>div]:bg-gray-500"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Activity Cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 100 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-5">
            <div className="flex items-center mb-4">
              <Activity className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Trip Activity</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm text-gray-600">Enroute to Loading</span>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {statusCounts.enrouteToLoading}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Truck className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">At Loading</span>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {statusCounts.atLoading}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                  <span className="text-sm text-gray-600">At Unloading</span>
                </div>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  {statusCounts.atUnloading}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-amber-600 mr-2" />
                  <span className="text-sm text-gray-600">Yet to Start</span>
                </div>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  {statusCounts.yetToStart}
                </Badge>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Alert Cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, type: "spring", stiffness: 100 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-5">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Trip Alerts</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-amber-600 mr-2" />
                  <span className="text-sm text-gray-600">Long Halt</span>
                </div>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  {statusCounts.longHalt}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-red-600 mr-2" />
                  <span className="text-sm text-gray-600">Continuous Driving</span>
                </div>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  {statusCounts.continuousDriving}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Route className="h-4 w-4 text-purple-600 mr-2" />
                  <span className="text-sm text-gray-600">Route Deviation</span>
                </div>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  {statusCounts.routeDeviation}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BarChart3 className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">Total Alerts</span>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {statusCounts.longHalt + statusCounts.continuousDriving + statusCounts.routeDeviation}
                </Badge>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
