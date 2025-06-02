import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Check, X, CircleIcon, Square, MapPin, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { GeofenceFormProps, Geofence } from "../../../types/geofence/gconfig"
import { useToast } from "@/hooks/use-toast"

export default function GeofenceForm({ onClose, geofence, isNew = false, onUpdate, onSave }: GeofenceFormProps) {
  const [geofenceType, setGeofenceType] = useState<"circle" | "polygon" | "pointer">(geofence?.type || "circle")
  const [radius, setRadius] = useState<number>(geofence?.radius || 500)
  const [name, setName] = useState(geofence?.name || "")
  // const [location, setLocation] = useState(geofence?.location || "")
  const [locationId, setLocationId] = useState(geofence?.locationId || "")
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>(
    geofence?.coordinates || { lat: 19.076, lng: 72.8777 },
  )
  const [tag, setTag] = useState(geofence?.tag || "")
  // const [geozoneType, setGeozoneType] = useState(geofence?.geozoneType || "")
  const [stopType, setStopType] = useState(geofence?.stopType || "")
  // const [shipmentId, setShipmentId] = useState(geofence?.shipmentId || "")
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const [marker, setMarker] = useState<any>(null)
  const [geofenceLayer, setGeofenceLayer] = useState<any>(null)
  const [customPolygonPoints, setCustomPolygonPoints] = useState<{ lat: number; lng: number }[]>(
    geofence?.polygonPoints || [],
  )
  const [polygonMarkers, setPolygonMarkers] = useState<any[]>([])
  const { showSuccessToast, showErrorToast, Toaster } = useToast({ position: "top-right",});

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
        if (geofenceType === "polygon" && customPolygonPoints.length > 0) {
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
      setPolygonMarkers([])

      // Create new geofence layer based on type
      let newLayer
      if (geofenceType === "circle") {
        newLayer = L.circle([coordinates.lat, coordinates.lng], {
          radius: radius,
          color: "#2563eb",
          fillColor: "#3b82f6",
          fillOpacity: 0.3,
          weight: 2,
        }).addTo(map)
      } else if (geofenceType === "polygon") {
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
      } else if (geofenceType === "pointer") {
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

      // Add popup for removing point
      marker.bindPopup(`
      <button class="px-2 py-1 bg-red-500 text-white text-xs rounded" 
        onclick="document.dispatchEvent(new CustomEvent('deletePolygonPoint', {detail: ${index}}))">
        Remove Point
      </button>
    `)

      newMarkers.push(marker)
    })

    setPolygonMarkers(newMarkers)
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
    if (geofenceType !== "polygon" || !mapInstance || customPolygonPoints.length < 2) return

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

    // Update parent component
    updateParent({
      polygonPoints: newPoints,
    })
  }

  // Update parent component with changes
  const updateParent = (changes: Partial<Geofence>) => {
    if (!onUpdate) return

    const updatedGeofence = {
      id: geofence?.id || "new",
      name,
      type: geofenceType,
      radius,
      coordinates,
      //location,
      locationId,
      tag,
      //geozoneType,
      stopType,
      //shipmentId,
      polygonPoints: customPolygonPoints,
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

      // Save geofence
      onSave({
        id: geofence?.id || "new",
        name,
        type: geofenceType,
        radius,
        coordinates,
        //location,
        locationId,
        tag,
        //geozoneType,
        stopType,
        //shipmentId,
        polygonPoints: customPolygonPoints,
      })
    } catch (error) {
      //console.error("Error saving geofence:", error)
    }
  }

  // Handle type change
  const handleTypeChange = (value: "circle" | "polygon" | "pointer") => {
    setGeofenceType(value)

    // Reset polygon points when switching to polygon
    if (value === "polygon" && (!customPolygonPoints || customPolygonPoints.length === 0)) {
      const newPoints = generatePolygonPoints(coordinates, 4, 0.01)
      setCustomPolygonPoints(newPoints.map((point) => ({ lat: point.lat, lng: point.lng })))
    }

    updateParent({
      type: value,
      polygonPoints: value === "polygon" ? customPolygonPoints : undefined,
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
    updateParent({ name: e.target.value })
  }

  // Handle location change
  // const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setLocation(e.target.value)
  //   updateParent({ location: e.target.value })
  // }

  // Handle locationId change
  const handleLocationIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocationId(e.target.value)
    updateParent({ locationId: e.target.value })
  }

  // Handle tag change
  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTag(e.target.value)
    updateParent({ tag: e.target.value })
  }

  // Handle geozoneType change
  // const handleGeozoneTypeChange = (value: string) => {
  //   setGeozoneType(value)
  //   updateParent({ geozoneType: value })
  // }

  // Handle stopType change
  const handleStopTypeChange = (value: string) => {
    setStopType(value)
    updateParent({ stopType: value })
  }

  // Handle shipmentId change
  // const handleShipmentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setShipmentId(e.target.value)
  //   updateParent({ shipmentId: e.target.value })
  // }

  // Listen for delete polygon point events
  useEffect(() => {
    const handleDeletePolygonPoint = (e: any) => {
      removePolygonPoint(e.detail)
    }

    document.addEventListener("deletePolygonPoint", handleDeletePolygonPoint)

    return () => {
      document.removeEventListener("deletePolygonPoint", handleDeletePolygonPoint)
    }
  }, [customPolygonPoints])

  // Ensure polygon updates immediately when points change
  useEffect(() => {
    if (mapLoaded && mapInstance && geofenceLayer && geofenceType === "polygon") {
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
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
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
          <div className="w-2/5 p-6 border-r border-gray-200 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Details</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Geofence Name
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={handleNameChange}
                      placeholder="Enter geofence name"
                      className="mt-1"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="latitude" className="text-sm font-medium text-gray-700">
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
                            if (geofenceType === "polygon" && customPolygonPoints.length > 0) {
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
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="longitude" className="text-sm font-medium text-gray-700">
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
                            if (geofenceType === "polygon" && customPolygonPoints.length > 0) {
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
                        className="mt-1"
                        required
                      />
                    </div>
                  </div>

                  {/* <div>
                    <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                      Location Description
                    </Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={handleLocationChange}
                      placeholder="E.g., Mumbai Warehouse, Delhi Hub"
                      className="mt-1"
                    />
                  </div> */}

                    <div>
                      <Label htmlFor="locationId" className="text-sm font-medium text-gray-700">
                        Location ID
                      </Label>
                      <Input
                        id="locationId"
                        value={locationId}
                        onChange={handleLocationIdChange}
                        placeholder="E.g., LOC001"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="tag" className="text-sm font-medium text-gray-700">
                        Tag
                      </Label>
                      <Input
                        id="tag"
                        value={tag}
                        onChange={handleTagChange}
                        placeholder="E.g., Warehouse, Hub"
                        className="mt-1"
                      />
                    </div>

                  <div>
                    {/* <div>
                      <Label htmlFor="geozoneType" className="text-sm font-medium text-gray-700">
                        Geozone Type
                      </Label>
                      <Select value={geozoneType} onValueChange={handleGeozoneTypeChange}>
                        <SelectTrigger className="mt-1 w-full">
                          <SelectValue placeholder="Select geozone type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Loading">Loading</SelectItem>
                          <SelectItem value="Unloading">Unloading</SelectItem>
                          <SelectItem value="Both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div> */}
                    <div>
                      <Label htmlFor="stopType" className="text-sm font-medium text-gray-700">
                        Stop Type
                      </Label>
                      <Select value={stopType} onValueChange={handleStopTypeChange}>
                        <SelectTrigger className="mt-1 w-full">
                          <SelectValue placeholder="Select stop type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pickup">Pickup</SelectItem>
                          <SelectItem value="Delivery">Delivery</SelectItem>
                          <SelectItem value="Loading">Waypoint</SelectItem>
                          <SelectItem value="Both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* <div>
                    <Label htmlFor="shipmentId" className="text-sm font-medium text-gray-700">
                      Shipment ID
                    </Label>
                    <Input
                      id="shipmentId"
                      value={shipmentId}
                      onChange={handleShipmentIdChange}
                      placeholder="E.g., SH001"
                      className="mt-1"
                    />
                  </div> */}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Geofence on Map Details */}
          <div className="w-3/5 p-6 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Geofence on Map Details</h3>

                {/* Map Preview */}
                <div className="mb-6">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Map Preview</Label>
                  <div className="border rounded-lg overflow-hidden h-80">
                    <div ref={mapContainerRef} className="h-full w-full" />
                    {!leafletLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
                          <p className="mt-2 text-sm text-gray-700">Loading map...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Geofence Area Type */}
                <div className="space-y-4 mb-6">
                  <Label className="text-sm font-medium text-gray-700">Choose Geofence Area Type</Label>
                  <RadioGroup value={geofenceType} onValueChange={handleTypeChange} className="flex space-x-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="circle" id="circle" />
                      <Label htmlFor="circle" className="flex items-center cursor-pointer text-sm">
                        <CircleIcon className="h-4 w-4 mr-2 text-blue-600" />
                        Circle
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="polygon" id="polygon" />
                      <Label htmlFor="polygon" className="flex items-center cursor-pointer text-sm">
                        <Square className="h-4 w-4 mr-2 text-purple-600" />
                        Polygon
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pointer" id="pointer" />
                      <Label htmlFor="pointer" className="flex items-center cursor-pointer text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-green-600" />
                        Pointer
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Circle Radius Controls */}
                {geofenceType === "circle" && (
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Label className="text-sm font-medium text-gray-700">Circle Radius Configuration</Label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>100 mtr</span>
                        <span>5000 mtr</span>
                      </div>
                      <Slider
                        value={[radius]}
                        min={100}
                        max={5000}
                        step={50}
                        onValueChange={handleRadiusChange}
                        className="w-full"
                      />
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700">Selected radius</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            value={radius}
                            onChange={(e) => {
                              const newRadius = Number.parseInt(e.target.value)
                              setRadius(newRadius)
                              updateParent({ radius: newRadius })
                            }}
                            className="w-20 h-8 text-sm"
                          />
                          <span className="text-sm text-gray-500">Mtr</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Polygon Controls */}
                {geofenceType === "polygon" && (
                  <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-700">
                        Polygon Corner Points: {customPolygonPoints.length}
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addPolygonPoint}
                        className="flex items-center gap-1 text-xs"
                      >
                        <Plus className="h-3 w-3" />
                        Add Point
                      </Button>
                    </div>

                    <div className="bg-amber-50 p-3 rounded-md border border-amber-200 text-amber-800 text-xs">
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

                {/* Pointer Info */}
                {geofenceType === "pointer" && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Pointer Configuration</Label>
                    <p className="text-sm text-gray-600">
                      Pointer geofence marks an exact location point. Drag the marker on the map to adjust the position.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <form onSubmit={handleSubmit}>
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Reset form to initial values
                  setName(geofence?.name || "")
                  //setLocation(geofence?.location || "")
                  setLocationId(geofence?.locationId || "")
                  setCoordinates(geofence?.coordinates || { lat: 19.076, lng: 72.8777 })
                  setTag(geofence?.tag || "")
                  //setGeozoneType(geofence?.geozoneType || "")
                  setStopType(geofence?.stopType || "")
                  //setShipmentId(geofence?.shipmentId || "")
                  setGeofenceType(geofence?.type || "circle")
                  setRadius(geofence?.radius || 500)
                  setCustomPolygonPoints(geofence?.polygonPoints || [])

                  showSuccessToast("Form Reset", "All form fields have been reset successfully")
                }}
              >
                Reset
              </Button>
              <div className="flex space-x-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-black hover:bg-gray-800 text-white">
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
