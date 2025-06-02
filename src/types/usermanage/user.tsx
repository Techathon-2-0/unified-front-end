export interface User {
  id: number
  name: string
  username: string
  email: string
  phone: string
  password: string
  active: boolean
  role: string
  tag?: string
  userTypes: string[]
  vehicleGroups: string[]
  geofenceGroups: string[]
  customerGroups: string[]
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
  onDelete: (id: number) => void
  currentPage?: number
  pageCount?: number
  onPageChange?: (page: number) => void
  totalCount?: number
}
