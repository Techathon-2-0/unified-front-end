import type React from "react"
import type { Geofence } from "./gconfig_type"

export interface GeofenceGroup {
  id: number
  geo_group: string
  geofenceIds: number[]
  created_at: string
  updated_at: string
  geofences?: Geofence[]
}

// export interface Geofence {
//   id: number
//   geofence_name: string
//   latitude: number
//   longitude: number
//   location_id: string
//   tag: string
//   stop_type: string
//   geofence_type: number // 0 for circle, 1 for pointer, 2 for polygon
//   radius: number
//   status: boolean
//   created_at: string
//   updated_at: string
// }

export interface FormData {
  geo_group: string
  geofenceIds: number[]
}

export interface AddEditFormProps {
  isOpen: boolean
  onClose: () => void
  formData: FormData
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onGeofenceSelection: (geofenceId: number) => void
  onSave: () => void
  geofenceData: Geofence[]
  isEditing: boolean
  isLoading?: boolean
}

export interface DeleteConfirmationProps {
  isOpen: boolean
  onClose: () => void
  group: GeofenceGroup | null
  onConfirm: () => void
  isLoading?: boolean
}

export interface GroupTableProps {
  groups: GeofenceGroup[]
  sortField: keyof GeofenceGroup | null
  sortDirection: "asc" | "desc"
  onViewDetails: (group: GeofenceGroup) => void
  onEditGroup: (group: GeofenceGroup) => void
  onDeleteGroup: (group: GeofenceGroup) => void
  onSort?: (field: string) => void
  isLoading?: boolean
}

export interface HeaderProps {
  totalCount: number
  onAddGroup: () => void
}

export interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  currentItems: number
  onPageChange: (page: number) => void
}

export interface SearchBarProps {
  searchQuery: string
  onSearch: (query: string) => void
  isLoading?: boolean
}

export interface ViewDetailsProps {
  isOpen: boolean
  onClose: () => void
  group: GeofenceGroup | null
  geofenceData: Geofence[]
  onEdit: (group: GeofenceGroup) => void
}
