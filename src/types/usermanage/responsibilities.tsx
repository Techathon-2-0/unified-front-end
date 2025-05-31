export type Responsibility = {
  id: number
  role_name: string
  created_at: string
  updated_at: string
  tabs_access: Array<Record<string, number>>
  report_access: string[]
}

export interface ResponsibilitiesTableProps {
  responsibilities: Responsibility[]
  onEdit: (responsibility: Responsibility) => void
  onDelete: (id: number) => void
  currentPage?: number
  pageCount?: number
  onPageChange?: (page: number) => void
  totalCount?: number
}

export interface ResponsibilityModalProps {
  open: boolean
  onClose: () => void
  responsibility: Responsibility | null
  onSave: (responsibility: Responsibility) => void
}

export interface FeatureSection {
  id: string
  name: string
  features: Feature[]
}

export interface Feature {
  id: string
  name: string
  checked: boolean
}

// Backend operation types
export type ResponsibilityOperation = {
  type: "create" | "update" | "delete"
  data: Responsibility | { id: number }
}
