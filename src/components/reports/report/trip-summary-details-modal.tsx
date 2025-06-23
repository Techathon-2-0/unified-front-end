import { motion, AnimatePresence } from "framer-motion"
import { X, MapPin, Clock, User, Truck, Route, Eye } from "lucide-react"
import type { TripSummaryDetailsModalProps } from "../../../types/reports/report_type"

export function TripSummaryDetailsModal({ open, onClose, tripData }: TripSummaryDetailsModalProps) {
  if (!open || !tripData) return null

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
                <Route className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Trip Summary - {tripData.shipment_id}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {tripData.vehicle_number} • {tripData.stops.length} stops
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
            {/* Trip Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Truck className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <h4 className="font-medium text-gray-900 dark:text-white">Vehicle Info</h4>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="text-gray-600 dark:text-gray-400">Vehicle: {tripData.vehicle_number}</div>
                  <div className="text-gray-600 dark:text-gray-400">Status: {tripData.vehicle_status}</div>
                  <div className="text-gray-600 dark:text-gray-400">GPS Vendor: {tripData.gps_vendor}</div>
                  <div className="text-gray-600 dark:text-gray-400">GPS Type: {tripData.gps_type}</div>
                  <div className="text-gray-600 dark:text-gray-400">GPS Unit: {tripData.gps_unit_id}</div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Route className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <h4 className="font-medium text-gray-900 dark:text-white">Route Info</h4>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="text-gray-600 dark:text-gray-400">Route: {tripData.route_name}</div>
                  <div className="text-gray-600 dark:text-gray-400">From: {tripData.start_location}</div>
                  <div className="text-gray-600 dark:text-gray-400">To: {tripData.end_location}</div>
                  <div className="text-gray-600 dark:text-gray-400">Domain: {tripData.domain_name}</div>
                  <div className="text-gray-600 dark:text-gray-400">Source: {tripData.shipment_source}</div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <h4 className="font-medium text-gray-900 dark:text-white">Driver Info</h4>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="text-gray-600 dark:text-gray-400">Name: {tripData.driver_name || "N/A"}</div>
                  <div className="text-gray-600 dark:text-gray-400">Mobile: {tripData.driver_mobile || "N/A"}</div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Provider: {tripData.service_provider_alias_value}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <h4 className="font-medium text-gray-900 dark:text-white">Current Location</h4>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="text-gray-600 dark:text-gray-400 break-words">
                    {tripData.current_location_address}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">GPS: {tripData.gps_time}</div>
                  <div className="text-gray-600 dark:text-gray-400">GPRS: {tripData.gprs_time}</div>
                  <div className="text-gray-600 dark:text-gray-400">Duration: {tripData.vehicle_status_duration}</div>
                </div>
              </div>
            </div>

            {/* GPS & Tracking Info */}
            {tripData.intutrack_data && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tracking Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">GPS Frequency</div>
                    <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {tripData.gps_frequency}s
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Consent Status</div>
                    <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {tripData.intutrack_data.consent_status}
                    </div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Operator</div>
                    <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                      {tripData.intutrack_data.operator}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Trip Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{tripData.total_distance}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Distance (km)</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{tripData.covered_distance}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Covered Distance (km)</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{tripData.total_time}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Time</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {tripData.total_drive_time}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Drive Time</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{tripData.total_stoppage_time}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Stoppage Time</div>
              </div>
            </div>

            {/* Stops Information */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Stops Information</h4>
              {tripData.stops.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="rounded-full bg-slate-100 dark:bg-gray-700 p-3 mb-4">
                    <Eye className="h-8 w-8 text-slate-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Stops Found</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    No stop information is available for this trip.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-gray-200 dark:border-gray-700">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-900/50">
                        <th className="py-3 px-4 text-left border-b border-gray-200 dark:border-gray-700 font-medium text-gray-900 dark:text-white">
                          Sequence
                        </th>
                        <th className="py-3 px-4 text-left border-b border-gray-200 dark:border-gray-700 font-medium text-gray-900 dark:text-white">
                          Stop Type
                        </th>
                        <th className="py-3 px-4 text-left border-b border-gray-200 dark:border-gray-700 font-medium text-gray-900 dark:text-white">
                          Customer
                        </th>
                        <th className="py-3 px-4 text-left border-b border-gray-200 dark:border-gray-700 font-medium text-gray-900 dark:text-white">
                          Location
                        </th>
                        <th className="py-3 px-4 text-left border-b border-gray-200 dark:border-gray-700 font-medium text-gray-900 dark:text-white">
                          Timing
                        </th>
                        <th className="py-3 px-4 text-left border-b border-gray-200 dark:border-gray-700 font-medium text-gray-900 dark:text-white">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tripData.stops.map((stop, index) => (
                        <tr
                          key={`${stop.planned_sequence}-${index}`}
                          className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <td className="py-3 px-4">
                            <div className="text-gray-900 dark:text-white font-medium">
                              {stop.planned_sequence} → {stop.actual_sequence}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">LR: {stop.lr_number}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                stop.stop_type === "Pickup"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                  : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              }`}
                            >
                              {stop.stop_type}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-gray-900 dark:text-white font-medium">{stop.customer_name}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-start space-x-2">
                              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="text-gray-900 dark:text-white font-medium">{stop.location_name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                  {stop.stop_location_address}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  Entry: {stop.entry_time || "N/A"}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  Exit: {stop.exit_time || "N/A"}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Loading: {stop.loading_unloading_time}
                              </div>
                              {stop.detention_time && (
                                <div className="text-xs text-red-600 dark:text-red-400">
                                  Detention: {stop.detention_time}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                stop.status === "completed" || stop.status === "on_time"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : stop.status === "delayed"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                              }`}
                            >
                              {stop.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
