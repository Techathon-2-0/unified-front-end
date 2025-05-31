import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { TripHeader } from "./header"
import { TripStatusCards } from "./status-cards"
import { TripFilters } from "./filters"
import { TripTable } from "./table"
import TripMap from "./map"
import { generateMockTrips } from "../../../data/dashboard/trip"
import type { Trip, StatusCounts, SortField, SortOrder } from "../../../types/dashboard/trip"

const TripDashboard = () => {
  // State
  const [timeRange, setTimeRange] = useState<string>("today")
  const [trips, setTrips] = useState<Trip[]>([])
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([])
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalTrips, setTotalTrips] = useState(0)
  const [mapView, setMapView] = useState<"normal" | "satellite">("normal")
  const [showFilters, setShowFilters] = useState(false)
  const [sortField, setSortField] = useState<SortField>("id")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

  const tripsPerPage = 5

  // Status counts with initial values from screenshot
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    enrouteToLoading: 0,
    atLoading: 0,
    atUnloading: 0,
    active: 283,
    yetToStart: 0,
    onTime: 189,
    delayLessThan1Hr: 2,
    delayMoreThan1Hr: 92,
    noUpdate: 103,
    longHalt: 0,
    continuousDriving: 0,
    routeDeviation: 0,
  })

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all")
  const [regionFilter, setRegionFilter] = useState("all")
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [entityFilter, setEntityFilter] = useState("all")
  const [routeFilter, setRouteFilter] = useState("all")
  const [userFilter, setUserFilter] = useState("all")

  // Simulate data loading
  useEffect(() => {
    const loadTrips = async () => {
      setIsLoading(true);
      
      try {
        const tripsData = await generateMockTrips();
        console.log(tripsData);
        // console.log("Trips loaded successfully, count:", tripsData.length);
        
        if (Array.isArray(tripsData) && tripsData.length > 0) {
          setTrips(tripsData);
          setFilteredTrips(tripsData);
          setTotalTrips(tripsData.length);
          console.log(tripsData);
          // Update status counts based on the data
          const newStatusCounts = { ...statusCounts };
          newStatusCounts.active = tripsData.filter(t => t.status === "Active").length;
          newStatusCounts.onTime = Math.floor(newStatusCounts.active * 0.7); // Example calculation
          newStatusCounts.delayLessThan1Hr = Math.floor(newStatusCounts.active * 0.1); // Example calculation
          newStatusCounts.delayMoreThan1Hr = Math.floor(newStatusCounts.active * 0.2); // Example calculation
          setStatusCounts(newStatusCounts);
        } else {

          setTrips([]);
          setFilteredTrips([]);
          setTotalTrips(0);
        }
      } catch (error) {
        console.error("Error loading trips:", error);

        setTrips([]);
        setFilteredTrips([]);
        setTotalTrips(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrips();

  }, []);

  // Handle filtering based on all filter criteria
  useEffect(() => {
    let result = [...trips]

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      console.log(result);
      result = result.filter(
        (trip) =>
          trip.id||
          trip.routeId?.toLowerCase().includes(query) ||
          trip.routeName?.toLowerCase().includes(query) ||
          trip.driverName?.toLowerCase().includes(query) ||
          trip.vehicleName?.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((trip) => trip.status.toLowerCase() === statusFilter.toLowerCase())
    }

    // Apply vehicle status filter
    if (vehicleStatusFilter !== "all") {
      result = result.filter((trip) => trip.vehicleStatus.toLowerCase() === vehicleStatusFilter.toLowerCase())
    }

    // Sort results
    result.sort((a, b) => {
      let valueA: any = a[sortField as keyof Trip]
      let valueB: any = b[sortField as keyof Trip]

      // Handle string comparisons
      if (typeof valueA === "string" && typeof valueB === "string") {
        valueA = valueA.toLowerCase()
        valueB = valueB.toLowerCase()
      }

      // Return comparison based on sort order
      if (sortOrder === "asc") {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0
      }
    })

    setFilteredTrips(result)
    setTotalTrips(result.length)
    // Reset to first page and collapse any expanded row when filters change
    setCurrentPage(1)
    setExpandedTripId(null)
    setSelectedTrip(null)
  }, [
    trips,
    searchQuery,
    statusFilter,
    regionFilter,
    vehicleStatusFilter,
    locationFilter,
    entityFilter,
    routeFilter,
    userFilter,
    sortField,
    sortOrder,
  ])

  // Handle pagination
  const indexOfLastTrip = currentPage * tripsPerPage
  const indexOfFirstTrip = indexOfLastTrip - tripsPerPage
  const currentTrips = filteredTrips.slice(indexOfFirstTrip, indexOfLastTrip)
  const totalPages = Math.ceil(filteredTrips.length / tripsPerPage)

  // Toggle expanded trip
  const toggleExpandTrip = (tripId: string) => {
    if (expandedTripId === tripId) {
      setExpandedTripId(null)
      setSelectedTrip(null)
    } else {
      setExpandedTripId(tripId)
      const trip = trips.find((t) => t.id === tripId) || null
      setSelectedTrip(trip)
    }
  }

  // Handle column sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      // Set new field and default to ascending
      setSortField(field)
      setSortOrder("asc")
    }
    // Reset to first page and collapse any expanded row when sorting changes
    setCurrentPage(1)
    setExpandedTripId(null)
    setSelectedTrip(null)
  }

  const filterProps  = {
    showFilters,
    setShowFilters,
    statusFilter,
    setStatusFilter,
    regionFilter,
    setRegionFilter,
    vehicleStatusFilter,
    setVehicleStatusFilter,
    locationFilter,
    setLocationFilter,
    entityFilter,
    setEntityFilter,
    routeFilter,
    setRouteFilter,
    userFilter,
    setUserFilter,
    searchQuery,
    setSearchQuery,
    filteredTrips: trips
  }

  // Update the pagination logic in the component
  const paginate = (pageNumber: number) => {
    // Close any expanded row when changing pages
    setExpandedTripId(null)
    setSelectedTrip(null)
    setCurrentPage(pageNumber)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TripHeader totalTrips={totalTrips} timeRange={timeRange} setTimeRange={setTimeRange} />

      <TripStatusCards statusCounts={statusCounts} totalTrips={totalTrips} />

      <TripFilters {...filterProps} />

      <div className="flex-1 p-4 sm:p-6">
        <TripTable
          trips={currentTrips}
          isLoading={isLoading}
          totalTrips={totalTrips}
          expandedTripId={expandedTripId}
          toggleExpandTrip={toggleExpandTrip}
          sortField={sortField}
          sortOrder={sortOrder}
          handleSort={handleSort}
          currentPage={currentPage}
          setCurrentPage={paginate}
          totalPages={totalPages}
          indexOfFirstTrip={indexOfFirstTrip}
          indexOfLastTrip={indexOfLastTrip}
          tripsPerPage={tripsPerPage}
        />

        {selectedTrip && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                Trip Route Map - {selectedTrip.vehicleName}
              </h2>
            </div>

            <div className="h-[400px]">
              <TripMap
                trips={[selectedTrip]}
                activeTrips={filteredTrips.filter((trip) => trip.status === "Active")}
                selectedTrip={selectedTrip}
                mapType={mapView}
                setMapType={setMapView}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default TripDashboard