// Update the Entity interface to match the backend schema
export interface Entity {
  id: number // Changed from string to number to match backend autoincrement
  vehicleNumber: string
  vendors: Vendor[] // Changed from string[] to Vendor[] to match backend response
  type: "Car" | "Truck" | "Excavator"
  status: boolean // Changed from "Active" | "Inactive" to boolean to match backend
  createdAt: string
  updatedAt: string
}

// Add Vendor interface to match backend response
export interface Vendor {
  id: number
  name: string
  status: boolean
}

export interface EntityDrawerProps {
  open: boolean
  onClose: () => void
  entity: Entity | null
  onSave: (entity: Omit<Entity, "id" | "createdAt" | "updatedAt">) => void // Modified to exclude auto-generated fields
  availableVendors: Vendor[] // Changed from string[] to Vendor[]
}

export interface EntityTableProps {
  entities: Entity[]
  onEdit: (entity: Entity) => void
  onDelete: (id: number) => void // Changed from string to number
  currentPage?: number
  pageCount?: number
  onPageChange?: (page: number) => void
  totalCount?: number
  isTableLoading?: boolean
}
