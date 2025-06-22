import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { TripHeader } from "./header"
import { TripStatusCards } from "./status-cards"
import { ViewControls } from "./view-controls"
import { TripTable } from "./trip-table"
import { TripMap } from "./trip-map"
import { fetchTrips } from "../../../data/dashboard/trip"
import type {
  TripApi,
  StatusCounts,
  FilterState,
  ViewMode,
  MapMode,
  SortField,
  SortOrder,
  VehicleGroup,
  CustomerGroup,
  Customer,
} from "../../../types/dashboard/trip_type"
import { useAuth } from "../../../context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { fetchGroupsbyuserId } from "@/data/manage/group"
import { fetchCustomerGroupsbyuser } from "@/data/manage/customergroup"
import { fetchCustomerNames } from "@/data/manage/customergroup"

export default function TripDashboard() {
  const { user } = useAuth()

  // State
  const [trips, setTrips] = useState<TripApi[]>([])
  const [filteredTrips, setFilteredTrips] = useState<TripApi[]>([])
  const [isLoading, setIsLoading] = useState(true)
  // Initialize viewMode from localStorage
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const stored = localStorage.getItem("tripDashboardViewMode")
    return stored === "map" || stored === "list" ? (stored as ViewMode) : "list"
  })
  const [mapMode, setMapMode] = useState<MapMode>("current")
  const [selectedTrip] = useState<TripApi | null>(null)

  // Filter data
  const [vehicleGroups, setVehicleGroups] = useState<VehicleGroup[]>([])
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([])
  const [customerNames, setCustomerNames] = useState<Customer[]>([])

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    vehicleGroup: [],
    customerGroup: [],
    customerName: [],
    vehicleStatus: [],
    tripStatus: "active",
    startDate: "",
    endDate: "",
    searchQuery: "",
  })

  // Table state
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>("id")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const tripsPerPage = 5
  const { showSuccessToast, showErrorToast, Toaster } = useToast({ position: "top-right" })

  // Status counts
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    active: 0,
    inactive: 0,
    atPickup: 0,
    atDelivery: 0,
    inTransit: 0,
    onTime: 0,
    delayed: 0,
    stoppage: 0,
    overspeeding: 0,
    continuousDriving: 0,
    routeDeviation: 0,
    geofence: 0,
    reachedStopAlarm: 0,
    noGpsFeed: 0,
  })

  // Add this state to track the selected status card filter
  const [statusCardFilter, setStatusCardFilter] = useState<string | string[] | null>(null);
  // Add this state to track the selected alarm filter
  const [selectedAlarm, setSelectedAlarm] = useState<string | null>(null);

  // Add fullscreen state, persisted in localStorage
  const [isFullscreen, setIsFullscreen] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tripDashboardIsFullscreen") === "true"
    }
    return false
  })

  // Sync isFullscreen to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tripDashboardIsFullscreen", isFullscreen ? "true" : "false")
    }
  }, [isFullscreen])

  // Listen for Escape key to exit fullscreen (like VehicleMap)
  useEffect(() => {
    if (!isFullscreen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullscreen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isFullscreen])

  // Load initial data
  useEffect(() => {
    if (user?.id) {
      loadInitialData()
    }
  }, [user?.id])

  const loadInitialData = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      // Load all data in parallel
      const [tripsData, vehicleGroupsData, customerGroupsData, customerNamesData] = await Promise.all([
        fetchTrips(user.id.toString(), {
          status: filters.tripStatus,
          startDate: filters.startDate,
          endDate: filters.endDate,
        }),
        fetchGroupsbyuserId(user?.id),
        fetchCustomerGroupsbyuser(user?.id?.toString()),
        fetchCustomerNames(user?.id?.toString()),
      ])

      setTrips(tripsData)
      setVehicleGroups(
        vehicleGroupsData.map((group: any) => ({
          group_id: group.group_id ?? group.id,
          group_name: group.group_name ?? group.name,
          ...group,
        }))
      )
      setCustomerGroups(
        customerGroupsData.map((group: any) => ({
          ...group,
          customers: group.customers ?? [],
        }))
      )
      setCustomerNames(
        customerNamesData.map((customer: any) => ({
          ...customer,
          customer_id: customer.customer_id ?? "",
        }))
      )

      // Calculate status counts
      calculateStatusCounts(tripsData)
    } catch (error) {
      console.error("Error loading data:", error)
      showErrorToast("Failed to load trip data. Please try again later.", "Error")
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStatusCounts = (tripsData: TripApi[]) => {
    const counts: StatusCounts = {
      active: 0,
      inactive: 0,
      atPickup: 0,
      atDelivery: 0,
      inTransit: 0,
      onTime: 0,
      delayed: 0,
      stoppage: 0,
      overspeeding: 0,
      continuousDriving: 0,
      routeDeviation: 0,
      geofence: 0,
      reachedStopAlarm: 0,
      noGpsFeed: 0,
    }

    tripsData.forEach((trip) => {
      // Trip status counts
      switch (trip.status.toLowerCase()) {
        case "at_stop_pickup":
          counts.atPickup++
          counts.active++
          break
        case "at_stop_delivery":
          counts.atDelivery++
          counts.active++
          break
        case "in_transit":
          counts.inTransit++
          counts.active++
          break
        case "inactive":
          counts.inactive++
          break
        default:
          counts.active++
      }

      // Only count onTime and delayed for non-inactive trips
      if (trip.status.toLowerCase() !== "inactive") {
        const hasDetention = trip.planned_stops.some(
          (stop) => stop.detention_time && stop.detention_time !== "0" && stop.detention_time !== "",
        )
        if (hasDetention) {
          counts.delayed++
        } else {
          counts.onTime++
        }
      }

      // Alarm counts
      Object.entries(trip.alert_counts_by_type).forEach(([alertType, alertData]) => {
        switch (alertType.toLowerCase()) {
          case "stoppage":
            counts.stoppage += alertData.active
            break
          case "overspeeding":
            counts.overspeeding += alertData.active
            break
          case "continuous_driving":
            counts.continuousDriving += alertData.active
            break
          case "route_deviation":
            counts.routeDeviation += alertData.active
            break
          case "geofence":
            counts.geofence += alertData.active
            break
          case "reached_stop_alarm":
            counts.reachedStopAlarm += alertData.active
            break
          case "no_gps_feed":
            counts.noGpsFeed += alertData.active
            break
        }
      })
    })

    setStatusCounts(counts)
  }

  // Apply filters
  useEffect(() => {
    let result = [...trips]

    // Vehicle Group (multi)
    if ((filters.vehicleGroup as string[]).length > 0) {
      result = result.filter((trip) =>
        trip.vehicle_groups.some((group) => (filters.vehicleGroup as string[]).includes(group.group_id.toString()))
      )
    }

    // Customer Group (multi)
    if ((filters.customerGroup as string[]).length > 0) {
      const selectedGroups = customerGroups.filter((group) => (filters.customerGroup as string[]).includes(group.id.toString()))
      if (selectedGroups.length > 0) {
        result = result.filter((trip) =>
          trip.planned_stops.some((stop) =>
            selectedGroups.some((group) =>
              group.customers.some((customer) => customer.customer_name === stop.customer_name)
            )
          )
        )
      }
    }

    // Customer Name (multi)
    if ((filters.customerName as string[]).length > 0) {
      result = result.filter((trip) =>
        trip.planned_stops.some((stop) => (filters.customerName as string[]).includes(stop.customer_name))
      )
    }

    // Vehicle Status (multi)
    if ((filters.vehicleStatus as string[]).length > 0) {
      result = result.filter((trip) => (filters.vehicleStatus as string[]).includes(trip.Vehicle_status))
    }

    // Apply search
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase()
      result = result.filter(
        (trip) => trip.Vehicle_number.toLowerCase().includes(query) || trip.id.toLowerCase().includes(query),
      )
    }

    // Sort results
    result.sort((a, b) => {
      let valueA: any = a[sortField]
      let valueB: any = b[sortField]

      if (typeof valueA === "string" && typeof valueB === "string") {
        valueA = valueA.toLowerCase()
        valueB = valueB.toLowerCase()
      }

      if (sortOrder === "asc") {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0
      }
    })

    setFilteredTrips(result)
    setCurrentPage(1)
    calculateStatusCounts(result)
  }, [trips, filters, sortField, sortOrder, customerGroups])

  // Refresh data
  const handleRefresh = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const tripsData = await fetchTrips(user.id.toString(), {
        status: filters.tripStatus,
        startDate: filters.startDate,
        endDate: filters.endDate,
      })
      setTrips(tripsData)
      showSuccessToast("Trip data refreshed successfully", "Success")
      // Keep fullscreen mode after refresh (no-op, state is preserved)
    } catch (error) {
      console.error("Error refreshing data:", error)
      showErrorToast("Failed to refresh trip data. Please try again later.", "Error")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle filter application
  const handleapplyfilter = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const tripsData = await fetchTrips(user.id.toString(), {
        status: filters.tripStatus,
        startDate: filters.startDate,
        endDate: filters.endDate,
      })
      setTrips(tripsData)
      showSuccessToast("Filter Applied successfully", "Success")
    } catch (error) {
      console.error("Error filtering data:", error)
      showErrorToast("Failed to filter trip data. Please try again later.", "Error")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  // Handle status card clicks
  const handleStatusClick = (status: string) => {
    setSelectedAlarm(null);
    switch (status) {
      case "pickup":
        setStatusCardFilter((prev) => prev === "at_stop_pickup" ? null : "at_stop_pickup");
        break;
      case "delivery":
        setStatusCardFilter((prev) => prev === "at_stop_delivery" ? null : "at_stop_delivery");
        break;
      case "transit":
        setStatusCardFilter((prev) => prev === "in_transit" ? null : "in_transit");
        break;
      case "inactive":
        setStatusCardFilter((prev) => prev === "inactive" ? null : "inactive");
        break;
      case "active":
        setStatusCardFilter((prev) =>
          Array.isArray(prev) && prev.join() === ["at_stop_pickup", "at_stop_delivery", "in_transit"].join()
            ? null
            : ["at_stop_pickup", "at_stop_delivery", "in_transit"]
        );
        break;
      case "ontime":
        setStatusCardFilter((prev) => prev === "ontime" ? null : "ontime");
        break;
      case "delayed":
        setStatusCardFilter((prev) => prev === "delayed" ? null : "delayed");
        break;
      default:
        setStatusCardFilter(null);
        break;
    }
  }

  // Handle alarm clicks
  const handleAlarmClick = (alarmType: string) => {
    setStatusCardFilter(null);
    setSelectedAlarm((prev) => prev === alarmType ? null : alarmType);
  }

  // Handle export
  const handleExport = (format: "csv" | "pdf") => {
    try {
      const data = filteredTrips.map((trip) => ({
        "Shipment ID": trip.id,
        "Vehicle Number": trip.Vehicle_number,
        "Status": trip.status,
        "Vehicle Status": trip.Vehicle_status,
        "Driver Name": trip.driverName,
        "Driver Mobile": trip.driverMobile,
        // Format Start Time and End Time as readable date/time strings
        "Start Date": trip.Start_Time ? new Date(trip.Start_Time).toLocaleDateString() : "",
        "Start Time": trip.Start_Time ? new Date(trip.Start_Time).toLocaleTimeString() : "",
        "End Date": trip.End_Time ? new Date(trip.End_Time).toLocaleDateString() : "",
        "End Time": trip.End_Time ? new Date(trip.End_Time).toLocaleTimeString() : "",
        "Route Name": trip.route_Name,
        "Origin": trip.origin,
        "Destination": trip.destination,
        "Current Location": trip.cuurent_location_address,
        "Total Distance": trip.total_distance,
        "Covered Distance": trip.total_covered_distance,
        "GPS Vendor": trip.gps_vendor,
      }))

      if (format === "csv") {
        // Use new headers for CSV
        const headers = [
          "Shipment ID",
          "Vehicle Number",
          "Status",
          "Vehicle Status",
          "Driver Name",
          "Driver Mobile",
          "Start Date",
          "Start Time",
          "End Date",
          "End Time",
          "Route Name",
          "Origin",
          "Destination",
          "Current Location",
          "Total Distance",
          "Covered Distance",
          "GPS Vendor",
        ]
        const csv = [
          headers.join(","),
          ...data.map((row) => headers.map((h) => `"${(row[h as keyof typeof row] ?? "").toString().replace(/"/g, '""')}"`).join(",")),
        ].join("\n")

        const blob = new Blob([csv], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `trips_${new Date().toISOString().split("T")[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        // Generate PDF
        const printWindow = window.open("", "_blank")
        if (printWindow) {
          const htmlContent = `
            <!DOCTYPE html>
            <html>
              <head>
                <title>Trips Report</title>
                <style>
                  body { font-family: Arial, sans-serif; margin: 20px; }
                  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                  th { background-color: #f2f2f2; }
                  h1 { color: #333; }
                </style>
              </head>
              <body>
                <h1>Trips Report</h1>
                <p>Generated on: ${new Date().toLocaleString()}</p>
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
                            .map((value) => `<td>${value}</td>`)
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
        }
      }

      showSuccessToast(`Data exported successfully as ${format.toUpperCase()}`, "Export Success")
    } catch (error) {
      console.error("Export error:", error)
      showErrorToast("Failed to export data. Please try again later.", "Export Error")
    }
  }

  // Pagination
  const indexOfLastTrip = currentPage * tripsPerPage
  const indexOfFirstTrip = indexOfLastTrip - tripsPerPage

  // Apply statusCardFilter or selectedAlarm to filteredTrips for display
  const tripsToShow =
    selectedAlarm
      ? filteredTrips.filter(trip => {
          const alertData = trip.alert_counts_by_type[selectedAlarm];
          return alertData && alertData.active > 0;
        })
      : statusCardFilter
        ? Array.isArray(statusCardFilter)
          ? filteredTrips.filter(trip =>
              statusCardFilter.includes(trip.status.toLowerCase())
            )
          : statusCardFilter === "ontime"
            ? filteredTrips.filter(trip => {
                // On Time: no planned_stop has detention_time set and not "0" or "" and trip is not inactive
                return trip.status.toLowerCase() !== "inactive" && !trip.planned_stops.some(
                  stop => stop.detention_time && stop.detention_time !== "0" && stop.detention_time !== ""
                );
              })
            : statusCardFilter === "delayed"
              ? filteredTrips.filter(trip => {
                  // Delayed: at least one planned_stop has detention_time set and not "0" or "" and trip is not inactive
                  return trip.status.toLowerCase() !== "inactive" && trip.planned_stops.some(
                    stop => stop.detention_time && stop.detention_time !== "0" && stop.detention_time !== ""
                  );
                })
            : filteredTrips.filter(trip =>
                statusCardFilter === "inactive"
                  ? trip.status.toLowerCase() === "inactive"
                  : trip.status.toLowerCase() === statusCardFilter
              )
      : filteredTrips

  const currentTrips = tripsToShow.slice(indexOfFirstTrip, indexOfLastTrip)
  const totalPages = Math.ceil(tripsToShow.length / tripsPerPage)

  useEffect(() => {
    localStorage.setItem("tripDashboardViewMode", viewMode)
  }, [viewMode])

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900`}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Header with Filters */}
        <TripHeader
          filters={filters}
          setFilters={setFilters}
          vehicleGroups={vehicleGroups}
          customerGroups={customerGroups}
          customerNames={customerNames}
          onRefresh={handleRefresh}
          isLoading={isLoading}
          onApplyFilters={handleapplyfilter} // Reset to first page on filter apply
        />

        {/* Status Cards */}
        <TripStatusCards
          statusCounts={statusCounts}
          onStatusClick={handleStatusClick}
          onAlarmClick={handleAlarmClick}
          selectedStatus={statusCardFilter}
          selectedAlarm={selectedAlarm}
        />

        {/* Show selected filter chip if any */}
        {(statusCardFilter || selectedAlarm) && (
          <div className="flex items-center gap-2 px-6 pb-2">
            {statusCardFilter && (
              <span className="inline-flex items-center bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded-full px-3 py-1 font-medium mr-2">
                {Array.isArray(statusCardFilter)
                  ? "Active"
                  : statusCardFilter === "at_stop_pickup"
                    ? "At Pickup"
                    : statusCardFilter === "at_stop_delivery"
                      ? "At Delivery"
                      : statusCardFilter === "in_transit"
                        ? "In Transit"
                        : statusCardFilter === "inactive"
                          ? "Inactive"
                          : statusCardFilter}
                <button
                  className="ml-2 p-0.5 hover:text-blue-600 focus:outline-none"
                  onClick={() => setStatusCardFilter(null)}
                  aria-label="Remove status filter"
                >
                  ×
                </button>
              </span>
            )}
            {selectedAlarm && (
              <span className="inline-flex items-center bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700 rounded-full px-3 py-1 font-medium mr-2">
                {selectedAlarm
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, l => l.toUpperCase())}
                <button
                  className="ml-2 p-0.5 hover:text-yellow-600 focus:outline-none"
                  onClick={() => setSelectedAlarm(null)}
                  aria-label="Remove alarm filter"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}

        {/* View Controls */}
        <ViewControls
          viewMode={viewMode}
          setViewMode={setViewMode}
          mapMode={mapMode}
          setMapMode={setMapMode}
          searchQuery={filters.searchQuery}
          setSearchQuery={(query) => setFilters({ ...filters, searchQuery: query })}
          onExport={handleExport}
        />

        {/* Content */}
        <div className={`p-6 ${isFullscreen ? "fixed inset-0 z-[100] bg-white dark:bg-gray-900 flex flex-col" : ""}`} style={isFullscreen ? {height: "100vh", width: "100vw", padding: 0} : {}}>
          {viewMode === "list" ? (
            <TripTable
              trips={currentTrips}
              isLoading={isLoading}
              totalTrips={tripsToShow.length}
              sortField={sortField}
              sortOrder={sortOrder}
              handleSort={handleSort}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              indexOfFirstTrip={indexOfFirstTrip}
              indexOfLastTrip={indexOfLastTrip}
              tripsPerPage={tripsPerPage}
            />
          ) : (
            <TripMap
              trips={tripsToShow}
              selectedTrip={selectedTrip}
              mapMode={mapMode}
              setMapMode={setMapMode}
              isFullscreen={isFullscreen}
              setIsFullscreen={setIsFullscreen}
            />
          )}
        </div>
      </motion.div>
      {Toaster}
    </div>
  )
}
