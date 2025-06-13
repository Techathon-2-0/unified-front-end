import { motion, AnimatePresence } from "framer-motion"
import { Edit, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ViewDetailsProps } from "../../../types/geofence/ggroup_type"
import { getGeofenceTypeName } from "../../../data/geofence/ggroup"
import { formatDate } from "../../formatdate"

export function ViewDetails({ isOpen, onClose, group, geofenceData, onEdit }: ViewDetailsProps) {
  if (!group) return null

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
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden relative"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header section - already dark by default */}
              <div className="bg-gradient-to-r from-black via-gray-900 to-gray-800 text-white px-8 py-6 flex justify-between items-center rounded-t-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]"></div>
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-600 rounded-full opacity-20 blur-3xl"></div>

                <div className="relative">
                  <h2 className="text-2xl font-bold tracking-tight">{group.geo_group}</h2>
                  <p className="text-white text-sm mt-1 opacity-90">Group ID: {group.id}</p>
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
                  {/* Group Information */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Group Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Group Name</h4>
                        <p className="text-sm text-gray-900 dark:text-white">{group.geo_group}</p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Geofences</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                            {group.geofenceIds.length} Geofences
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Created On</h4>
                        <p className="text-sm text-gray-900 dark:text-white">{formatDate(group.created_at)}</p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Updated</h4>
                        <p className="text-sm text-gray-900 dark:text-white">{formatDate(group.updated_at)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Geofences */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assigned Geofences</h3>
                    <ScrollArea className="h-80">
                      <div className="space-y-2">
                        {group.geofenceIds.map((geofenceId) => {
                          const geofence = geofenceData.find((g) => g.id === geofenceId)
                          return (
                            <div
                              key={geofenceId}
                              className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors dark:bg-gray-800"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                      {geofence?.geofence_name || `Geofence ${geofenceId}`}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">ID: {geofence?.id || geofenceId}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Location ID: {geofence?.location_id || "Unknown"}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <Badge
                                      variant="outline"
                                      className={`${
                                        geofence?.geofence_type === 0
                                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                                          : geofence?.geofence_type === 2
                                            ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                                            : "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                                      }`}
                                    >
                                      {geofence ? getGeofenceTypeName(geofence.geofence_type) : "Unknown"}
                                    </Badge>
                                    <p
                                      className={`text-xs mt-1 ${geofence?.status ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                                    >
                                      {geofence?.status ? "Active" : "Inactive"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}

                        {(!group.geofenceIds || group.geofenceIds.length === 0) && (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <p className="text-sm">No geofences assigned to this group</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Total Geofences:</span>
                        <span className="ml-2 font-medium text-black dark:text-white">{group.geofenceIds.length}</span>
                      </div>
                    
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex flex-col sm:flex-row justify-between rounded-b-xl border-t border-gray-200 dark:border-gray-600 sticky bottom-0">
                <div></div>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      onEdit(group)
                    }}
                    className="px-5 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black dark:bg-gray-900 hover:bg-gray-700 dark:hover:bg-gray-800 focus:outline-none transition-colors flex items-center justify-center"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Group
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
