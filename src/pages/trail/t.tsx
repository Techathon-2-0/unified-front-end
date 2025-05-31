import { useState, useEffect, useRef, lazy, Suspense } from "react"
import { motion } from "framer-motion"
import {
  ChevronLeft,
  Filter,
  FileText,
  FileSpreadsheet,
  MapPin,
  Truck,
  Calendar,
  Clock,
  Info,
  Search,
  X,
} from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DatePickerWithRange } from "@/components/trail/date-range-picker"
import { fetchVehicles, fetchVehicleTrails, fetchVehicleTrips, fetchTripTrail } from "../../data/trail/traildata"
import type { TrailType, TrailPoint } from "../../types/trail/trail"
import type { Vehicle } from "../../types/live/list"
import type { Trip } from "../../types/dashboard/trip"

// Lazy load the map component to avoid issues with Leaflet requiring window
const TrailMap = lazy(() => import("@/components/trail/trail-map"))

export default function TrailPage() {
  const [trailType, setTrailType] = useState<TrailType>("vehicle")
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [dateRange, setDateRange] = useState<{
    from: Date
    to: Date
  }>({
    from: new Date(new Date().setHours(0, 0, 0, 0)),
    to: new Date(new Date().setHours(23, 59, 59, 999)),
  })
  const [isLoading, setIsLoading] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [vehicleSearch, setVehicleSearch] = useState("")
  const [trailPoints, setTrailPoints] = useState<TrailPoint[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [currentPointIndex, setCurrentPointIndex] = useState(0)
  const [showSidebar, setShowSidebar] = useState(true)
  const [trailStats, setTrailStats] = useState({
    distance: 0,
    duration: "00:00",
    avgSpeed: 0,
    maxSpeed: 0,
  })
  const [showPoints, setShowPoints] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [vehicleFilter, setVehicleFilter] = useState({
    group: "",
    status: "",
    type: "",
  })
  const calendarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadVehicles()
  }, [])

  useEffect(() => {
    // Handle clicks outside the calendar to close it
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        // Close calendar logic if needed
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const loadVehicles = async () => {
    setIsLoading(true)
    try {
      const data = await fetchVehicles()
      setVehicles(data)
    } catch (error) {
      console.error("Error loading vehicles:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTrailData = async () => {
    if (!selectedVehicle) return

    setIsLoading(true)
    setTrailPoints([])
    setSelectedTrip(null)

    try {
      if (trailType === "vehicle") {
        const data = await fetchVehicleTrails(selectedVehicle.id, dateRange.from, dateRange.to)
        if (data && data.length > 0) {
          setTrailPoints(data)

          // Calculate stats
          const speeds = data.map((point) => point.speed || 0)
          const maxSpeed = Math.max(...speeds)
          const avgSpeed = speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length

          // Calculate duration
          const startTime = new Date(data[0].timestamp).getTime()
          const endTime = new Date(data[data.length - 1].timestamp).getTime()
          const durationMs = endTime - startTime
          const hours = Math.floor(durationMs / (1000 * 60 * 60))
          const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

          // Calculate distance (assuming the last point has cumulative distance)
          const distance = data[data.length - 1].distance || 0

          setTrailStats({
            distance,
            duration: `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`,
            avgSpeed: Math.round(avgSpeed),
            maxSpeed: Math.round(maxSpeed),
          })
        }
      } else {
        const data = await fetchVehicleTrips(selectedVehicle.id)
        setTrips(data)
      }
    } catch (error) {
      console.error("Error loading trail data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTripSelect = async (trip: Trip) => {
    setSelectedTrip(trip)
    setIsLoading(true)

    try {
      // Use the new fetchTripTrail function to get trail points that pass through all stops
      const tripTrailPoints = await fetchTripTrail(trip)

      setTrailPoints(tripTrailPoints)

      // Reset playback
      setCurrentPointIndex(0)
      setIsPlaying(false)
    } catch (error) {
      console.error("Error loading trip trail:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlayPause = () => {
    if (trailPoints.length === 0) return

    if (currentPointIndex >= trailPoints.length - 1) {
      setCurrentPointIndex(0)
    }

    setIsPlaying(!isPlaying)
  }

  const handleExport = (type: "pdf" | "csv") => {
    // Mock export functionality
    alert(`Exporting as ${type.toUpperCase()}...`)
    // In a real app, you would implement the actual export logic here
  }

  const filteredVehicles = vehicles.filter((vehicle) => {
    // Apply search filter
    const matchesSearch =
      vehicle.vehicleNumber.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      vehicle.deviceName.toLowerCase().includes(vehicleSearch.toLowerCase())

    // Apply other filters
    const matchesGroup = vehicleFilter.group === "" || vehicle.group === vehicleFilter.group
    const matchesStatus = vehicleFilter.status === "" || vehicle.status === vehicleFilter.status
    const matchesType = vehicleFilter.type === "" || vehicle.type === vehicleFilter.type

    return matchesSearch && matchesGroup && matchesStatus && matchesType
  })

  // Get unique values for filters
  const groups = [...new Set(vehicles.map((v) => v.group))]
  const statuses = [...new Set(vehicles.map((v) => v.status))]
  const types = [...new Set(vehicles.map((v) => v.type))]

  return (
    <div className="flex flex-col h-160 max-h-screen overflow-hidden bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-wrap sm:flex-nowrap gap-2">
        <div className="flex items-center space-x-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <ChevronLeft size={20} />
          </motion.button>
        </div>
        <div className="flex items-center space-x-2">
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Export as PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                <span>Export as CSV</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}

          <div className="bg-gray-200 rounded-full px-1 py-1 flex items-center w-full sm:w-28 h-10">
  <div
    className="relative w-full h-full flex items-center justify-between px-2 cursor-pointer text-sm"
    onClick={() => setShowPoints(!showPoints)}
  >
    <span className={`z-10 font-medium ${!showPoints ? "text-white" : "text-gray-700"}`}>Line</span>
    <span className={`z-10 font-medium ${showPoints ? "text-white" : "text-gray-700"}`}>Points</span>
    
    <motion.div
      className="absolute top-0 left-0 w-1/2 h-full bg-black rounded-full"
      initial={false}
      animate={{ x: showPoints ? "100%" : "0%" }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    />
  </div>
</div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setFilterOpen(!filterOpen)}
                  className={filterOpen ? "bg-gray-100" : ""}
                >
                  <Filter size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filter options</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <motion.div
          initial={{ width: showSidebar ? 320 : 0 }}
          animate={{ width: showSidebar ? 320 : 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border-r border-gray-200 overflow-y-auto overflow-x-hidden z-20 h-full"
        >
          {showSidebar && (
            <div className="p-4 space-y-6">
              <Tabs defaultValue="vehicle" onValueChange={(value) => setTrailType(value as TrailType)}>
                <TabsList className="w-full">
                  <TabsTrigger value="vehicle" className="flex-1">
                    Vehicle Based
                  </TabsTrigger>
                  <TabsTrigger value="trip" className="flex-1">
                    Trip Based
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="vehicle" className="space-y-4 mt-4">
                  <div ref={calendarRef}>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Date Range</label>
                    <DatePickerWithRange dateRange={dateRange} onChange={setDateRange} />
                  </div>
                </TabsContent>
              </Tabs>

              {filterOpen && (
                <Card className="border-dashed">
                  <CardContent className="p-3 space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">Filter Options</h3>
                      <Button variant="ghost" size="icon" onClick={() => setFilterOpen(false)}>
                        <X size={14} />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-500">Group</label>
                        <Select
                          value={vehicleFilter.group}
                          onValueChange={(value) => setVehicleFilter({ ...vehicleFilter, group: value })}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="All Groups" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Groups</SelectItem>
                            {groups.map((group) => (
                              <SelectItem key={group} value={group}>
                                {group}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-xs text-gray-500">Status</label>
                        <Select
                          value={vehicleFilter.status}
                          onValueChange={(value) => setVehicleFilter({ ...vehicleFilter, status: value })}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="All Statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {statuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-xs text-gray-500">Type</label>
                        <Select
                          value={vehicleFilter.type}
                          onValueChange={(value) => setVehicleFilter({ ...vehicleFilter, type: value })}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="All Types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {types.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setVehicleFilter({ group: "", status: "", type: "" })}
                      >
                        Reset
                      </Button>
                      <Button size="sm" onClick={() => setFilterOpen(false)}>
                        Apply
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Select Vehicle</label>
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      placeholder="Search vehicles..."
                      value={vehicleSearch}
                      onChange={(e) => setVehicleSearch(e.target.value)}
                      className="pl-8"
                    />
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    {vehicleSearch && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                        onClick={() => setVehicleSearch("")}
                      >
                        <X size={14} />
                      </Button>
                    )}
                  </div>

                  <div className="max-h-60 overflow-y-auto border rounded-md">
                    {isLoading ? (
                      <div className="p-4 text-center text-sm text-gray-500">Loading vehicles...</div>
                    ) : filteredVehicles.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">No vehicles found</div>
                    ) : (
                      <div className="divide-y">
                        {filteredVehicles.map((vehicle) => (
                          <motion.div
                            key={vehicle.id}
                            whileHover={{ backgroundColor: "rgba(243, 244, 246, 1)" }}
                            onClick={() => setSelectedVehicle(vehicle)}
                            className={`flex items-center p-3 cursor-pointer ${
                              selectedVehicle?.id === vehicle.id ? "bg-white border-l-4 border-black" : ""
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center">
                                <Truck
                                  className={`h-4 w-4 mr-2 ${
                                    selectedVehicle?.id === vehicle.id ? "text-black" : "text-gray-400"
                                  }`}
                                />
                                <p className="text-sm font-medium truncate">{vehicle.deviceName}</p>
                              </div>
                              <div className="flex items-center mt-1">
                                <p className="text-xs text-gray-500 truncate mr-2">{vehicle.vehicleNumber}</p>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] h-4 ${
                                    vehicle.status === "Moving"
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : "bg-gray-50 text-gray-700 border-gray-200"
                                  }`}
                                >
                                  {vehicle.status}
                                </Badge>
                              </div>
                            </div>
                            {selectedVehicle?.id === vehicle.id && (
                              <div className="text-xs text-gray-500 flex flex-col items-end">
                                <span className="font-medium text-black">{Math.round(vehicle.speed)} km/h</span>
                                <span>{vehicle.type}</span>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedVehicle && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium">{selectedVehicle.deviceName}</h3>
                      <p className="text-xs text-gray-500">{selectedVehicle.vehicleNumber}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${
                        selectedVehicle.status === "Moving"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-50 text-gray-700 border-gray-200"
                      }`}
                    >
                      {selectedVehicle.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                    <div className="flex items-center">
                      <Info className="h-3 w-3 mr-1 text-gray-400" />
                      <span className="text-gray-500">Type:</span>
                      <span className="ml-1 font-medium">{selectedVehicle.type}</span>
                    </div>
                    <div className="flex items-center">
                      <Info className="h-3 w-3 mr-1 text-gray-400" />
                      <span className="text-gray-500">Speed:</span>
                      <span className="ml-1 font-medium">{Math.round(selectedVehicle.speed)} km/h</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                      <span className="text-gray-500">GPS:</span>
                      <span className="ml-1 font-medium">{format(new Date(selectedVehicle.gpsTime), "HH:mm:ss")}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1 text-gray-400" />
                      <span className="text-gray-500">GPRS:</span>
                      <span className="ml-1 font-medium">{format(new Date(selectedVehicle.gprsTime), "HH:mm:ss")}</span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={loadTrailData}
                disabled={!selectedVehicle}
                className="w-full bg-black hover:bg-gray-800 text-white"
              >
                Track
              </Button>

              {trailType === "trip" && trips.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700">Select Trip</h3>
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      {trips.length} trips
                    </Badge>
                  </div>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {trips.map((trip) => (
                      <Card
                        key={trip.id}
                        className={`cursor-pointer hover:border-red-300 transition-all ${
                          selectedTrip?.id === trip.id ? "border-red-500 shadow-sm" : ""
                        }`}
                        onClick={() => handleTripSelect(trip)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start">
                            <div className="flex flex-col items-center mr-3">
                              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              </div>
                              <div className="w-0.5 h-8 bg-gray-200"></div>
                              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="mb-1">
                                <p className="text-sm font-medium truncate">{trip.routeName}</p>
                                <p className="text-xs text-gray-500">
                                  {format(new Date(trip.startTime), "dd MMM yyyy HH:mm")}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-medium truncate">{trip.location}</p>
                                <p className="text-xs text-gray-500">
                                  {format(new Date(trip.endTime), "dd MMM yyyy HH:mm")}
                                </p>
                              </div>

                              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] ${
                                    trip.status === "Completed"
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : trip.status === "Active"
                                        ? "bg-blue-50 text-blue-700 border-blue-200"
                                        : trip.status === "Delayed"
                                          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                          : "bg-gray-50 text-gray-700 border-gray-200"
                                  }`}
                                >
                                  {trip.status}
                                </Badge>

                                <div className="flex items-center space-x-3 text-xs">
                                  <div className="text-center">
                                    <span className="text-gray-500">Drive:</span>{" "}
                                    <span className="font-medium">{trip.totalDriveTime}</span>
                                  </div>
                                  <div className="text-center">
                                    <span className="text-gray-500">Stops:</span>{" "}
                                    <span className="font-medium">{trip.stops.length}</span>
                                  </div>
                                </div>
                              </div>

                              {selectedTrip?.id === trip.id && (
                                <Button
                                  size="sm"
                                  className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setIsPlaying(true)
                                  }}
                                >
                                  Play Trail
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Map */}
          <div className="flex-1 relative w-full h-full min-h-[300px]">
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading map...</p>
                  </div>
                </div>
              }
            >
              <TrailMap
                trailPoints={trailPoints}
                tripStops={selectedTrip?.stops || []}
                isPlaying={isPlaying}
                currentPointIndex={currentPointIndex}
                setCurrentPointIndex={setCurrentPointIndex}
                playbackSpeed={playbackSpeed}
                trailType={trailType}
                setIsPlaying={setIsPlaying}
                showPoints={showPoints}
              />
            </Suspense>
          </div>

          {/* Bottom Controls */}
          {trailPoints.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white border-t border-gray-200 p-4"
            >
              <div className="flex items-start flex-wrap md:flex-nowrap">
                <div className="flex items-center space-x-2 w-full md:w-1/3 mb-3 md:mb-0">
                  <MapPin className="text-gray-500 flex-shrink-0" size={20} />
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {currentPointIndex < trailPoints.length
                        ? trailPoints[currentPointIndex].location || "Unknown Location"
                        : "Unknown Location"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {trailPoints.length > 0
                        ? format(new Date(trailPoints[0].timestamp), "HH:mm:ss | MMM dd yyyy")
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center w-full md:w-auto">
                  <div className="flex items-center space-x-4 mb-2 flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setCurrentPointIndex(Math.max(0, currentPointIndex - 10))
                        if (isPlaying) setIsPlaying(false)
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 19L5 12L12 5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M19 19L12 12L19 5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full h-10 w-10 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                      onClick={handlePlayPause}
                    >
                      {isPlaying ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 4H6V20H10V4Z" fill="currentColor" />
                          <path d="M18 4H14V20H18V4Z" fill="currentColor" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 3L19 12L5 21V3Z" fill="currentColor" />
                        </svg>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setCurrentPointIndex(Math.min(trailPoints.length - 1, currentPointIndex + 10))
                        if (isPlaying) setIsPlaying(false)
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 5L19 12L12 19"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M5 5L12 12L5 19"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Button>

                    <Select value={playbackSpeed.toString()} onValueChange={(value) => setPlaybackSpeed(Number(value))}>
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="Speed" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.5">0.5x</SelectItem>
                        <SelectItem value="1">1x</SelectItem>
                        <SelectItem value="2">2x</SelectItem>
                        <SelectItem value="4">4x</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={trailPoints.length - 1}
                    value={currentPointIndex}
                    onChange={(e) => {
                      setCurrentPointIndex(Number(e.target.value))
                      if (isPlaying) setIsPlaying(false)
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="w-full md:w-1/3 flex justify-end mt-3 md:mt-0">
                  <div className="grid grid-cols-2 gap-4 text-right">
                    <div>
                      <p className="text-xs text-gray-500">Distance (Kms)</p>
                      <p className="text-xl font-bold">
                        {currentPointIndex < trailPoints.length && trailPoints[currentPointIndex].distance
                          ? Math.round(trailPoints[currentPointIndex].distance)
                          : "0"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Time (Hrs : Mins)</p>
                      <div className="flex items-center justify-end">
                        <p className="text-xl font-bold">{trailStats.duration}</p>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Speed</p>
                      <p className="text-3xl font-bold">
                        {currentPointIndex < trailPoints.length
                          ? Math.round(trailPoints[currentPointIndex].speed || 0)
                          : 0}
                        <span className="text-sm font-normal">Km/h</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
