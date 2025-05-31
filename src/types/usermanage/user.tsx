export type User = {
  id: string
  name: string
  phone: string
  email: string
  username: string
  password: string // Add password field
  active: boolean
  role: string
  userTypes: string[] // Multiple user types
  vehicleGroups: string[] // Multiple vehicle groups
  geofenceGroups: string[] // Multiple geofence groups
  tag: string
  avatar?: string // Optional avatar field
}

export interface UserDrawerProps {
  open: boolean
  onClose: () => void
  user: User | null
  onSave: (user: User) => void
}

export interface UserTableProps {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (id: string) => void
  currentPage?: number
  pageCount?: number
  onPageChange?: (page: number) => void
  totalCount?: number
}
