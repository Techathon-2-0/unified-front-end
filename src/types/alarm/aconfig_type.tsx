export interface Alarm {
  id: string
  type: string
  severityType: string
  description: string
  assignedTo: string | null
  createdOn: string
  updatedOn: string | null
  alarmGeneration: "Always" | "Conditional"
  enableGeofence: boolean
  groups: string[]
  email: string
  sms: string
  thresholdValue: string
  status?: "Active" | "Inactive"
  restDuration?: number
  geofenceStatus?: "In" | "Out" | "Both"
  activeTrip?: boolean
  activeStartTimeRange?: string
  activeEndTimeRange?: string
  vehicleGroups?: number[]
  customerGroups?: number[]
  geofenceGroups?: number[]
  emails?: string[]
  phoneNumbers?: string[]
  read?: boolean
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
  availableVehicleGroups: any[]
  availableCustomerGroups: any[]
  availableGeofenceGroups: any[]
  availableUsers: any[]
}

export interface AlarmFilterBarProps {
  totalCount: number
  onFilterChange: (filters: AlarmFilters) => void
  availableGroups: string[]
  availableAlarmTypes: string[]
  availableSeverityTypes: string[]
  availableVehicleGroups?: any[]
  availableCustomerGroups?: any[]
  availableGeofenceGroups?: any[]
}

export interface AlarmFilters {
  alarmTypes: string[]
  vehicleGroups: string[]
  customerGroups: string[]
  geofenceGroups: string[]
  statuses: string[]
  severityTypes: string[]
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
  onViewAssignedGroups: (alarm: Alarm) => void
}

export interface ViewAssignedGroupsModalProps {
  isOpen: boolean
  onClose: () => void
  alarm: Alarm | null
  vehicleGroups?: any[]
  customerGroups?: any[]
  geofenceGroups?: any[]
}

export interface GroupSelectionProps {
  title: string
  groups: any[]
  selectedGroups: number[]
  onChange: (selectedIds: number[]) => void
  nameField?: string
  idField?: string
}

export interface NotificationSelectionProps {
  users: any[]
  selectedEmails: string[]
  selectedPhoneNumbers: string[]
  onEmailsChange: (emails: string[]) => void
  onPhoneNumbersChange: (phoneNumbers: string[]) => void
  customEmails: string
  customPhoneNumbers: string
  onCustomEmailsChange: (value: string) => void
  onCustomPhoneNumbersChange: (value: string) => void
}
