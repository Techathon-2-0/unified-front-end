import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronDown,
  X,
  AlertTriangle,
  MapPin,
  Users,
  Layers,
  Activity,
  Bell,
  Filter,
  Search,
  CheckCircle2,
  Circle,
} from "lucide-react"

import type { AlarmFilterBarProps, AlarmFilters } from "../../../types/alarm/aconfig_type"
import type { CustomerGroup } from "@/types/manage/customergroup_type"
import type { Group } from "@/types/manage/group_type"
import type { GeofenceGroup } from "@/types/geofence/ggroup_type"
import { fetchCustomerGroups } from "@/data/manage/customergroup"
import { fetchGroups } from "@/data/manage/group"
import { fetchGeofenceGroups } from "@/data/geofence/ggroup"

// Data fetching functions
// export const fetchCustomerGroups = async (): Promise<CustomerGroup[]> => {
//   try {
//     const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/customer-group`)
//     const groups = response.data.data || []

//     return groups.map((group: any) => ({
//       id: group.id,
//       group_name: group.group_name,
//       customerIds: group.customers ? group.customers.map((customer: any) => customer.id) : [],
//       created_at: group.created_at,
//       updated_at: group.updated_at,
//     }))
//   } catch (error) {
//     console.error("Error fetching customer groups:", error)
//     throw error
//   }
// }

// export const fetchGroups = async (): Promise<Group[]> => {
//   try {
//     const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/groups`)
//     const groups = response.data.data || []

//     return groups.map((group: any) => ({
//       id: group.id,
//       name: group.group_name,
//       entityIds: group.entities ? group.entities.map((entity: any) => entity.id) : [],
//       createdOn: group.created_at,
//       updatedOn: group.updated_at,
//     }))
//   } catch (error) {
//     console.error("Error fetching groups:", error)
//     throw error
//   }
// }

// export const fetchGeofenceGroups = async (): Promise<GeofenceGroup[]> => {
//   try {
//     const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/geofence-group`)
//     const groups = response.data.data || []

//     return groups.map((group: any) => ({
//       id: typeof group.id === "object" ? group.id.id : group.id,
//       geo_group: group.geo_group,
//       geofenceIds: group.geofences?.map((g: any) => g.id) || [],
//       created_at: group.created_at,
//       updated_at: group.updated_at,
//       geofences: group.geofences || [],
//     }))
//   } catch (error) {
//     console.error("Error fetching geofence groups:", error)
//     throw error
//   }
// }

export const AlarmFilterBar = ({
  totalCount,
  onFilterChange,
  availableAlarmTypes,
  availableSeverityTypes,
}: Omit<AlarmFilterBarProps, 'availableVehicleGroups' | 'availableCustomerGroups' | 'availableGeofenceGroups'>) => {
  const [filters, setFilters] = useState<AlarmFilters>({
    alarmTypes: [],
    vehicleGroups: [],
    customerGroups: [],
    geofenceGroups: [],
    statuses: [],
    severityTypes: [],
  })

  // Data state
  const [vehicleGroups, setVehicleGroups] = useState<Group[]>([])
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([])
  const [geofenceGroups, setGeofenceGroups] = useState<GeofenceGroup[]>([])
  const [loading, setLoading] = useState(true)

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const dropdownRef = useRef<HTMLDivElement | null>(null)

  // Fetch data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true)
      try {
        const [vehicleData, customerData, geofenceData] = await Promise.all([
          fetchGroups(),
          fetchCustomerGroups(),
          fetchGeofenceGroups(),
        ])

        setVehicleGroups(vehicleData)
        setCustomerGroups(customerData)
        setGeofenceGroups(geofenceData)
      } catch (err) {
        console.error("Error fetching filter data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [activeDropdown])

  useEffect(() => {
    onFilterChange(filters)
  }, [filters, onFilterChange])

  const toggleDropdown = () => {
    setActiveDropdown(activeDropdown ? null : "filters")
  }

  const toggleFilter = (filterType: keyof AlarmFilters, value: string) => {
    setFilters((prev) => {
      const currentValues = prev[filterType]
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value]

      return {
        ...prev,
        [filterType]: newValues,
      }
    })
  }

  const clearFilters = (filterType: keyof AlarmFilters) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: [],
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      alarmTypes: [],
      vehicleGroups: [],
      customerGroups: [],
      geofenceGroups: [],
      statuses: [],
      severityTypes: [],
    })
    setSearchQuery("")
  }

  const getFilterCount = () => {
    return Object.values(filters).reduce((count, filterArray) => count + filterArray.length, 0)
  }

  const getActiveFiltersText = () => {
    const activeFilters: string[] = []

    if (filters.alarmTypes.length) activeFilters.push(`${filters.alarmTypes.length} Alarm Types`)
    if (filters.vehicleGroups.length) activeFilters.push(`${filters.vehicleGroups.length} Vehicle Groups`)
    if (filters.customerGroups.length) activeFilters.push(`${filters.customerGroups.length} Customer Groups`)
    if (filters.geofenceGroups.length) activeFilters.push(`${filters.geofenceGroups.length} Geofence Groups`)
    if (filters.statuses.length) activeFilters.push(`${filters.statuses.length} Statuses`)
    if (filters.severityTypes.length) activeFilters.push(`${filters.severityTypes.length} Severity Types`)

    return activeFilters.join(", ")
  }

  const filterOptions = [
    {
      type: "alarmTypes",
      label: "Alarm Type",
      icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
      options: availableAlarmTypes || [],
      color: "amber",
    },
    {
      type: "vehicleGroups",
      label: "Vehicle Group",
      icon: <Layers className="h-4 w-4 text-blue-500" />,
      options: vehicleGroups.map((group) => group.name || `Group ${group.id}`),
      color: "blue",
    },
    {
      type: "customerGroups",
      label: "Customer Group",
      icon: <Users className="h-4 w-4 text-purple-500" />,
      options: customerGroups.map((group) => group.group_name || `Group ${group.id}`),
      color: "purple",
    },
    {
      type: "geofenceGroups",
      label: "Geofence Group",
      icon: <MapPin className="h-4 w-4 text-green-500" />,
      options: geofenceGroups.map((group) => group.geo_group || `Group ${group.id}`),
      color: "green",
    },
    {
      type: "statuses",
      label: "Status",
      icon: <Bell className="h-4 w-4 text-red-500" />,
      options: ["Active", "Inactive"],
      color: "red",
    },
    {
      type: "severityTypes",
      label: "Severity",
      icon: <Activity className="h-4 w-4 text-orange-500" />,
      options: availableSeverityTypes || [],
      color: "orange",
    },
  ]

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        {/* Left Section - Count and Active Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="h-9 bg-gradient-to-r from-red-400 to-[#d5233b] text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm"
          >
            
              {/* <Bell className="h-4 w-4" /> */}
              <span>Total Alarms: {totalCount}</span>
          

            {/* {loading && (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading filters...</span>
              </div>
            )} */}

            {/* {error && (
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
                <button
                  onClick={refreshData}
                  className="text-red-600 hover:text-red-800 underline text-sm"
                >
                  Retry
                </button>
              </div>
            )} */}
          </motion.div>

          {getFilterCount() > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-2"
            >
              <div className="text-sm text-gray-600 dark:text-gray-300 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-md">
                <span className="font-medium">{getFilterCount()} filters active:</span>
                <span className="ml-1 text-xs">{getActiveFiltersText()}</span>
              </div>
              <button
                onClick={clearAllFilters}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <X className="h-3 w-3" />
                Clear All
              </button>
            </motion.div>
          )}
        </div>

        {/* Right Section - Filter Button */}
        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center gap-2">
            {/* <button
              onClick={refreshData}
              disabled={refreshing || loading}
              className="h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Refresh filter data"
            >
              <RefreshCw className={`h-4 w-4 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button> */}

            <button
              className={`h-10 flex items-center gap-3 px-4 py-2 border rounded-lg font-medium transition-all duration-200 ${getFilterCount() > 0
                  ? "bg-red-600 hover:bg-red-700 border-red-600 text-white shadow-md"
                  : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              onClick={toggleDropdown}
              disabled={loading}
            >
              <Filter className="h-4 w-4" />
              <span>
                {getFilterCount() === 0 ? "Add Filters" : `${getFilterCount()} Active`}
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${activeDropdown === "filters" ? "rotate-180" : ""}`} />
            </button>
          </div>

          <AnimatePresence>
            {activeDropdown === "filters" && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute left-2 right-2 sm:left-auto sm:right-10 mt-2 w-auto sm:w-[400px] max-w-[400px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden max-h-[80vh] flex flex-col"
              >
                {/* Header */}
                <div className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                      <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 dark:text-gray-200" />
                      Filter Alarms
                    </h3>
                    <div className="flex items-center gap-2">
                      {getFilterCount() > 0 && (
                        <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-md text-xs font-medium">
                          {getFilterCount()} active
                        </span>
                      )}
                      <button
                        onClick={clearAllFilters}
                        className="text-xs sm:text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search filter options..."
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Filter Options */}
                <div className="p-3 sm:p-4 overflow-y-auto bg-white dark:bg-gray-800 flex-1 min-h-0 max-h-70">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {filterOptions.map((filterOption) => {
                      const filteredOptions = filterOption.options.filter((option) =>
                        option.toLowerCase().includes(searchQuery.toLowerCase()),
                      )

                      if (filteredOptions.length === 0 && searchQuery) {
                        return null
                      }

                      const selectedCount = filters[filterOption.type as keyof AlarmFilters].length

                      return (
                        <div key={filterOption.type} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              {filterOption.icon}
                              <span>{filterOption.label}</span>
                              {selectedCount > 0 && (
                                <span className={`bg-${filterOption.color}-100 dark:bg-${filterOption.color}-900 text-${filterOption.color}-800 dark:text-${filterOption.color}-200 px-2 py-0.5 rounded-full text-xs font-medium`}>
                                  {selectedCount}
                                </span>
                              )}
                            </h4>
                            {selectedCount > 0 && (
                              <button
                                onClick={() => clearFilters(filterOption.type as keyof AlarmFilters)}
                                className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 font-medium"
                              >
                                Clear
                              </button>
                            )}
                          </div>

                          <div className="space-y-1 max-h-32 sm:max-h-40 overflow-y-auto pr-2 custom-scrollbar bg-white dark:bg-gray-800">
                            {filteredOptions.length === 0 ? (
                              <p className="text-xs text-gray-500 dark:text-gray-400 py-2 text-center italic">
                                No options available
                              </p>
                            ) : (
                              filteredOptions.map((option) => {
                                const isSelected = filters[filterOption.type as keyof AlarmFilters].includes(option)
                                return (
                                  <label
                                    key={`${filterOption.type}-${option}`}
                                    className="flex items-center space-x-3 py-2 px-2 sm:px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors group"
                                  >
                                    <div className="relative">
                                      {isSelected ? (
                                        <CheckCircle2 className={`h-4 w-4 text-${filterOption.color}-600 dark:text-${filterOption.color}-400`} />
                                      ) : (
                                        <Circle className="h-4 w-4 text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                                      )}
                                    </div>
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleFilter(filterOption.type as keyof AlarmFilters, option)}
                                      className="sr-only"
                                    />
                                    <span className={`text-sm flex-1 ${isSelected ? `text-${filterOption.color}-700 dark:text-${filterOption.color}-300 font-medium` : 'text-gray-700 dark:text-gray-300'}`}>
                                      {option}
                                    </span>
                                  </label>
                                )
                              })
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {getFilterCount() === 0 ? "No filters applied" : `${getFilterCount()} filters will be applied`}
                    </span>
                    {/* <button
            onClick={() => setActiveDropdown(null)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Apply Filters
          </button> */}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.8);
        }
      `}</style>
    </div>
  )
}