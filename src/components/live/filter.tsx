import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, ChevronDown, X } from "lucide-react"
import type { FilterBarProps, Vehicle } from "../../types/live/list_type"
import { fetchGroupsbyuserId } from "../../data/manage/group" // Updated import
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "../../context/AuthContext" // Adjust path as needed
import type { Group } from "../../types/manage/group_type" // Adjust path as needed

interface UpdatedFilterBarProps extends Omit<FilterBarProps, 'onExport'> {
  onExport: (format: "csv" | "pdf") => void
  filteredVehicles: Vehicle[] // Add filtered vehicles data
}

const FilterBar = ({
  totalCount,
  filters,
  onFilterChange,
  // onExport,
  vehicleCounts,
  filteredVehicles,
}: UpdatedFilterBarProps) => {
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [showGroupOptions, setShowGroupOptions] = useState(false)
  const [showStatusOptions, setShowStatusOptions] = useState(false)
  const [showTripOptions, setShowTripOptions] = useState(false) // Trip filter state
  const [groupsData, setGroupsData] = useState<Group[]>([]) // State for groups data
  const [isLoadingGroups, setIsLoadingGroups] = useState(false) // Loading state
  const { showSuccessToast, showErrorToast, Toaster } = useToast({ position: "top-right", });
  const { user } = useAuth() // Get user from Auth context

  // Track selected options for multi-select
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedTripStatuses, setSelectedTripStatuses] = useState<string[]>([]) // Trip status state

  // Refs for dropdown containers
  const exportRef = useRef<HTMLDivElement>(null)
  const groupRef = useRef<HTMLDivElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)

  // Fetch groups data on component mount
  useEffect(() => {
    const loadGroups = async () => {
      setIsLoadingGroups(true)
      try {
        const groups = await fetchGroupsbyuserId(user?.id || 0) // Fetch groups for the current user
        setGroupsData(groups.map((g: any) => ({
          ...g,
          id: String(g.id),
        })))
      } catch (error) {
        console.error("Failed to fetch groups:", error)
        showErrorToast("Failed to load groups data", "")
      } finally {
        setIsLoadingGroups(false)
      }
    }

    loadGroups()
  }, [showErrorToast])

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setShowExportOptions(false)
      }
      if (groupRef.current && !groupRef.current.contains(event.target as Node)) {
        setShowGroupOptions(false)
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setShowStatusOptions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Initialize selected filters from props
  useEffect(() => {
    if (filters.group) {
      if (Array.isArray(filters.group)) {
        setSelectedGroups(filters.group)
      } else if (typeof filters.group === "string" && filters.group !== "") {
        setSelectedGroups([filters.group])
      } else {
        setSelectedGroups([])
      }
    }

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        setSelectedStatuses(filters.status)
      } else if (typeof filters.status === "string" && filters.status !== "") {
        setSelectedStatuses([filters.status])
      } else {
        setSelectedStatuses([])
      }
    }

    if (filters.type) {
      if (Array.isArray(filters.type)) {
        setSelectedTypes(filters.type)
      } else if (typeof filters.type === "string" && filters.type !== "") {
        setSelectedTypes([filters.type])
      } else {
        setSelectedTypes([])
      }
    }
  }, [])

  // Handle export functionality
  const handleExport = (format: "csv" | "pdf") => {
    try {
      if (!filteredVehicles || filteredVehicles.length === 0) {
        showErrorToast("No vehicles data available to export", "")
        return
      }

      const data = filteredVehicles.map((vehicle) => ({
        "Vehicle ID": vehicle.id,
        "Vehicle Number": vehicle.vehicleNumber,
        "Device Name": vehicle.deviceName,
        "Type": vehicle.type,
        "Status": vehicle.status,
        // "Altitude": `${vehicle.altitude||0} m`,
        "Speed": `${vehicle.speed} km/h`,
        //"Address": vehicle.address,
        "Driver Name": vehicle.driverName,
        "Driver Mobile": vehicle.driverMobile,
        "Vendor Name": vehicle.vendorName,
        "Group": Array.isArray(vehicle.group) ? vehicle.group.join(", ") : vehicle.group,
        "GPS Time": vehicle.gpsTime,
        "GPRS Time": vehicle.gprsTime,
        "Distance": vehicle.distance,
        "Ignition Status": vehicle.ignitionStatus,
        "Power": vehicle.power,
        "Battery": vehicle.battery,
        "Last Alarm": vehicle.lastAlarm,
        "Coordinates": `${vehicle.lat}, ${vehicle.lng}`
      }))

      if (format === "csv") {
        const csv = [
          Object.keys(data[0]).join(","),
          ...data.map((row) =>
            Object.values(row).map(value => {
              // Handle null/undefined values
              if (value === null || value === undefined) {
                return ''
              }

              // Convert to string and handle special characters
              const stringValue = String(value)

              // If value contains comma, newline, or quotes, wrap in quotes and escape internal quotes
              if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
                return `"${stringValue.replace(/"/g, '""')}"`
              }

              return stringValue
            }).join(",")
          )
        ].join("\n")

        const blob = new Blob([csv], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `vehicles_${new Date().toISOString().split("T")[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)

        showSuccessToast("CSV file downloaded successfully", "")
      } else {
        // Generate PDF using browser print
        const printWindow = window.open("", "_blank")
        if (printWindow) {
          const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Vehicles Report</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                th, td { border: 1px solid #ddd; padding: 6px; text-align: left; word-wrap: break-word; }
                th { background-color: #f2f2f2; font-weight: bold; }
                h1 { color: #d5233b; margin-bottom: 10px; }
                .summary { margin-bottom: 20px; }
                @media print {
                  body { margin: 0; }
                  table { page-break-inside: auto; }
                  tr { page-break-inside: avoid; page-break-after: auto; }
                }
              </style>
            </head>
            <body>
              <h1>Vehicles Report</h1>
              <div class="summary">
                <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Total Vehicles:</strong> ${data.length}</p>
                <p><strong>Applied Filters:</strong> ${[
              selectedGroups.length > 0 ? `Groups: ${selectedGroups.join(', ')}` : '',
              selectedStatuses.length > 0 ? `Status: ${selectedStatuses.join(', ')}` : '',
              selectedTypes.length > 0 ? `Types: ${selectedTypes.join(', ')}` : '',
              filters.search ? `Search: "${filters.search}"` : ''
            ].filter(Boolean).join(' | ') || 'None'
            }</p>
              </div>
              <table>
                <thead>
                  <tr>
                    ${Object.keys(data[0])
              .map((key) => `<th>${key}</th>`)
              .join("")}
                  </tr>
                </thead>
                <tbody>
                  ${data
              .map(
                (row) =>
                  `<tr>${Object.values(row)
                    .map((value) => {
                      // Handle null/undefined and array values for PDF
                      if (value === null || value === undefined) {
                        return '<td>-</td>'
                      }
                      return `<td>${String(value)}</td>`
                    })
                    .join("")}</tr>`,
              )
              .join("")}
                </tbody>
              </table>
            </body>
          </html>
        `
          printWindow.document.write(htmlContent)
          printWindow.document.close()
          printWindow.print()
          printWindow.close()

          showSuccessToast("PDF downloaded successfully", "")
        } else {
          showErrorToast("Failed to open print window. Please check if popups are blocked.", "")
        }
      }

      setShowExportOptions(false)
    } catch (error) {
      //console.error("Export error:", error)
      showErrorToast("Failed to export vehicles data. Please try again.", "")
    }
  }

  // Handle group selection
  const handleGroupSelect = (group: string) => {
    let newGroups: string[]

    if (selectedGroups.includes(group)) {
      newGroups = selectedGroups.filter((g) => g !== group)
    } else {
      newGroups = [...selectedGroups, group]
    }

    setSelectedGroups(newGroups)
    onFilterChange({ group: newGroups.length ? newGroups.join(",") : "" })
    setShowGroupOptions(false) // Close dropdown after selection
  }

  // Handle status selection
  const handleStatusSelect = (status: string) => {
    let newStatuses: string[]

    if (selectedStatuses.includes(status)) {
      newStatuses = selectedStatuses.filter((s) => s !== status)
    } else {
      newStatuses = [...selectedStatuses, status]
    }

    setSelectedStatuses(newStatuses)
    onFilterChange({ status: newStatuses.length ? newStatuses.join(",") : "" })
    setShowStatusOptions(false) // Close dropdown after selection
  }

  // Handle type selection
  const handleTypeSelect = (type: string) => {
    let newTypes: string[]

    if (selectedTypes.includes(type)) {
      newTypes = selectedTypes.filter((t) => t !== type)
    } else {
      newTypes = [...selectedTypes, type]
    }

    setSelectedTypes(newTypes)
    onFilterChange({ type: newTypes.length ? newTypes.join(",") : "" })
  }

  // Handle Trip status selection
  const handleTripStatusSelect = (status: string) => {
    let newTrips: string[]
    if (selectedTripStatuses.includes(status)) {
      newTrips = selectedTripStatuses.filter((s) => s !== status)
    } else {
      newTrips = [...selectedTripStatuses, status]
    }
    setSelectedTripStatuses(newTrips)
    onFilterChange({ trip: newTrips.length ? newTrips.join(",") : "" })
    setShowTripOptions(false)
  }

  // Filter vehicles according to intersection of selected groups, vendor name, and trip status
  // const getFilteredVehicles = () => {
  //   let result = filteredVehicles

  //   // Group filter (intersection)
  //   if (selectedGroups.length > 0) {
  //     result = result.filter((vehicle) => {
  //       if (!Array.isArray(vehicle.group)) return false
  //       // Intersection: vehicle.group must include ALL selectedGroups
  //       return selectedGroups.every((g) => vehicle.group.includes(g))
  //     })
  //   }

  //   // Vendor name search (case-insensitive)
  //   if (filters.search && filters.search.trim() !== "") {
  //     const searchLower = filters.search.toLowerCase()
  //     result = result.filter(
  //       (vehicle) =>
  //         (vehicle.vendorName && vehicle.vendorName.toLowerCase().includes(searchLower)) ||
  //         // ...existing search logic...
  //         false // placeholder, actual search logic is elsewhere
  //     )
  //   }

  //   // Trip filter
  //   if (selectedTripStatuses.length > 0) {
  //     result = result.filter((vehicle) => {
  //       // Assume vehicle.tripStatus is "Active" or "Inactive"
  //       return selectedTripStatuses.includes(vehicle.trip_status)
  //     })
  //   }

  //   return result
  // }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 md:p-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="flex items-center">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="h-9 bg-gradient-to-r from-red-400 to-[#d5233b] text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm"
          >
            Total Count: {totalCount}
          </motion.div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative" ref={exportRef}>
            <button
              className="h-9 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm transition-all hover:shadow"
              onClick={() => setShowExportOptions(!showExportOptions)}
            >
              Export <ChevronDown className={`h-4 w-4 transition-transform ${showExportOptions ? "rotate-180" : ""}`} />
            </button>
            {showExportOptions && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute left-0 mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50"
              >
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
                  onClick={() => handleExport("csv")}
                >
                  Export as CSV
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
                  onClick={() => handleExport("pdf")}
                >
                  Export as PDF
                </button>
              </motion.div>
            )}
          </div>

          <div className="relative" ref={groupRef}>
            <button
              className={`h-9 flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all hover:shadow ${selectedGroups.length > 0
                ? "bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-800 text-[#d5233b] dark:text-red-400"
                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                }`}
              onClick={() => setShowGroupOptions(!showGroupOptions)}
              disabled={isLoadingGroups}
            >
              {isLoadingGroups ? "Loading..." : `Group ${selectedGroups.length > 0 ? `(${selectedGroups.length})` : ""}`}
              <ChevronDown className={`h-4 w-4 transition-transform ${showGroupOptions ? "rotate-180" : ""}`} />
            </button>
            {showGroupOptions && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-y-hidden absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50"
              >
                <div className="py-1">
                  {isLoadingGroups ? (
                    <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-center">Loading groups...</div>
                  ) : groupsData.length === 0 ? (
                    <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-center">No groups available</div>
                  ) : (
                    groupsData.map((group) => (
                      <button
                        key={group.id}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 flex items-center justify-between"
                        onClick={() => handleGroupSelect(group.name)}
                      >
                        <span>{group.name}</span>
                        {selectedGroups.includes(group.name) && <span className="text-[#d5233b] dark:text-red-400">✓</span>}
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </div>

          <div className="relative" ref={statusRef}>
            <button
              className={`h-9 flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all hover:shadow ${selectedStatuses.length > 0
                ? "bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-800 text-[#d5233b] dark:text-red-400"
                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                }`}
              onClick={() => setShowStatusOptions(!showStatusOptions)}
            >
              Status {selectedStatuses.length > 0 && `(${selectedStatuses.length})`}
              <ChevronDown className={`h-4 w-4 transition-transform ${showStatusOptions ? "rotate-180" : ""}`} />
            </button>
            {showStatusOptions && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute left-0 mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50"
              >
                <div className="py-1">
                  {["Active", "No Update", "No Data"].map((status) => (
                    <button
                      key={status}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 flex items-center justify-between"
                      onClick={() => handleStatusSelect(status)}
                    >
                      <span>{status}</span>
                      {selectedStatuses.includes(status) && <span className="text-[#d5233b] dark:text-red-400">✓</span>}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Trip Filter */}
          <div className="relative">
            <button
              className={`h-9 flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all hover:shadow ${selectedTripStatuses.length > 0
                  ? "bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-800 text-[#d5233b] dark:text-red-400"
                  : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                }`}
              onClick={() => setShowTripOptions(!showTripOptions)}
            >
              Trip {selectedTripStatuses.length > 0 && `(${selectedTripStatuses.length})`}
              <ChevronDown className={`h-4 w-4 transition-transform ${showTripOptions ? "rotate-180" : ""}`} />
            </button>
            {showTripOptions && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50"
              >
                <div className="py-1">
                  {["Active", "Inactive"].map((status) => (
                    <button
                      key={status}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 flex items-center justify-between"
                      onClick={() => handleTripStatusSelect(status)}
                    >
                      <span>{status}</span>
                      {selectedTripStatuses.includes(status) && <span className="text-[#d5233b] dark:text-red-400">✓</span>}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="relative flex-1 min-w-[240px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full h-9 pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none shadow-sm"
              placeholder="Search devices..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Selected filters display */}
      {(selectedGroups.length > 0 || selectedStatuses.length > 0 || selectedTypes.length > 0 || selectedTripStatuses.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">Active filters:</div>
          {selectedGroups.map((group) => (
            <motion.div
              key={`group-${group}`}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-red-50 dark:bg-red-900/30 text-[#d5233b] dark:text-red-400 px-2 py-1 rounded-md text-sm flex items-center gap-1"
            >
              <span>Group: {group}</span>
              <button onClick={() => handleGroupSelect(group)} className="text-red-500 dark:text-red-400 hover:text-[#d5233b] dark:hover:text-red-300">
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
          {selectedStatuses.map((status) => (
            <motion.div
              key={`status-${status}`}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-red-50 dark:bg-red-900/30 text-[#d5233b] dark:text-red-400 px-2 py-1 rounded-md text-sm flex items-center gap-1"
            >
              <span>Status: {status}</span>
              <button onClick={() => handleStatusSelect(status)} className="text-red-500 dark:text-red-400 hover:text-[#d5233b] dark:hover:text-red-300">
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
          {selectedTripStatuses.map((trip) => (
            <motion.div
              key={`trip-${trip}`}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-red-50 dark:bg-red-900/30 text-[#d5233b] dark:text-red-400 px-2 py-1 rounded-md text-sm flex items-center gap-1"
            >
              <span>Trip: {trip}</span>
              <button onClick={() => handleTripStatusSelect(trip)} className="text-red-500 dark:text-red-400 hover:text-[#d5233b] dark:hover:text-red-300">
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
          {selectedTypes.map((type) => (
            <motion.div
              key={`type-${type}`}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-red-50 dark:bg-red-900/30 text-[#d5233b] dark:text-red-400 px-2 py-1 rounded-md text-sm flex items-center gap-1"
            >
              <span>Type: {type}</span>
              <button onClick={() => handleTypeSelect(type)} className="text-red-500 dark:text-red-400 hover:text-[#d5233b] dark:hover:text-red-300">
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedTypes.includes("Car")
            ? "bg-gradient-to-r from-red-500 to-[#d5233b] text-white shadow-md"
            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          onClick={() => handleTypeSelect("Car")}
        >
          Car{" "}
          <span
            className={`ml-1 ${selectedTypes.includes("Car") ? "bg-red-400 text-white" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"} px-1.5 py-0.5 rounded-full text-xs`}
          >
            {vehicleCounts.car}
          </span>
        </motion.button>
        {/* <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            selectedTypes.includes("Person")
              ? "bg-gradient-to-r from-red-500 to-[#d5233b] text-white shadow-md"
              : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
          onClick={() => handleTypeSelect("Person")}
        >
          Person{" "}
          <span
            className={`ml-1 ${selectedTypes.includes("Person") ? "bg-red-400 text-white" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"} px-1.5 py-0.5 rounded-full text-xs`}
          >
            {vehicleCounts.person}
          </span>
        </motion.button> */}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedTypes.includes("Truck")
            ? "bg-gradient-to-r from-red-500 to-[#d5233b] text-white shadow-md"
            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          onClick={() => handleTypeSelect("Truck")}
        >
          Truck{" "}
          <span
            className={`ml-1 ${selectedTypes.includes("Truck") ? "bg-red-400 text-white" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"} px-1.5 py-0.5 rounded-full text-xs`}
          >
            {vehicleCounts.truck}
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedTypes.includes("Excavator")
            ? "bg-gradient-to-r from-red-500 to-[#d5233b] text-white shadow-md"
            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          onClick={() => handleTypeSelect("Excavator")}
        >
          Excavator{" "}
          <span
            className={`ml-1 ${selectedTypes.includes("Excavator") ? "bg-red-400 text-white" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"} px-1.5 py-0.5 rounded-full text-xs`}
          >
            {vehicleCounts.excavator}
          </span>
        </motion.button>
        {/* <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            selectedTypes.includes("Street Light")
              ? "bg-gradient-to-r from-red-500 to-[#d5233b] text-white shadow-md"
              : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
          onClick={() => handleTypeSelect("Street Light")}
        >
          Street Light{" "}
          <span
            className={`ml-1 ${selectedTypes.includes("Street Light") ? "bg-red-400 text-white" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"} px-1.5 py-0.5 rounded-full text-xs`}
          >
            {vehicleCounts.streetLight}
          </span>
        </motion.button> */}

        {/* <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            selectedTypes.includes("Trailer")
              ? "bg-gradient-to-r from-red-500 to-[#d5233b] text-white shadow-md"
              : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
          onClick={() => handleTypeSelect("Trailer")}
        >
          Trailer{" "}
          <span
            className={`ml-1 ${selectedTypes.includes("Trailer") ? "bg-red-400 text-white" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"} px-1.5 py-0.5 rounded-full text-xs`}
          >
            {vehicleCounts.trailer}
          </span>
        </motion.button> */}
      </div>
      {Toaster}
    </div>
  )
}

export default FilterBar