import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { motion } from "framer-motion"
import type { TrailMapProps } from "../../types/trail/trail"

export default function TrailMap({
  trailPoints,
  tripStops,
  isPlaying,
  currentPointIndex,
  setCurrentPointIndex,
  playbackSpeed,
  trailType,
  setIsPlaying,
  showPoints,
}: TrailMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<L.Map | null>(null)
  const polylineRef = useRef<L.Polyline | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const pointMarkersRef = useRef<L.CircleMarker[]>([])
  const vehicleMarkerRef = useRef<L.Marker | null>(null)
  const stopMarkersRef = useRef<L.Marker[]>([])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return

    // Create map if it doesn't exist
    if (!leafletMapRef.current) {
      leafletMapRef.current = L.map(mapRef.current, {
        zoomControl: false, // We'll add custom zoom controls
        attributionControl: true,
      }).setView([20.5937, 78.9629], 5)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(leafletMapRef.current)
    }

    // Cleanup function
    return () => {
      // We don't destroy the map on component unmount to prevent re-initialization issues
    }
  }, [])

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

    const startMarker = L.marker([startPoint.lat, startPoint.lng], { icon: startIcon })
      .addTo(leafletMapRef.current)
      .bindPopup(
        `<b>Start Point</b><br>${startPoint.location || "Unknown"}<br>${new Date(startPoint.timestamp).toLocaleString()}`,
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

    const endMarker = L.marker([endPoint.lat, endPoint.lng], { icon: endIcon })
      .addTo(leafletMapRef.current)
      .bindPopup(
        `<b>End Point</b><br>${endPoint.location || "Unknown"}<br>${new Date(endPoint.timestamp).toLocaleString()}`,
      )

    markersRef.current.push(endMarker)

    // Create bounds to fit all points
    const bounds = L.latLngBounds([
      [startPoint.lat, startPoint.lng],
      [endPoint.lat, endPoint.lng],
    ])

    // Create polyline for the trail (only in line mode)
    if (!showPoints) {
      // Use all points for the polyline to ensure accurate path representation
      const latlngs = trailPoints.map((point) => {
        const latLng = [point.lat, point.lng]
        bounds.extend(latLng as L.LatLngExpression)
        return latLng
      })

      polylineRef.current = L.polyline(latlngs as L.LatLngExpression[], {
        color: "#2563eb",
        weight: 4,
        opacity: 0.7,
        lineCap: "round",
        lineJoin: "round",
        smoothFactor: 1.0, // Lower smoothFactor to show more detail in the path
      }).addTo(leafletMapRef.current)
    }

    // Add point markers (only in points mode)
    if (showPoints) {
      trailPoints.forEach((point, index) => {
        const latLng = [point.lat, point.lng]
        bounds.extend(latLng as L.LatLngExpression)

        const pointMarker = L.circleMarker([point.lat, point.lng], {
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
            ${point.location || "Unknown"}<br>
            ${new Date(point.timestamp).toLocaleString()}<br>
            Speed: ${Math.round(point.speed || 0)} km/h`,
          )

        pointMarkersRef.current.push(pointMarker)
      })
    }

    // Fit map to bounds with padding
    leafletMapRef.current.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 15, // Limit max zoom to prevent zooming in too much
    })

    // Reset current point index
    setCurrentPointIndex(0)
  }, [trailPoints, setCurrentPointIndex, showPoints])

  // Handle trip stops
  useEffect(() => {
    if (!leafletMapRef.current) return

    // Clear existing stop markers
    stopMarkersRef.current.forEach((marker) => {
      if (leafletMapRef.current) leafletMapRef.current.removeLayer(marker)
    })
    stopMarkersRef.current = []

    if (trailType === "trip" && tripStops.length > 0 && trailPoints.length > 0) {
      // Create stop markers
      tripStops.forEach((stop, index) => {
        // For trip-based trails, we need to find the appropriate point in the trail
        // that corresponds to each stop
        const stopIndex = Math.floor(((index + 1) * trailPoints.length) / (tripStops.length + 1))
        const point = trailPoints[stopIndex]

        if (!point) return

        const stopIcon = L.divIcon({
          className: "custom-div-icon",
          html: `<div style="background-color: #f59e0b; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        })

        const stopMarker = L.marker([point.lat, point.lng], { icon: stopIcon })
          .addTo(leafletMapRef.current!)
          .bindPopup(
            `<b>Stop: ${stop.name}</b><br>
            Status: ${stop.status}<br>
            Type: ${stop.stopType}<br>
            Detention: ${stop.detentionTime}`,
          )

        stopMarkersRef.current.push(stopMarker)
      })
    }
  }, [tripStops, trailType, trailPoints, trailPoints.length])

  // Handle playback
  useEffect(() => {
    if (!leafletMapRef.current || trailPoints.length === 0) return

    let interval: NodeJS.Timeout

    if (isPlaying) {
      // Create or update vehicle marker
      if (!vehicleMarkerRef.current && currentPointIndex < trailPoints.length) {
        const point = trailPoints[currentPointIndex]

        const vehicleIcon = L.divIcon({
          className: "custom-div-icon",
          html: `<div style="background-color: #2563eb; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        })

        vehicleMarkerRef.current = L.marker([point.lat, point.lng], { icon: vehicleIcon }).addTo(leafletMapRef.current)
      }

      // Start playback interval
      interval = setInterval(() => {
        setCurrentPointIndex((prev) => {
          if (prev >= trailPoints.length - 1) {
            clearInterval(interval)
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 1000 / playbackSpeed)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, playbackSpeed, trailPoints.length, setCurrentPointIndex, setIsPlaying])

  // Update vehicle marker position
  useEffect(() => {
    if (!leafletMapRef.current || trailPoints.length === 0 || currentPointIndex >= trailPoints.length) return

    const point = trailPoints[currentPointIndex]

    // Update vehicle marker position
    if (vehicleMarkerRef.current) {
      vehicleMarkerRef.current.setLatLng([point.lat, point.lng])

      // Update popup content
      vehicleMarkerRef.current.bindPopup(`
        <b>Current Position</b><br>
        ${point.location || "Unknown"}<br>
        ${new Date(point.timestamp).toLocaleString()}<br>
        Speed: ${Math.round(point.speed || 0)} km/h
      `)

      // Pan map to follow vehicle
      if (isPlaying) {
        leafletMapRef.current.panTo([point.lat, point.lng])
      }
    } else if (isPlaying || currentPointIndex > 0) {
      // Create vehicle marker if it doesn't exist
      const vehicleIcon = L.divIcon({
        className: "custom-div-icon",
        html: `<div style="background-color: #2563eb; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })

      vehicleMarkerRef.current = L.marker([point.lat, point.lng], { icon: vehicleIcon })
        .addTo(leafletMapRef.current)
        .bindPopup(`
          <b>Current Position</b><br>
          ${point.location || "Unknown"}<br>
          ${new Date(point.timestamp).toLocaleString()}<br>
          Speed: ${Math.round(point.speed || 0)} km/h
        `)
    }

    // Update polyline to show trail up to current point (only in line mode)
    if (!showPoints && leafletMapRef.current) {
      if (polylineRef.current) {
        leafletMapRef.current.removeLayer(polylineRef.current)
      }

      // Use all points up to current index for accurate path representation
      const latlngs = trailPoints.slice(0, currentPointIndex + 1).map((p) => [p.lat, p.lng])
      polylineRef.current = L.polyline(latlngs as L.LatLngExpression[], {
        color: "#2563eb",
        weight: 4,
        opacity: 0.7,
        lineCap: "round",
        lineJoin: "round",
        smoothFactor: 1.0,
      }).addTo(leafletMapRef.current)
    }

    // In points mode, highlight the current point
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

  // Custom map controls
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
    if (!leafletMapRef.current) return

    if (trailPoints.length > 0) {
      // Create bounds from all points
      const bounds = L.latLngBounds(trailPoints.map((p) => [p.lat, p.lng]) as L.LatLngExpression[])

      leafletMapRef.current.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15,
      })
    }
  }

  return (
    <div className="w-full h-full min-h-[300px] relative">
      <div ref={mapRef} className="w-full h-full z-10 absolute inset-0"></div>

      {/* Custom map controls */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 bg-white rounded-md shadow-md flex items-center justify-center hover:bg-gray-100"
          onClick={handleZoomIn}
        >
          <span className="text-xl font-bold">+</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 bg-white rounded-md shadow-md flex items-center justify-center hover:bg-gray-100"
          onClick={handleZoomOut}
        >
          <span className="text-xl font-bold">-</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 bg-white rounded-md shadow-md flex items-center justify-center hover:bg-gray-100"
          onClick={handleRecenter}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </motion.button>
      </div>
    </div>
  )
}
