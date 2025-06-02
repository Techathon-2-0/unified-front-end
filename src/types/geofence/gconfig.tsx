export interface Geofence {
  id: string
  name: string
  type: "circle" | "polygon" | "pointer"
  radius?: number
  coordinates: { lat: number; lng: number }
  locationId?: string
  polygonPoints?: { lat: number; lng: number }[]
  tag?: string
  stopType?: string
  status?: string
  createdAt?: string
  updatedAt?: string
  //location: string
  //shipmentId?: string
  // geozoneType?: string
  // createdBy?: string
  // updatedBy?: string
  // unloadingTime?: number
  // description?: string
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
  selectedGeofence: string | null
  editingGeofence: Geofence | null
  isCreatingNew: boolean
  searchHighlight: string | null
  onSelectGeofence: (id: string | null) => void
  onEditGeofence: (id: string) => void
  onUpdateGeofence?: (geofence: Geofence) => void
}
