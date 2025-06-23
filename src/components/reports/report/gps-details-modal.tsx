import { motion, AnimatePresence } from "framer-motion"
import { X, MapPin, Clock, Zap, Battery, Power, Navigation, Eye } from "lucide-react"
import type { TripDetailsModalProps } from "../../../types/reports/report_type"

export function TripDetailsModal({ open, onClose, vehicleData }: TripDetailsModalProps) {
  if (!open || !vehicleData) return null

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  }

  const modalVariants = {
    hidden: { scale: 0.9, opacity: 0, y: 20 },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 25 },
    },
    exit: {
      scale: 0.9,
      opacity: 0,
      y: 20,
      transition: { duration: 0.2 },
    },
  }

  return (
    <AnimatePresence>
      <motion.div
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 bg-opacity-50"
        onClick={onClose}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Trail Points - {vehicleData.vehicleNumber}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {vehicleData.trailPoints.length} GPS points recorded
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {vehicleData.trailPoints.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-slate-100 dark:bg-gray-700 p-3 mb-4">
                  <Eye className="h-8 w-8 text-slate-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Trail Points Found</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  No GPS trail points were recorded for this vehicle in the selected time period.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 dark:border-gray-700">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50">
                      <th className="py-3 px-4 text-left border-b border-gray-200 dark:border-gray-700 font-medium text-gray-900 dark:text-white">
                        S.No
                      </th>
                      <th className="py-3 px-4 text-left border-b border-gray-200 dark:border-gray-700 font-medium text-gray-900 dark:text-white">
                        GPS Time
                      </th>
                      <th className="py-3 px-4 text-left border-b border-gray-200 dark:border-gray-700 font-medium text-gray-900 dark:text-white">
                        Location
                      </th>
                      <th className="py-3 px-4 text-left border-b border-gray-200 dark:border-gray-700 font-medium text-gray-900 dark:text-white">
                        Coordinates
                      </th>
                      <th className="py-3 px-4 text-left border-b border-gray-200 dark:border-gray-700 font-medium text-gray-900 dark:text-white">
                        Speed
                      </th>
                      <th className="py-3 px-4 text-left border-b border-gray-200 dark:border-gray-700 font-medium text-gray-900 dark:text-white">
                        Status
                      </th>
                      <th className="py-3 px-4 text-left border-b border-gray-200 dark:border-gray-700 font-medium text-gray-900 dark:text-white">
                        Technical Info
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicleData.trailPoints.map((point, index) => (
                      <tr
                        key={`${point.timestamp}-${index}`}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="py-3 px-4 text-center font-medium text-gray-900 dark:text-white">{index + 1}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="text-gray-900 dark:text-white font-medium">{point.gpsTime || "N/A"}</div>
                              {point.gprsTime && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">GPRS: {point.gprsTime}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-start space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="max-w-xs">
                              <div
                                className="text-gray-900 dark:text-white text-sm leading-relaxed break-words"
                                title={point.address}
                              >
                                {point.address}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-xs font-mono text-gray-600 dark:text-gray-400">
                            <div>{point.latitude.toFixed(6)}</div>
                            <div>{point.longitude.toFixed(6)}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1">
                            <div className="text-gray-900 dark:text-white font-medium">{point.speed} km/h</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1">
                              <Zap className="h-3 w-3 text-gray-400" />
                              <span
                                className={`text-xs font-medium ${
                                  point.ignitionStatus === "ON"
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                {point.ignitionStatus}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Navigation className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-600 dark:text-gray-400">{point.heading}°</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1">
                              <Power className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-600 dark:text-gray-400">{point.power}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Battery className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-600 dark:text-gray-400">{point.battery}</span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{point.vendor}</div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
