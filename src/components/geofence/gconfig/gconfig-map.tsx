import { useEffect, useRef, useState } from "react"
import { Satellite, MapIcon, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { GeofenceMapProps } from "../../../types/geofence/gconfig_type"
import { fetchRolesByUserId } from "@/data/usermanage/responsibility"
import { useAuth } from "@/context/AuthContext"

export default function GeofenceMap({
  geofences,
  selectedGeofence,
  editingGeofence,
  searchHighlight,
  onSelectGeofence,
  onEditGeofence,
  onUpdateGeofence,
}: GeofenceMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [mapStyle, setMapStyle] = useState<"streets" | "satellite">("streets")
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  // const [geofenceLayers, setGeofenceLayers] = useState<Record<string, any>>({})
  const [tempLayer, setTempLayer] = useState<any>(null)
  const [drawingMode, setDrawingMode] = useState(false)
  const [polygonMarkers, setPolygonMarkers] = useState<any[]>([])
  const { user } = useAuth()
  const [geofenceConfigAccess, setGeofenceConfigAccess] = useState<number | null>(null)


  useEffect(() => {
    const fetchAccess = async () => {
      if (user && user.id) {
        try {
          const roles = await fetchRolesByUserId(user.id)
          if (roles && roles.length > 0) {
            const tabsAccess = roles[0].tabs_access
            const geofenceTab = tabsAccess.find((tab: any) => tab.hasOwnProperty("geofence_config"))
            setGeofenceConfigAccess(geofenceTab ? geofenceTab.geofence_config : null)
          }
        } catch {
          setGeofenceConfigAccess(null)
        }
      }
    }
    fetchAccess()
  }, [user])

  // Load Leaflet scripts
  useEffect(() => {
    if (!leafletLoaded && typeof window !== "undefined") {
      // Load Leaflet CSS
      const linkCSS = document.createElement("link")
      linkCSS.rel = "stylesheet"
      linkCSS.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      linkCSS.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
      linkCSS.crossOrigin = ""
      document.head.appendChild(linkCSS)

      // Load Leaflet JS
      const script = document.createElement("script")
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
      script.crossOrigin = ""
      script.async = true
      script.onload = () => {
        setLeafletLoaded(true)
      }
      document.head.appendChild(script)
    }
  }, [leafletLoaded])

  // Initialize map once Leaflet is loaded
  useEffect(() => {
    if (leafletLoaded && mapContainerRef.current && !mapInstance) {
      const L = (window as any).L

      // Create map instance with lower z-index for panes
      const map = L.map(mapContainerRef.current, {
        zoomControl: false, // We'll add this separately with higher z-index
      }).setView([19.076, 72.8777], 12)

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

      // Create layer groups for geofences
      const geofenceLayerGroup = L.layerGroup().addTo(map)
      const tempLayerGroup = L.layerGroup().addTo(map)
      const polygonEditLayerGroup = L.layerGroup().addTo(map)

      // Store map and layers in state
      setMapInstance({
        map,
        streetLayer,
        satelliteLayer,
        geofenceLayerGroup,
        tempLayerGroup,
        polygonEditLayerGroup,
        L,
      })

      setMapLoaded(true)

      // Force all map panes to have lower z-index
      Object.values(map.getPanes()).forEach((pane: any) => {
        if (pane.style) {
          pane.style.zIndex = "1"
        }
      })

      // Add click handler for adding polygon points
      map.on("click", (e: any) => {
        if (drawingMode && editingGeofence && editingGeofence.type === "polygon") {
          addPolygonPoint(e.latlng)
        }
      })
    }
  }, [leafletLoaded, mapContainerRef, mapInstance, mapStyle, drawingMode, editingGeofence])

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

  // Update geofences on map
  useEffect(() => {
    if (mapLoaded && mapInstance) {
      // Clear existing geofence layers
      mapInstance.geofenceLayerGroup.clearLayers()

      // Create new layers object
      const newGeofenceLayers: Record<string, any> = {}

      // Add geofences to map
      geofences.forEach((geofence) => {
        const isSelected = geofence.id === selectedGeofence
        const isHighlighted = geofence.id === searchHighlight
        const L = mapInstance.L
        let layer

        if (geofence.type === "circle") {
          // Create circle geofence
          layer = L.circle([geofence.coordinates.lat, geofence.coordinates.lng], {
            radius: geofence.radius,
            color: isHighlighted ? "#ef4444" : isSelected ? "#2563eb" : "#60a5fa",
            fillColor: isHighlighted ? "#f87171" : isSelected ? "#3b82f6" : "#93c5fd",
            fillOpacity: isHighlighted ? 0.5 : isSelected ? 0.3 : 0.2,
            weight: isHighlighted ? 3 : isSelected ? 2 : 1,
            // Add pulsing effect for highlighted geofences
            className: isHighlighted ? "pulse-highlight" : "",
          }).addTo(mapInstance.geofenceLayerGroup)

          // Add a marker at the center
          const centerMarker = L.circleMarker([geofence.coordinates.lat, geofence.coordinates.lng], {
            radius: 6,
            color: "#ffffff",
            fillColor: isHighlighted ? "#ef4444" : isSelected ? "#2563eb" : "#60a5fa",
            fillOpacity: 1,
            weight: 2,
          }).addTo(mapInstance.geofenceLayerGroup)

          // Add popup with geofence info
          const circleColor = isHighlighted ? "#ef4444" : isSelected ? "#2563eb" : "#60a5fa"
          layer.bindPopup(`
            <div class="overflow-hidden rounded-lg" style="min-width: 220px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
              <div style="background-color: ${circleColor}; padding: 10px 12px; color: white; display: flex; justify-content: space-between; align-items: center;">
                <div style="font-weight: bold; font-size: 14px;">${geofence.geofence_name}</div>
                <div style="display: flex; align-items: center; font-size: 12px; background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 12px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
                  <span style="margin-left: 4px;">Circle</span>
                </div>
              </div>
              <div style="padding: 12px; background-color: white;">
                <div style="margin-bottom: 8px; display: flex; align-items: center;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span style="margin-left: 6px; color: #4b5563; font-size: 13px;">${geofence.location_id || "No location specified"}</span>
                </div>
                <div style="display: flex; align-items: center; background-color: #eff6ff; padding: 8px; border-radius: 6px; margin-bottom: 10px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                  <div style="margin-left: 6px; color: #3b82f6; font-weight: 500; font-size: 13px;">Radius: ${geofence.radius}m</div>
                </div>
                ${geofenceConfigAccess !== 1 ? `
  <button style="width: 100%; padding: 8px 0; background-color: ${circleColor}; color: white; border: none; border-radius: 6px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center;" 
    onclick="document.dispatchEvent(new CustomEvent('editGeofence', {detail: ${geofence.id}}))">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style="margin-right: 6px;"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
    Edit Geofence
  </button>` : ''}
              </div>
            </div>
          `)

          // Store both layers
          newGeofenceLayers[geofence.id] = {
            main: layer,
            center: centerMarker,
          }
        } else if (geofence.type === "polygon") {
          // Use custom polygon points if available, otherwise generate them
          let latLngs
          if (geofence.polygonPoints && geofence.polygonPoints.length > 0) {
            latLngs = geofence.polygonPoints.map((point) => [point.lat, point.lng])
          } else {
            // Generate polygon points
            const points = generatePolygonPoints(geofence.coordinates, 6, 0.01)
            latLngs = points.map((point) => [point.lat, point.lng])
          }

          // Create polygon geofence
          layer = L.polygon(latLngs, {
            color: isHighlighted ? "#9333ea" : isSelected ? "#7c3aed" : "#a78bfa",
            fillColor: isHighlighted ? "#a855f7" : isSelected ? "#8b5cf6" : "#c4b5fd",
            fillOpacity: isHighlighted ? 0.5 : isSelected ? 0.3 : 0.2,
            weight: isHighlighted ? 3 : isSelected ? 2 : 1,
            className: isHighlighted ? "pulse-highlight" : "",
          }).addTo(mapInstance.geofenceLayerGroup)

          // Add a marker at the center
          const centerMarker = L.circleMarker([geofence.coordinates.lat, geofence.coordinates.lng], {
            radius: 6,
            color: "#ffffff",
            fillColor: isHighlighted ? "#9333ea" : isSelected ? "#7c3aed" : "#a78bfa",
            fillOpacity: 1,
            weight: 2,
          }).addTo(mapInstance.geofenceLayerGroup)

          // Add popup with geofence info
          const polygonColor = isHighlighted ? "#9333ea" : isSelected ? "#7c3aed" : "#a78bfa"
          layer.bindPopup(`
            <div class="overflow-hidden rounded-lg" style="min-width: 220px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
              <div style="background-color: ${polygonColor}; padding: 10px 12px; color: white; display: flex; justify-content: space-between; align-items: center;">
                <div style="font-weight: bold; font-size: 14px;">${geofence.geofence_name}</div>
                <div style="display: flex; align-items: center; font-size: 12px; background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 12px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
                  <span style="margin-left: 4px;">Polygon</span>
                </div>
              </div>
              <div style="padding: 12px; background-color: white;">
                <div style="margin-bottom: 8px; display: flex; align-items: center;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span style="margin-left: 6px; color: #4b5563; font-size: 13px;">${geofence.location_id || "No location specified"}</span>
                </div>
                <div style="display: flex; align-items: center; background-color: #f5f3ff; padding: 8px; border-radius: 6px; margin-bottom: 10px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/></svg>
                  <div style="margin-left: 6px; color: #7c3aed; font-weight: 500; font-size: 13px;">
                    ${geofence.polygonPoints ? geofence.polygonPoints.length : 0} Points
                  </div>
                </div>
                 ${geofenceConfigAccess !== 1 ?`
                <button style="width: 100%; padding: 8px 0; background-color: ${polygonColor}; color: white; border: none; border-radius: 6px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center;" 
                  onclick="document.dispatchEvent(new CustomEvent('editGeofence', {detail: ${geofence.id}}))">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style="margin-right: 6px;"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  Edit Geofence
                </button>`
                : ''}
              </div>
            </div>
          `)

          // Store both layers
          newGeofenceLayers[geofence.id] = {
            main: layer,
            center: centerMarker,
          }
        } else if (geofence.type === "pointer") {
          // Create pointer geofence
          layer = L.circleMarker([geofence.coordinates.lat, geofence.coordinates.lng], {
            radius: 8,
            color: "#ffffff",
            fillColor: isHighlighted ? "#059669" : isSelected ? "#10b981" : "#34d399",
            fillOpacity: 1,
            weight: 2,
          }).addTo(mapInstance.geofenceLayerGroup)

          // Add popup with geofence info
          const pointerColor = isHighlighted ? "#059669" : isSelected ? "#10b981" : "#34d399"
          layer.bindPopup(`
            <div class="overflow-hidden rounded-lg" style="min-width: 220px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
              <div style="background-color: ${pointerColor}; padding: 10px 12px; color: white; display: flex; justify-content: space-between; align-items: center;">
                <div style="font-weight: bold; font-size: 14px;">${geofence.geofence_name}</div>
                <div style="display: flex; align-items: center; font-size: 12px; background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 12px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span style="margin-left: 4px;">Pointer</span>
                </div>
              </div>
              <div style="padding: 12px; background-color: white;">
                <div style="margin-bottom: 8px; display: flex; align-items: center;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span style="margin-left: 6px; color: #4b5563; font-size: 13px;">${geofence.location_id || "No location specified"}</span>
                </div>
                <div style="display: flex; align-items: center; background-color: #ecfdf5; padding: 8px; border-radius: 6px; margin-bottom: 10px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  <div style="margin-left: 6px; color: #10b981; font-weight: 500; font-size: 13px;">
                    Exact Location
                  </div>
                </div>
                 ${geofenceConfigAccess !== 1 ?`
                <button style="width: 100%; padding: 8px 0; background-color: ${pointerColor}; color: white; border: none; border-radius: 6px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center;" 
                  onclick="document.dispatchEvent(new CustomEvent('editGeofence', {detail: ${geofence.id}}))">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style="margin-right: 6px;"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  Edit Geofence
                </button>` : ''}
              </div>
            </div>
          `)

          // Store layer
          newGeofenceLayers[geofence.id] = {
            main: layer,
            center: null,
          }
        }

        // Add click event to select geofence
        if (layer) {
          layer.on("click", () => {
            onSelectGeofence(geofence.id)
          })
        }
      })

      // Update geofence layers state
      // setGeofenceLayers(newGeofenceLayers)

      // If a geofence is selected or highlighted, center the map on it
      if (searchHighlight) {
        const geofence = geofences.find((g) => g.id === searchHighlight)
        if (geofence) {
          mapInstance.map.setView([geofence.coordinates.lat, geofence.coordinates.lng], 15)

          // Open popup for highlighted geofence after a short delay
          setTimeout(() => {
            const layerInfo = newGeofenceLayers[geofence.id]
            if (layerInfo && layerInfo.main && layerInfo.main.openPopup) {
              layerInfo.main.openPopup()
            }
          }, 500)
        }
      } else if (selectedGeofence) {
        const geofence = geofences.find((g) => g.id === selectedGeofence)
        if (geofence) {
          mapInstance.map.setView([geofence.coordinates.lat, geofence.coordinates.lng], 15)
        }
      } else if (geofences.length > 0) {
        // If no specific geofence is selected/highlighted, fit all geofences in view
        const group = new mapInstance.L.featureGroup(Object.values(newGeofenceLayers).map((layer) => layer.main))
        if (group.getLayers().length > 0) {
          mapInstance.map.fitBounds(group.getBounds().pad(0.1))
        }
      }
    }
  }, [mapLoaded, mapInstance, geofences, selectedGeofence, searchHighlight, onSelectGeofence])

  // Update temporary editing geofence
  useEffect(() => {
    if (mapLoaded && mapInstance && editingGeofence) {
      // Clear existing temp layer
      mapInstance.tempLayerGroup.clearLayers()
      mapInstance.polygonEditLayerGroup.clearLayers()
      setPolygonMarkers([])

      const L = mapInstance.L
      let newTempLayer

      if (editingGeofence.type === "circle") {
        // Create circle geofence
        newTempLayer = L.circle([editingGeofence.coordinates.lat, editingGeofence.coordinates.lng], {
          radius: editingGeofence.radius,
          color: "#f97316", // Orange for editing
          fillColor: "#fb923c",
          fillOpacity: 0.4,
          weight: 2,
          dashArray: "5, 5",
        }).addTo(mapInstance.tempLayerGroup)

        // Add center marker
        L.circleMarker([editingGeofence.coordinates.lat, editingGeofence.coordinates.lng], {
          radius: 6,
          color: "#ffffff",
          fillColor: "#f97316",
          fillOpacity: 1,
          weight: 2,
        }).addTo(mapInstance.tempLayerGroup)
      } else if (editingGeofence.type === "polygon") {
        // Use existing polygon points or generate new ones
        let points: { lat: number; lng: number }[] = []

        if (editingGeofence.polygonPoints && editingGeofence.polygonPoints.length > 0) {
          points = [...editingGeofence.polygonPoints]
        } else {
          // Generate default polygon points
          const generatedPoints = generatePolygonPoints(editingGeofence.coordinates, 4, 0.01)
          points = generatedPoints.map((point) => ({ lat: point.lat, lng: point.lng }))
        }

        // Create polygon geofence
        const latLngs = points.map((point) => [point.lat, point.lng])

        newTempLayer = L.polygon(latLngs, {
          color: "#f97316", // Orange for editing
          fillColor: "#fb923c",
          fillOpacity: 0.4,
          weight: 2,
          dashArray: "5, 5",
        }).addTo(mapInstance.tempLayerGroup)

        // Add a prominent center marker
        const centerMarker = L.circleMarker([editingGeofence.coordinates.lat, editingGeofence.coordinates.lng], {
          radius: 8,
          color: "#ffffff",
          fillColor: "#f97316",
          fillOpacity: 1,
          weight: 2,
        }).addTo(mapInstance.tempLayerGroup)

        // Add a label to the center marker
        centerMarker.bindTooltip("Center Point", {
          permanent: true,
          direction: "top",
          className: "bg-white px-2 py-1 rounded text-xs shadow-md",
        })

        // Add draggable markers for each polygon point (excluding the center)
        const cornerPoints = points.filter(
          (p) => p.lat !== editingGeofence.coordinates.lat || p.lng !== editingGeofence.coordinates.lng,
        )

        const newPolygonMarkers = cornerPoints.map((point, index) => {
          const marker = L.marker([point.lat, point.lng], {
            draggable: true,
            autoPan: true,
            autoPanSpeed: 10,
            autoPanPadding: [50, 50],
            icon: L.divIcon({
              html: `<div class="w-6 h-6 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold cursor-move" 
                       style="box-shadow: 0 0 0 2px rgba(255,255,255,0.5), 0 0 5px rgba(0,0,0,0.3);">
            ${index + 1}
          </div>`,
              className: "cursor-move",
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            }),
          }).addTo(mapInstance.polygonEditLayerGroup)

          // Add tooltip to indicate draggability
          marker.bindTooltip("Drag to move", {
            direction: "top",
            offset: [0, -10],
            opacity: 0.8,
          })

          // Add event listeners for dragging with improved responsiveness
          marker.on("dragstart", () => {
            if (mapInstance.map._container) {
              mapInstance.map._container.style.cursor = "grabbing"
            }
          })

          marker.on("drag", () => {
            // Find the actual index in the full points array
            const actualIndex = points.findIndex((p) => p.lat === point.lat && p.lng === point.lng)
            if (actualIndex !== -1) {
              updatePolygonPoint(actualIndex, marker.getLatLng())
            }
          })

          marker.on("dragend", () => {
            if (mapInstance.map._container) {
              mapInstance.map._container.style.cursor = ""
            }

            // Find the actual index in the full points array
            const actualIndex = points.findIndex((p) => p.lat === point.lat && p.lng === point.lng)
            if (actualIndex !== -1) {
              updatePolygonPoint(actualIndex, marker.getLatLng())
            }
          })

          // Add delete button with proper index handling
          marker.bindPopup(`
    <button class="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600" 
      onclick="window.removeMapPolygonPoint(${points.findIndex((p) => p.lat === point.lat && p.lng === point.lng)})">
      Remove Point ${index + 1}
    </button>
  `)

          return marker
        })

        setPolygonMarkers(newPolygonMarkers)
      } else if (editingGeofence.type === "pointer") {
        // Create pointer geofence
        newTempLayer = L.circleMarker([editingGeofence.coordinates.lat, editingGeofence.coordinates.lng], {
          radius: 8,
          color: "#ffffff",
          fillColor: "#f97316", // Orange for editing
          fillOpacity: 1,
          weight: 2,
        }).addTo(mapInstance.tempLayerGroup)
      }

      setTempLayer(newTempLayer)

      // Center map on the editing geofence
      mapInstance.map.setView([editingGeofence.coordinates.lat, editingGeofence.coordinates.lng], 14)
    } else if (mapLoaded && mapInstance && !editingGeofence) {
      // Clear temp layer when not editing
      mapInstance.tempLayerGroup.clearLayers()
      mapInstance.polygonEditLayerGroup.clearLayers()
      setTempLayer(null)
      setPolygonMarkers([])
      setDrawingMode(false)
    }
  }, [mapLoaded, mapInstance, editingGeofence])

  // Listen for edit geofence events from popups
  useEffect(() => {
    // Set up global function for removing points in map
    ; (window as any).removeMapPolygonPoint = (index: number) => {
      removePolygonPoint(index)
    }

    const handleEditGeofence = (e: any) => {
      onEditGeofence(Number.parseInt(e.detail))
    }

    const handleDeletePolygonPoint = (e: any) => {
      removePolygonPoint(e.detail)
    }

    document.addEventListener("editGeofence", handleEditGeofence)
    document.addEventListener("deletePolygonPoint", handleDeletePolygonPoint)

    return () => {
      document.removeEventListener("editGeofence", handleEditGeofence)
      document.removeEventListener("deletePolygonPoint", handleDeletePolygonPoint)
      // Clean up global function
      delete (window as any).removeMapPolygonPoint
    }
  }, [onEditGeofence, editingGeofence])

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

  // Add this function to create a polygon from a central point and corner points
  const createPolygonFromCenterAndCorners = (
    center: { lat: number; lng: number },
    cornerPoints: { lat: number; lng: number }[],
  ) => {
    if (cornerPoints.length === 0) {
      // If no corner points, create a default polygon
      return generatePolygonPoints(center, 4, 0.01)
    }

    // Sort corner points by angle from center
    const sortedPoints = [...cornerPoints].sort((a, b) => {
      const angleA = Math.atan2(a.lat - center.lat, a.lng - center.lng)
      const angleB = Math.atan2(b.lat - center.lat, b.lng - center.lng)
      return angleA - angleB
    })

    return sortedPoints
  }

  // Update the addPolygonPoint function to connect points properly
  const addPolygonPoint = (latlng: any) => {
    if (!editingGeofence || editingGeofence.type !== "polygon" || !mapInstance || !onUpdateGeofence) return

    const L = mapInstance.L
    const newPoint = { lat: latlng.lat, lng: latlng.lng }

    // Get current polygon points
    let points: { lat: number; lng: number }[] = []
    if (editingGeofence.polygonPoints && editingGeofence.polygonPoints.length > 0) {
      // Add the new point to existing points
      points = [...editingGeofence.polygonPoints, newPoint]
    } else {
      // If no points exist, create a point at the center and add the new point
      points = [{ lat: editingGeofence.coordinates.lat, lng: editingGeofence.coordinates.lng }, newPoint]
    }

    // Create a new marker for the point
    const marker = L.marker([newPoint.lat, newPoint.lng], {
      draggable: true,
      icon: L.divIcon({
        html: `<div class="w-4 h-4 rounded-full bg-orange-500 border-2 border-white"></div>`,
        className: "",
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      }),
    }).addTo(mapInstance.polygonEditLayerGroup)

    // Add event listener for dragging
    const index = points.length - 1
    marker.on("drag dragend", () => {
      updatePolygonPoint(index, marker.getLatLng())
    })

    // Add delete button
    marker.bindPopup(`
      <button class="px-2 py-1 bg-red-500 text-white text-xs rounded " 
        onclick="document.dispatchEvent(new CustomEvent('deletePolygonPoint', {detail: ${index}}))">
        Remove Point
      </button>
    `)

    // Update polygon markers
    setPolygonMarkers([...polygonMarkers, marker])

    // Update the polygon on the map
    if (tempLayer) {
      mapInstance.tempLayerGroup.removeLayer(tempLayer)
    }

    // Create a polygon connecting all points including the center
    const sortedPoints = createPolygonFromCenterAndCorners(
      editingGeofence.coordinates,
      points.filter((p) => p.lat !== editingGeofence.coordinates.lat || p.lng !== editingGeofence.coordinates.lng),
    )

    const latLngs = sortedPoints.map((point) => [point.lat, point.lng])
    const newPolygon = L.polygon(latLngs, {
      color: "#f97316",
      fillColor: "#fb923c",
      fillOpacity: 0.4,
      weight: 2,
      dashArray: "5, 5",
    }).addTo(mapInstance.tempLayerGroup)

    setTempLayer(newPolygon)

    // Update the editing geofence
    const updatedGeofence = {
      ...editingGeofence,
      polygonPoints: sortedPoints,
    }

    onUpdateGeofence(updatedGeofence)
  }

  // Update the updatePolygonPoint function to maintain the center-based polygon
  const updatePolygonPoint = (index: number, latlng: any) => {
    if (!editingGeofence || editingGeofence.type !== "polygon" || !mapInstance || !onUpdateGeofence) return

    // Get current polygon points
    let points: { lat: number; lng: number }[] = []
    if (editingGeofence.polygonPoints && editingGeofence.polygonPoints.length > 0) {
      points = [...editingGeofence.polygonPoints]
    } else {
      // Generate default polygon points if none exist
      const generatedPoints = generatePolygonPoints(editingGeofence.coordinates, 4, 0.01)
      points = generatedPoints.map((point) => ({ lat: point.lat, lng: point.lng }))
    }

    // Update the point at the given index with exact coordinates
    if (index >= 0 && index < points.length) {
      points[index] = {
        lat: latlng.lat,
        lng: latlng.lng,
      }
    }

    // Update the polygon on the map with immediate visual feedback
    if (tempLayer) {
      mapInstance.tempLayerGroup.removeLayer(tempLayer)
    }

    // Create a polygon connecting all points
    const latLngs = points.map((point) => [point.lat, point.lng])
    const newPolygon = mapInstance.L.polygon(latLngs, {
      color: "#f97316",
      fillColor: "#fb923c",
      fillOpacity: 0.4,
      weight: 2,
      dashArray: "5, 5",
    }).addTo(mapInstance.tempLayerGroup)

    // Force redraw for smoother appearance
    newPolygon.redraw()

    setTempLayer(newPolygon)

    // Update the editing geofence with exact coordinates
    const updatedGeofence = {
      ...editingGeofence,
      polygonPoints: points,
    }

    onUpdateGeofence(updatedGeofence)
  }

  // Remove a polygon point
  const removePolygonPoint = (index: number) => {
    if (!editingGeofence || editingGeofence.type !== "polygon" || !mapInstance || !onUpdateGeofence) return
    if (!editingGeofence.polygonPoints || editingGeofence.polygonPoints.length <= 3) {
      // Don't allow removing if we have 3 or fewer points (minimum for a polygon)
      alert("A polygon must have at least 3 points")
      return
    }

    // Get current polygon points
    const points = [...editingGeofence.polygonPoints]

    // Remove the point at the given index
    if (index >= 0 && index < points.length) {
      points.splice(index, 1)
    }

    // Clear all existing markers
    mapInstance.polygonEditLayerGroup.clearLayers()

    // Recreate all markers with updated indices
    const newPolygonMarkers = points.map((point, idx) => {
      const marker = mapInstance.L.marker([point.lat, point.lng], {
        draggable: true,
        autoPan: true,
        autoPanSpeed: 10,
        autoPanPadding: [50, 50],
        icon: mapInstance.L.divIcon({
          html: `<div class="w-6 h-6 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold cursor-move" 
                 style="box-shadow: 0 0 0 2px rgba(255,255,255,0.5), 0 0 5px rgba(0,0,0,0.3);">
              ${idx + 1}
            </div>`,
          className: "cursor-move",
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      }).addTo(mapInstance.polygonEditLayerGroup)

      // Add tooltip to indicate draggability
      marker.bindTooltip("Drag to move", {
        direction: "top",
        offset: [0, -10],
        opacity: 0.8,
      })

      // Add event listeners for dragging with improved responsiveness
      marker.on("dragstart", () => {
        if (mapInstance.map._container) {
          mapInstance.map._container.style.cursor = "grabbing"
        }
      })

      marker.on("drag", () => {
        updatePolygonPoint(idx, marker.getLatLng())
      })

      marker.on("dragend", () => {
        if (mapInstance.map._container) {
          mapInstance.map._container.style.cursor = ""
        }
        updatePolygonPoint(idx, marker.getLatLng())
      })

      // Add delete button with proper index
      marker.bindPopup(`
      <button class="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600" 
        onclick="window.removeMapPolygonPoint(${idx})">
        Remove Point ${idx + 1}
      </button>
    `)

      return marker
    })

    setPolygonMarkers(newPolygonMarkers)

    // Update the polygon on the map
    if (tempLayer) {
      mapInstance.tempLayerGroup.removeLayer(tempLayer)
    }

    const latLngs = points.map((point) => [point.lat, point.lng])
    const newPolygon = mapInstance.L.polygon(latLngs, {
      color: "#f97316",
      fillColor: "#fb923c",
      fillOpacity: 0.4,
      weight: 2,
      dashArray: "5, 5",
    }).addTo(mapInstance.tempLayerGroup)

    setTempLayer(newPolygon)

    // Update the editing geofence
    const updatedGeofence = {
      ...editingGeofence,
      polygonPoints: points,
    }

    onUpdateGeofence(updatedGeofence)
  }

  // Toggle drawing mode
  const toggleDrawingMode = () => {
    setDrawingMode(!drawingMode)
  }

  return (
    <div className="h-full relative">
      {/* Map container */}
      <div ref={mapContainerRef} className="h-[98%] z-5 m-4 rounded-lg" />

      {/* Map controls */}
      <div className="absolute top-4 right-4 z-10">
        <ToggleGroup
          type="single"
          value={mapStyle}
          onValueChange={(value) => value && setMapStyle(value as "streets" | "satellite")}
          className="bg-white dark:bg-gray-800 shadow-md rounded-md p-1 mx-4"
        >
          <ToggleGroupItem value="streets" aria-label="Map view" className="data-[state=on]:bg-red-100 dark:data-[state=on]:bg-red-900 dark:text-white">
            <MapIcon className="h-4 w-4" />
            <span className="ml-1 text-xs hidden sm:inline">Map</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="satellite" aria-label="Satellite view" className="data-[state=on]:bg-red-100 dark:data-[state=on]:bg-red-900 dark:text-white">
            <Satellite className="h-4 w-4" />
            <span className="ml-1 text-xs hidden sm:inline">Satellite</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Polygon drawing mode button */}
      {editingGeofence && editingGeofence.type === "polygon" && (
        <div className="absolute top-4 left-40 z-50">
          <Button
            onClick={toggleDrawingMode}
            variant={drawingMode ? "default" : "outline"}
            className="flex items-center gap-2 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
          >
            {drawingMode ? "Exit Drawing Mode" : "Add Polygon Points"}
          </Button>
          {drawingMode && (
            <div className="mt-2 bg-white dark:bg-gray-800 p-2 rounded-md shadow-md text-xs dark:text-gray-300">
              Click on the map to add points to the polygon
            </div>
          )}
        </div>
      )}

      {/* Edit button for selected geofence */}
      {selectedGeofence && !editingGeofence && geofenceConfigAccess !== 1 && (
        <div className="absolute top-20 right-4 z-10 mx-4">
          <Button onClick={() => onEditGeofence(selectedGeofence)} className="flex items-center gap-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white">
            <Edit className="h-4 w-4" />
            Edit Geofence
          </Button>
        </div>
      )}

      {/* Loading indicator */}
      {!leafletLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-80 dark:bg-opacity-80 z-50">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-t-red-500 border-red-200 dark:border-red-400 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-700 dark:text-gray-300">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  )
}
