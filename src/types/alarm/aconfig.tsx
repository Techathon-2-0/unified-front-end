export interface Alarm {
  id: string
  type: string
  alarmCategory: string
  severityType: string
  description: string
  assignedTo: string | null
  createdBy: string | null
  createdOn: string
  updatedBy: string | null
  updatedOn: string | null
  alarmGeneration: "Always" | "Conditional"
  enableGeofence: boolean
  groups: string[]
  email: string
  sms: string
  webhook: string
  thresholdValue: string
  read: boolean
}

export type AlarmTypeIconProps = {
  type: string
  className?: string
  size?: number
}

export interface CreateAlarmModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (alarm: Partial<Alarm>) => void
  editAlarm?: Alarm | null
  availableGroups: string[]
}

export interface AlarmFilterBarProps {
  totalCount: number
  onSearch: (query: string) => void
  onExport: (format: "csv" | "pdf") => void
  onGroupsChange: (groups: string[]) => void
  availableGroups: string[]
}

export type SeverityBadgeProps = {
  severity: string
}

export interface AlarmTableProps {
  alarms: Alarm[]
  onEdit: (alarm: Alarm) => void
  onDelete: (alarmId: string) => void
  loading: boolean
  selectedGroups: string[]
  searchQuery: string
  currentPage: number
  pageCount: number
  onPageChange: (page: number) => void
  totalCount: number
  selectedAlarms: string[]
  onSelectAlarm: (id: string, checked: boolean) => void
  onSelectAll: (checked: boolean) => void
  onSort: (field: keyof Alarm, direction: "asc" | "desc") => void
}
