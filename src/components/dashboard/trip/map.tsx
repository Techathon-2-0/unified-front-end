import { useEffect, useRef, useState } from "react"
import { Layers, Navigation, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { TripMapProps } from "../../../types/dashboard/trip"
import { renderToString } from "react-dom/server"
import { Truck } from "lucide-react"



const TripMap = ({ trips, activeTrips = [], selectedTrip, mapType, setMapType }: TripMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Initialize map
  useEffect(() => {
    // Skip if no container or map already initialized
    if (!mapContainerRef.current || mapInstanceRef.current) return

    // Default coordinates (Delhi, India)
    const defaultCenter: [number, number] = [28.6139, 77.209]

    // Create map instance with proper z-index settings
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 10,
      zoomControl: false, // We'll add custom zoom controls
      // Add z-index related options
      zoomSnap: 0.1,
      zoomDelta: 0.5,
    })

    // Add tile layer based on mapType
    const tileLayer = L.tileLayer(
      mapType === "normal"
        ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          mapType === "normal"
            ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            : "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        // Set proper z-index for tiles
        zIndex: 1,
      },
    ).addTo(map)

    // Add zoom controls to a custom position
    L.control
      .zoom({
        position: "bottomright",
      })
      .addTo(map)

    // Store references
    mapInstanceRef.current = map
    tileLayerRef.current = tileLayer

    // Set map as loaded
    setMapLoaded(true)

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        tileLayerRef.current = null
        markersRef.current = []
      }
    }
  }, [])

  // Update map type
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !tileLayerRef.current) return

    // Remove existing tile layer
    mapInstanceRef.current.removeLayer(tileLayerRef.current)

    // Add new tile layer based on mapType
    const newTileLayer = L.tileLayer(
      mapType === "normal"
        ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          mapType === "normal"
            ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            : "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        zIndex: 1,
      },
    ).addTo(mapInstanceRef.current)

    // Update reference
    tileLayerRef.current = newTileLayer
  }, [mapType, mapLoaded])

  // Update markers when trips change
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(marker)
      }
    })
    markersRef.current = []

    // Add markers for all trips
    const newMarkers = trips.map((trip) => {
      const getStatusColor = (status: string) => {
        switch (status) {
          case "Active":
            return "#22c55e" // green-500
          case "Completed":
            return "#3b82f6" // blue-500
          case "Delayed":
            return "#f59e0b" // amber-500
          case "Cancelled":
            return "#ef4444" // red-500
          default:
            return "#6b7280" // gray-500
        }
      }

      const statusColor = getStatusColor(trip.status);
      const customIcon = L.divIcon({
        className: "custom-div-icon",
        html: renderToString(
          <div
            className="marker-pin"
            style={{
              backgroundColor: statusColor,
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              border: "2px solid white",
              padding: 0,       // remove any default padding
              margin: 0,        // remove margin
              lineHeight: 1,    // control line height
            }}
          >
            <Truck size={18} strokeWidth={2} style={{ display: 'block' }} />
          </div>
        ),
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });


      // Create marker
      const marker = L.marker(trip.coordinates, { icon: customIcon })
        .addTo(mapInstanceRef.current!)
        .bindPopup(`
          <div class="popup-content">
            <h3>${trip.vehicleName}</h3>
            <p>Status: ${trip.status}</p>
            <p>Location: ${trip.location}</p>
          </div>
        `)

      return marker
    })

    markersRef.current = newMarkers

    // If a trip is selected, focus on it
    if (selectedTrip && mapInstanceRef.current) {
      mapInstanceRef.current.setView(selectedTrip.coordinates, 14)

      // Find and open the popup for the selected trip
      const selectedMarker = markersRef.current[trips.findIndex((trip) => trip.id === selectedTrip.id)]
      if (selectedMarker) {
        selectedMarker.openPopup()
      }
    } else if (trips.length > 0 && mapInstanceRef.current) {
      // If no trip is selected but we have trips, fit the map to show all markers
      if (trips.length === 1) {
        // If only one trip, center on it
        mapInstanceRef.current.setView(trips[0].coordinates, 12)
      } else {
        // Create a bounds object
        const bounds = L.latLngBounds(trips.map((trip) => trip.coordinates))

        // Fit the map to show all markers with some padding
        mapInstanceRef.current.fitBounds(bounds.pad(0.1))
      }
    }
  }, [trips, selectedTrip, mapLoaded])

  // Draw route lines for selected trip
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !selectedTrip || selectedTrip.stops.length < 2) return

    // Create an array of coordinates for the route
    const routeCoordinates = [
      selectedTrip.coordinates, // Start with the vehicle's current position
      ...selectedTrip.stops.map((_, index) => {
        // Generate some coordinates around the vehicle for demonstration
        // In a real app, you would use the actual coordinates of each stop
        const lat = selectedTrip.coordinates[0] + (index + 1) * 0.01
        const lng = selectedTrip.coordinates[1] + (index + 1) * 0.01
        return [lat, lng] as [number, number]
      }),
    ]

    // Create a polyline
    const routeLine = L.polyline(routeCoordinates, {
      color: "#3b82f6", // blue-500
      weight: 4,
      opacity: 0.7,
      dashArray: "10, 10",
      lineCap: "round",
    }).addTo(mapInstanceRef.current)

    // Add stop markers
    const stopMarkers = selectedTrip.stops.map((stop, index) => {
      // Use the coordinates we generated above
      const stopCoords = routeCoordinates[index + 1]

      // Create custom icon for stops
      const stopIcon = L.divIcon({
        className: "stop-icon",
        html: `<div class="stop-marker">
                <span>${stop.point}</span>
              </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      // Create marker
      return L.marker(stopCoords, { icon: stopIcon })
        .addTo(mapInstanceRef.current!)
        .bindPopup(`
          <div class="popup-content">
            <h3>Stop ${stop.point}</h3>
            <p>Name: ${stop.name}</p>
            <p>Status: ${stop.status}</p>
            <p>Type: ${stop.stopType}</p>
            <p>Planned: ${stop.plannedTime}</p>
          </div>
        `)
    })

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(routeLine)
        stopMarkers.forEach((marker) => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.removeLayer(marker)
          }
        })
      }
    }
  }, [selectedTrip, mapLoaded])

  return (
    <div className="relative h-full w-full">
      {/* Map container with proper z-index */}
      <div
        ref={mapContainerRef}
        className="h-full w-full bg-gray-100"
        style={{
          minHeight: "400px",
          position: "relative",
          zIndex: 1 // Set lower z-index so sidebar appears above
        }}
      >
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 2 }}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Map controls with proper z-index */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2" style={{ zIndex: 10 }}>
        <Button
          variant="secondary"
          size="sm"
          className="h-9 px-3 bg-white/90 hover:bg-white shadow-md"
          onClick={() => setMapType(mapType === "normal" ? "satellite" : "normal")}
        >
          <Layers className="h-4 w-4 mr-1.5" />
          <span>{mapType === "normal" ? "Satellite View" : "Standard Map"}</span>
        </Button>

        <Button
          variant="secondary"
          size="sm"
          className="h-9 px-3 bg-white/90 hover:bg-white shadow-md"
          onClick={() => {
            if (mapInstanceRef.current && trips.length > 0) {
              if (trips.length === 1) {
                mapInstanceRef.current.setView(trips[0].coordinates, 12)
              } else {
                const bounds = L.latLngBounds(trips.map((trip) => trip.coordinates))
                mapInstanceRef.current.fitBounds(bounds.pad(0.1))
              }
            }
          }}
        >
          <MapPin className="h-4 w-4 mr-1.5" />
          <span>Center Map</span>
        </Button>
      </div>

      {/* Map info with proper z-index */}
      <div className="absolute bottom-4 left-4 bg-white/90 rounded-md shadow-md px-3 py-2 text-sm" style={{ zIndex: 10 }}>
        {selectedTrip ? (
          <div className="flex items-center">
            <Navigation className="h-4 w-4 mr-1.5 text-blue-600" />
            <span className="font-medium">{selectedTrip.vehicleName}</span>
            <span className="mx-1">-</span>
            <span>{selectedTrip.location}</span>
          </div>
        ) : (
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1.5 text-gray-600" />
            <span>Showing all vehicles</span>
          </div>
        )}
      </div>

      {/* Legend with proper z-index */}
      <div className="absolute bottom-4 right-4 bg-white/90 rounded-md shadow-md px-3 py-2" style={{ zIndex: 10 }}>
        <div className="text-xs font-medium mb-1">Status Legend</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-green-500 mr-1.5"></div>
            <span>Active</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-blue-500 mr-1.5"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-amber-500 mr-1.5"></div>
            <span>Delayed</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-red-500 mr-1.5"></div>
            <span>Cancelled</span>
          </div>
        </div>
      </div>

      {/* CSS for custom markers */}
      <style jsx global>{`
        /* Ensure Leaflet map container has proper z-index */
        .leaflet-container {
          z-index: 1 !important;
        }
        
        /* Ensure Leaflet panes have proper z-index hierarchy */
        .leaflet-map-pane {
          z-index: 1 !important;
        }
        
        .leaflet-tile-pane {
          z-index: 1 !important;
        }
        
        .leaflet-overlay-pane {
          z-index: 2 !important;
        }
        
        .leaflet-shadow-pane {
          z-index: 3 !important;
        }
        
        .leaflet-marker-pane {
          z-index: 4 !important;
        }
        
        .leaflet-tooltip-pane {
          z-index: 5 !important;
        }
        
        .leaflet-popup-pane {
          z-index: 6 !important;
        }
        
        .leaflet-control-container {
          z-index: 7 !important;
        }
        
        .custom-div-icon {
          background: transparent;
          border: none;
          z-index: 100 !important;
        }
        
        .marker-pin {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          position: relative;
          z-index: 100;
        }
        
        .marker-pin.active {
          background-color: #22c55e; /* green-500 */
        }
        
        .marker-pin.completed {
          background-color: #3b82f6; /* blue-500 */
        }
        
        .marker-pin.delayed {
          background-color: #f59e0b; /* amber-500 */
        }
        
        .marker-pin.cancelled {
          background-color: #ef4444; /* red-500 */
        }
        
        .marker-pin.manually.closed {
          background-color: #6b7280; /* gray-500 */
        }
        
        .stop-marker {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: #f97316; /* orange-500 */
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 10px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          border: 2px solid white;
          position: relative;
          z-index: 100;
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
      `}</style>
    </div>
  )
}

export default TripMap