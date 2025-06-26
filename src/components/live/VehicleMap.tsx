import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import type { Vehicle } from "../../types/live/list_type"
import { Maximize, Minimize, RotateCcw, Layers, Search, List, X, Info } from "lucide-react"
import L from "leaflet"
import type { VehicleMapProps } from "../../types/live/list_type"
import { renderToString } from "react-dom/server";
import getVehicle3DSVG from "./vehicleicon"
import VehicleDetailsModal from "./VehicleDetailsModal"

const VehicleMap = ({ vehicles, loading, filters, onFilterChange }: VehicleMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<L.Map | null>(null)
  const [markers, setMarkers] = useState<L.Marker[]>([])
  // Persist fullscreen state in localStorage
  const [isFullscreen, setIsFullscreen] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("vehicleMapFullscreen") === "true"
    }
    return false
  })
  const [mapType, setMapType] = useState<"standard" | "satellite">("standard")
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  // const [hoveredVehicle, setHoveredVehicle] = useState<Vehicle | null>(null)
  const [showVehicleList, setShowVehicleList] = useState(true)
  const [detailsVehicle, setDetailsVehicle] = useState<Vehicle | null>(null)

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || map) return

    // Create map instance
    const mapInstance = L.map(mapContainerRef.current, {
      center: [20.5937, 78.9629], // Center of India
      zoom: 5,
      zoomControl: false,
    })

    // Add tile layer (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInstance)

    // Add zoom control to a specific position
    L.control
      .zoom({
        position: "bottomright",
      })
      .addTo(mapInstance)

    setMap(mapInstance)

    // Cleanup function
    return () => {
      if (mapInstance) {
        mapInstance.remove()
      }
    }
  }, [mapContainerRef])

  // Add markers for vehicles
  useEffect(() => {
    if (!map) return

    // Clear existing markers
    markers.forEach((marker) => marker.remove())
    const newMarkers: L.Marker[] = []

    // Create custom icon based on vehicle status
    // Enhanced 3D vehicle icon function - replace your existing getVehicle3DSVG function


    // Also update your createCustomIcon function to use the enhanced icons
    const createCustomIcon = (vehicle: Vehicle) => {
      const statusColor = getStatusColor(vehicle.status, true)

      return L.divIcon({
        className: "custom-div-icon",
        html: renderToString(
          <div
            style={{
              width: "60px", // Increased from 50px
              height: "60px", // Increased from 50px
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              margin: 0,
              lineHeight: 1,
              position: "relative",
              transform: "perspective(120px) rotateX(45deg)", // Adjusted perspective
              transformStyle: "preserve-3d",
            }}>

            {/* Vehicle SVG container with better sizing */}
            <div
              style={{
                width: "45px", // Larger vehicle size
                height: "45px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: "scale(1.2)", // Scale up the vehicle
              }}>
              {getVehicle3DSVG(vehicle.type)}
            </div>

            {/* Status indicator positioned directly on vehicle */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(15px, -15px) rotateX(-45deg) translateZ(15px)", // Position on vehicle corner
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: statusColor,
                border: "2px solid white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4)",
                zIndex: 10,
              }}
            />
          </div>
        ),
        iconSize: [60, 60], // Increased icon size
        iconAnchor: [30, 20], // Adjusted anchor point for better positioning
      });
    }

    // Add markers for each vehicle
    vehicles.forEach((vehicle) => {
      if (vehicle.lat && vehicle.lng) {
        const marker = L.marker([vehicle.lat, vehicle.lng], {
          icon: createCustomIcon(vehicle),
        }).addTo(map)

        // Add popup with vehicle info - adding dark mode compatibility for popups
        marker.bindPopup(`
          <div style="min-width: 200px; color: var(--leaflet-popup-text, #333); background: var(--leaflet-popup-bg, white);">
            <h3 style="font-weight: bold; margin-bottom: 5px;">${vehicle.vehicleNumber}</h3>
            <p style="margin: 2px 0;"><strong>Speed:</strong> ${vehicle.speed ? vehicle.speed : "0"} km/h</p>
            <p style="margin: 2px 0;"><strong>Status:</strong> ${vehicle.status}</p>
            <p style="margin: 2px 0;"><strong>Type:</strong> ${vehicle.type}</p>
            <p style="margin: 2px 0;"><strong>Lat/Lng:</strong> ${vehicle.lat}, ${vehicle.lng}</p>
          </div>
        `)

        // Add event listeners
        // marker.on("mouseover", () => {
        //   setHoveredVehicle(vehicle)
        // })

        // marker.on("mouseout", () => {
        //   setHoveredVehicle(null)
        // })

        marker.on("click", () => {
          setSelectedVehicle(vehicle)
          marker.openPopup()
        })

        newMarkers.push(marker)
      }
    })

    setMarkers(newMarkers)

    // Fit bounds to show all markers if there are any
    if (newMarkers.length > 0) {
      const group = L.featureGroup(newMarkers)
      map.fitBounds(group.getBounds(), { padding: [50, 50] })
    }
  }, [map, vehicles])

  // Fix: Invalidate map size after fullscreen or map is set (for correct rendering)
  useEffect(() => {
    if (map) {
      setTimeout(() => {
        map.invalidateSize()
      }, 300)
    }
  }, [map, isFullscreen])

  // Sync fullscreen state to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("vehicleMapFullscreen", isFullscreen ? "true" : "false")
    }
  }, [isFullscreen])

  // Listen for Escape key to exit fullscreen
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

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev)
    // Trigger map resize after state change and animation
    setTimeout(() => {
      if (map) map.invalidateSize()
    }, 500)
  }

  const toggleMapType = () => {
    if (!map) return

    // Remove current tile layer
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer)
      }
    })

    // Add new tile layer based on selected type
    if (mapType === "standard") {
      // Switch to satellite
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        attribution:
          "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
      }).addTo(map)
      setMapType("satellite")
    } else {
      // Switch to standard
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)
      setMapType("standard")
    }
  }

  const resetMapView = () => {
    if (!map) return

    // Fit bounds to show all markers
    if (markers.length > 0) {
      const group = L.featureGroup(markers)
      map.fitBounds(group.getBounds(), { padding: [50, 50] })
    } else {
      // Default view of India if no markers
      map.setView([20.5937, 78.9629], 5)
    }
  }

  const getStatusColor = (status: string, forMap = false) => {
    switch (status) {
      case "Active":
        return forMap ? "#22c55e" : "bg-green-500"
      case "No Update":
        return forMap ? "#eab308" : "bg-yellow-500"
      case "No Data":
        return forMap ? "#ef4444" : "bg-red-500"
      default:
        return forMap ? "#6b7280" : "bg-gray-500"
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 },
    },
  }

  const listVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.2 },
    },
  }

  const mapVariants = {
    fullscreen: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 50,
      borderRadius: 0,
    },
    normal: {
      position: "relative" as const,
      top: "auto",
      left: "auto",
      right: "auto",
      bottom: "auto",
      zIndex: 10,
      borderRadius: "0.75rem",
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={
        `grid grid-cols-1 ` +
        (
          !showVehicleList && !isFullscreen
            ? `md:grid-cols-1`
            : `md:grid-cols-[320px_1fr]`
        ) +
        ` gap-4 h-[calc(100vh-240px)]`
      }
    >
      {showVehicleList && !isFullscreen && (
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-full"
        >
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Search vehicles..."
                value={filters.search}
                onChange={(e) => onFilterChange({ search: e.target.value })}
              />
            </div>
          </div>
          <div className="overflow-y-auto h-[calc(100%-56px)]">
            {loading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <div className="flex justify-center items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                  <span>Loading...</span>
                </div>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">No vehicles found</div>
            ) : (
              <motion.ul
                className="divide-y divide-gray-200 dark:divide-gray-700"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05,
                    },
                  },
                }}
              >
                {vehicles.map((vehicle) => (
                  <motion.li
                    key={vehicle.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          type: "spring",
                          stiffness: 100,
                          damping: 15,
                        },
                      },
                    }}
                    className={`relative p-3 cursor-pointer hover:bg-[rgba(243,244,246,1)] dark:hover:bg-[rgba(55,65,81,0.8)]  ${selectedVehicle?.id === vehicle.id ? "bg-red-50 dark:bg-red-900/20" : ""}`}
                    onClick={() => {
                      setSelectedVehicle(vehicle)
                      // Find and open popup for this vehicle
                      if (map && vehicle.lat && vehicle.lng) {
                        map.setView([vehicle.lat, vehicle.lng], 15)
                        markers.forEach((marker) => {
                          const markerLatLng = marker.getLatLng()
                          if (markerLatLng.lat === vehicle.lat && markerLatLng.lng === vehicle.lng) {
                            marker.openPopup()
                          }
                        })
                      }
                    }}
                    // onMouseEnter={() => setHoveredVehicle(vehicle)}
                    // onMouseLeave={() => setHoveredVehicle(null)}
                  >
                    {/* Info button at top right of each vehicle item with tooltip */}

                    <div className="flex items-start">
                      <div className={`mt-1 h-3 w-3 rounded-full ${getStatusColor(vehicle.status)}`}></div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{vehicle.vehicleNumber}</p>
                        <div className="absolute top-4 right-4 z-10 group">
                          <button
                            className="text-black dark:text-white hover:text-gray-800 dark:hover:text-gray-300"
                            onClick={e => {
                              e.stopPropagation()
                              setDetailsVehicle(vehicle)
                            }}
                            title="Expand to view vehicle details"
                            tabIndex={0}
                          >
                            <Info className="h-5 w-5" />
                          </button>
                          {/* <div className="absolute right-0 mt-1 px-2 py-1 bg-black text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                            Expand to view vehicle details
                          </div> */}
                        </div>
                        {/* <p className="text-xs text-gray-500 dark:text-gray-400">{vehicle.deviceName}</p> */}
                        <div className="mt-1 flex items-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{vehicle.speed || "0"} km/h</span>
                          <span className="mx-1 text-gray-300 dark:text-gray-600">•</span>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded-full ${getStatusColor(vehicle.status)} bg-opacity-20`}
                          >
                            {vehicle.status}
                          </span>
                        </div>
                        {/* <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{vehicle.address}</p> */}
                      </div>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </div>
        </motion.div>
      )}

      <motion.div
        initial="normal"
        animate={isFullscreen ? "fullscreen" : "normal"}
        variants={mapVariants}
        transition={{ duration: 0.3 }}
        className="relative bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 h-full [--leaflet-popup-bg:white] [--leaflet-popup-text:#333] "
      >
        {/* Map Control Buttons - Fixed positioning and z-index */}
        <div className="absolute top-4 right-4 z-[1000] flex gap-2 pointer-events-auto">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleFullscreen}
            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
            style={{ pointerEvents: 'auto' }}
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleMapType}
            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
            style={{ pointerEvents: 'auto' }}
          >
            <Layers className="h-5 w-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={resetMapView}
            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
            style={{ pointerEvents: 'auto' }}
          >
            <RotateCcw className="h-5 w-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowVehicleList(!showVehicleList)}
            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 md:hidden"
            style={{ pointerEvents: 'auto' }}
          >
            {showVehicleList ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
          </motion.button>
        </div>

        {/* Add expand/collapse button for vehicle list in normal mode */}
        {!isFullscreen && (
          <button
            className="absolute top-4 left-4 z-[1001] p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
            onClick={() => setShowVehicleList((v) => !v)}
            title={showVehicleList ? "Hide vehicle list" : "Show vehicle list"}
          >
            {showVehicleList ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
          </button>
        )}

        {isFullscreen && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowVehicleList(!showVehicleList)}
            className="absolute top-4 left-4 z-[1000] p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
            style={{ pointerEvents: 'auto' }}
          >
            {showVehicleList ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
          </motion.button>
        )}

        {isFullscreen && showVehicleList && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-16 left-4 z-[1000] w-80 max-h-[calc(100vh-120px)] bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none  bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Search vehicles..."
                  value={filters.search}
                  onChange={(e) => onFilterChange({ search: e.target.value })}
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-180px)]">
              {loading ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex justify-center items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                    <span>Loading...</span>
                  </div>
                </div>
              ) : vehicles.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">No vehicles found</div>
              ) : (
                <motion.ul
                  className="divide-y divide-gray-200 dark:divide-gray-700"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.05,
                      },
                    },
                  }}
                >
                  {vehicles.map((vehicle) => (
                    <motion.li
                      key={vehicle.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: {
                            type: "spring",
                            stiffness: 100,
                            damping: 15,
                          },
                        },
                      }}
                      className={`p-3 cursor-pointer hover:bg-[rgba(243,244,246,1)] dark:hover:bg-[rgba(55,65,81,0.8)] ${selectedVehicle?.id === vehicle.id ? "bg-red-50 dark:bg-red-900/20" : ""}`}
                      onClick={() => {
                        setSelectedVehicle(vehicle)
                        // Find and open popup for this vehicle
                        if (map && vehicle.lat && vehicle.lng) {
                          map.setView([vehicle.lat, vehicle.lng], 15)
                          markers.forEach((marker) => {
                            const markerLatLng = marker.getLatLng()
                            if (markerLatLng.lat === vehicle.lat && markerLatLng.lng === vehicle.lng) {
                              marker.openPopup()
                            }
                          })
                        }
                      }}
                      // onMouseEnter={() => setHoveredVehicle(vehicle)}
                      // onMouseLeave={() => setHoveredVehicle(null)}
                    >
                      <div className="flex items-start">
                        <div className={`mt-1 h-3 w-3 rounded-full ${getStatusColor(vehicle.status)}`}></div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {vehicle.vehicleNumber}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{vehicle.deviceName}</p>
                          <div className="mt-1 flex items-center">
                            <span className="text-xs text-gray-500 dark:text-gray-400">{vehicle.speed || "0"} km/h</span>
                            <span className="mx-1 text-gray-300 dark:text-gray-600">•</span>
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded-full ${getStatusColor(vehicle.status)} bg-opacity-20`}
                            >
                              {vehicle.status}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            {vehicle.address}
                          </p>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </div>
          </motion.div>
        )}

        {/* Map Container - Fixed height and positioning */}
        <div
          ref={mapContainerRef}
          className="w-full h-full"
          style={{ minHeight: isFullscreen ? '100vh' : '400px' }}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-70 dark:bg-opacity-70 z-[500]">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
                <div className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">Loading map...</div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Vehicle Details Modal */}
      {detailsVehicle && (
        <VehicleDetailsModal
          vehicle={detailsVehicle}
          onClose={() => setDetailsVehicle(null)}
        />
      )}
    </motion.div>
  )
}

export default VehicleMap