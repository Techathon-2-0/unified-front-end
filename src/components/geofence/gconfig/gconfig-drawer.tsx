import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Check, X, CircleIcon, Square, MapPin, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { GeofenceFormProps, Geofence } from "../../../types/geofence/gconfig_type"
import { useToast } from "@/hooks/use-toast"
import { reverseGeocode } from "../../reversegeocoding"

export default function GeofenceForm({ onClose, geofence, isNew = false, onUpdate, onSave }: GeofenceFormProps) {
  // Helper function to convert string type to number
  // const getGeofenceTypeNumber = (type: "circle" | "polygon" | "pointer"): number => {
  //   switch (type) {
  //     case "circle": return 0
  //     case "pointer": return 1
  //     case "polygon": return 2
  //     default: return 0
  //   }
  // }

  // Helper function to convert number type to string
  const getGeofenceTypeString = (type: number): "circle" | "polygon" | "pointer" => {
    switch (type) {
      case 0: return "circle"
      case 1: return "pointer" 
      case 2: return "polygon"
      default: return "circle"
    }
  }

  // Update the state to use number
  const [geofenceType, setGeofenceType] = useState<number>(
    geofence?.geofence_type !== undefined ? geofence.geofence_type : 0
  )
  const [radius, setRadius] = useState<number>(geofence?.radius || 500)
  const [name, setName] = useState(geofence?.geofence_name || "")
  const [locationId, setLocationId] = useState(geofence?.location_id || "")
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>(
    geofence?.coordinates || { lat: 19.076, lng: 72.8777 },
  )
  const [tag, setTag] = useState(geofence?.tag || "")
  const [stopType, setStopType] = useState(geofence?.stop_type || "")
  const [status, setStatus] = useState<boolean>(geofence?.status ?? true)
  const [address, setAddress] = useState<string>(geofence?.address || "")
  const [time, setTime] = useState<string>(geofence?.time || "")
  const [loadingAddress, setLoadingAddress] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const [marker, setMarker] = useState<any>(null)
  const [geofenceLayer, setGeofenceLayer] = useState<any>(null)
  const [customPolygonPoints, setCustomPolygonPoints] = useState<{ lat: number; lng: number }[]>(
    geofence?.polygonPoints || [],
  )
  const { showSuccessToast, showErrorToast, Toaster } = useToast({ position: "top-right" })

  // Load address when coordinates change
  useEffect(() => {
    const loadAddress = async () => {
      if (coordinates.lat && coordinates.lng) {
        setLoadingAddress(true)
        try {
          const geocodedAddress = await reverseGeocode(coordinates.lat, coordinates.lng)
          setAddress(geocodedAddress)
        } catch (error) {
          console.error("Error loading address:", error)
          setAddress("Address not available")
        } finally {
          setLoadingAddress(false)
        }
      }
    }

    loadAddress()
  }, [coordinates.lat, coordinates.lng])

  // Check if Leaflet is already loaded
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).L) {
      setLeafletLoaded(true)
    }
  }, [])

  // Initialize map once Leaflet is loaded
  useEffect(() => {
    if (leafletLoaded && mapContainerRef.current && !mapInstance) {
      const L = (window as any).L

      // Create map instance
      const map = L.map(mapContainerRef.current).setView([coordinates.lat, coordinates.lng], 14)

      // Add tile layers
      const streetLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      const satelliteLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        },
      )

      // Add layer control
      const baseLayers = {
        "Street Map": streetLayer,
        Satellite: satelliteLayer,
      }

      L.control.layers(baseLayers).addTo(map)

      // Create draggable marker
      const newMarker = L.marker([coordinates.lat, coordinates.lng], {
        draggable: true,
      }).addTo(map)

      // Update coordinates when marker is dragged
      newMarker.on("dragend", () => {
        const latlng = newMarker.getLatLng()
        const newCoords = { lat: latlng.lat, lng: latlng.lng }

        // If in polygon mode, move all polygon points by the same offset
        if (geofenceType === 2 && customPolygonPoints.length > 0) {
          const offsetLat = newCoords.lat - coordinates.lat
          const offsetLng = newCoords.lng - coordinates.lng

          const updatedPolygonPoints = customPolygonPoints.map((point) => ({
            lat: point.lat + offsetLat,
            lng: point.lng + offsetLng,
          }))

          setCustomPolygonPoints(updatedPolygonPoints)

          // Update parent with new coordinates and polygon points
          updateParent({
            coordinates: newCoords,
            polygonPoints: updatedPolygonPoints,
          })
        } else {
          // Update parent component with changes for non-polygon types
          updateParent({
            coordinates: newCoords,
          })
        }

        setCoordinates(newCoords)
      })

      // Create layer groups for polygon editing
      const polygonLayerGroup = L.layerGroup().addTo(map)
      const polygonMarkersGroup = L.layerGroup().addTo(map)

      setMapInstance({
        map,
        L,
        polygonLayerGroup,
        polygonMarkersGroup,
      })
      setMarker(newMarker)
      setMapLoaded(true)
    }
  }, [leafletLoaded, mapContainerRef, mapInstance, coordinates])

  // Update marker position when coordinates change
  useEffect(() => {
    if (mapLoaded && marker) {
      marker.setLatLng([coordinates.lat, coordinates.lng])
    }
  }, [mapLoaded, marker, coordinates])

  // Update geofence visualization when parameters change
  useEffect(() => {
    if (mapLoaded && mapInstance) {
      const L = mapInstance.L
      const map = mapInstance.map

      // Remove existing geofence layer
      if (geofenceLayer) {
        map.removeLayer(geofenceLayer)
      }

      // Clear polygon markers
      mapInstance.polygonMarkersGroup.clearLayers()
      
      // Create new geofence layer based on type - using numbers
      let newLayer
      if (geofenceType === 0) { // circle
        newLayer = L.circle([coordinates.lat, coordinates.lng], {
          radius: radius,
          color: "#2563eb",
          fillColor: "#3b82f6",
          fillOpacity: 0.3,
          weight: 2,
        }).addTo(map)
      } else if (geofenceType === 2) { // polygon
        // Use custom polygon points if available, otherwise generate them
        let latLngs
        if (customPolygonPoints && customPolygonPoints.length > 0) {
          latLngs = customPolygonPoints.map((point) => [point.lat, point.lng])
        } else {
          // Generate default polygon points (square)
          const points = generatePolygonPoints(coordinates, 4, 0.01)
          latLngs = points.map((point) => [point.lat, point.lng])

          // Update custom polygon points
          setCustomPolygonPoints(points.map((point) => ({ lat: point.lat, lng: point.lng })))
        }

        newLayer = L.polygon(latLngs, {
          color: "#7c3aed",
          fillColor: "#8b5cf6",
          fillOpacity: 0.3,
          weight: 2,
        }).addTo(map)

        // Add markers for each polygon point
        if (customPolygonPoints && customPolygonPoints.length > 0) {
          createPolygonMarkers(customPolygonPoints)
        }
      } else if (geofenceType === 1) { // pointer
        newLayer = L.circleMarker([coordinates.lat, coordinates.lng], {
          radius: 8,
          color: "#ffffff",
          fillColor: "#10b981",
          fillOpacity: 1,
          weight: 2,
        }).addTo(map)
      }

      setGeofenceLayer(newLayer)
    }
  }, [mapLoaded, mapInstance, geofenceType, coordinates, radius, customPolygonPoints])

  // Create markers for polygon points
  const createPolygonMarkers = (points: { lat: number; lng: number }[]) => {
    if (!mapInstance) return

    const L = mapInstance.L
    const newMarkers = []

    // Clear existing markers
    mapInstance.polygonMarkersGroup.clearLayers()

    // Create a marker for each point
    points.forEach((point, index) => {
      // Create a larger, more visible draggable marker
      const marker = L.marker([point.lat, point.lng], {
        draggable: true,
        autoPan: true,
        autoPanSpeed: 5,
        autoPanPadding: [30, 30],
        icon: L.divIcon({
          html: `
  <div class="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 border-2 border-white text-white text-xs font-bold cursor-move shadow-lg" 
       style="box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
    ${index + 1}
  </div>
`,
          className: "cursor-move",
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      }).addTo(mapInstance.polygonMarkersGroup)

      // Add smooth dragging with throttled updates
      let dragTimeout: NodeJS.Timeout | null = null

      marker.on("dragstart", () => {
        if (mapInstance.map._container) {
          mapInstance.map._container.style.cursor = "grabbing"
        }
      })

      marker.on("drag", () => {
        // Throttle updates for smoother dragging
        if (dragTimeout) clearTimeout(dragTimeout)
        dragTimeout = setTimeout(() => {
          const latlng = marker.getLatLng()
          updatePolygonPoint(index, latlng)
        }, 60) // ~60fps
      })

      marker.on("dragend", () => {
        if (mapInstance.map._container) {
          mapInstance.map._container.style.cursor = ""
        }
        // Final update with exact position
        const latlng = marker.getLatLng()
        updatePolygonPoint(index, latlng)
      })

      // Add a tooltip to indicate it's draggable
      marker.bindTooltip("Drag to move", {
        direction: "top",
        offset: [0, -10],
        opacity: 0.8,
      })

      // Add popup for removing point with proper index
      marker.bindPopup(`
    <button class="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600" 
      onclick="window.removePolygonPointAtIndex(${index})">
      Remove Point ${index + 1}
    </button>
  `)

      newMarkers.push(marker)
    })
  }
  // Helper function to generate polygon points
  const generatePolygonPoints = (center: { lat: number; lng: number }, sides: number, radius: number) => {
    const points = []
    const angleStep = (Math.PI * 2) / sides

    for (let i = 0; i < sides; i++) {
      const angle = i * angleStep
      const lat = center.lat + Math.sin(angle) * radius
      const lng = center.lng + Math.cos(angle) * radius
      points.push({ lat, lng })
    }

    return points
  }

  // Add a new point to the polygon border automatically
  const addPolygonPoint = () => {
    if (geofenceType !== 2 || !mapInstance || customPolygonPoints.length < 2) return // Check for polygon type as number

    // Find a good spot on the polygon border to add a new point
    // We'll add it in the middle of the longest edge
    let maxDistance = 0
    let insertIndex = 0
    let newPoint: { lat: number; lng: number } = { lat: 0, lng: 0 }

    for (let i = 0; i < customPolygonPoints.length; i++) {
      const p1 = customPolygonPoints[i]
      const p2 = customPolygonPoints[(i + 1) % customPolygonPoints.length]

      // Calculate distance between these points
      const distance = Math.sqrt(Math.pow(p1.lat - p2.lat, 2) + Math.pow(p1.lng - p2.lng, 2))

      if (distance > maxDistance) {
        maxDistance = distance
        insertIndex = i + 1

        // New point is in the middle of this edge
        newPoint = {
          lat: (p1.lat + p2.lat) / 2,
          lng: (p1.lng + p2.lng) / 2,
        }
      }
    }

    // Insert the new point at the calculated position
    const newPoints = [...customPolygonPoints]
    newPoints.splice(insertIndex, 0, newPoint)

    // Update the polygon
    setCustomPolygonPoints(newPoints)

    // Update parent component
    updateParent({
      polygonPoints: newPoints,
    })
  }

  // Update a polygon point - allow completely free movement
  const updatePolygonPoint = (index: number, latlng: any) => {
    if (index < 0 || index >= customPolygonPoints.length || !mapInstance) return

    // Create a new array to avoid reference issues
    const newPoints = [...customPolygonPoints]

    // Update the point to exactly where it was dragged with no constraints
    newPoints[index] = {
      lat: latlng.lat,
      lng: latlng.lng,
    }

    // Ensure immediate visual feedback by directly updating the polygon
    if (geofenceLayer && geofenceLayer.setLatLngs) {
      const latLngs = newPoints.map((point) => [point.lat, point.lng])
      geofenceLayer.setLatLngs(latLngs)

      // Force redraw for smoother appearance
      geofenceLayer.redraw()
    }

    // Update the polygon points state
    setCustomPolygonPoints(newPoints)

    // Update parent component with the new points
    updateParent({
      polygonPoints: newPoints,
    })
  }

  // Remove a polygon point
  const removePolygonPoint = (index: number) => {
    if (index < 0 || index >= customPolygonPoints.length || !mapInstance) return

    // Don't allow removing if we have 3 or fewer points (minimum for a polygon)
    if (customPolygonPoints.length <= 3) {
      showErrorToast("A polygon must have at least 3 points", "")
      return
    }

    // Remove the point
    const newPoints = [...customPolygonPoints]
    newPoints.splice(index, 1)

    // Update the polygon
    setCustomPolygonPoints(newPoints)

    // Clear existing markers and recreate them with updated indices
    mapInstance.polygonMarkersGroup.clearLayers()

    // Recreate markers for the remaining points
    if (newPoints.length > 0) {
      createPolygonMarkers(newPoints)
    }

    // Update parent component
    updateParent({
      polygonPoints: newPoints,
    })
  }

  // Update parent component with changes
  const updateParent = (changes: Partial<Geofence>) => {
    if (!onUpdate) return

    const updatedGeofence = {
      id: geofence?.id || 0,
      name,
      type: geofenceType, // Now using number directly
      radius,
      coordinates,
      locationId,
      tag,
      stop_type: stopType,
      status,
      polygonPoints: customPolygonPoints,
      address,
      time,
      ...changes,
    }

    onUpdate(updatedGeofence as Geofence)
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Validate form
      if (!name.trim()) {
        showErrorToast("Please enter a name for the geofence", "")
        return
      }
      if (!locationId.trim()) {
        showErrorToast("Please Enter Location ID", "")
        return
      }

      // Save geofence
      onSave({
        id: geofence?.id || 0,
        geofence_name: name,
        geofence_type: geofenceType, // Now using number directly
        type: getGeofenceTypeString(geofenceType), // Convert to string for compatibility
        radius,
        coordinates,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        location_id: locationId,
        tag,
        stop_type: stopType,
        status,
        polygonPoints: customPolygonPoints,
        address,
        time,
      })
    } catch (error) {
      console.error("Error saving geofence:", error)
    }
  }

  // Handle type change - now accepts number
  const handleTypeChange = (value: number) => {
    setGeofenceType(value)

    // Reset polygon points when switching to polygon
    if (value === 2 && (!customPolygonPoints || customPolygonPoints.length === 0)) { // Check for polygon type as number
      const newPoints = generatePolygonPoints(coordinates, 4, 0.01)
      setCustomPolygonPoints(newPoints.map((point) => ({ lat: point.lat, lng: point.lng })))
    }

    updateParent({
      geofence_type: value,
      type: getGeofenceTypeString(value),
      polygonPoints: value === 2 ? customPolygonPoints : undefined, // Check for polygon type as number
    })
  }

  // Handle radius change
  const handleRadiusChange = (values: number[]) => {
    const newRadius = values[0]
    setRadius(newRadius)
    updateParent({ radius: newRadius })
  }

  // Handle name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    updateParent({ geofence_name: e.target.value })
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value)
    updateParent({ time: e.target.value })
  }

  // Handle locationId change
  const handleLocationIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocationId(e.target.value)
    updateParent({ location_id: e.target.value })
  }

  // Handle tag change
  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTag(e.target.value)
    updateParent({ tag: e.target.value })
  }

  // Handle stopType change
  const handleStopTypeChange = (value: string) => {
    setStopType(value)
    updateParent({ stop_type: value })
  }

  // Listen for delete polygon point events and set up global function
  useEffect(() => {
    // Set up global function for removing points
    ; (window as any).removePolygonPointAtIndex = (index: number) => {
      removePolygonPoint(index)
    }

    const handleDeletePolygonPoint = (e: any) => {
      removePolygonPoint(e.detail)
    }

    document.addEventListener("deletePolygonPoint", handleDeletePolygonPoint)

    return () => {
      document.removeEventListener("deletePolygonPoint", handleDeletePolygonPoint)
      // Clean up global function
      delete (window as any).removePolygonPointAtIndex
    }
  }, [customPolygonPoints, mapInstance])

  // Ensure polygon updates immediately when points change
  useEffect(() => {
    if (mapLoaded && mapInstance && geofenceLayer && geofenceType === 2) { // Check for polygon type as number
      if (geofenceLayer.setLatLngs && customPolygonPoints.length > 0) {
        const latLngs = customPolygonPoints.map((point) => [point.lat, point.lng])
        geofenceLayer.setLatLngs(latLngs)
      }
    }
  }, [mapLoaded, mapInstance, geofenceLayer, customPolygonPoints, geofenceType])

  // Center map when coordinates change from input
  useEffect(() => {
    if (mapLoaded && mapInstance && coordinates.lat && coordinates.lng) {
      // Validate coordinates are within valid ranges
      if (coordinates.lat >= -90 && coordinates.lat <= 90 && coordinates.lng >= -180 && coordinates.lng <= 180) {
        mapInstance.map.setView([coordinates.lat, coordinates.lng], mapInstance.map.getZoom())
      }
    }
  }, [mapLoaded, mapInstance, coordinates.lat, coordinates.lng])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header with gradient background like group-drawer */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-gray-800"></div>
          <div className="absolute inset-0 backdrop-blur-sm"></div>
          <div className="relative flex items-center justify-between px-6 py-4">
            <h2 className="text-xl font-semibold text-white">{isNew ? "Add New Geofence" : "Edit Geofence"}</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          {/* Left Section - Basic Details */}
          <div className="w-2/5 p-6 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Details</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Geofence Name
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={handleNameChange}
                      placeholder="Enter geofence name"
                      className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="latitude" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Latitude
                      </Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="0.000001"
                        value={coordinates.lat}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === "" || value === "-") {
                            return
                          }
                          const lat = Number.parseFloat(value)
                          if (!isNaN(lat) && lat >= -90 && lat <= 90) {
                            const newCoords = { ...coordinates, lat }

                            // If in polygon mode, move all polygon points by the same offset
                            if (geofenceType === 2 && customPolygonPoints.length > 0) { // Check for polygon type as number
                              const offsetLat = lat - coordinates.lat

                              const updatedPolygonPoints = customPolygonPoints.map((point) => ({
                                lat: point.lat + offsetLat,
                                lng: point.lng,
                              }))

                              setCustomPolygonPoints(updatedPolygonPoints)
                              setCoordinates(newCoords)
                              updateParent({
                                coordinates: newCoords,
                                polygonPoints: updatedPolygonPoints,
                              })
                            } else {
                              setCoordinates(newCoords)
                              updateParent({ coordinates: newCoords })
                            }
                          }
                        }}
                        className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="longitude" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Longitude
                      </Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="0.000001"
                        value={coordinates.lng}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === "" || value === "-") {
                            return
                          }
                          const lng = Number.parseFloat(value)
                          if (!isNaN(lng) && lng >= -180 && lng <= 180) {
                            const newCoords = { ...coordinates, lng }

                            // If in polygon mode, move all polygon points by the same offset
                            if (geofenceType === 2 && customPolygonPoints.length > 0) { // Check for polygon type as number
                              const offsetLng = lng - coordinates.lng

                              const updatedPolygonPoints = customPolygonPoints.map((point) => ({
                                lat: point.lat,
                                lng: point.lng + offsetLng,
                              }))

                              setCustomPolygonPoints(updatedPolygonPoints)
                              setCoordinates(newCoords)
                              updateParent({
                                coordinates: newCoords,
                                polygonPoints: updatedPolygonPoints,
                              })
                            } else {
                              setCoordinates(newCoords)
                              updateParent({ coordinates: newCoords })
                            }
                          }
                        }}
                        className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  {/* Address Display */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</Label>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md min-h-[60px]">
                      {loadingAddress ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin text-gray-400 dark:text-gray-500" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">Loading address...</span>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
                          {address || "Address not available"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="locationId" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Location ID
                    </Label>
                    <Input
                      id="locationId"
                      value={locationId}
                      onChange={handleLocationIdChange}
                      placeholder="E.g., LOC001"
                      className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="time" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Loading/Unloading Time
                    </Label>
                    <Input
                      id="time"
                      value={time}
                      onChange={handleTimeChange}
                      placeholder="E.g., 1hr"
                      className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <div>
                      <Label htmlFor="stopType" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Stop Type
                      </Label>
                      <Select value={stopType} onValueChange={handleStopTypeChange}>
                        <SelectTrigger className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                          <SelectValue placeholder="Select stop type" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          <SelectItem value="P" className="dark:text-gray-200">Pickup</SelectItem>
                          <SelectItem value="D" className="dark:text-gray-200">Delivery</SelectItem>
                          <SelectItem value="W" className="dark:text-gray-200">Waypoint</SelectItem>
                          <SelectItem value="S" className="dark:text-gray-200">Rest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tag" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tag
                      </Label>
                      <Input
                        id="tag"
                        value={tag}
                        onChange={handleTagChange}
                        placeholder="E.g. Hub"
                        className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </Label>
                      <Select
                        value={status ? "active" : "inactive"}
                        onValueChange={(value) => {
                          const newStatus = value === "active"
                          setStatus(newStatus)
                          updateParent({ status: newStatus })
                        }}
                      >
                        <SelectTrigger className="mt-1 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          <SelectItem value="active" className="dark:text-gray-200">Active</SelectItem>
                          <SelectItem value="inactive" className="dark:text-gray-200">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Geofence on Map Details */}
          <div className="w-3/5 p-6 overflow-y-auto dark:border-gray-700">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Geofence on Map Details</h3>

                {/* Map Preview */}
                <div className="mb-6">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Map Preview</Label>
                  <div className="border rounded-lg overflow-hidden h-80 dark:border-gray-700">
                    <div ref={mapContainerRef} className="h-full w-full" />
                    {!leafletLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-80 dark:bg-opacity-80">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 border-4 border-t-blue-500 border-blue-200 dark:border-blue-700 rounded-full animate-spin"></div>
                          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">Loading map...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Geofence Area Type - Updated to use numbers */}
                <div className="space-y-4 mb-6">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Choose Geofence Area Type</Label>
                  <RadioGroup value={geofenceType.toString()} onValueChange={(value) => handleTypeChange(parseInt(value))} className="flex space-x-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0" id="circle" className="dark:border-gray-500" />
                      <Label htmlFor="circle" className="flex items-center cursor-pointer text-sm dark:text-gray-300">
                        <CircleIcon className="h-4 w-4 mr-2 text-blue-600" />
                        Circle
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2" id="polygon" className="dark:border-gray-500" />
                      <Label htmlFor="polygon" className="flex items-center cursor-pointer text-sm dark:text-gray-300">
                        <Square className="h-4 w-4 mr-2 text-purple-600" />
                        Polygon
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="pointer" className="dark:border-gray-500" />
                      <Label htmlFor="pointer" className="flex items-center cursor-pointer text-sm dark:text-gray-300">
                        <MapPin className="h-4 w-4 mr-2 text-green-600" />
                        Pointer
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Circle Radius Controls - Updated condition */}
                {geofenceType === 0 && (
                  <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Circle Radius Configuration</Label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>100 mtr</span>
                        <span>5000 mtr</span>
                      </div>
                      <Slider
                        value={[radius]}
                        min={100}
                        max={5000}
                        step={10}
                        onValueChange={handleRadiusChange}
                        className="w-full"
                      />
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Selected radius</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            value={radius}
                            onChange={(e) => {
                              const value = e.target.value
                              const newRadius = value === '' ? 0 : Number.parseInt(value)
                              setRadius(newRadius)
                              updateParent({ radius: newRadius })
                            }}
                            className="w-20 h-8 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                          <span className="text-sm text-gray-500 dark:text-gray-400">Mtr</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Polygon Controls - Updated condition */}
                {geofenceType === 2 && (
                  <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Polygon Corner Points: {customPolygonPoints.length}
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addPolygonPoint}
                        className="flex items-center gap-1 text-xs dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <Plus className="h-3 w-3" />
                        Add Point
                      </Button>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs">
                      <p className="font-medium mb-1">How to edit polygon shape:</p>
                      <ol className="list-decimal ml-4 space-y-1">
                        <li>Click "Add Point" to add a new corner point</li>
                        <li>Drag numbered points to reshape the area</li>
                        <li>Click on points to remove them</li>
                        <li>Minimum 3 points required for polygon</li>
                      </ol>
                    </div>
                  </div>
                )}

                {/* Pointer Info - Updated condition */}
                {geofenceType === 1 && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Pointer Configuration</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Pointer geofence marks an exact location point. Drag the marker on the map to adjust the position.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-800">
          <form onSubmit={handleSubmit}>
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Reset form to initial values
                  setName(geofence?.geofence_name || "")
                  setLocationId(geofence?.location_id || "")
                  setCoordinates(geofence?.coordinates || { lat: 19.076, lng: 72.8777 })
                  setTag(geofence?.tag || "")
                  setStopType(geofence?.stop_type || "")
                  setStatus(geofence?.status ?? true)
                  setGeofenceType(geofence?.geofence_type !== undefined ? geofence.geofence_type : 0) // Use number
                  setRadius(geofence?.radius || 500)
                  setCustomPolygonPoints(geofence?.polygonPoints || [])
                  setTime(geofence?.time || "")

                  showSuccessToast("Form Reset", "All form fields have been reset successfully")
                }}
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Reset
              </Button>
              <div className="flex space-x-3">
                <Button type="button" variant="outline" onClick={onClose} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                  Cancel
                </Button>
                <Button type="submit" className="bg-black hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white">
                  <Check className="mr-2 h-4 w-4" />
                  {isNew ? "Create Geofence" : "Update Geofence"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
      {Toaster}
    </div>
  )
}
