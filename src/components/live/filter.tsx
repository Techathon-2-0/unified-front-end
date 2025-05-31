import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, ChevronDown, X } from "lucide-react"
import type { FilterBarProps, Vehicle } from "../../types/live/list"
import { initialGroupData } from "../../data/manage/groups"
import { useToast } from "@/hooks/use-toast"

interface UpdatedFilterBarProps extends Omit<FilterBarProps, 'onExport'> {
  onExport: (format: "csv" | "pdf") => void
  filteredVehicles: Vehicle[] // Add filtered vehicles data
}

const FilterBar = ({ 
  totalCount, 
  filters, 
  onFilterChange, 
  onExport, 
  vehicleCounts, 
  filteredVehicles 
}: UpdatedFilterBarProps) => {
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [showGroupOptions, setShowGroupOptions] = useState(false)
  const [showStatusOptions, setShowStatusOptions] = useState(false)
  const { showSuccessToast, showErrorToast, Toaster } = useToast({ position: "top-right",});

  // Track selected options for multi-select
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

  // Refs for dropdown containers
  const exportRef = useRef<HTMLDivElement>(null)
  const groupRef = useRef<HTMLDivElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)

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
      "Altitude": `${vehicle.altitude||0} m`,
      "Speed": `${vehicle.speed} km/h`,
      "Address": vehicle.address,
      "Driver Name": vehicle.driverName,
      "Driver Mobile": vehicle.driverMobile,
      "Vendor Name": vehicle.vendorName,
      "Group": vehicle.group,
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
          Object.values(row).map(value => 
            typeof value === 'string' && value.includes(',') 
              ? `"${value}"` 
              : value
          ).join(",")
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
                th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
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
                <p><strong>Applied Filters:</strong> ${
                  [
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
                          .map((value) => `<td>${value || '-'}</td>`)
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
    onFilterChange({ group: newGroups.length ? newGroups : "" })
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
    onFilterChange({ status: newStatuses.length ? newStatuses : "" })
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
    onFilterChange({ type: newTypes.length ? newTypes : "" })
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 md:p-5">
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
              className="h-9 flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 shadow-sm transition-all hover:shadow"
              onClick={() => setShowExportOptions(!showExportOptions)}
            >
              Export <ChevronDown className={`h-4 w-4 transition-transform ${showExportOptions ? "rotate-180" : ""}`} />
            </button>
            {showExportOptions && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50"
              >
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                  onClick={() => handleExport("csv")}
                >
                  Export as CSV
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                  onClick={() => handleExport("pdf")}
                >
                  Export as PDF
                </button>
              </motion.div>
            )}
          </div>

          <div className="relative" ref={groupRef}>
            <button
              className={`h-9 flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 shadow-sm transition-all hover:shadow ${
                selectedGroups.length > 0
                  ? "bg-red-50 border-red-300 text-[#d5233b]"
                  : "bg-white border-gray-300 text-gray-700"
              }`}
              onClick={() => setShowGroupOptions(!showGroupOptions)}
            >
              Group {selectedGroups.length > 0 && `(${selectedGroups.length})`}
              <ChevronDown className={`h-4 w-4 transition-transform ${showGroupOptions ? "rotate-180" : ""}`} />
            </button>
            {showGroupOptions && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-y-hidden absolute right-0 mt-1 w-60 bg-white border border-gray-200 rounded-md shadow-lg z-50"
              >
                <div className="py-1">
                  {initialGroupData.map((initialGroupData) => (
                    <button
                      key={initialGroupData.id}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
                      onClick={() => handleGroupSelect(initialGroupData.name)}
                    >
                      <span>{initialGroupData.name}</span>
                      {selectedGroups.includes(initialGroupData.name) && <span className="text-[#d5233b]">✓</span>}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="relative" ref={statusRef}>
            <button
              className={`h-9 flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 shadow-sm transition-all hover:shadow ${
                selectedStatuses.length > 0
                  ? "bg-red-50 border-red-300 text-[#d5233b]"
                  : "bg-white border-gray-300 text-gray-700"
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
                className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50"
              >
                <div className="py-1">
                  {["Active", "Idle", "Stopped", "No Data"].map((status) => (
                    <button
                      key={status}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
                      onClick={() => handleStatusSelect(status)}
                    >
                      <span>{status}</span>
                      {selectedStatuses.includes(status) && <span className="text-[#d5233b]">✓</span>}
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
              className="block w-full h-9 pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none shadow-sm"
              placeholder="Search devices..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Selected filters display */}
      {(selectedGroups.length > 0 || selectedStatuses.length > 0 || selectedTypes.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="text-sm text-gray-500 flex items-center">Active filters:</div>
          {selectedGroups.map((group) => (
            <motion.div
              key={`group-${group}`}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-red-50 text-[#d5233b] px-2 py-1 rounded-md text-sm flex items-center gap-1"
            >
              <span>Group: {group}</span>
              <button onClick={() => handleGroupSelect(group)} className="text-red-500 hover:text-[#d5233b]">
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
          {selectedStatuses.map((status) => (
            <motion.div
              key={`status-${status}`}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-red-50 text-[#d5233b] px-2 py-1 rounded-md text-sm flex items-center gap-1"
            >
              <span>Status: {status}</span>
              <button onClick={() => handleStatusSelect(status)} className="text-red-500 hover:text-[#d5233b]">
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
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            selectedTypes.includes("Car")
              ? "bg-gradient-to-r from-red-500 to-[#d5233b] text-white shadow-md"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
          onClick={() => handleTypeSelect("Car")}
        >
          Car{" "}
          <span
            className={`ml-1 ${selectedTypes.includes("Car") ? "bg-red-400 text-white" : "bg-white text-gray-700"} px-1.5 py-0.5 rounded-full text-xs`}
          >
            {vehicleCounts.car}
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            selectedTypes.includes("Person")
              ? "bg-gradient-to-r from-red-500 to-[#d5233b] text-white shadow-md"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
          onClick={() => handleTypeSelect("Person")}
        >
          Person{" "}
          <span
            className={`ml-1 ${selectedTypes.includes("Person") ? "bg-red-400 text-white" : "bg-white text-gray-700"} px-1.5 py-0.5 rounded-full text-xs`}
          >
            {vehicleCounts.person}
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            selectedTypes.includes("Truck")
              ? "bg-gradient-to-r from-red-500 to-[#d5233b] text-white shadow-md"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
          onClick={() => handleTypeSelect("Truck")}
        >
          Truck{" "}
          <span
            className={`ml-1 ${selectedTypes.includes("Truck") ? "bg-red-400 text-white" : "bg-white text-gray-700"} px-1.5 py-0.5 rounded-full text-xs`}
          >
            {vehicleCounts.truck}
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            selectedTypes.includes("Excavator")
              ? "bg-gradient-to-r from-red-500 to-[#d5233b] text-white shadow-md"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
          onClick={() => handleTypeSelect("Excavator")}
        >
          Excavator{" "}
          <span
            className={`ml-1 ${selectedTypes.includes("Excavator") ? "bg-red-400 text-white" : "bg-white text-gray-700"} px-1.5 py-0.5 rounded-full text-xs`}
          >
            {vehicleCounts.excavator}
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            selectedTypes.includes("Street Light")
              ? "bg-gradient-to-r from-red-500 to-[#d5233b] text-white shadow-md"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
          onClick={() => handleTypeSelect("Street Light")}
        >
          Street Light{" "}
          <span
            className={`ml-1 ${selectedTypes.includes("Street Light") ? "bg-red-400 text-white" : "bg-white text-gray-700"} px-1.5 py-0.5 rounded-full text-xs`}
          >
            {vehicleCounts.streetLight}
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            selectedTypes.includes("Trailer")
              ? "bg-gradient-to-r from-red-500 to-[#d5233b] text-white shadow-md"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
          onClick={() => handleTypeSelect("Trailer")}
        >
          Trailer{" "}
          <span
            className={`ml-1 ${selectedTypes.includes("Trailer") ? "bg-red-400 text-white" : "bg-white text-gray-700"} px-1.5 py-0.5 rounded-full text-xs`}
          >
            {vehicleCounts.trailer}
          </span>
        </motion.button>
      </div>
      {Toaster}
    </div>
  )
}

export default FilterBar