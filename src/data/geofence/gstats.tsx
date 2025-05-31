import type { Vehicle } from "../../types/live/list"
import type { GeofenceVehicle } from "../../types/geofence/gstats"
import { initialGeofenceData } from "../../data/geofence/gconfig"

// Function to calculate distance between two points using Haversine formula
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLng = (lng2 - lng1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Function to check if a point is inside a circle
export function isPointInCircle(
  pointLat: number,
  pointLng: number,
  centerLat: number,
  centerLng: number,
  radiusKm: number,
): boolean {
  const distance = calculateDistance(pointLat, pointLng, centerLat, centerLng)
  return distance <= radiusKm
}

// Function to check if a point is inside a polygon using ray casting algorithm
export function isPointInPolygon(pointLat: number, pointLng: number, polygon: { lat: number; lng: number }[]): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    if (
      polygon[i].lng > pointLng !== polygon[j].lng > pointLng &&
      pointLat <
        ((polygon[j].lat - polygon[i].lat) * (pointLng - polygon[i].lng)) / (polygon[j].lng - polygon[i].lng) +
          polygon[i].lat
    ) {
      inside = !inside
    }
  }
  return inside
}

// Function to determine if a vehicle is inside a geofence
export function isVehicleInGeofence(vehicle: Vehicle, geofenceId: string): boolean {
  const geofence = initialGeofenceData.find((g) => g.id === geofenceId)
  if (!geofence) return false

  switch (geofence.type) {
    case "circle":
      return isPointInCircle(
        vehicle.lat,
        vehicle.lng,
        geofence.coordinates.lat,
        geofence.coordinates.lng,
        geofence.radius / 1000, // Convert meters to kilometers
      )
    case "polygon":
      if (!geofence.polygonPoints) return false
      return isPointInPolygon(vehicle.lat, vehicle.lng, geofence.polygonPoints)
    case "pointer":
      // For pointer type, consider a small radius around the point (e.g., 100 meters)
      return isPointInCircle(vehicle.lat, vehicle.lng, geofence.coordinates.lat, geofence.coordinates.lng, 0.1)
    default:
      return false
  }
}

// Function to calculate distance from vehicle to geofence center
export function getDistanceFromGeofence(vehicle: Vehicle, geofenceId: string): number {
  const geofence = initialGeofenceData.find((g) => g.id === geofenceId)
  if (!geofence) return 0

  return calculateDistance(vehicle.lat, vehicle.lng, geofence.coordinates.lat, geofence.coordinates.lng)
}

// Vehicle to geofence assignments (fixed associations)
const vehicleGeofenceAssignments: Record<string, string> = {
  v1: "GF001", // RJ14GP4709_MMI -> Mumbai Warehouse
  v2: "GF002", // KL71L8490_MMI -> Delhi Hub
  v3: "GF002", // KL25R4425_MMI -> Delhi Hub
  v4: "GF003", // HR38AH3469_MMI -> Bangalore Center
  v5: "GF001", // MH14KQ4940_MMI -> Mumbai Warehouse
  v6: "GF004", // TN07AC5689_MMI -> Chennai Port
  v7: "GF001", // DL1RT6694_MMI -> Mumbai Warehouse
}

// Function to get vehicle's assigned geofence
export function getVehicleAssignedGeofence(vehicleId: string): string {
  return vehicleGeofenceAssignments[vehicleId] || "GF001" // Default to Mumbai Warehouse
}

// Function to convert vehicles to geofence vehicles with status
export function convertToGeofenceVehicles(vehicles: Vehicle[], selectedGeofence: string): GeofenceVehicle[] {
  return vehicles.map((vehicle) => {
    const assignedGeofence = getVehicleAssignedGeofence(vehicle.id)
    const isCurrentlyInside = isVehicleInGeofence(vehicle, assignedGeofence)
    const distanceFromGeofence = getDistanceFromGeofence(vehicle, assignedGeofence)

    // Mock entry/exit times and duration for demonstration
    // Simulate different scenarios for the three categories
    let entryTime: string | undefined
    let exitTime: string | undefined
    let duration: string | undefined
    let category: "not_arrived" | "still_inside" | "arrived_and_left"

    if (isCurrentlyInside) {
      // Still inside
      entryTime = "07-03-2025 20:15:09"
      duration = "02:18:15"
      category = "still_inside"
    } else {
      // Outside - could be "not arrived" or "arrived and left"
      const hasBeenInside = Math.random() > 0.4 // 60% chance they've been inside
      if (hasBeenInside) {
        // Arrived and left
        entryTime = "07-03-2025 18:30:15"
        exitTime = "07-03-2025 22:45:30"
        duration = "04:15:15"
        category = "arrived_and_left"
      } else {
        // Not arrived
        category = "not_arrived"
      }
    }

    return {
      ...vehicle,
      geofenceStatus: isCurrentlyInside ? "inside" : "outside",
      assignedGeofenceId: assignedGeofence,
      entryTime,
      exitTime,
      duration,
      distanceFromGeofence,
      category,
    }
  })
}

// Function to filter vehicles by their assigned geofence for geofence matrix
export function filterVehiclesByGeofence(vehicles: GeofenceVehicle[], geofenceId: string): GeofenceVehicle[] {
  // For geofence matrix, show only vehicles assigned to this geofence
  return vehicles.filter((vehicle) => vehicle.assignedGeofenceId === geofenceId)
}
