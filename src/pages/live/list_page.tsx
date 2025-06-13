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
  const [view, setView] = useState<"list" | "map">("list")
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

    // Group filter: intersection, vehicle.group is array, filters.group is array or string
    if (filters.group) {
      const selectedGroups = Array.isArray(filters.group)
        ? filters.group
        : typeof filters.group === "string" && filters.group !== ""
          ? filters.group.split(",")
          : []
      if (selectedGroups.length > 0) {
        result = result.filter((vehicle) =>
          Array.isArray(vehicle.group)
            ? selectedGroups.every((g) => vehicle.group.includes(g))
            : false
        )
      }
    }

    // Trip filter: filters.trip is array or string, vehicle.tripStatus is "Active"/"Inactive"
    if (filters.trip) {
      const selectedTrips = Array.isArray(filters.trip)
        ? filters.trip
        : typeof filters.trip === "string" && filters.trip !== ""
          ? filters.trip.split(",")
          : []
      if (selectedTrips.length > 0) {
        result = result.filter((vehicle) =>
          selectedTrips.includes(vehicle.trip_status)
        )
      }
    }

    // Handle status filtering with support for arrays
    if (filters.status) {
      if (Array.isArray(filters.status) && filters.status.length > 0) {
        result = result.filter((vehicle) => filters.status.includes(vehicle.status))
      } else if (typeof filters.status === "string" && filters.status !== "") {
        result = result.filter((vehicle) => vehicle.status === filters.status)
      }
    }

    // Handle type filtering with support for arrays
    if (filters.type) {
      if (Array.isArray(filters.type) && filters.type.length > 0) {
        result = result.filter((vehicle) => filters.type.includes(vehicle.type))
      } else if (typeof filters.type === "string" && filters.type !== "") {
        result = result.filter((vehicle) => vehicle.type === filters.type)
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

  return (
    <div className="min-h-screen from-gray-50 to-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 py-6">
        <ActionBar view={view} setView={setView} onRefresh={handleRefresh} tripCount={0} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6"
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
