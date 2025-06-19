import { useState, useEffect, lazy, Suspense } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  MapPin,
  Clock,
  Route,
  Gauge,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/trail/date-range-picker"
import TrailTypeSelector from "@/components/trail/trail-type-selector"
import VehicleDetails from "@/components/trail/vehicle-details"
import SpeedChart from "@/components/trail/speed-chart"
import { fetchVehicleTrail, fetchTripTrail } from "../../data/trail/traildata"
import type { VehicleTrailResponse, TripTrailResponse } from "../../types/trail/trail_type"
import type { TrailType } from "../../types/trail/trail_type"

const TrailMap = lazy(() => import("@/components/trail/trail-map"))

export default function TrailPage() {
  const [trailType, setTrailType] = useState<TrailType>("vehicle")
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })

  // Search states
  const [vehicleSearch, setVehicleSearch] = useState("")
  const [shipmentSearch, setShipmentSearch] = useState("")

  // Data states
  const [vehicleData, setVehicleData] = useState<VehicleTrailResponse | null>(null)
  const [tripData, setTripData] = useState<TripTrailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // UI states
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Playback states
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [currentPointIndex, setCurrentPointIndex] = useState(0)
  const [showPoints, setShowPoints] = useState(false)
  const [showPlannedSequence, setShowPlannedSequence] = useState(true)
  const [showTrailControls, setShowTrailControls] = useState(false)

  // Search for vehicle trail
  const handleVehicleSearch = async () => {
    if (!vehicleSearch.trim()) {
      setError("Please enter a vehicle number")
      return
    }

    setIsLoading(true)
    setError(null)
    setVehicleData(null)
    setShowTrailControls(false)

    try {
      const startTime = dateRange.from ? dateRange.from.toISOString() : ""
      const endTime = dateRange.to ? dateRange.to.toISOString() : ""

      const data = await fetchVehicleTrail(vehicleSearch.trim(), startTime, endTime)

      if (data) {
        setVehicleData(data)
      } else {
        setError("No trail data found for this vehicle")
      }
    } catch (err) {
      setError("Failed to fetch vehicle trail data")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Search for trip trail
  const handleTripSearch = async () => {
    if (!shipmentSearch.trim()) {
      setError("Please enter a shipment ID")
      return
    }

    setIsLoading(true)
    setError(null)
    setTripData(null)
    setShowTrailControls(false)

    try {
      const data = await fetchTripTrail(shipmentSearch.trim())

      if (data) {
        setTripData(data)
      } else {
        setError("No trail data found for this shipment")
      }
    } catch (err) {
      setError("Failed to fetch trip trail data")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Play trail handler
  const handlePlayTrail = () => {
    setShowTrailControls(true)
    setCurrentPointIndex(0)
    setIsPlaying(true)
  }

  // Playback controls
  const handlePlayPause = () => {
    const currentData = trailType === "vehicle" ? vehicleData : tripData
    if (!currentData) return

    // Determine the data length for playback
    let dataLength = 0
    if (trailType === "trip" && showPlannedSequence && tripData?.stops) {
      dataLength = tripData.stops.length
    } else {
      dataLength = currentData.trailPoints.length
    }

    if (dataLength === 0) return

    if (currentPointIndex >= dataLength - 1) {
      setCurrentPointIndex(0)
    }

    setIsPlaying(!isPlaying)
  }

  // Auto-advance playback
  useEffect(() => {
    if (!isPlaying) return

    const currentData = trailType === "vehicle" ? vehicleData : tripData
    if (!currentData) return

    // Determine the data source for playback
    let dataLength = 0
    if (trailType === "trip" && showPlannedSequence && tripData?.stops) {
      // For planned sequence, use stops length
      dataLength = tripData.stops.length
    } else {
      // For vehicle mode or trip actual sequence, use trail points
      dataLength = currentData.trailPoints.length
    }

    if (dataLength === 0) return

    const interval = setInterval(() => {
      setCurrentPointIndex((prev) => {
        if (prev >= dataLength - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 1000 / playbackSpeed)

    return () => clearInterval(interval)
  }, [isPlaying, playbackSpeed, vehicleData, tripData, trailType, showPlannedSequence])

  const currentData = trailType === "vehicle" ? vehicleData : tripData
  const currentPoint = currentData?.trailPoints[currentPointIndex]

  // Calculate current stats
  const calculateCurrentStats = () => {
    if (!currentData || currentPointIndex === 0) {
      return { currentDistance: 0, currentTime: "00:00:00" }
    }

    // For planned sequence in trip mode, calculate based on stops
    if (trailType === "trip" && showPlannedSequence && tripData?.stops) {
      const sortedStops = [...tripData.stops].sort((a, b) => a.plannedSequence - b.plannedSequence)

      if (currentPointIndex >= sortedStops.length || currentPointIndex === 0) {
        return { currentDistance: 0, currentTime: "00:00:00" }
      }

      // Calculate distance between stops
      let currentDistance = 0
      for (let i = 1; i <= currentPointIndex; i++) {
        const prevStop = sortedStops[i - 1]
        const currStop = sortedStops[i]

        const R = 6371 // Earth's radius in kilometers
        const dLat = ((currStop.latitude - prevStop.latitude) * Math.PI) / 180
        const dLon = ((currStop.longitude - prevStop.longitude) * Math.PI) / 180
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((prevStop.latitude * Math.PI) / 180) *
            Math.cos((currStop.latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        currentDistance += R * c
      }

      // For stops, show sequence number as time
      const currentTimeFormatted = `Stop ${currentPointIndex + 1}/${sortedStops.length}`

      return { currentDistance, currentTime: currentTimeFormatted }
    }

    // For trail points (vehicle mode or trip actual sequence)
    const currentPoint = currentData.trailPoints[currentPointIndex]
    if (!currentPoint) {
      return { currentDistance: 0, currentTime: "00:00:00" }
    }

    // Calculate distance covered from start to current position
    let currentDistance = 0
    for (let i = 1; i <= currentPointIndex; i++) {
      const prevPoint = currentData.trailPoints[i - 1]
      const currPoint = currentData.trailPoints[i]

      // Calculate distance between two points using Haversine formula
      const R = 6371 // Earth's radius in kilometers
      const dLat = ((currPoint.latitude - prevPoint.latitude) * Math.PI) / 180
      const dLon = ((currPoint.longitude - prevPoint.longitude) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((prevPoint.latitude * Math.PI) / 180) *
          Math.cos((currPoint.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      currentDistance += R * c
    }

    // Calculate time elapsed from start to current position
    const startTime = new Date(currentData.trailPoints[0].time).getTime()
    const currentTime = new Date(currentPoint.time).getTime()
    const elapsedMs = currentTime - startTime

    const hours = Math.floor(elapsedMs / (1000 * 60 * 60))
    const minutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((elapsedMs % (1000 * 60)) / 1000)

    const currentTimeFormatted = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

    return { currentDistance, currentTime: currentTimeFormatted }
  }

  const { currentDistance, currentTime } = calculateCurrentStats()

  // Exit fullscreen on Escape key
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

  return (
    <div className={`flex h-162 bg-gray-50 dark:bg-gray-900 ${isFullscreen ? "fixed inset-0 z-50 bg-white dark:bg-gray-900" : ""}`}>
      {/* Sidebar */}
      {!isFullscreen && (
        <motion.div
          initial={{ width: sidebarExpanded ? 360 : 55 }}
          animate={{ width: sidebarExpanded ? 360 : 55 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col rounded-l-2xl"
        >
          {/* Sidebar Header */}
          <div
            className="p-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between" // changed p-4 to p-2 for less height
            style={{ minHeight: 40, height: 55 }} // enforce smaller height
          >
            {/* {sidebarExpanded && <h1 className="text-xl font-semibold dark:text-white">Trail Tracking</h1>} */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className={`dark:text-gray-300 dark:hover:bg-gray-700 ${
                !sidebarExpanded ? "mr-2" : ""
              }`} // add right margin when collapsed
            >
              {sidebarExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>

          {/* Sidebar Content */}
          {sidebarExpanded && (
            <div className="flex flex-col overflow-y-auto p-4 space-y-6">
              <div className="flex justify-center">
              <TrailTypeSelector value={trailType} onChange={setTrailType} />
              </div>

              {trailType === "vehicle" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Date & Time Range
                    </label>
                    <DatePickerWithRange
                      dateRange={dateRange}
                      onChange={(range) => {
                        setDateRange({ from: range.from, to: range.to })
                      }}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Vehicle Number
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Enter vehicle number..."
                        value={vehicleSearch}
                        onChange={(e) => setVehicleSearch(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleVehicleSearch()}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <Button
                        onClick={handleVehicleSearch}
                        disabled={isLoading}
                        className="bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                      >
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {trailType === "trip" && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Shipment ID</label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter shipment ID..."
                      value={shipmentSearch}
                      onChange={(e) => setShipmentSearch(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleTripSearch()}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <Button
                      onClick={handleTripSearch}
                      disabled={isLoading}
                      className="bg-black hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading...</span>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Vehicle/Trip Details */}
              {currentData && <VehicleDetails data={currentData} type={trailType} onPlayTrail={handlePlayTrail} />}

              {/* Speed Chart */}
              {currentData && showTrailControls && !(
                trailType === "trip" && showPlannedSequence
              ) && (
                <SpeedChart trailPoints={currentData.trailPoints} currentPointIndex={currentPointIndex} />
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 rounded-tr-2xl ${isFullscreen ? "rounded-tr-none" : ""}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold dark:text-white">
              {currentData
                ? trailType === "vehicle"
                  ? `Vehicle: ${currentData.vehicleNumber}`
                  : `Trip: ${(currentData as TripTrailResponse).shipmentId}`
                : "Trail Map"}
            </h2>
            <div className="flex items-center space-x-2">
              {/* Fullscreen Button (duplicate for header, optional)
              {!currentData ? null : (
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white dark:bg-gray-800 shadow-md"
                  onClick={() => setIsFullscreen((v) => !v)}
                  aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
              )} */}
              {/* Line/Points Toggle */}
              {currentData && (
                <div className="flex items-center space-x-2">
                  {/* Line/Points Toggle */}
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full px-1 py-1 flex items-center w-28 h-10">
                    <div
                      className="relative w-full h-full flex items-center justify-between px-2 cursor-pointer text-sm"
                      onClick={() => setShowPoints(!showPoints)}
                    >
                      <span
                        className={`z-10 font-medium ${!showPoints ? "text-white" : "text-gray-700 dark:text-gray-300"}`}
                      >
                        Line
                      </span>
                      <span
                        className={`z-10 font-medium ${showPoints ? "text-white" : "text-gray-700 dark:text-gray-300"}`}
                      >
                        Points
                      </span>

                      <motion.div
                        className="absolute top-0 left-0 w-1/2 h-full bg-black rounded-full"
                        initial={false}
                        animate={{ x: showPoints ? "100%" : "0%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      />
                    </div>
                  </div>

                  {/* Planned/Actual Toggle for Trip */}
                  {/* {trailType === "trip" && tripData && tripData.stops && tripData.stops.length > 0 && (
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full px-1 py-1 flex items-center w-32 h-10">
                      <div
                        className="relative w-full h-full flex items-center justify-between px-2 cursor-pointer text-sm"
                        onClick={() => setShowPlannedSequence(!showPlannedSequence)}
                      >
                        <span
                          className={`z-10 font-medium ${showPlannedSequence ? "text-white" : "text-gray-700 dark:text-gray-300"}`}
                        >
                          Planned
                        </span>
                        <span
                          className={`z-10 font-medium ${!showPlannedSequence ? "text-white" : "text-gray-700 dark:text-gray-300"}`}
                        >
                          Actual
                        </span>

                        <motion.div
                          className="absolute top-0 left-0 w-1/2 h-full bg-green-600 rounded-full"
                          initial={false}
                          animate={{ x: showPlannedSequence ? "0%" : "100%" }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        />
                      </div>
                    </div>
                  )} */}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          {currentData ? (
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading map...</p>
                  </div>
                </div>
              }
            >
              <TrailMap
                trailPoints={currentData.trailPoints}
                stops={trailType === "trip" ? (currentData as TripTrailResponse).stops : []}
                isPlaying={isPlaying}
                currentPointIndex={currentPointIndex}
                setCurrentPointIndex={setCurrentPointIndex}
                playbackSpeed={playbackSpeed}
                trailType={trailType}
                setIsPlaying={setIsPlaying}
                showPoints={showPoints}
                showPlannedSequence={showPlannedSequence}
                setShowPlannedSequence={setShowPlannedSequence}
                isFullscreen={isFullscreen}
                onToggleFullscreen={() => setIsFullscreen((v) => !v)}
              />
            </Suspense>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-br-2xl">
              <div className="text-center">
                <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No Trail Data</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Search for a {trailType === "vehicle" ? "vehicle" : "shipment"} to view trail data
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Trail Controls */}
        {showTrailControls && currentData && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={`bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 ${isFullscreen ? "" : "rounded-br-2xl"}`}
            style={isFullscreen ? { position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 100 } : {}}
          >
            {/* Progress Slider */}
            <div className="px-7 py-3 border-b border-gray-200 dark:border-gray-700">
              <input
                type="range"
                min="0"
                max={(() => {
                  if (trailType === "trip" && showPlannedSequence && tripData?.stops) {
                    return tripData.stops.length - 1
                  }
                  return currentData ? currentData.trailPoints.length - 1 : 0
                })()}
                value={currentPointIndex}
                onChange={(e) => {
                  setCurrentPointIndex(Number(e.target.value))
                  if (isPlaying) setIsPlaying(false)
                }}
                className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Controls and Info */}
            <div className="px-7 py-6">
              <div className="flex items-center justify-between space-x-4">
                {/* Current Location Info */}
                <div className="flex items-center space-x-2 min-w-0">
                  <MapPin className="text-gray-500 dark:text-gray-400 flex-shrink-0" size={20} />
                  <div className="min-w-0">
                    {/* Tooltip for address */}
                    <div className="relative group max-w-xs">
                      <div className="truncate cursor-default text-sm max-w-[170px]">
                        {(() => {
                          if (trailType === "trip" && showPlannedSequence && tripData?.stops) {
                            const sortedStops = [...tripData.stops].sort((a, b) => a.plannedSequence - b.plannedSequence)
                            const currentStop = sortedStops[currentPointIndex]
                            return currentStop ? currentStop.stopName : "Unknown Stop"
                          }
                          return currentPoint?.address || "Unknown Location"
                        })()}
                      </div>
                      {/* Tooltip only if address exists and not in planned stops mode */}
                      {(() => {
                        if (trailType === "trip" && showPlannedSequence && tripData?.stops) {
                          const sortedStops = [...tripData.stops].sort((a, b) => a.plannedSequence - b.plannedSequence)
                          const currentStop = sortedStops[currentPointIndex]
                          return currentStop?.stopName ? (
                            <div className="absolute left-0 bottom-full mb-2 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-md shadow-xl border border-slate-700 z-10 min-w-0 w-max max-w-[300px] break-words whitespace-normal opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out transform group-hover:-translate-y-1 translate-y-1">
                              <div className="font-medium text-slate-100 leading-snug break-words">
                                {currentStop.stopName}
                              </div>
                              <div className="absolute -bottom-1 left-4 w-2 h-2 bg-slate-900 dark:bg-slate-800 border-r border-b border-slate-700 transform rotate-45"></div>
                            </div>
                          ) : null
                        }
                        if (currentPoint?.address) {
                          return (
                            <div className="absolute left-0 bottom-full mb-2 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-md shadow-xl border border-slate-700 z-10 min-w-0 w-max max-w-[300px] break-words whitespace-normal opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out transform group-hover:-translate-y-1 translate-y-1">
                              <div className="font-medium text-slate-100 leading-snug break-words">
                                {currentPoint.address}
                              </div>
                              <div className="absolute -bottom-1 left-4 w-2 h-2 bg-slate-900 dark:bg-slate-800 border-r border-b border-slate-700 transform rotate-45"></div>
                            </div>
                          )
                        }
                        return null
                      })()}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(() => {
                        if (trailType === "trip" && showPlannedSequence && tripData?.stops) {
                          const sortedStops = [...tripData.stops].sort((a, b) => a.plannedSequence - b.plannedSequence)
                          const currentStop = sortedStops[currentPointIndex]
                          return currentStop ? `Sequence ${currentStop.plannedSequence} | ${currentStop.status}` : ""
                        }
                        return currentPoint?.time ? format(new Date(currentPoint.time), "HH:mm:ss | MMM dd yyyy") : ""
                      })()}
                    </p>
                  </div>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPointIndex(Math.max(0, currentPointIndex - 10))}
                  >
                    <SkipBack size={16} />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePlayPause}
                    className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setCurrentPointIndex(Math.min(currentData.trailPoints.length - 1, currentPointIndex + 10))
                    }
                  >
                    <SkipForward size={16} />
                  </Button>

                  <Select value={playbackSpeed.toString()} onValueChange={(value) => setPlaybackSpeed(Number(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5x</SelectItem>
                      <SelectItem value="1">1x</SelectItem>
                      <SelectItem value="2">2x</SelectItem>
                      <SelectItem value="4">4x</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Route className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Distance</p>
                    <p className="font-semibold dark:text-white">{currentDistance.toFixed(1)} km</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
                    <p className="font-semibold dark:text-white">{currentTime}</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Gauge className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Speed</p>
                    <p className="font-semibold dark:text-white">
                      {currentPoint ? Math.round(currentPoint.speed) : 0} km/h
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
