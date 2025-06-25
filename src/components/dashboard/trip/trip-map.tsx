import { useEffect, useRef, useState } from "react"
import { Layers, Maximize, Minimize, RotateCcw, Search, Info, List, X } from "lucide-react"
//import { Button } from "@/components/ui/button"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { TripApi } from "../../../types/dashboard/trip_type"
import type { TripMapProps } from "../../../types/dashboard/trip_type"
import { TripDetailsModal } from "./trip-details-modal"
import { renderToString } from "react-dom/server";
import getVehicle3DSVG from "../../live/vehicleicon"

// Extend props to accept fullscreen state and setter
type TripMapExtraProps = {
  isFullscreen?: boolean
  setIsFullscreen?: (v: boolean) => void
}
export function TripMap({
  trips,
  selectedTrip,
  mapMode,
  isFullscreen = false,
  setIsFullscreen = () => {},
}: TripMapProps & TripMapExtraProps) {
  const [showDetails, setShowDetails] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const [mapType, setMapType] = useState<"normal" | "satellite">("normal")
  const [mapLoaded, setMapLoaded] = useState(false)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<TripApi | null>(selectedTrip)
  const [showTripList, setShowTripList] = useState(true)


  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    const defaultCenter: [number, number] = [28.6139, 77.209]

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 6,
      zoomControl: false,
    })

    L.tileLayer(
      mapType === "normal"
        ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          mapType === "normal"
            ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            : "Tiles &copy; Esri",
      },
    ).addTo(map)

    L.control.zoom({ position: "bottomright" }).addTo(map)

    mapInstanceRef.current = map
    setMapLoaded(true)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markersRef.current = []
      }
    }
  }, [])

  // Update map type
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return

    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapInstanceRef.current!.removeLayer(layer)
      }
    })

    L.tileLayer(
      mapType === "normal"
        ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          mapType === "normal"
            ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            : "Tiles &copy; Esri",
      },
    ).addTo(mapInstanceRef.current)
  }, [mapType, mapLoaded])

  // Helper for trip status color (returns Tailwind classes)
  const getTripStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "at_stop_pickup":
      case "at_stop_delivery":
      case "in_transit":
        return "bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  const handleShowDetails = (trip: TripApi) => {
    setSelected(trip)
    setShowDetails(true)
  }

  // Helper for vehicle status color
  const getVehicleStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "no update":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "no data":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  // NEW: Helper for trip status inline color (for popup)
  const getTripStatusColorStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "at_stop_pickup":
      case "at_stop_delivery":
      case "in_transit":
        return "color:#166534; background-color:#bbf7d0;"; // green
      case "inactive":
        return "color:#374151; background-color:#f3f4f6;"; // gray
      default:
        return "color:#374151; background-color:#f3f4f6;";
    }
  }

  // NEW: Helper for vehicle status inline color (for popup)
  const getVehicleStatusColorStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "color:#166534; background-color:#dcfce7;"; // green
      case "no update":
        return "color:#854d0e; background-color:#fef9c3;"; // yellow
      case "no data":
        return "color:#991b1b; background-color:#fee2e2;"; // red
      default:
        return "color:#374151; background-color:#f3f4f6;";
    }
  }

  const getStatusText = (status: string) => {
  switch (status.toLowerCase()) {
    case "at_stop_pickup":
      return "At Pickup Stop"
    case "at_stop_delivery":
      return "At Delivery Stop"
    case "in_transit":
      return "In Transit"
    case "inactive":
      return "Inactive"
    default:
      return status
  }
}

  // Update markers based on map mode
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      mapInstanceRef.current!.removeLayer(marker)
    })
    markersRef.current = []

    if (mapMode === "current") {
      // Show current location markers for all trips
      trips.forEach((trip) => {
        if (
          Array.isArray(trip.current_location_coordindates) &&
          trip.current_location_coordindates.length === 2 &&
          typeof trip.current_location_coordindates[0] === "number" &&
          typeof trip.current_location_coordindates[1] === "number"
        ) {
          // Use 3D vehicle icon for current location marker
          const marker = L.marker(trip.current_location_coordindates, {
            icon: L.divIcon({
              className: "custom-div-icon",
              html: renderToString(
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    margin: 0,
                    lineHeight: 1,
                    position: "relative",
                    transform: "perspective(120px) rotateX(45deg)",
                    transformStyle: "preserve-3d",
                  }}>
                  <div
                    style={{
                      width: "45px",
                      height: "45px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transform: "scale(1.2)",
                    }}>
                    {getVehicle3DSVG(trip.vehicle_type)}
                  </div>
                  {/* Status indicator dot */}
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(15px, -15px) rotateX(-45deg) translateZ(15px)",
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: trip.status?.toLowerCase() === "inactive" ? "#6b7280" : "#22c55e",
                      border: "2px solid white",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4)",
                      zIndex: 10,
                    }}
                  />
                </div>
              ),
              iconSize: [60, 60],
              iconAnchor: [30, 20],
            }),
          })
            .addTo(mapInstanceRef.current!)
            .bindPopup(`
            <div class="popup-content">
              <h3>Shipment ID: ${trip.id}</h3>
              <p><strong>Vehicle Number:</strong> ${trip.Vehicle_number}</p>
              <p><strong>Vehicle Status:</strong> <span style="${getVehicleStatusColorStyle(trip.Vehicle_status)}padding:2px 6px;border-radius:6px;font-weight:bold;">${trip.Vehicle_status}</span></p>
              <p><strong>Driver:</strong> ${trip.driverName}</p>
              <p><strong>Driver Mobile:</strong> ${trip.driverMobile || "-"}</p>
              <p><strong>Status:</strong> <span style="${getTripStatusColorStyle(trip.status)}padding:2px 6px;border-radius:6px;font-weight:bold;">${getStatusText(trip.status)}</span></p>
              
              <p><strong>Location:</strong> ${
                Array.isArray(trip.current_location_coordindates) && trip.current_location_coordindates.length === 2
                  ? `${trip.current_location_coordindates[0].toFixed(6)}, ${trip.current_location_coordindates[1].toFixed(6)}`
                  : "No location"
              }</p>
              <p><strong>Last Update:</strong> ${new Date(trip.last_gps_ping).toLocaleString()}</p>
              <p><strong>Status Duration:</strong> ${trip.status_duration}</p>
            </div>
          `)

          markersRef.current.push(marker)
        }
      })
    } else {
      // "path" mode: Only show selected trip's path and stops
      if (!selected) {
        // No trip selected: show nothing
        return
      }
      const trip = selected

      // Add origin marker only if coordinates exist and are not [0,0]
      if (
        Array.isArray(trip.origin_coordinates) &&
        trip.origin_coordinates.length === 2 &&
        typeof trip.origin_coordinates[0] === "number" &&
        typeof trip.origin_coordinates[1] === "number" &&
        !(trip.origin_coordinates[0] === 0 && trip.origin_coordinates[1] === 0)
      ) {
        const originMarker = L.marker(trip.origin_coordinates, {
          icon: L.divIcon({
            className: "custom-div-icon",
            html: `<div class="origin-marker">START</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          }),
        })
          .addTo(mapInstanceRef.current!)
          .bindPopup(`
          <div class="popup-content">
            <h3>Origin</h3>
            <p>${trip.origin}</p>
          </div>
        `)

        markersRef.current.push(originMarker)
      }

      // Add stop markers for completed stops
      const completedStops = trip.planned_stops
        .filter((stop) => stop.actual_sequence > 0 && stop.status.toLowerCase() === "complete")
        .sort((a, b) => a.actual_sequence - b.actual_sequence)

      completedStops.forEach((stop, index) => {
        // Only generate stop marker if origin_coordinates are valid and not [0,0]
        if (
          Array.isArray(trip.origin_coordinates) &&
          trip.origin_coordinates.length === 2 &&
          typeof trip.origin_coordinates[0] === "number" &&
          typeof trip.origin_coordinates[1] === "number" &&
          !(trip.origin_coordinates[0] === 0 && trip.origin_coordinates[1] === 0)
        ) {
          // Generate coordinates around the route (in real app, use actual coordinates)
          const lat = trip.origin_coordinates[0] + (index + 1) * 0.1
          const lng = trip.origin_coordinates[1] + (index + 1) * 0.1

          const stopMarker = L.marker([lat, lng], {
            icon: L.divIcon({
              className: "custom-div-icon",
              html: `<div class="stop-marker completed">${stop.actual_sequence}</div>`,
              iconSize: [25, 25],
              iconAnchor: [12.5, 12.5],
            }),
          })
            .addTo(mapInstanceRef.current!)
            .bindPopup(`
            <div class="popup-content">
              <h3>Stop ${stop.actual_sequence}</h3>
              <p><strong>Location:</strong> ${stop.location_name}</p>
              <p><strong>Customer:</strong> ${stop.customer_name}</p>
              <p><strong>Type:</strong> ${stop.stop_type}</p>
              <p><strong>Status:</strong> ${stop.status}</p>
            </div>
          `)

          markersRef.current.push(stopMarker)
        }
      })

      // Add destination marker if destination_coordinates are valid and not [0,0]
      if (
        Array.isArray(trip.destination_coordinates) &&
        trip.destination_coordinates.length === 2 &&
        typeof trip.destination_coordinates[0] === "number" &&
        typeof trip.destination_coordinates[1] === "number" &&
        !(trip.destination_coordinates[0] === 0 && trip.destination_coordinates[1] === 0)
      ) {
        const destinationMarker = L.marker(trip.destination_coordinates, {
          icon: L.divIcon({
            className: "custom-div-icon",
            html: `<div class="destination-marker">END</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          }),
        })
          .addTo(mapInstanceRef.current!)
          .bindPopup(`
            <div class="popup-content">
              <h3>Destination</h3>
              <p>${trip.destination}</p>
            </div>
          `)

        markersRef.current.push(destinationMarker)
      }

      // Add current location if trip is not inactive
      if (
        trip.status.toLowerCase() !== "inactive" &&
        Array.isArray(trip.current_location_coordindates) &&
        trip.current_location_coordindates.length === 2 &&
        typeof trip.current_location_coordindates[0] === "number" &&
        typeof trip.current_location_coordindates[1] === "number"
      ) {
        // Use 3D vehicle icon for current location marker
        const currentMarker = L.marker(trip.current_location_coordindates, {
          icon: L.divIcon({
            className: "custom-div-icon",
            html: renderToString(
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  margin: 0,
                  lineHeight: 1,
                  position: "relative",
                  transform: "perspective(120px) rotateX(45deg)",
                  transformStyle: "preserve-3d",
                }}>
                <div
                  style={{
                    width: "45px",
                    height: "45px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: "scale(1.2)",
                  }}>
                  {getVehicle3DSVG(trip.vehicle_type)}
                </div>
                {/* Status indicator dot */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(15px, -15px) rotateX(-45deg) translateZ(15px)",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: trip.status?.toLowerCase() === "inactive" ? "#6b7280" : "#22c55e",
                    border: "2px solid white",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4)",
                    zIndex: 10,
                  }}
                />
              </div>
            ),
            iconSize: [60, 60],
            iconAnchor: [30, 20],
          }),
        })
          .addTo(mapInstanceRef.current!)
          .bindPopup(`
          <div class="popup-content">
            <h3>Shipment ID: ${trip.id}</h3>
            <p><strong>Vehicle Number:</strong> ${trip.Vehicle_number}</p>
             <p><strong>Vehicle Status:</strong> <span style="${getVehicleStatusColorStyle(trip.Vehicle_status)}padding:2px 6px;border-radius:6px;font-weight:bold;">${trip.Vehicle_status}</span></p>
            <p><strong>Driver:</strong> ${trip.driverName}</p>
            <p><strong>Driver Mobile:</strong> ${trip.driverMobile || "-"}</p>
            <p><strong>Status:</strong> <span style="${getTripStatusColorStyle(trip.status)}padding:2px 6px;border-radius:6px;font-weight:bold;">${getStatusText(trip.status)}</span></p>
           
            <p><strong>Location:</strong> ${
              Array.isArray(trip.current_location_coordindates) && trip.current_location_coordindates.length === 2
                ? `${trip.current_location_coordindates[0].toFixed(6)}, ${trip.current_location_coordindates[1].toFixed(6)}`
                : "No location"
            }</p>
          </div>
        `)

        markersRef.current.push(currentMarker)
      }

      // Draw path line only if origin_coordinates are valid and not [0,0]
      if (
        completedStops.length > 0 &&
        Array.isArray(trip.origin_coordinates) &&
        trip.origin_coordinates.length === 2 &&
        typeof trip.origin_coordinates[0] === "number" &&
        typeof trip.origin_coordinates[1] === "number" &&
        !(trip.origin_coordinates[0] === 0 && trip.origin_coordinates[1] === 0)
      ) {
        const pathCoordinates: [number, number][] = [
          trip.origin_coordinates,
          ...completedStops.map((_, index) => {
            const lat = trip.origin_coordinates[0] + (index + 1) * 0.1
            const lng = trip.origin_coordinates[1] + (index + 1) * 0.1
            return [lat, lng] as [number, number]
          }),
          ...(trip.status.toLowerCase() !== "inactive" &&
            Array.isArray(trip.current_location_coordindates) &&
            trip.current_location_coordindates.length === 2 &&
            typeof trip.current_location_coordindates[0] === "number" &&
            typeof trip.current_location_coordindates[1] === "number"
            ? [trip.current_location_coordindates]
            : []),
        ]

        const pathLine = L.polyline(pathCoordinates, {
          color: "#dc2626",
          weight: 3,
          opacity: 0.7,
        }).addTo(mapInstanceRef.current!)

        markersRef.current.push(pathLine as any)
      }
    }

    // Fit map to show all markers
    if (markersRef.current.length > 0) {
      const group = new L.FeatureGroup(markersRef.current.filter((m) => m instanceof L.Marker))
      if (group.getLayers().length > 0) {
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1))
      }
    }
  }, [trips, mapMode, mapLoaded, selected]) // <-- add selected to deps

  // Fullscreen handler (toggle state, no browser fullscreen API)
  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize()
    }, 300)
  }

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
  }, [isFullscreen, setIsFullscreen])

  const handleResetView = () => {
    if (mapInstanceRef.current && markersRef.current.length > 0) {
      const group = new L.FeatureGroup(markersRef.current.filter((m) => m instanceof L.Marker))
      if (group.getLayers().length > 0) {
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1))
      }
    }
  }

  // Filtered trips based on search
  const filteredTrips = trips.filter(
    (trip) =>
      trip.Vehicle_number?.toLowerCase().includes(search.toLowerCase()) ||
      trip.driverName?.toLowerCase().includes(search.toLowerCase()) ||
      trip.cuurent_location_address?.toLowerCase().includes(search.toLowerCase()) ||
      trip.id?.toString().includes(search)
  )

  // Update selected trip if prop changes
  useEffect(() => {
    setSelected(selectedTrip)
  }, [selectedTrip])

  return (
    <div
      // Remove wrapperRef and browser fullscreen API
      className={
        isFullscreen
          ? "fixed inset-0 z-[100] bg-white dark:bg-gray-900 flex gap-4"
          : "flex h-[500px] gap-4"
      }
      style={isFullscreen ? { height: "100vh", width: "100vw" } : {}}
    >
      {/* Expand/collapse trip list button in normal mode */}


      {/* Trip List Sidebar or Floating Panel */}
      {showTripList && (
        <div
          className={
            isFullscreen
              ? "absolute top-16 left-4 z-40 w-80 max-h-110 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col"
              : "w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col"
          }
          style={isFullscreen ? {} : { height: "100%" }}
        >


          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Search trips..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

            </div>
          </div>
          <div className="overflow-y-auto h-full">
            {filteredTrips.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">No trips found</div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTrips.map((trip) => (
                  <li
                    key={trip.id}
                    className={`p-3 cursor-pointer hover:bg-[rgba(243,244,246,1)] dark:hover:bg-[rgba(55,65,81,0.8)] ${selected?.id === trip.id ? "bg-red-50 dark:bg-red-900/20" : ""
                      }`}
                    onClick={() => {
                      setSelected(trip)
                      // Center map and open popup for this trip's marker
                      if (
                        mapInstanceRef.current &&
                        Array.isArray(trip.current_location_coordindates) &&
                        trip.current_location_coordindates.length === 2
                      ) {
                        mapInstanceRef.current.setView(trip.current_location_coordindates, 15)
                        // Try to open popup for this marker
                        markersRef.current.forEach((marker: any) => {
                          if (
                            marker.getLatLng &&
                            marker.getLatLng().lat === trip.current_location_coordindates[0] &&
                            marker.getLatLng().lng === trip.current_location_coordindates[1]
                          ) {
                            marker.openPopup && marker.openPopup()
                          }
                        })
                      }
                    }}
                  >
                    {/* Shipment ID on top */}
                    <div className="flex items-center mb-1">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Shipment ID:</span>
                      <span className="ml-2 text-xs text-gray-900 dark:text-gray-100">{trip.id}</span>
                      <button
                        onClick={() => handleShowDetails(trip)}
                        className="text-black dark:text-white hover:text-gray-800 dark:hover:text-gray-300 ml-1"
                      >
                        <Info className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-start">
                      {/* Trip status dot */}
                      <div className={`mt-1 h-3 w-3 rounded-full ${getTripStatusColor(trip.status)}`}></div>
                      <div className="ml-3 flex-1">
                        {/* Vehicle Number */}
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{trip.Vehicle_number}</p>
                        <div className="mt-1 flex items-center gap-2">
                          {/* Driver Name */}
                          <span className="text-xs text-gray-500 dark:text-gray-400">{trip.driverName}</span>
                          {/* Driver Mobile */}
                          {trip.driverMobile && (
                            <>
                              <span className="mx-1 text-gray-300 dark:text-gray-600">•</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{trip.driverMobile}</span>
                            </>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          {/* Trip Status */}
                          <span
                            className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${getTripStatusColor(trip.status)} bg-opacity-20`}
                          >
                            {getStatusText(trip.status)}
                          </span>
                          {/* Vehicle Status */}
                          <span
                            className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${getVehicleStatusColor(trip.Vehicle_status)} bg-opacity-20`}
                          >
                            {trip.Vehicle_status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {Array.isArray(trip.current_location_coordindates) && trip.current_location_coordindates.length === 2
                            ? `${trip.current_location_coordindates[0].toFixed(6)}, ${trip.current_location_coordindates[1].toFixed(6)}`
                            : "No location"}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Show trip list toggle button in fullscreen mode when list is hidden */}
      {isFullscreen && (
        <button
          className="absolute top-4 left-4 z-40 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
          onClick={() => setShowTripList(!showTripList)}
          title={showTripList ? "Hide trip list" : "Show trip list"}
        >
          {showTripList ? (
            <X className="h-5 w-5" />
          ) : (
            <List className="h-5 w-5" />
          )}
        </button>
      )}

      {/* Map Container */}
      <div
        className={
          isFullscreen
            ? "flex-1 relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden z-10"
            : "flex-1 relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden z-10"
        }
        style={isFullscreen ? { height: "100vh" } : {}}
      >
        <div ref={mapContainerRef} className="h-full w-full">
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          )}
          {/* Show overlay message if in path mode and no trip is selected */}
          {mapMode !== "current" && !selected && (
            <div className="absolute inset-0 flex items-center justify-center z-[2000] pointer-events-none">
              <div className="bg-white/90 dark:bg-gray-900/90 rounded-lg shadow-lg px-6 py-4 text-center text-gray-700 dark:text-gray-200 text-lg font-semibold border border-gray-300 dark:border-gray-700">
                Please select a trip from the list to view its path.
              </div>
            </div>
          )}
        </div>
        {!isFullscreen && (
          <button
            className="absolute top-4 left-4 z-[1001] p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
            onClick={() => setShowTripList((v) => !v)}
            title={showTripList ? "Hide trip list" : "Show trip list"}
          >
            {showTripList ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
          </button>
        )}

        {/* Map Controls */}
        <div className="absolute top-4 right-5 z-[1002] flex gap-2 pointer-events-auto">
          <button
            onClick={() => setMapType(mapType === "normal" ? "satellite" : "normal")}
            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
            style={{ pointerEvents: 'auto' }}
            title={mapType === "normal" ? "Switch to satellite" : "Switch to map"}
          >
            <Layers className="h-5 w-5" />
          </button>
          <button
            onClick={handleFullscreen}
            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
            style={{ pointerEvents: 'auto' }}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>
          <button
            onClick={handleResetView}
            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
            style={{ pointerEvents: 'auto' }}
            title="Reset map view"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowTripList(!showTripList)}
            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 md:hidden"
            style={{ pointerEvents: 'auto' }}
            title={showTripList ? "Hide trip list" : "Show trip list"}
          >
            {showTripList ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
          </button>
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] space-y-4">
          <div className=" max-w-100 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-md p-3 z-[1000]">
            <div className="text-xs font-medium mb-2">Legend</div>
            <div className="space-y-1 text-xs">
              {mapMode === "current" ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Active Trip</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span>Inactive Trip</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Origin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Completed Stops</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Current Location</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 bg-red-600"></div>
                    <span>Route Path</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Map Info */}
          <div className=" max-w-100 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-md p-3 z-[1000]">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {mapMode === "current" ? "Current Locations" : "Actual Path"}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              {trips.length} trip{trips.length !== 1 ? "s" : ""} displayed
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
        .custom-div-icon {
          background: transparent;
          border: none;
        }
        
        .current-location-marker {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          border: 2px solid white;
        }
        
        .current-location-marker.p {
          background-color: #3b82f6;
        }
        
        .current-location-marker.d {
          background-color: #22c55e;
        }
        
        .current-location-marker.t {
          background-color: #f59e0b;
        }
        
        .current-location-marker.inactive {
          background-color: #6b7280;
        }
        
        .origin-marker {
          width: 30px;
          height: 30px;
          border-radius: 4px;
          background-color: #1e40af;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .stop-marker {
          width: 25px;
          height: 25px;
          border-radius: 50%;
          background-color: #22c55e;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 10px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          border: 2px solid white;
        }
        
        .destination-marker {
          width: 30px;
          height: 30px;
          border-radius: 4px;
          background-color: #dc2626;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .popup-content {
          padding: 5px;
        }
        
        .popup-content h3 {
          margin: 0 0 5px 0;
          font-weight: bold;
        }
        
        .popup-content p {
          margin: 2px 0;
          font-size: 12px;
        }
        `}
      </style>
      <TripDetailsModal
        open={showDetails}
        onOpenChange={setShowDetails}
        selectedTrip={selected}
      />
    </div>
  )
}

