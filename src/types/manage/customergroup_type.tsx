export interface Customer {
  id: number
  lr_number?: string
  customer_id?: string
  customer_name: string
  customer_location?: string
  stop_id?: number
}

export interface CustomerGroup {
  id: number
  group_name: string
  customerIds: number[]
  created_at: string
  updated_at: string
}

export interface CustomerGroupDrawerProps {
  open: boolean
  onClose: () => void
  customerGroup: CustomerGroup | null
  onSave: (customerGroup: CustomerGroup) => void
}

export interface CustomerGroupTableProps {
  customerGroups: CustomerGroup[]
  onEdit: (customerGroup: CustomerGroup) => void
  onDelete: (id: number) => void
  currentPage?: number
  pageCount?: number
  onPageChange?: (page: number) => void
  totalCount?: number
  isTableLoading?: boolean
}
