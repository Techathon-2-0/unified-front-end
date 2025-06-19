import { Badge } from "@/components/ui/badge"
import { renderToString } from "react-dom/server"
import getVehicle3DSVG from "../../live/vehicleicon"

import { useEffect, useRef, useState } from "react"
import { MapIcon, Satellite, Maximize, Minimize, RotateCcw, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { fetchGeofencesbyuserid } from "../../../data/geofence/gconfig"
import type { GeofenceMapProps, Geofence } from "../../../types/geofence/gstats_type"
import { useAuth } from "@/context/AuthContext"

export function GeofenceMap({
  vehicles,
  selectedGeofence,
  matrixType,
  highlightedVehicle,
  isFullScreen = false,
  onVehicleClick,
  onClose,
}: GeofenceMapProps) {
  const [mapStyle, setMapStyle] = useState<"streets" | "satellite">("streets")
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const [geofences, setGeofences] = useState<Geofence[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useAuth()

  // Add state for sidebar collapse
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    if (!isFullScreen || !onClose) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isFullScreen, onClose])

  useEffect(() => {
    if (user?.id) {
      fetchGeofencesbyuserid(String(user.id))
        .then(setGeofences)
        .catch((error) => {
          console.error("Error fetching geofences:", error)
          setGeofences([])
        })
    }
  }, [user?.id])

  const selectedGeofenceData = geofences.find((g) => g.id.toString() === selectedGeofence)

  // Get geofence color based on type
  const getGeofenceColor = (type: number) => {
    switch (type) {
      case 0: // circle
        return "#3b82f6" // Blue
      case 2: // polygon
        return "#8b5cf6" // Purple
      case 1: // pointer
        return "#10b981" // Green
      default:
        return "#3b82f6"
    }
  }

  // Load Leaflet
  useEffect(() => {
    if (!leafletLoaded && typeof window !== "undefined") {
      const linkCSS = document.createElement("link")
      linkCSS.rel = "stylesheet"
      linkCSS.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      linkCSS.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
      linkCSS.crossOrigin = ""
      document.head.appendChild(linkCSS)

      const script = document.createElement("script")
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
      script.crossOrigin = ""
      script.async = true
      script.onload = () => setLeafletLoaded(true)
      document.head.appendChild(script)
    }
  }, [leafletLoaded])

  // Initialize map
  useEffect(() => {
    if (leafletLoaded && mapContainerRef.current && !mapInstance) {
      const L = (window as any).L

      // Default center of India if no geofence is selected
      const defaultCenter = [20.5937, 78.9629]
      const defaultZoom = 5

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView(defaultCenter, defaultZoom)

      // Add zoom control with higher z-index
      L.control
        .zoom({
          position: "bottomright",
        })
        .addTo(map)

      // Add tile layers
      const streetLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      })

      const satelliteLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
          maxZoom: 19,
        },
      )

      // Set initial layer based on mapStyle
      if (mapStyle === "streets") {
        streetLayer.addTo(map)
      } else {
        satelliteLayer.addTo(map)
      }

      // Force all map panes to have lower z-index
      Object.values(map.getPanes()).forEach((pane: any) => {
        if (pane.style) {
          pane.style.zIndex = "1"
        }
      })

      setMapInstance({ map, streetLayer, satelliteLayer, L })
      setMapLoaded(true)
    }
  }, [leafletLoaded, mapContainerRef, mapInstance, mapStyle])

  // Update map style when it changes
  useEffect(() => {
    if (mapInstance) {
      if (mapStyle === "streets") {
        mapInstance.satelliteLayer.remove()
        mapInstance.streetLayer.addTo(mapInstance.map)
      } else {
        mapInstance.streetLayer.remove()
        mapInstance.satelliteLayer.addTo(mapInstance.map)
      }
    }
  }, [mapStyle, mapInstance])

  // Update map with geofence and vehicles
  useEffect(() => {
    if (mapLoaded && mapInstance) {
      const { map, L } = mapInstance

      // Clear existing layers
      map.eachLayer((layer: any) => {
        if (layer.options && (layer.options.isGeofence || layer.options.isVehicle)) {
          map.removeLayer(layer)
        }
      })

      // Add selected geofence if available
      let geofenceBounds = null
      let geofenceLayer
      if (selectedGeofenceData) {
        const geofenceColor = getGeofenceColor(selectedGeofenceData.geofence_type)

        // Add geofence with exact same styling as geofence config

        if (selectedGeofenceData.geofence_type === 0) {
          // Circle
          geofenceLayer = L.circle([selectedGeofenceData.latitude, selectedGeofenceData.longitude], {
            radius: selectedGeofenceData.radius,
            color: geofenceColor,
            fillColor: geofenceColor,
            fillOpacity: 0.3,
            weight: 2,
            isGeofence: true,
          }).addTo(map)

          // Add center marker for circle
          L.circleMarker([selectedGeofenceData.latitude, selectedGeofenceData.longitude], {
            radius: 6,
            color: "#ffffff",
            fillColor: geofenceColor,
            fillOpacity: 1,
            weight: 2,
            isGeofence: true,
          }).addTo(map)

          geofenceBounds = geofenceLayer.getBounds()
        } else if (selectedGeofenceData.geofence_type === 2 && selectedGeofenceData.polygon_points) {
          // Polygon
          const latLngs = selectedGeofenceData.polygon_points.map((p) => [p.latitude, p.longitude])
          geofenceLayer = L.polygon(latLngs, {
            color: "#7c3aed", // Purple for polygon
            fillColor: "#8b5cf6",
            fillOpacity: 0.3,
            weight: 2,
            isGeofence: true,
          }).addTo(map)

          // Add center marker for polygon
          L.circleMarker([selectedGeofenceData.latitude, selectedGeofenceData.longitude], {
            radius: 6,
            color: "#ffffff",
            fillColor: "#7c3aed",
            fillOpacity: 1,
            weight: 2,
            isGeofence: true,
          }).addTo(map)

          geofenceBounds = geofenceLayer.getBounds()
        } else if (selectedGeofenceData.geofence_type === 1) {
          // Pointer
          geofenceLayer = L.circleMarker([selectedGeofenceData.latitude, selectedGeofenceData.longitude], {
            radius: 8,
            color: "#ffffff",
            fillColor: "#10b981", // Green for pointer
            fillOpacity: 1,
            weight: 2,
            isGeofence: true,
          }).addTo(map)

          // For pointer, create artificial bounds around the point
          const lat = selectedGeofenceData.latitude
          const lng = selectedGeofenceData.longitude
          const offset = 0.01 // Small offset to create visible area
          geofenceBounds = L.latLngBounds([
            [lat - offset, lng - offset],
            [lat + offset, lng + offset],
          ])
        }

        // Add geofence popup
        if (selectedGeofenceData && geofenceLayer) {
          geofenceLayer.bindPopup(`
            <div style="min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold;">${selectedGeofenceData.geofence_name}</h3>
              <p style="margin: 2px 0;"><strong>ID:</strong> ${selectedGeofenceData.location_id}</p>
              <p style="margin: 2px 0;"><strong>Type:</strong> ${getTypeLabel(selectedGeofenceData.geofence_type)}</p>
              <p style="margin: 2px 0;"><strong>Address:</strong> ${selectedGeofenceData.address || "N/A"}</p>
              ${
                selectedGeofenceData.geofence_type === 0
                  ? `<p style="margin: 2px 0;"><strong>Radius:</strong> ${selectedGeofenceData.radius} m</p>`
                  : ""
              }
            </div>
          `)
        }
      }

      // Filter vehicles by search term for full screen mode
      const filteredVehicles =
        isFullScreen && searchTerm
          ? vehicles.filter(
              (v) =>
                v.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (v.shipmentId && v.shipmentId.toLowerCase().includes(searchTerm.toLowerCase())),
            )
          : vehicles

      // Add vehicles with custom icons
      const vehicleMarkers = []
      let highlightedVehiclePosition: [number, number] | null = null

      // Helper to get status color (red for "outside", green for "inside")
      const getStatusColor = (status: string) => {
        if (status === "inside") return "#10b981"
        if (status === "outside") return "#ef4444"
        return "#f59e42"
      }

      // Custom icon creation using vehicleicon.tsx and index
      const createCustomIcon = (vehicle: any) => {
        const statusColor = getStatusColor(vehicle.geofenceStatus)
        // Remove or reduce shadow for the custom icon
        return mapInstance.L.divIcon({
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
                // Remove or reduce boxShadow here
                boxShadow: "none", // <--- changed from any previous shadow
                // Optionally, you can use a lighter shadow if you want a subtle effect:
                // boxShadow: "0 2px 6px rgba(0,0,0,0.10)",
              }}>
              {/* Vehicle SVG container */}
              <div
                style={{
                  width: "45px",
                  height: "45px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: "scale(1.2)",
                  position: "relative",
                  // Remove any shadow here as well
                  boxShadow: "none",
                }}>
                {getVehicle3DSVG(vehicle.type)}
              </div>
              {/* Status indicator */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(15px, -15px) rotateX(-45deg) translateZ(15px)",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: statusColor,
                  border: "2px solid white",
                  zIndex: 10,
                  // Remove any shadow here as well
                  boxShadow: "none",
                }}
              />
            </div>
          ),
          iconSize: [60, 60],
          iconAnchor: [30, 20],
        })
      }

      filteredVehicles.forEach((vehicle) => {
        // Skip plotting if lat or lng is missing, null, undefined, or empty string
        if (
          vehicle.lat === undefined ||
          vehicle.lat === null ||
          vehicle.lat.toString() === "" ||
          vehicle.lng === undefined ||
          vehicle.lng === null ||
          vehicle.lng.toString() === ""
        ) {
          return
        }

        const isInside = vehicle.geofenceStatus === "inside"
        const isHighlighted = highlightedVehicle === vehicle.id

        if (isHighlighted) {
          highlightedVehiclePosition = [vehicle.lat, vehicle.lng]
        }

        // Use custom icon instead of simple circle marker
        const vehicleMarker = L.marker([vehicle.lat, vehicle.lng], {
          icon: createCustomIcon(vehicle),
          zIndexOffset: isHighlighted ? 2000 : 1000,
        }).addTo(map)

        // Add popup with vehicle details
        vehicleMarker.bindPopup(`
          <div style="min-width: 200px; z-index: 2000;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${vehicle.vehicleNumber}</h3>
            
            <p style="margin: 2px 0;"><strong>Status:</strong> 
              <span style="color: ${isInside ? "#10b981" : "#ef4444"}; font-weight: bold;">
                ${vehicle.geofenceStatus}
              </span>
            </p>
            <p style="margin: 2px 0;"><strong>Distance:</strong> ${vehicle.distanceFromGeofence.toFixed(2)} km</p>
            <p style="margin: 2px 0;"><strong>Speed:</strong> ${vehicle.speed || 0} km/h</p>
          </div>
        `)

        // Add click handler for full screen mode
        if (isFullScreen && onVehicleClick) {
          vehicleMarker.on("click", () => {
            onVehicleClick(vehicle.id)
          })
        }

        // Auto-open popup for highlighted vehicle
        if (isHighlighted) {
          vehicleMarker.openPopup()
        }

        vehicleMarkers.push(vehicleMarker)
      })

      // Add CSS for vehicle tooltips
      if (!document.getElementById("vehicle-tooltip-css")) {
        const style = document.createElement("style")
        style.id = "vehicle-tooltip-css"
        style.innerHTML = `
          .vehicle-tooltip {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            font-weight: bold;
            text-align: center;
          }
          .vehicle-tooltip.highlighted {
            font-size: 14px;
          }
          .vehicle-tooltip:before {
            display: none !important;
          }
          .leaflet-tooltip-pane {
            z-index: 1000;
          }
        `
        document.head.appendChild(style)
      }

      // Set map view based on content
      if (highlightedVehicle && highlightedVehiclePosition) {
        // Create bounds that include both geofence and highlighted vehicle
        const combinedBounds = L.latLngBounds()

        // Add geofence bounds
        if (geofenceBounds && geofenceBounds.isValid()) {
          combinedBounds.extend(geofenceBounds)
        } else if (selectedGeofenceData) {
          // If no geofence bounds, add geofence center
          combinedBounds.extend([selectedGeofenceData.latitude, selectedGeofenceData.longitude])
        }

        // Add highlighted vehicle position
        combinedBounds.extend(highlightedVehiclePosition)

        // Fit map to show both geofence and highlighted vehicle
        map.fitBounds(combinedBounds.pad(0.2), {
          maxZoom: 15, // Don't zoom in too much
        })
      } else if (geofenceBounds && geofenceBounds.isValid()) {
        // No highlighted vehicle, just show geofence
        map.fitBounds(geofenceBounds.pad(0.2))
      } else if (selectedGeofenceData) {
        // Fallback: center on geofence coordinates
        map.setView([selectedGeofenceData.latitude, selectedGeofenceData.longitude], 13)
      } else if (vehicles.length > 0) {
        // If no geofence selected, fit to all vehicles with valid lat/lng only
        const validVehiclePositions = vehicles
          .filter(
            (v) =>
              v.lat !== undefined &&
              v.lat !== null &&
              v.lat.toString() !== "" &&
              v.lng !== undefined &&
              v.lng !== null &&
              v.lng.toString() !== ""
          )
          .map((v) => [v.lat, v.lng])
        if (validVehiclePositions.length > 0) {
          const vehicleBounds = L.latLngBounds(validVehiclePositions)
          map.fitBounds(vehicleBounds.pad(0.2))
        }
      }

      // Add CSS for pulsing effect
      if (!document.getElementById("pulse-css")) {
        const style = document.createElement("style")
        style.id = "pulse-css"
        style.innerHTML = `
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
          .pulse-icon {
            animation: pulse 1.5s infinite;
          }
        `
        document.head.appendChild(style)
      }
    }
  }, [
    mapLoaded,
    mapInstance,
    selectedGeofenceData,
    vehicles,
    matrixType,
    selectedGeofence,
    highlightedVehicle,
    isFullScreen,
    searchTerm,
  ])

  // Center map on current view
  const centerMap = () => {
    if (mapInstance) {
      const { map } = mapInstance

      if (selectedGeofenceData) {
        map.setView([selectedGeofenceData.latitude, selectedGeofenceData.longitude], 13)
      } else if (vehicles.length > 0) {
        // Only use vehicles with valid lat/lng
        const validVehiclePositions = vehicles
          .filter(
            (v: any) =>
              v.lat !== undefined &&
              v.lat !== null &&
              v.lat.toString() !== "" &&
              v.lng !== undefined &&
              v.lng !== null &&
              v.lng.toString() !== ""
          )
          .map((v: any) => [v.lat, v.lng])
        if (validVehiclePositions.length > 0) {
          const vehicleBounds = mapInstance.L.latLngBounds(validVehiclePositions)
          map.fitBounds(vehicleBounds.pad(0.2))
        }
      }
    }
  }

  // Filtered vehicles for sidebar in full screen mode
  const filteredVehiclesRaw =
    isFullScreen && searchTerm
      ? vehicles.filter(
          (v) =>
            v.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (v.shipmentId && v.shipmentId.toLowerCase().includes(searchTerm.toLowerCase())),
        )
      : vehicles

  // Sort: vehicles with lat/lng first
  const filteredVehicles = [
    ...filteredVehiclesRaw.filter(
      v =>
        v.lat !== undefined &&
        v.lat !== null &&
        v.lat.toString() !== "" &&
        v.lng !== undefined &&
        v.lng !== null &&
        v.lng.toString() !== ""
    ),
    ...filteredVehiclesRaw.filter(
      v =>
        v.lat === undefined ||
        v.lat === null ||
        v.lat.toString() === "" ||
        v.lng === undefined ||
        v.lng === null ||
        v.lng.toString() === ""
    ),
  ]

  // Helper function to get geofence type label
  function getTypeLabel(type: number) {
    switch (type) {
      case 0:
        return "Circle"
      case 2:
        return "Polygon"
      case 1:
        return "Point"
      default:
        return "Unknown"
    }
  }

  // Persist fullscreen state in localStorage
  useEffect(() => {
    if (isFullScreen) {
      localStorage.setItem("gstats-map-fullscreen", "1")
    } else {
      localStorage.removeItem("gstats-map-fullscreen")
    }
  }, [isFullScreen])

  // On mount, restore fullscreen if needed
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("gstats-map-fullscreen") === "1" && !isFullScreen) {
        window.dispatchEvent(new CustomEvent("toggle-map-fullscreen"))
      }
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Card className={`${isFullScreen ? "fixed inset-0 z-50" : "h-full"} shadow-sm`}>
      <CardContent className="p-0 h-full relative">
        {/* Map Controls */}
        <div className="absolute top-4 left-4 z-20">
          {/* Legend */}
          
          <ToggleGroup
            type="single"
            value={mapStyle}
            onValueChange={(value) => value && setMapStyle(value as "streets" | "satellite")}
            className="bg-white dark:bg-gray-900 shadow-md rounded-md p-1"
          >
            <ToggleGroupItem
              value="streets"
              aria-label="Map view"
              className="data-[state=on]:bg-red-100 dark:data-[state=on]:bg-red-900 dark:text-gray-100"
            >
              <MapIcon className="h-4 w-4" />
              <span className="ml-1 text-xs hidden sm:inline">Map</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="satellite"
              aria-label="Satellite view"
              className="data-[state=on]:bg-red-100 dark:data-[state=on]:bg-red-900 dark:text-gray-100"
            >
              <Satellite className="h-4 w-4" />
              <span className="ml-1 text-xs hidden sm:inline">Satellite</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Center Map Button */}
        <div className="absolute top-4 right-4 z-20">
          <Button variant="outline" size="sm" onClick={centerMap} className="bg-white dark:bg-gray-900 dark:hover:bg-gray-700 shadow-md">
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        {/* Full Screen Toggle */}
        <div className="absolute top-4 right-15 z-20">
          {isFullScreen ? (
            <Button variant="outline" size="sm" onClick={onClose} className="bg-white dark:bg-gray-900 dark:hover:bg-gray-700 shadow-md">
              <Minimize className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.dispatchEvent(new CustomEvent("toggle-map-fullscreen"))}
              className="bg-white dark:bg-gray-900 dark:hover:bg-gray-700 shadow-md"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="absolute bottom-3 left-4 z-20"> 
        <div className="mb-2 bg-white dark:bg-gray-900 rounded-md shadow px-3 py-2 flex items-center space-x-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-1">
              <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#ef4444" }} />
              <span className="text-xs text-gray-700 dark:text-gray-200">Outside</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#10b981" }} />
              <span className="text-xs text-gray-700 dark:text-gray-200">Inside</span>
            </div>
          </div>
        </div>
        {/* Full Screen Vehicle List */}
        {isFullScreen && (
          <div
            className={`absolute top-20 rounded-xl left-4 z-20 bg-white dark:bg-gray-900 shadow-md transition-all duration-300 ${sidebarCollapsed ? "w-10" : "w-75"}`}
          >
            <div className="flex justify-between items-center p-2 py-3  border-gray-200 dark:border-gray-700">
              <h3 className={`font-medium pl-2 text-lg ${sidebarCollapsed ? "hidden" : "block"}`}>Vehicles</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="h-6 w-6"
              >
                {sidebarCollapsed ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
              </Button>
            </div>

            {!sidebarCollapsed && (
              <>
                <div className="p-2 py-3 border-b border-t border-gray-200 dark:border-gray-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                    <Input
                      placeholder="Search vehicles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                    />
                  </div>
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-1 p-3">
                    {filteredVehicles.map((vehicle) => {
                      const hasLatLng =
                        vehicle.lat !== undefined &&
                        vehicle.lat !== null &&
                        vehicle.lat.toString() !== "" &&
                        vehicle.lng !== undefined &&
                        vehicle.lng !== null &&
                        vehicle.lng.toString() !== ""
                      return (
                        <div
                          key={vehicle.id}
                          className={`p-2 rounded-md cursor-pointer ${
                            highlightedVehicle === vehicle.id
                              ? "bg-red-100 dark:bg-red-900/30 border-l-2 border-red-500"
                              : "hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                          onClick={() => onVehicleClick && onVehicleClick(vehicle.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-sm dark:text-gray-100">{vehicle.vehicleNumber}</div>
                            {hasLatLng ? (
                              <Badge
                                className={`text-xs ${
                                  vehicle.geofenceStatus === "inside"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                }`}
                              >
                                {vehicle.geofenceStatus === "inside" ? "Inside" : "Outside"}
                              </Badge>
                            ) : (
                              <Badge className="text-xs bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                NA
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
                            <span>{vehicle.type}</span>
                            {hasLatLng ? (
                              <span>{vehicle.distanceFromGeofence.toFixed(2)} km</span>
                            ) : (
                              <span>NA Km</span>
                            )}
                          </div>
                          
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </>
            )}
          </div>
        )}

        {/* Close Button for Full Screen */}
        {/* {isFullScreen && onClose && (
          <div className="absolute top-4 right-16 z-40">
            <Button variant="outline" size="sm" onClick={onClose} className="bg-white dark:bg-gray-900 dark:hover:bg-gray-700 shadow-md">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )} */}

        <div ref={mapContainerRef} className="h-full w-full rounded-lg relative z-10 dark:bg-gray-900" />
        {!leafletLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-80 dark:bg-opacity-80 rounded-lg z-20">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-t-red-500 border-red-200 dark:border-red-800 dark:border-t-red-400 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-700 dark:text-gray-200">Loading map...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}