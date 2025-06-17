import type { Vehicle } from "../live/list_type"

export interface GeofenceStatsProps {
  vehicles: Vehicle[]
  selectedGeofence: string | null
  onGeofenceChange: (geofenceId: string) => void
}

export interface GeofenceVehicle extends Vehicle {
  geofenceStatus: "inside" | "outside"
  assignedGeofenceId: string
  distanceFromGeofence: number
}

export interface GeofenceMatrixProps {
  vehicles: GeofenceVehicle[]
  selectedGeofence: string | null
  matrixType: "geofence" | "distance"
  onVehicleClick: (vehicleId: string) => void
  highlightedVehicle: string | null
  onFilteredCountChange: (count: number) => void
  onAlertClick: (vehicleId: string, geofenceId: string) => void
  onMatrixTypeChange: (type: "geofence" | "distance") => void
}

export interface GeofenceMapProps {
  vehicles: GeofenceVehicle[]
  selectedGeofence: string | null
  matrixType: "geofence" | "distance"
  highlightedVehicle: string | null
  isFullScreen?: boolean
  onVehicleClick?: (vehicleId: string) => void
  onClose?: () => void
}

export interface GeofenceHeaderProps {
  totalCount: number
  onRefresh: () => void
  onExport: (format: "csv" | "pdf") => void
  matrixType: "geofence" | "distance"
  onMatrixTypeChange: (type: "geofence" | "distance") => void
}

export interface GeofenceSelectorProps {
  selectedGeofence: string | null
  onGeofenceChange: (geofenceId: string) => void
}

export type SortField = "vehicleNumber" | "type" | "status" | "distanceFromGeofence" | "gpsTime"
export type SortDirection = "asc" | "desc"

export interface Geofence {
  id: number
  geofence_name: string
  latitude: number
  longitude: number
  location_id: string
  tag: string
  stop_type: string
  geofence_type: number
  radius: number
  status: boolean
  address: string
  time: string
  created_at: string
  updated_at: string
  polygon_points: PolygonPoint[]
}

export interface PolygonPoint {
  id: number
  geofence_id: number
  latitude: number
  longitude: number
  corner_points: number
  created_at: string
  updated_at: string
}

export interface GeofenceAlert {
  alert_id: number
  alert_status: number
  alert_status_text: string
  geofence_event_type: string
  geofence_name: string
  vehicle_number: string
  alarm_category: string
  alarm_description: string
  created_at: string
  updated_at: string
  alarm_created_at: string
  geofence_status: number
}

export interface AlertResponse {
  success: boolean
  geofence_id: number
  geofence_name: string
  vehicle_number: string
  total_alerts: number
  time_filter: string
  alerts: GeofenceAlert[]
}

export interface AlertDialogProps {
  isOpen: boolean
  onClose: () => void
  vehicleNumber: string
  geofenceId: string
}

// export interface Group {
//   id: number
//   name: string
//   entityIds: number[]
//   createdOn: string
//   updatedOn: string
// }