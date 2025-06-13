export type Vendor = {
  id: number // Changed from string to number to match backend autoincrement
  name: string
  active: boolean // This maps to status in backend (true = active, false = inactive)
  createdAt: string // Maps to created_at from backend
  updatedAt: string // Maps to updated_at from backend
}

export interface VendorDrawerProps {
  open: boolean
  onClose: () => void
  vendor: Vendor | null
  onSave: (vendor: Omit<Vendor, "id" | "createdAt" | "updatedAt">) => void // Modified to exclude auto-generated fields
}

export interface VendorTableProps {
  vendors: Vendor[]
  onEdit: (vendor: Vendor) => void
  onDelete: (id: number) => void // Changed from string to number
  currentPage?: number
  pageCount?: number
  onPageChange?: (page: number) => void
  totalCount?: number
  isTableLoading?: boolean
}
