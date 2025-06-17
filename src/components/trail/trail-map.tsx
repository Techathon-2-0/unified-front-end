import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { ZoomIn, ZoomOut, RotateCcw, Satellite, MapIcon, Maximize, Minimize } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TrailMapProps } from "@/types/trail/trail_type"
import type { CustomLeafletMap } from "@/types/trail/trail_type"

export default function TrailMap({
  trailPoints,
  stops = [],
  isPlaying,
  currentPointIndex,
  setCurrentPointIndex,
  //playbackSpeed,
  trailType,
  //setIsPlaying,
  showPoints,
  showPlannedSequence = true,
  setShowPlannedSequence,
  isFullscreen = false,
  onToggleFullscreen,
}: TrailMapProps & {
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<CustomLeafletMap | null>(null)
  const polylineRef = useRef<L.Polyline | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const pointMarkersRef = useRef<L.CircleMarker[]>([])
  const vehicleMarkerRef = useRef<L.Marker | null>(null)
  const stopMarkersRef = useRef<L.Marker[]>([])
  const [mapType, setMapType] = useState<"normal" | "satellite">("normal")

  // Create vehicle icon with heading
  const createVehicleIcon = (heading: number) => {
    return L.divIcon({
      className: "custom-vehicle-icon",
      html: `
      <div style="
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.7); /* translucent white */
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      ">

        <svg 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          style="transform: rotate(${heading}deg);"
        >
          <polygon 
            points="12,2 17,20 12,16 7,20" 
            fill="#2563eb"
          />
        </svg>
      </div>
    `,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
  };


  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return

    if (!leafletMapRef.current) {
      leafletMapRef.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: true,
      }).setView([20.5937, 78.9629], 5)

      // Add tile layers
      const normalLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      })

      const satelliteLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
          maxZoom: 19,
        },
      )

      if (mapType === "normal") {
        normalLayer.addTo(leafletMapRef.current)
      } else {
        satelliteLayer.addTo(leafletMapRef.current)
      }

      // Store layers for switching
      leafletMapRef.current.normalLayer = normalLayer
      leafletMapRef.current.satelliteLayer = satelliteLayer
    }

    return () => {
      // Cleanup handled in component unmount
    }
  }, [])

  // Handle map type switching
  useEffect(() => {
    if (!leafletMapRef.current) return

    const map = leafletMapRef.current as any

    if (mapType === "normal") {
      if (map.satelliteLayer && map.hasLayer(map.satelliteLayer)) {
        map.removeLayer(map.satelliteLayer)
      }
      if (map.normalLayer && !map.hasLayer(map.normalLayer)) {
        map.addLayer(map.normalLayer)
      }
    } else {
      if (map.normalLayer && map.hasLayer(map.normalLayer)) {
        map.removeLayer(map.normalLayer)
      }
      if (map.satelliteLayer && !map.hasLayer(map.satelliteLayer)) {
        map.addLayer(map.satelliteLayer)
      }
    }
  }, [mapType])

  // Handle trail points changes
  useEffect(() => {
    if (!leafletMapRef.current || trailPoints.length === 0) return

    // Clear existing markers and polylines
    if (polylineRef.current) {
      leafletMapRef.current.removeLayer(polylineRef.current)
      polylineRef.current = null
    }

    markersRef.current.forEach((marker) => {
      if (leafletMapRef.current) leafletMapRef.current.removeLayer(marker)
    })
    markersRef.current = []

    pointMarkersRef.current.forEach((marker) => {
      if (leafletMapRef.current) leafletMapRef.current.removeLayer(marker)
    })
    pointMarkersRef.current = []

    // Create start marker
    const startPoint = trailPoints[0]
    const startIcon = L.divIcon({
      className: "custom-div-icon",
      html: `<div style="background-color: #10b981; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    })

    const startMarker = L.marker([startPoint.latitude, startPoint.longitude], { icon: startIcon })
      .addTo(leafletMapRef.current)
      .bindPopup(
        `<b>Start Point</b><br>
        ${startPoint.address}<br>
        Lat: ${startPoint.latitude}, Lng: ${startPoint.longitude}<br>
        ${new Date(startPoint.time).toLocaleString()}<br>
        Speed: ${startPoint.speed} km/h`
      )

    markersRef.current.push(startMarker)

    // Create end marker
    const endPoint = trailPoints[trailPoints.length - 1]
    const endIcon = L.divIcon({
      className: "custom-div-icon",
      html: `<div style="background-color: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    })

    const endMarker = L.marker([endPoint.latitude, endPoint.longitude], { icon: endIcon })
      .addTo(leafletMapRef.current)
      .bindPopup(
        `<b>End Point</b><br>
        ${endPoint.address}<br>
        Lat: ${endPoint.latitude}, Lng: ${endPoint.longitude}<br>
        ${new Date(endPoint.time).toLocaleString()}<br>
        Speed: ${endPoint.speed} km/h`
      )

    markersRef.current.push(endMarker)

    // Create bounds
    const bounds = L.latLngBounds([
      [startPoint.latitude, startPoint.longitude],
      [endPoint.latitude, endPoint.longitude],
    ])

    // Create polyline or points
    if (!showPoints) {
      const latlngs = trailPoints.map((point) => {
        const latLng = [point.latitude, point.longitude]
        bounds.extend(latLng as L.LatLngExpression)
        return latLng
      })

      polylineRef.current = L.polyline(latlngs as L.LatLngExpression[], {
        color: "#2563eb",
        weight: 4,
        opacity: 0.7,
        lineCap: "round",
        lineJoin: "round",
        smoothFactor: 1.0,
      }).addTo(leafletMapRef.current)
    } else {
      trailPoints.forEach((point, index) => {
        const latLng = [point.latitude, point.longitude]
        bounds.extend(latLng as L.LatLngExpression)

        const pointMarker = L.circleMarker([point.latitude, point.longitude], {
          radius: 4,
          fillColor: "#2563eb",
          color: "#ffffff",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8,
        })
          .addTo(leafletMapRef.current!)
          .bindPopup(
            `<b>Point ${index + 1}</b><br>
            ${point.address}<br>
            Lat: ${point.latitude}, Lng: ${point.longitude}<br>
            ${new Date(point.time).toLocaleString()}<br>
            Speed: ${Math.round(point.speed)} km/h`
          )

        pointMarkersRef.current.push(pointMarker)
      })
    }

    // Fit map to bounds
    leafletMapRef.current.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 15,
    })

    setCurrentPointIndex(0)
  }, [trailPoints, setCurrentPointIndex, showPoints])

  // Handle stops for trip-based trails
  useEffect(() => {
    if (!leafletMapRef.current || trailType !== "trip") return

    // Clear existing stop markers
    stopMarkersRef.current.forEach((marker) => {
      if (leafletMapRef.current) leafletMapRef.current.removeLayer(marker)
    })
    stopMarkersRef.current = []

    if (stops.length > 0) {
      stops.forEach((stop) => {
        const stopIcon = L.divIcon({
          className: "custom-div-icon",
          html: `<div style="background-color: #f59e0b; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        })

        const stopMarker = L.marker([stop.latitude, stop.longitude], { icon: stopIcon })
          .addTo(leafletMapRef.current!)
          .bindPopup(
            `<b>${stop.stopName}</b><br>
            Type: ${stop.stopType}<br>
            Status: ${stop.status}<br>
            Sequence: ${showPlannedSequence ? stop.plannedSequence : stop.actualSequence}<br>
            Lat: ${stop.latitude}, Lng: ${stop.longitude}<br>
            ${stop.address}`,
          )

        stopMarkersRef.current.push(stopMarker)
      })
    }
  }, [stops, trailType, showPlannedSequence])

  // Handle vehicle marker updates
  useEffect(() => {
    if (!leafletMapRef.current || trailPoints.length === 0 || currentPointIndex >= trailPoints.length) return

    const point = trailPoints[currentPointIndex]

    if (vehicleMarkerRef.current) {
      vehicleMarkerRef.current.setLatLng([point.latitude, point.longitude])
      vehicleMarkerRef.current.setIcon(createVehicleIcon(point.heading))

      vehicleMarkerRef.current.bindPopup(`
        <b>Current Position</b><br>
        ${point.address}<br>
        Lat: ${point.latitude}, Lng: ${point.longitude}<br>
        ${new Date(point.time).toLocaleString()}<br>
        Speed: ${Math.round(point.speed)} km/h<br>
        Heading: ${point.heading}°
      `)

      if (isPlaying) {
        leafletMapRef.current.panTo([point.latitude, point.longitude])
      }
    } else if (isPlaying || currentPointIndex > 0) {
      vehicleMarkerRef.current = L.marker([point.latitude, point.longitude], {
        icon: createVehicleIcon(point.heading),
      })
        .addTo(leafletMapRef.current)
        .bindPopup(`
          <b>Current Position</b><br>
          ${point.address}<br>
          Lat: ${point.latitude}, Lng: ${point.longitude}<br>
          ${new Date(point.time).toLocaleString()}<br>
          Speed: ${Math.round(point.speed)} km/h<br>
          Heading: ${point.heading}°
        `)
    }

    // Update polyline progress
    if (!showPoints && leafletMapRef.current) {
      if (polylineRef.current) {
        leafletMapRef.current.removeLayer(polylineRef.current)
      }

      const latlngs = trailPoints.slice(0, currentPointIndex + 1).map((p) => [p.latitude, p.longitude])
      polylineRef.current = L.polyline(latlngs as L.LatLngExpression[], {
        color: "#2563eb",
        weight: 4,
        opacity: 0.7,
        lineCap: "round",
        lineJoin: "round",
        smoothFactor: 1.0,
      }).addTo(leafletMapRef.current)
    }

    // Highlight current point in points mode
    if (showPoints && pointMarkersRef.current.length > currentPointIndex) {
      pointMarkersRef.current.forEach((marker, idx) => {
        if (idx === currentPointIndex) {
          marker.setStyle({
            radius: 6,
            fillColor: "#ef4444",
            fillOpacity: 1,
          })
        } else {
          marker.setStyle({
            radius: 4,
            fillColor: "#2563eb",
            fillOpacity: 0.8,
          })
        }
      })
    }
  }, [currentPointIndex, isPlaying, trailPoints, showPoints])

  // Invalidate map size on fullscreen toggle
  useEffect(() => {
    if (leafletMapRef.current) {
      setTimeout(() => {
        leafletMapRef.current?.invalidateSize?.()
      }, 300)
    }
  }, [isFullscreen])

  // Map control functions
  const handleZoomIn = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.zoomIn()
    }
  }

  const handleZoomOut = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.zoomOut()
    }
  }

  const handleRecenter = () => {
    if (!leafletMapRef.current || trailPoints.length === 0) return

    const bounds = L.latLngBounds(trailPoints.map((p) => [p.latitude, p.longitude]) as L.LatLngExpression[])
    leafletMapRef.current.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 15,
    })
  }

  const toggleMapType = () => {
    setMapType(mapType === "normal" ? "satellite" : "normal")
  }

  return (
    <div
      className={`w-full h-full min-h-[300px] relative ${
        isFullscreen ? "fixed inset-0 z-50 bg-white dark:bg-gray-900" : ""
      }`}
      style={
        isFullscreen
          ? {
              position: "fixed",
              inset: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 50,
              background: "white",
            }
          : { width: "100%", height: "100%" }
      }
    >
      <div
        ref={mapRef}
        className="z-10 absolute inset-0"
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          inset: 0,
        }}
      ></div>

      {/* Map Controls */}
      <div className="absolute right-4 top-4 flex flex-col gap-2 z-20">
        {/* Fullscreen Button */}
        {onToggleFullscreen && (
          <Button
            variant="outline"
            size="icon"
            className="bg-white dark:bg-gray-800 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        )}

        <Button
          variant="outline"
          size="icon"
          className="bg-white dark:bg-gray-800 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={toggleMapType}
        >
          {mapType === "normal" ? <Satellite className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="bg-white dark:bg-gray-800 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={handleZoomIn}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="bg-white dark:bg-gray-800 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={handleZoomOut}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="bg-white dark:bg-gray-800 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={handleRecenter}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Trip Sequence Toggle */}
      {trailType === "trip" && stops.length > 0 && (
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-white dark:bg-gray-800 rounded-md shadow-md p-2">
            <div className="flex items-center space-x-2">
              <Button
                variant={showPlannedSequence ? "default" : "outline"}
                size="sm"
                onClick={() => setShowPlannedSequence?.(true)}
                className="text-xs"
              >
                Planned
              </Button>
              <Button
                variant={!showPlannedSequence ? "default" : "outline"}
                size="sm"
                onClick={() => setShowPlannedSequence?.(false)}
                className="text-xs"
              >
                Actual
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
