import { motion, AnimatePresence } from "framer-motion"
import { Layers, Users, MapPin, X, Mail, Phone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ViewAssignedGroupsModalProps } from "../../../types/alarm/aconfig_type"
import { useEffect, useState } from "react"

export const ViewAssignedGroupsModal = ({
  isOpen,
  onClose,
  alarm,
  vehicleGroups = [],
  customerGroups = [],
  geofenceGroups = [],
}: ViewAssignedGroupsModalProps) => {
  const [vehicleGroupNames, setVehicleGroupNames] = useState<string[]>([])
  const [customerGroupNames, setCustomerGroupNames] = useState<string[]>([])
  const [geofenceGroupNames, setGeofenceGroupNames] = useState<string[]>([])

  useEffect(() => {
    if (alarm) {
      // Map vehicle group IDs to names
      const vGroupNames = (alarm.vehicleGroups || []).map((id) => {
        const group = vehicleGroups.find((g) => Number(g.id) === Number(id))
        return group ? group.name : `Vehicle Group ${id}`
      })
      setVehicleGroupNames(vGroupNames)

      // Map customer group IDs to names
      const cGroupNames = (alarm.customerGroups || []).map((id) => {
        const group = customerGroups.find((g) => Number(g.id) === Number(id))
        return group ? group.group_name : `Customer Group ${id}`
      })
      setCustomerGroupNames(cGroupNames)

      // Map geofence group IDs to names
      const gGroupNames = (alarm.geofenceGroups || []).map((id) => {
        const group = geofenceGroups.find((g) => Number(g.id) === Number(id))
        return group ? group.geo_group : `Geofence Group ${id}`
      })
      setGeofenceGroupNames(gGroupNames)
    }
  }, [alarm, vehicleGroups, customerGroups, geofenceGroups])

  if (!alarm) return null

  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      y: 50,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.2,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  }

  const totalGroups = vehicleGroupNames.length + customerGroupNames.length + geofenceGroupNames.length
  const totalRecipients = (alarm.emails?.length || 0) + (alarm.phoneNumbers?.length || 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <motion.div
            className="fixed inset-0 bg-black/50 bg-opacity-50"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          <div className="flex items-center justify-center min-h-screen p-4">
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden relative"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Enhanced Header section */}
              <div className="bg-gradient-to-r from-black via-gray-900 to-gray-800 text-white px-8 py-6 flex justify-between items-center rounded-t-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]"></div>
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-600 rounded-full opacity-20 blur-3xl"></div>

                <div className="relative">
                  <h2 className="text-2xl font-bold tracking-tight">Assigned Groups</h2>
                  <p className="text-white text-sm mt-1 opacity-90">Alarm: {alarm.type || 'Unnamed Alarm'}</p>
                </div>

                <button
                  onClick={onClose}
                  className="relative text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)] pb-20 sm:pb-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  {/* Summary Card */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assignment Summary</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Groups</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                            {totalGroups} Groups
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Recipients</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                            {totalRecipients} Recipients
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Groups */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Layers className="h-5 w-5 mr-2 text-blue-500" />
                      Vehicle Groups
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      {vehicleGroupNames.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {vehicleGroupNames.map((name, index) => (
                            <motion.div
                              key={`vehicle-${index}`}
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-3 py-2 rounded-full text-xs border border-blue-200 dark:border-blue-800 font-medium"
                            >
                              {name}
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          <p className="text-sm">No vehicle groups assigned</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Customer Groups */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-purple-500" />
                      Customer Groups
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      {customerGroupNames.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {customerGroupNames.map((name, index) => (
                            <motion.div
                              key={`customer-${index}`}
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className="bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 px-3 py-2 rounded-full text-xs border border-purple-200 dark:border-purple-800 font-medium"
                            >
                              {name}
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          <p className="text-sm">No customer groups assigned</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Geofence Groups */}
                  {alarm.enableGeofence && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-green-500" />
                        Geofence Groups
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        {geofenceGroupNames.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {geofenceGroupNames.map((name, index) => (
                              <motion.div
                                key={`geofence-${index}`}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-3 py-2 rounded-full text-xs border border-green-200 dark:border-green-800 font-medium"
                              >
                                {name}
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                            <p className="text-sm">No geofence groups assigned</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notification Recipients */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Recipients</h3>
                    <ScrollArea className="max-h-60">
                      <div className="space-y-4">
                        {/* Email Recipients */}
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-amber-500" />
                            Email Addresses
                          </h4>
                          {alarm.emails && alarm.emails.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {alarm.emails.map((email, index) => (
                                <motion.div
                                  key={`email-${index}`}
                                  initial={{ scale: 0.9, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-3 py-2 rounded-full text-xs border border-amber-200 dark:border-amber-800 font-medium"
                                >
                                  {email}
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-2 text-gray-500 dark:text-gray-400">
                              <p className="text-sm">No email recipients</p>
                            </div>
                          )}
                        </div>

                        {/* Phone Recipients */}
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 mb-4">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-teal-500" />
                            Phone Numbers
                          </h4>
                          {alarm.phoneNumbers && alarm.phoneNumbers.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {alarm.phoneNumbers.map((phone, index) => (
                                <motion.div
                                  key={`phone-${index}`}
                                  initial={{ scale: 0.9, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 px-3 py-2 rounded-full text-xs border border-teal-200 dark:border-teal-800 font-medium"
                                >
                                  {phone}
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-2 text-gray-500 dark:text-gray-400">
                              <p className="text-sm">No phone recipients</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </ScrollArea>
                  </div>
                </motion.div>
              </div>

              {/* Enhanced Footer */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end rounded-b-xl border-t border-gray-200 dark:border-gray-600 sticky bottom-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}