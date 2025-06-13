import axios from "axios"
import type { Vehicle } from "../../types/live/list_type"
import type { GeofenceVehicle, Geofence, AlertResponse } from "../../types/geofence/gstats_type"

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
export function isPointInPolygon(
  pointLat: number,
  pointLng: number,
  polygon: { latitude: number; longitude: number }[],
): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].longitude
    const yi = polygon[i].latitude
    const xj = polygon[j].longitude
    const yj = polygon[j].latitude

    const intersect = yi > pointLat !== yj > pointLat && pointLng < ((xj - xi) * (pointLat - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

// Function to determine if a vehicle is inside a geofence
export function isVehicleInGeofence(vehicle: Vehicle, geofence: Geofence | undefined): boolean {
  if (!geofence) return false

  switch (geofence.geofence_type) {
    case 0: // Circle
      return isPointInCircle(
        vehicle.lat,
        vehicle.lng,
        geofence.latitude,
        geofence.longitude,
        geofence.radius / 1000, // Convert meters to kilometers
      )
    case 2: // Polygon
      if (!geofence.polygon_points || geofence.polygon_points.length < 3) return false
      return isPointInPolygon(vehicle.lat, vehicle.lng, geofence.polygon_points)
    case 1: // Pointer
      // For pointer type, consider a small radius around the point (e.g., 100 meters)
      return isPointInCircle(vehicle.lat, vehicle.lng, geofence.latitude, geofence.longitude, 0.1)
    default:
      return false
  }
}

// Function to calculate distance from vehicle to geofence center
export function getDistanceFromGeofence(vehicle: Vehicle, geofence: Geofence | undefined): number {
  if (!geofence) return 0

  return calculateDistance(vehicle.lat, vehicle.lng, geofence.latitude, geofence.longitude)
}

// Function to convert vehicles to geofence vehicles with status
export function convertToGeofenceVehicles(vehicles: Vehicle[], selectedGeofence: Geofence | null): GeofenceVehicle[] {
  return vehicles.map((vehicle) => {
    const isCurrentlyInside = selectedGeofence ? isVehicleInGeofence(vehicle, selectedGeofence) : false
    const distanceFromGeofence = selectedGeofence ? getDistanceFromGeofence(vehicle, selectedGeofence) : 0

    return {
      ...vehicle,
      geofenceStatus: isCurrentlyInside ? "inside" : "outside",
      assignedGeofenceId: selectedGeofence ? selectedGeofence.id.toString() : "",
      distanceFromGeofence,
    }
  })
}

// Function to filter vehicles by their assigned geofence for geofence matrix
export function filterVehiclesByGeofence(vehicles: GeofenceVehicle[], geofenceId: string | null): GeofenceVehicle[] {
  if (!geofenceId) return vehicles
  // For geofence matrix, show all vehicles but highlight their status relative to this geofence
  return vehicles
}

// Function to fetch geofence alerts for a specific vehicle
export async function fetchGeofenceAlerts(geofenceId: string, vehicleNumber: string): Promise<AlertResponse> {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/alerts/geofenece/${geofenceId}/vehicle/${vehicleNumber}`,
    )
    return response.data
  } catch (error) {
    console.error("Error fetching geofence alerts:", error)
    throw error
  }
}