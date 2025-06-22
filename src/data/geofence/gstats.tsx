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

// Helper function: Calculate distance from a point to a line segment (Haversine, returns km)
function distanceToSegment(
  lat: number,
  lng: number,
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  // Convert to radians
  const toRad = (deg: number) => deg * (Math.PI / 180)

  // Convert lat/lng to Cartesian coordinates
  const R = 6371 // Earth's radius in km
  const φ1 = toRad(lat1),
    λ1 = toRad(lng1)
  const φ2 = toRad(lat2),
    λ2 = toRad(lng2)
  const φ = toRad(lat),
    λ = toRad(lng)

  // Approximate as flat for small distances (project to 2D)
  // Use equirectangular projection for simplicity
  const x = (λ - λ1) * Math.cos((φ1 + φ2) / 2)
  const y = φ - φ1
  const x1 = 0,
    y1 = 0
  const x2 = (λ2 - λ1) * Math.cos((φ1 + φ2) / 2)
  const y2 = φ2 - φ1

  // Project point onto segment
  const dx = x2 - x1
  const dy = y2 - y1
  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)))
  const projX = x1 + t * dx
  const projY = y1 + t * dy

  // Distance from point to projection
  const dist = Math.sqrt((x - projX) ** 2 + (y - projY) ** 2)
  return R * dist
}

// Helper function: Distance from point to polygon (km)
function distanceToPolygon(lat: number, lng: number, polygon: { latitude: number; longitude: number }[]): number {
  let minDist = Infinity
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length
    const lat1 = polygon[i].latitude,
      lng1 = polygon[i].longitude
    const lat2 = polygon[j].latitude,
      lng2 = polygon[j].longitude
    const dist = distanceToSegment(lat, lng, lat1, lng1, lat2, lng2)
    if (dist < minDist) minDist = dist
  }
  return minDist
}

// Helper function: Distance from point to circle edge (km)
function distanceToCircleEdge(
  lat: number,
  lng: number,
  centerLat: number,
  centerLng: number,
  radiusMeters: number
): number {
  const radiusKm = radiusMeters / 1000;
  const distToCenter = calculateDistance(lat, lng, centerLat, centerLng);
  if (distToCenter <= radiusKm) {
    return 0;
  }
  return distToCenter - radiusKm;
}

// Function to calculate distance from vehicle to geofence center or nearest polygon edge
export function getDistanceFromGeofence(vehicle: Vehicle, geofence: Geofence | undefined): number {
  if (!geofence) return 0

  switch (geofence.geofence_type) {
    case 0: // Circle
      if (
        isPointInCircle(
          vehicle.lat,
          vehicle.lng,
          geofence.latitude,
          geofence.longitude,
          geofence.radius / 1000
        )
      ) {
        return 0;
      }
      return distanceToCircleEdge(
        vehicle.lat,
        vehicle.lng,
        geofence.latitude,
        geofence.longitude,
        geofence.radius
      );
    case 1: // Pointer
      // Pointer is a small circle (100m radius)
      if (
        isPointInCircle(
          vehicle.lat,
          vehicle.lng,
          geofence.latitude,
          geofence.longitude,
          0.1
        )
      ) {
        return 0;
      }
      return distanceToCircleEdge(
        vehicle.lat,
        vehicle.lng,
        geofence.latitude,
        geofence.longitude,
        100
      );
    case 2: // Polygon
      if (!geofence.polygon_points || geofence.polygon_points.length < 3) return 0
      if (isPointInPolygon(vehicle.lat, vehicle.lng, geofence.polygon_points)) {
        return 0
      }
      return distanceToPolygon(vehicle.lat, vehicle.lng, geofence.polygon_points)
    default:
      return 0
  }
}

// Function to convert vehicles to geofence vehicles with status
export function convertToGeofenceVehicles(vehicles: Vehicle[], selectedGeofence: Geofence | null): GeofenceVehicle[] {
  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
  return safeVehicles.map((vehicle) => {
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
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
    return response.data
  } catch (error) {
    console.error("Error fetching geofence alerts:", error)
    throw error
  }
}