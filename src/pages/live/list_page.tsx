import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import VehicleTable from "../../components/live/VehicleTable"
import VehicleMap from "../../components/live/VehicleMap"
import FilterBar from "../../components/live/filter"
import ActionBar from "../../components/live/ActionBar"
import type { Vehicle, VehicleFilter } from "../../types/live/list_type"
import { fetchVehicles } from "../../data/live/list"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "../../context/AuthContext"

const VehicleTracker = () => {
  // Persist view in localStorage
  const [view, setViewState] = useState<"list" | "map">(() => {
    const saved = localStorage.getItem("vehicleView")
    return saved === "map" ? "map" : "list"
  })
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [filters, setFilters] = useState<VehicleFilter>({
    search: "",
    group: "",
    status: "",
    type: "",
    trip: "",
  })
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([])
  const itemsPerPage = 5
  const { showSuccessToast, showErrorToast, Toaster } = useToast({ position: "top-right",})
  const { user } = useAuth()

  useEffect(() => {
    const loadVehicles = async () => {
      setLoading(true)
      try {
        // Use user from useAuth hook at the top-level of the component
        const data = await fetchVehicles(String(user?.id))
        const vehiclesArray = Array.isArray(data) ? data : []
        setVehicles(vehiclesArray)
        setFilteredVehicles(vehiclesArray)
        setTotalCount(vehiclesArray.length)
      } catch (error) {
        console.error("Failed to fetch vehicles:", error)
      } finally {
        setLoading(false)
      }
    }

    loadVehicles()
  }, [user])

  useEffect(() => {
    let result = [...vehicles]

    // Search filter (AND)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        (vehicle) =>
          vehicle.vehicleNumber.toLowerCase().includes(searchLower) ||
          vehicle.deviceName.toLowerCase().includes(searchLower) ||
          vehicle.address.toLowerCase().includes(searchLower) ||
          vehicle.vendorName.toLowerCase().includes(searchLower),
      )
    }

    // Group filter (OR within, AND across)
    if (filters.group) {
      const selectedGroups = Array.isArray(filters.group)
        ? filters.group
        : typeof filters.group === "string" && filters.group !== ""
          ? filters.group.split(",")
          : []
      if (selectedGroups.length > 0) {
        result = result.filter((vehicle) =>
          Array.isArray(vehicle.group)
            ? vehicle.group.some((g) => selectedGroups.includes(g))
            : false
        )
      }
    }

    // Trip filter (OR within, AND across)
    if (filters.trip) {
      const selectedTrips = Array.isArray(filters.trip)
        ? filters.trip
        : typeof filters.trip === "string" && filters.trip !== ""
          ? filters.trip.split(",")
          : []
      if (selectedTrips.length > 0) {
        result = result.filter((vehicle) => {
          // Map frontend "Active"/"Inactive" to backend trip_status values
          const tripStatus = vehicle.trip_status
          let match = false
          if (selectedTrips.includes("Active")) {
            // Active: at_stop_delivery, at_stop_pickup, in_transit
            if (
              tripStatus === "at_stop_delivery" ||
              tripStatus === "at_stop_pickup" ||
              tripStatus === "in_transit"
            ) {
              match = true
            }
          }
          if (selectedTrips.includes("Inactive")) {
            // Inactive: inactive or empty
            if (tripStatus === "inactive" || tripStatus === "" || tripStatus == null) {
              match = true
            }
          }
          return match
        })
      }
    }

    // Status filter (OR within, AND across)
    if (filters.status) {
      const selectedStatuses = Array.isArray(filters.status)
        ? filters.status
        : typeof filters.status === "string" && filters.status !== ""
          ? filters.status.split(",")
          : []
      if (selectedStatuses.length > 0) {
        result = result.filter((vehicle) => selectedStatuses.includes(vehicle.status))
      }
    }

    // Type filter (OR within, AND across)
    if (filters.type) {
      const selectedTypes = Array.isArray(filters.type)
        ? filters.type
        : typeof filters.type === "string" && filters.type !== ""
          ? filters.type.split(",")
          : []
      if (selectedTypes.length > 0) {
        result = result.filter((vehicle) => selectedTypes.includes(vehicle.type))
      }
    }

    setFilteredVehicles(result)
    setTotalCount(result.length)
    setCurrentPage(1)
  }, [filters, vehicles])

  const handleFilterChange = (newFilters: Partial<VehicleFilter>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      // Use user from useAuth hook at the top-level of the component
      const data = await fetchVehicles(String(user?.id))
      const vehiclesArray = Array.isArray(data) ? data : []
      setVehicles(vehiclesArray)
      setFilteredVehicles(vehiclesArray)
      setTotalCount(vehiclesArray.length)

      showSuccessToast("Data refreshed", "Vehicle data has been refreshed successfully.")
    } catch (error) {
      showErrorToast("Refresh failed", "Failed to refresh vehicle data.")
    } finally {
      setLoading(false)
    }
  }

  const handleExport = (format: "csv" | "pdf") => {
    // Implementation for exporting data
    console.log(`Exporting data as ${format}`)
  }

  const handleSort = (field: keyof Vehicle, direction: "asc" | "desc" = "asc") => {
    const sorted = [...filteredVehicles].sort((a, b) => {
      let comparison = 0
      if (a[field] < b[field]) comparison = -1
      if (a[field] > b[field]) comparison = 1

      // Reverse the comparison if direction is descending
      return direction === "asc" ? comparison : -comparison
    })
    setFilteredVehicles(sorted)
  }

  const handleSelectVehicle = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedVehicles((prev) => [...prev, id])
    } else {
      setSelectedVehicles((prev) => prev.filter((vehicleId) => vehicleId !== id))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageVehicles = getCurrentPageVehicles().map((v) => v.id)
      setSelectedVehicles(currentPageVehicles)
    } else {
      setSelectedVehicles([])
    }
  }

  const getCurrentPageVehicles = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredVehicles.slice(startIndex, startIndex + itemsPerPage)
  }

  const pageCount = Math.ceil(filteredVehicles.length / itemsPerPage)

  const vehicleCounts = {
    car: Array.isArray(vehicles) ? vehicles.filter((v) => v.type === "Car").length : 0,
    truck: Array.isArray(vehicles) ? vehicles.filter((v) => v.type === "Truck").length : 0,
    person: Array.isArray(vehicles) ? vehicles.filter((v) => v.type === "Person").length : 0,
    excavator: Array.isArray(vehicles) ? vehicles.filter((v) => v.type === "Excavator").length : 0,
    streetLight: Array.isArray(vehicles) ? vehicles.filter((v) => v.type === "Street Light").length : 0,
    trailer: Array.isArray(vehicles) ? vehicles.filter((v) => v.type === "Trailer").length : 0,
  }

  // Wrap setView to also update localStorage
  const setView = (v: "list" | "map") => {
    setViewState(v)
    localStorage.setItem("vehicleView", v)
  }

  return (
    <div className="min-h-screen from-gray-50 to-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 pt-2">
        <ActionBar view={view} setView={setView} onRefresh={handleRefresh} tripCount={0} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-5"
        >
          <FilterBar
            totalCount={filteredVehicles.length}
            filters={filters}
            onFilterChange={handleFilterChange}
            onExport={handleExport} // This can now be removed if you want the component to handle it internally
            vehicleCounts={vehicleCounts}
            filteredVehicles={filteredVehicles} // Add this prop
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {view === "list" ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="mt-6"
            >
              <VehicleTable
                vehicles={getCurrentPageVehicles()}
                loading={loading}
                currentPage={currentPage}
                pageCount={pageCount}
                onPageChange={setCurrentPage}
                onSort={handleSort}
                selectedVehicles={selectedVehicles}
                onSelectVehicle={handleSelectVehicle}
                onSelectAll={handleSelectAll}
                totalCount={totalCount}
              />
            </motion.div>
          ) : (
            <motion.div
              key="map"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="mt-6"
            >
              <VehicleMap
                vehicles={filteredVehicles}
                loading={loading}
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {Toaster}
    </div>
  )
}

export default VehicleTracker
