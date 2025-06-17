export type Group = {
  id: number
  name: string
  entityIds: number[] // Changed from vehicleIds to entityIds and number type
  createdOn: string
  updatedOn: string
}

export interface GroupDrawerProps {
  open: boolean
  onClose: () => void
  group: Group | null
  onSave: (group: Group) => void
}

export interface GroupTableProps {
  groups: Group[]
  onEdit: (group: Group) => void
  onDelete: (id: number) => void
  currentPage?: number
  pageCount?: number
  onPageChange?: (page: number) => void
  totalCount?: number
}

export interface Entity {
  id: number
  vehicleNumber: string
  type: "Car" | "Truck" | "Excavator"
  status: boolean
}
