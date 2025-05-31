import type { Vehicle } from "../live/list"

export interface GeofenceStatsProps {
  vehicles: Vehicle[]
  selectedGeofence: string
  onGeofenceChange: (geofenceId: string) => void
}

export interface GeofenceVehicle extends Vehicle {
  geofenceStatus: "inside" | "outside"
  assignedGeofenceId: string
  entryTime?: string
  exitTime?: string
  duration?: string
  distanceFromGeofence: number
  category: "not_arrived" | "still_inside" | "arrived_and_left"
}

export interface GeofenceMatrixProps {
  vehicles: GeofenceVehicle[]
  selectedGeofence: string
  matrixType: "geofence" | "distance"
  onVehicleClick: (vehicleId: string) => void
  highlightedVehicle: string | null
  onFilteredCountChange: (count: number) => void
}

export interface GeofenceMapProps {
  vehicles: GeofenceVehicle[]
  selectedGeofence: string
  matrixType: "geofence" | "distance"
  highlightedVehicle: string | null
}

export interface GeofenceHeaderProps {
  totalCount: number
  onRefresh: () => void
  onExport: (format: "csv" | "pdf") => void
  matrixType: "geofence" | "distance"
  onMatrixTypeChange: (type: "geofence" | "distance") => void
}

export interface GeofenceSelectorProps {
  selectedGeofence: string
  onGeofenceChange: (geofenceId: string) => void
}

export type SortField = "vehicleNumber" | "type" | "status" | "distanceFromGeofence" | "gpsTime" | "duration"
export type SortDirection = "asc" | "desc"
