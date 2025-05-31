export interface GeofenceGroup {
  id: string
  name: string
  geofenceIds: string[]
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  personInCharge: string
  contactInfo: string
}

export interface Geofence {
  id: string
  name: string
  type: string
  radius: number
  location: string
  locationId: string
  coordinates: { lat: number; lng: number }
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
  status: string
  unloadingTime: number
  tag: string
  geozoneType: string
  stopType: string
  shipmentId: string
}

export interface FormData {
  name: string
  personInCharge: string
  contactInfo: string
  geofenceIds: string[]
}

export interface AddEditFormProps {
  isOpen: boolean
  onClose: () => void
  formData: FormData
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onGeofenceSelection: (geofenceId: string) => void
  onSave: () => void
  geofenceData: Geofence[]
  isEditing: boolean
}

export interface DeleteConfirmationProps {
  isOpen: boolean
  onClose: () => void
  group: GeofenceGroup | null
  onConfirm: () => void
}

export interface GroupTableProps {
  groups: GeofenceGroup[]
  sortField: keyof GeofenceGroup | null
  sortDirection: "asc" | "desc"
  onViewDetails: (group: GeofenceGroup) => void
  onEditGroup: (group: GeofenceGroup) => void
  onDeleteGroup: (group: GeofenceGroup) => void
  onSort?: (field: string) => void;
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
}

export interface ViewDetailsProps {
  isOpen: boolean
  onClose: () => void
  group: GeofenceGroup | null
  geofenceData: Geofence[]
  onEdit: (group: GeofenceGroup) => void
}