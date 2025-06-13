export interface Geofence {
  id: number
  geofence_name: string
  type: "circle" | "polygon" | "pointer"
  radius?: number
  coordinates: { lat: number; lng: number }
  location_id?: string
  polygonPoints?: { lat: number; lng: number }[]
  tag?: string
  stop_type?: string
  status?: boolean
  created_at?: string
  updated_at?: string
  geofence_type: number // 0=circle, 1=pointer, 2=polygon
  latitude: number
  longitude: number
  polygon_points?: Array<{
    latitude: number
    longitude: number
    corner_points: number
  }>
  address?: string
  time?: string
}

export interface GeofenceFormProps {
  onClose: () => void
  geofence?: Geofence | null
  isNew?: boolean
  onUpdate?: (geofence: Geofence) => void
  onSave: (geofence: Geofence) => void
}

export interface GeofenceMapProps {
  geofences: Geofence[]
  selectedGeofence: number | null
  editingGeofence: Geofence | null
  isCreatingNew: boolean
  searchHighlight: number | null
  onSelectGeofence: (id: number | null) => void
  onEditGeofence: (id: number) => void
  onUpdateGeofence?: (geofence: Geofence) => void
}
