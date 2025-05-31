import { useEffect, useRef, useState } from "react"
import { MapIcon, Satellite } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { initialGeofenceData } from "../../../data/geofence/gconfig"
import type { GeofenceMapProps } from "../../../types/geofence/gstats"

export function GeofenceMap({ vehicles, selectedGeofence, matrixType, highlightedVehicle }: GeofenceMapProps) {
  const [mapStyle, setMapStyle] = useState<"streets" | "satellite">("streets")
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [leafletLoaded, setLeafletLoaded] = useState(false)

  const selectedGeofenceData = initialGeofenceData.find((g) => g.id === selectedGeofence)

  // Get geofence color based on type
  const getGeofenceColor = (type: string) => {
    switch (type) {
      case "circle":
        return "#3b82f6" // Blue
      case "polygon":
        return "#8b5cf6" // Purple
      case "pointer":
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
    if (leafletLoaded && mapContainerRef.current && !mapInstance && selectedGeofenceData) {
      const L = (window as any).L

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView([selectedGeofenceData.coordinates.lat, selectedGeofenceData.coordinates.lng], 13)

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
  }, [leafletLoaded, mapContainerRef, mapInstance, selectedGeofenceData, mapStyle])

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
    if (mapLoaded && mapInstance && selectedGeofenceData) {
      const { map, L } = mapInstance

      // Clear existing layers
      map.eachLayer((layer: any) => {
        if (layer.options && (layer.options.isGeofence || layer.options.isVehicle)) {
          map.removeLayer(layer)
        }
      })

      const geofenceColor = getGeofenceColor(selectedGeofenceData.type)

      // Add geofence with exact same styling as geofence config
      let geofenceLayer
      let geofenceBounds

      if (selectedGeofenceData.type === "circle") {
        geofenceLayer = L.circle([selectedGeofenceData.coordinates.lat, selectedGeofenceData.coordinates.lng], {
          radius: selectedGeofenceData.radius,
          color: geofenceColor,
          fillColor: geofenceColor,
          fillOpacity: 0.3,
          weight: 2,
          isGeofence: true,
        }).addTo(map)

        // Add center marker for circle
        L.circleMarker([selectedGeofenceData.coordinates.lat, selectedGeofenceData.coordinates.lng], {
          radius: 6,
          color: "#ffffff",
          fillColor: geofenceColor,
          fillOpacity: 1,
          weight: 2,
          isGeofence: true,
        }).addTo(map)

        geofenceBounds = geofenceLayer.getBounds()
      } else if (selectedGeofenceData.type === "polygon" && selectedGeofenceData.polygonPoints) {
        const latLngs = selectedGeofenceData.polygonPoints.map((p) => [p.lat, p.lng])
        geofenceLayer = L.polygon(latLngs, {
          color: "#7c3aed", // Purple for polygon (matching geofence config)
          fillColor: "#8b5cf6",
          fillOpacity: 0.3,
          weight: 2,
          isGeofence: true,
        }).addTo(map)

        // Add center marker for polygon
        L.circleMarker([selectedGeofenceData.coordinates.lat, selectedGeofenceData.coordinates.lng], {
          radius: 6,
          color: "#ffffff",
          fillColor: "#7c3aed",
          fillOpacity: 1,
          weight: 2,
          isGeofence: true,
        }).addTo(map)

        geofenceBounds = geofenceLayer.getBounds()
      } else if (selectedGeofenceData.type === "pointer") {
        geofenceLayer = L.circleMarker([selectedGeofenceData.coordinates.lat, selectedGeofenceData.coordinates.lng], {
          radius: 8,
          color: "#ffffff",
          fillColor: "#10b981", // Green for pointer (matching geofence config)
          fillOpacity: 1,
          weight: 2,
          isGeofence: true,
        }).addTo(map)

        // For pointer, create artificial bounds around the point
        const lat = selectedGeofenceData.coordinates.lat
        const lng = selectedGeofenceData.coordinates.lng
        const offset = 0.01 // Small offset to create visible area
        geofenceBounds = L.latLngBounds([
          [lat - offset, lng - offset],
          [lat + offset, lng + offset],
        ])
      }

      // Determine which vehicles to show based on matrix type
      const vehiclesToShow =
        matrixType === "geofence" ? vehicles.filter((v) => v.assignedGeofenceId === selectedGeofence) : vehicles

      // Add vehicles with smaller, less prominent markers
      const vehicleMarkers = []
      let highlightedVehiclePosition: [number, number] | null = null

      vehiclesToShow.forEach((vehicle, index) => {
        const isInside = vehicle.geofenceStatus === "inside"
        const isHighlighted = highlightedVehicle === vehicle.id

        if (isHighlighted) {
          highlightedVehiclePosition = [vehicle.lat, vehicle.lng]
        }

        // Create smaller, less prominent vehicle icons with highlighting
        const vehicleIcon = L.divIcon({
          html: `<div style="
        width: ${isHighlighted ? "28px" : "20px"}; 
        height: ${isHighlighted ? "28px" : "20px"}; 
        border-radius: 50%; 
        background-color: ${isInside ? "#10b981" : "#ef4444"}; 
        color: white; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        font-weight: bold; 
        font-size: ${isHighlighted ? "12px" : "10px"};
        border: ${isHighlighted ? "4px solid #3b82f6" : "2px solid white"};
        box-shadow: 0 ${isHighlighted ? "3px 6px" : "1px 3px"} rgba(0,0,0,${isHighlighted ? "0.5" : "0.3"});
        z-index: ${isHighlighted ? "2000" : "1000"};
        animation: ${isHighlighted ? "pulse 2s infinite" : "none"};
      ">${index + 1}</div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      </style>`,
          className: "",
          iconSize: [isHighlighted ? 28 : 20, isHighlighted ? 28 : 20],
          iconAnchor: [isHighlighted ? 14 : 10, isHighlighted ? 14 : 10],
        })

        const marker = L.marker([vehicle.lat, vehicle.lng], {
          icon: vehicleIcon,
          isVehicle: true,
          zIndexOffset: isHighlighted ? 2000 : 1000,
        })
          .addTo(map)
          .bindPopup(`
      <div style="min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; font-weight: bold;">${vehicle.vehicleNumber}</h3>
        <p style="margin: 2px 0;"><strong>Type:</strong> ${vehicle.type}</p>
        <p style="margin: 2px 0;"><strong>Status:</strong> 
          <span style="color: ${isInside ? "#10b981" : "#ef4444"}; font-weight: bold;">
            ${vehicle.geofenceStatus.toUpperCase()}
          </span>
        </p>
        <p style="margin: 2px 0;"><strong>Distance:</strong> ${vehicle.distanceFromGeofence.toFixed(2)} km</p>
        ${vehicle.duration ? `<p style="margin: 2px 0;"><strong>Duration:</strong> ${vehicle.duration}</p>` : ""}
        <p style="margin: 2px 0;"><strong>Speed:</strong> ${vehicle.speed} km/h</p>
        <p style="margin: 2px 0;"><strong>Driver:</strong> ${vehicle.driverName}</p>
      </div>
    `)

        // Auto-open popup for highlighted vehicle
        if (isHighlighted) {
          marker.openPopup()
        }

        vehicleMarkers.push(marker)
      })

      // Set map view to ensure both geofence and highlighted vehicle are visible
      if (highlightedVehicle && highlightedVehiclePosition) {
        // Create bounds that include both geofence and highlighted vehicle
        const combinedBounds = L.latLngBounds()

        // Add geofence bounds
        if (geofenceBounds && geofenceBounds.isValid()) {
          combinedBounds.extend(geofenceBounds)
        } else {
          // If no geofence bounds, add geofence center
          combinedBounds.extend([selectedGeofenceData.coordinates.lat, selectedGeofenceData.coordinates.lng])
        }

        // Add highlighted vehicle position
        combinedBounds.extend(highlightedVehiclePosition)

        // Fit map to show both geofence and highlighted vehicle
        map.fitBounds(combinedBounds.pad(0.2), {
          maxZoom: 15, // Don't zoom in too much
        })
      } else if (geofenceBounds && geofenceBounds.isValid()) {
        // No highlighted vehicle, just show geofence as before
        // Calculate appropriate zoom level based on geofence type and size
        let targetZoom = 13

        if (selectedGeofenceData.type === "circle") {
          // Calculate zoom based on radius
          if (selectedGeofenceData.radius <= 200) {
            targetZoom = 16
          } else if (selectedGeofenceData.radius <= 500) {
            targetZoom = 15
          } else if (selectedGeofenceData.radius <= 1000) {
            targetZoom = 14
          } else if (selectedGeofenceData.radius <= 2000) {
            targetZoom = 13
          } else {
            targetZoom = 12
          }
        } else if (selectedGeofenceData.type === "polygon") {
          // For polygons, use bounds to determine zoom
          const boundsSize = geofenceBounds.getNorthEast().distanceTo(geofenceBounds.getSouthWest())
          if (boundsSize <= 1000) {
            targetZoom = 15
          } else if (boundsSize <= 2000) {
            targetZoom = 14
          } else if (boundsSize <= 5000) {
            targetZoom = 13
          } else {
            targetZoom = 12
          }
        } else if (selectedGeofenceData.type === "pointer") {
          targetZoom = 15 // Fixed zoom for pointers
        }

        // Set the view with calculated zoom
        map.setView([selectedGeofenceData.coordinates.lat, selectedGeofenceData.coordinates.lng], targetZoom)

        // Small delay to ensure proper rendering
        setTimeout(() => {
          // Ensure the geofence is visible by fitting bounds with padding if needed
          if (selectedGeofenceData.type !== "pointer") {
            const currentBounds = map.getBounds()
            if (!currentBounds.contains(geofenceBounds)) {
              map.fitBounds(geofenceBounds.pad(0.2), {
                maxZoom: targetZoom,
              })
            }
          }
        }, 100)
      } else {
        // Fallback: center on geofence coordinates
        map.setView([selectedGeofenceData.coordinates.lat, selectedGeofenceData.coordinates.lng], 13)
      }
    }
  }, [mapLoaded, mapInstance, selectedGeofenceData, vehicles, matrixType, selectedGeofence, highlightedVehicle])

  return (
    <Card className="h-full shadow-sm">
      <CardContent className="p-0 h-full relative">
        {/* Map Controls */}
        <div className="absolute top-4 left-4 z-40">
          <ToggleGroup
            type="single"
            value={mapStyle}
            onValueChange={(value) => value && setMapStyle(value as "streets" | "satellite")}
            className="bg-white shadow-md rounded-md p-1"
          >
            <ToggleGroupItem value="streets" aria-label="Map view" className="data-[state=on]:bg-blue-100">
              <MapIcon className="h-4 w-4" />
              <span className="ml-1 text-xs hidden sm:inline">Map</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="satellite" aria-label="Satellite view" className="data-[state=on]:bg-blue-100">
              <Satellite className="h-4 w-4" />
              <span className="ml-1 text-xs hidden sm:inline">Satellite</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div ref={mapContainerRef} className="h-full w-full rounded-lg relative z-10" />
        {!leafletLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-lg z-20">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-700">Loading map...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
