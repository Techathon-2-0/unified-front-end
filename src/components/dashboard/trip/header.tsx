import { useState } from "react"
import { motion } from "framer-motion"
import { Filter, RefreshCw, Calendar, Users, Truck, User, ChevronDown, XCircle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import type { FilterState } from "../../../types/dashboard/trip_type"
import type { TripHeaderProps } from "../../../types/dashboard/trip_type"
import { toast } from "sonner"

export function TripHeader({
  filters,
  setFilters,
  vehicleGroups,
  customerGroups,
  customerNames,
  onRefresh,
  isLoading,
  onApplyFilters,
}: TripHeaderProps) {
  const [showFilters, setShowFilters] = useState(false)
  // Use a single state for date range
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined })

  // Dropdown open states for each filter
  // const [isLoading ]
  const [openVehicleGroup, setOpenVehicleGroup] = useState(false)
  const [openCustomerGroup, setOpenCustomerGroup] = useState(false)
  const [openCustomerName, setOpenCustomerName] = useState(false)
  const [openVehicleStatus, setOpenVehicleStatus] = useState(false)
  const [openTripStatus, setOpenTripStatus] = useState(false)

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters({
      ...filters,
      [key]: value,
    })
  }

  // Update handleDateChange for range
  const handleDateRangeChange = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range) return;
    setDateRange({
      from: range.from ?? undefined,
      to: range.to ?? undefined,
    })
    setFilters({
      ...filters,
      startDate: range.from ? format(range.from, "yyyy-MM-dd") : "",
      endDate: range.to ? format(range.to, "yyyy-MM-dd") : "",
    })
  }

  // Helper for multi-select filter change
  const handleMultiFilterChange = (key: keyof FilterState, value: string) => {
    const current = Array.isArray(filters[key]) ? filters[key] as string[] : []
    let updated: string[]
    if (current.includes(value)) {
      updated = current.filter(v => v !== value)
    } else {
      updated = [...current, value]
    }
    setFilters({
      ...filters,
      [key]: updated.length === 0 ? [] : updated,
    })
  }

  // Helper for "All" in multi-select
  const handleMultiAll = (key: keyof FilterState) => {
    setFilters({
      ...filters,
      [key]: [],
    })
  }

  // Helper for showing selected values
  const getSelectedNames = (key: keyof FilterState, allLabel: string, items: any[], idKey: string, nameKey: string) => {
    const selected = filters[key] as string[]
    if (!selected || selected.length === 0) return allLabel
    if (selected.length === 1) {
      const found = items.find((g) => g[idKey].toString() === selected[0])
      return found ? found[nameKey] : selected[0]
    }
    if (selected.length <= 2) {
      return selected.map(id => {
        const found = items.find((g) => g[idKey].toString() === id)
        return found ? found[nameKey] : id
      }).join(", ")
    }
    return `${selected.length} selected`
  }

  // Helper for filter button style
  const filterBtn = (active: boolean) =>
    `h-9 flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all hover:shadow ${
      active
        ? "bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-800 text-[#d5233b] dark:text-red-400"
        : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
    }`

  // Handler for Apply Filter with toast
  const handleApplyFilter = () => {
    if (onApplyFilters) {
      onApplyFilters()
    } else {
      onRefresh()
    }
    toast.success("Filter applied successfully")
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 md:p-5 mb-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Left side - Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="border-red-200 text-red-700 hover:text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-wrap items-center gap-3"
            >
              {/* Vehicle Group Filter (multi-select) */}
              <div className="relative">
                <button
                  className={filterBtn((filters.vehicleGroup as string[]).length > 0)}
                  onClick={() => setOpenVehicleGroup((v) => !v)}
                  type="button"
                >
                  <Truck className="h-4 w-4 text-gray-500" />
                  {getSelectedNames("vehicleGroup", "All Groups", vehicleGroups, "group_id", "group_name")}
                  <ChevronDown className={`h-4 w-4 transition-transform ${openVehicleGroup ? "rotate-180" : ""}`} />
                </button>
                {openVehicleGroup && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-56 overflow-y-auto"
                  >
                    <button
                      className="w-full flex items-center gap-2 text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
                      onClick={() => { handleMultiAll("vehicleGroup"); setOpenVehicleGroup(false); }}
                    >
                      <Check className={`h-4 w-4 ${!(filters.vehicleGroup as string[])?.length ? "text-red-500" : "invisible"}`} />
                      All Groups
                    </button>
                    {vehicleGroups.map((group) => (
                      <button
                        key={group.group_id}
                        className="w-full flex items-center gap-2 text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
                        onClick={() => handleMultiFilterChange("vehicleGroup", group.group_id.toString())}
                      >
                        <Check className={`h-4 w-4 ${(filters.vehicleGroup as string[]).includes(group.group_id.toString()) ? "text-red-500" : "invisible"}`} />
                        {group.group_name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Customer Group Filter (multi-select) */}
              <div className="relative">
                <button
                  className={filterBtn((filters.customerGroup as string[]).length > 0)}
                  onClick={() => setOpenCustomerGroup((v) => !v)}
                  type="button"
                >
                  <Users className="h-4 w-4 text-gray-500" />
                  {getSelectedNames("customerGroup", "All Customer Groups", customerGroups, "id", "group_name")}
                  <ChevronDown className={`h-4 w-4 transition-transform ${openCustomerGroup ? "rotate-180" : ""}`} />
                </button>
                {openCustomerGroup && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-56 overflow-y-auto"
                  >
                    <button
                      className="w-full flex items-center gap-2 text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
                      onClick={() => { handleMultiAll("customerGroup"); setOpenCustomerGroup(false); }}
                    >
                      <Check className={`h-4 w-4 ${!(filters.customerGroup as string[])?.length ? "text-red-500" : "invisible"}`} />
                      All Customer Groups
                    </button>
                    {customerGroups.map((group) => (
                      <button
                        key={group.id}
                        className="w-full flex items-center gap-2 text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
                        onClick={() => handleMultiFilterChange("customerGroup", group.id.toString())}
                      >
                        <Check className={`h-4 w-4 ${(filters.customerGroup as string[]).includes(group.id.toString()) ? "text-red-500" : "invisible"}`} />
                        {group.group_name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Customer Name Filter (multi-select) */}
              <div className="relative">
                <button
                  className={filterBtn((filters.customerName as string[]).length > 0)}
                  onClick={() => setOpenCustomerName((v) => !v)}
                  type="button"
                >
                  <User className="h-4 w-4 text-gray-500" />
                  {getSelectedNames("customerName", "All Customers", customerNames, "customer_name", "customer_name")}
                  <ChevronDown className={`h-4 w-4 transition-transform ${openCustomerName ? "rotate-180" : ""}`} />
                </button>
                {openCustomerName && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-56 overflow-y-auto"
                  >
                    <button
                      className="w-full flex items-center gap-2 text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
                      onClick={() => { handleMultiAll("customerName"); setOpenCustomerName(false); }}
                    >
                      <Check className={`h-4 w-4 ${!(filters.customerName as string[])?.length ? "text-red-500" : "invisible"}`} />
                      All Customers
                    </button>
                    {customerNames.map((customer) => (
                      <button
                        key={customer.id}
                        className="w-full flex items-center gap-2 text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
                        onClick={() => handleMultiFilterChange("customerName", customer.customer_name)}
                      >
                        <Check className={`h-4 w-4 ${(filters.customerName as string[]).includes(customer.customer_name) ? "text-red-500" : "invisible"}`} />
                        {customer.customer_name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Vehicle Status Filter (multi-select) */}
              <div className="relative">
                <button
                  className={filterBtn((filters.vehicleStatus as string[]).length > 0)}
                  onClick={() => setOpenVehicleStatus((v) => !v)}
                  type="button"
                >
                  {getSelectedNames("vehicleStatus", "Vehicle Status", [
                    { id: "Active", name: "Active" },
                    { id: "No Update", name: "No Update" },
                    { id: "No Data", name: "No Data" },
                  ], "id", "name")}
                  <ChevronDown className={`h-4 w-4 transition-transform ${openVehicleStatus ? "rotate-180" : ""}`} />
                </button>
                {openVehicleStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute left-0 mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-56 overflow-y-auto"
                  >
                    <button
                      className="w-full flex items-center gap-2 text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
                      onClick={() => { handleMultiAll("vehicleStatus"); setOpenVehicleStatus(false); }}
                    >
                      <Check className={`h-4 w-4 ${!(filters.vehicleStatus as string[])?.length ? "text-red-500" : "invisible"}`} />
                      All Status
                    </button>
                    {["Active", "No Update", "No Data"].map((status) => (
                      <button
                        key={status}
                        className="w-full flex items-center gap-2 text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
                        onClick={() => handleMultiFilterChange("vehicleStatus", status)}
                      >
                        <Check className={`h-4 w-4 ${(filters.vehicleStatus as string[]).includes(status) ? "text-red-500" : "invisible"}`} />
                        {status}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right side - Refresh */}
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          onClick={onRefresh}
          disabled={isLoading}
          aria-label="Refresh"
          className="p-2 bg-black dark:bg-gray-800 text-white rounded-md shadow w-auto"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </motion.button>
      </div>

      {/* Backend Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-wrap items-center gap-4">
            {/* Trip Status */}
            <div className="relative">
              <button
                className={filterBtn(filters.tripStatus !== "all" && filters.tripStatus !== "")}
                onClick={() => setOpenTripStatus((v) => !v)}
                type="button"
              >
                Trip Status: {filters.tripStatus === "all" || filters.tripStatus === "" ? "All" : filters.tripStatus.charAt(0).toUpperCase() + filters.tripStatus.slice(1)}
                <ChevronDown className={`h-4 w-4 transition-transform ${openTripStatus ? "rotate-180" : ""}`} />
              </button>
              {openTripStatus && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-0 mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-56 overflow-y-auto"
                >
                  {["all", "active", "inactive"].map((status) => (
                    <button
                      key={status}
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
                      onClick={() => { handleFilterChange("tripStatus", status); setOpenTripStatus(false); }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Date Range and Apply Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Date Range:</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-40 justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      {dateRange.from && dateRange.to
                        ? `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")}`
                        : dateRange.from
                        ? `${format(dateRange.from, "MMM dd")} - End`
                        : "Select range"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <div className="flex flex-col gap-2 p-2">
                      <CalendarComponent
                        mode="range"
                        selected={dateRange}
                        onSelect={handleDateRangeChange}
                        initialFocus
                        disabled={(date) => date > new Date()}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => {
                          setDateRange({ from: undefined, to: undefined });
                          setFilters({
                            ...filters,
                            startDate: "",
                            endDate: "",
                          });
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              {/* Apply Filter Button - stacks below date range on small screens */}
              <Button
                variant="default"
                onClick={handleApplyFilter}
                disabled={isLoading}
                className="bg-black hover:bg-gray-900 text-white ml-0 sm:ml-2 sm:w-auto"
              >
                Apply Filter
              </Button>
            </div>

            {/* Add info text to the right */}
            <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">
              To apply trip status and date range click on <span className="font-semibold">Apply Filter</span>
            </div>
          </div>

          {/* Applied Filters Row */}
          <div className="flex flex-wrap gap-2 mt-4 text-xs overflow-x-auto pb-1">
            {(filters.vehicleGroup as string[]).length > 0 && (
              (filters.vehicleGroup as string[]).map(id => (
                <span key={id} className="inline-flex items-center bg-red-50 dark:bg-red-900/30 text-[#d5233b] dark:text-red-300 border border-red-200 dark:border-red-700 rounded-full px-3 py-1 font-medium mr-2 mb-2">
                  <Truck className="h-3 w-3 mr-1" />
                  {vehicleGroups.find(g => g.group_id.toString() === id)?.group_name || id}
                  <button
                    className="ml-1 p-0.5 hover:text-red-600 focus:outline-none"
                    onClick={() => {
                      setFilters({
                        ...filters,
                        vehicleGroup: (filters.vehicleGroup as string[]).filter(v => v !== id),
                      })
                    }}
                    aria-label="Remove vehicle group filter"
                  >
                    <XCircle className="h-3 w-3" />
                  </button>
                </span>
              ))
            )}
            {(filters.customerGroup as string[]).length > 0 && (
              (filters.customerGroup as string[]).map(id => (
                <span key={id} className="inline-flex items-center bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded-full px-3 py-1 font-medium mr-2 mb-2">
                  <Users className="h-3 w-3 mr-1" />
                  {customerGroups.find(g => g.id.toString() === id)?.group_name || id}
                  <button
                    className="ml-1 p-0.5 hover:text-blue-600 focus:outline-none"
                    onClick={() => {
                      setFilters({
                        ...filters,
                        customerGroup: (filters.customerGroup as string[]).filter(v => v !== id),
                      })
                    }}
                    aria-label="Remove customer group filter"
                  >
                    <XCircle className="h-3 w-3" />
                  </button>
                </span>
              ))
            )}
            {(filters.customerName as string[]).length > 0 && (
              (filters.customerName as string[]).map(name => (
                <span key={name} className="inline-flex items-center bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700 rounded-full px-3 py-1 font-medium mr-2 mb-2">
                  <User className="h-3 w-3 mr-1" />
                  {name}
                  <button
                    className="ml-1 p-0.5 hover:text-green-600 focus:outline-none"
                    onClick={() => {
                      setFilters({
                        ...filters,
                        customerName: (filters.customerName as string[]).filter(v => v !== name),
                      })
                    }}
                    aria-label="Remove customer name filter"
                  >
                    <XCircle className="h-3 w-3" />
                  </button>
                </span>
              ))
            )}
            {(filters.vehicleStatus as string[]).length > 0 && (
              (filters.vehicleStatus as string[]).map(status => (
                <span key={status} className="inline-flex items-center bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700 rounded-full px-3 py-1 font-medium mr-2 mb-2">
                  <Filter className="h-3 w-3 mr-1" />
                  {status}
                  <button
                    className="ml-1 p-0.5 hover:text-yellow-600 focus:outline-none"
                    onClick={() => {
                      setFilters({
                        ...filters,
                        vehicleStatus: (filters.vehicleStatus as string[]).filter(v => v !== status),
                      })
                    }}
                    aria-label="Remove vehicle status filter"
                  >
                    <XCircle className="h-3 w-3" />
                  </button>
                </span>
              ))
            )}
            {/* ...existing code for tripStatus, startDate, endDate... */}
            {/* If no filters applied */}
            {!(
              (filters.vehicleGroup as string[])?.length ||
              (filters.customerGroup as string[])?.length ||
              (filters.customerName as string[])?.length ||
              (filters.vehicleStatus as string[])?.length ||
              (filters.tripStatus && filters.tripStatus !== "all") ||
              filters.startDate ||
              filters.endDate
            ) && (
              <span className="text-gray-400">No filters applied</span>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
