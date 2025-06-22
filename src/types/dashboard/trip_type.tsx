export interface VehicleGroup {
  group_id: number
  group_name: string
}

export interface CustomerGroup {
  id: number
  group_name: string
  customers: Customer[]
}

export interface Customer {
  id: number
  customer_id: string
  customer_name: string
}

export interface AlertCountsByType {
  [alertType: string]: {
    active: number
    inactive: number
    manually_closed?: number
  }
}

export interface PlannedStop {
  planned_stop: number
  location_id: string
  location_name: string
  pickup_location: string
  stop_type: string
  lr_number: string
  customer_name: string
  status: string
  loading_unloading_time: string
  entry_time: string
  exit_time: string
  actual_sequence: number
  ceta: string
  geta: string
  detention_time: string
  name: string
  geofence_name: string
}

export interface TripApi {
  id: string
  route_Name: string
  Domain_Name: string
  Start_Time: string
  End_Time: string
  driverName: string
  driverMobile: string
  serviceProviderAlias: string
  Vehicle_number: string
  vehicle_type: string
  vehicle_groups: VehicleGroup[]
  cuurent_location_address: string
  current_location_coordindates: [number, number]
  last_gps_ping: string
  shipment_source: string
  gps_type: string
  gps_unit_id: string
  gps_vendor: string
  gps_frequency: string
  total_distance: string
  total_covered_distance: string
  status: string
  origin: string
  destination: string
  origin_coordinates: [number, number]
  destination_coordinates: [number, number]
  ceta: string
  geta: string
  alert_counts_by_type: AlertCountsByType
  Vehicle_status: string
  status_duration: string
  total_detention_time: string
  total_drive_time: string
  total_stoppage_time: string
  planned_stops: PlannedStop[]
  last_gps_vendor : string
  total_time: string
  average_distance: string
}

export interface StatusCounts {
  active: number
  inactive: number
  atPickup: number
  atDelivery: number
  inTransit: number
  onTime: number
  delayed: number
  stoppage: number
  overspeeding: number
  continuousDriving: number
  routeDeviation: number
  geofence: number
  reachedStopAlarm: number
  noGpsFeed: number
}

export interface AlertDetail {
  alert_id: number
  alert_type_name: string
  alert_category: string
  alert_description: string
  status: number
  status_text: string
  can_manually_close: boolean
  created_at: string
  updated_at: string
}

export interface AlertResponse {
  success: boolean
  shipment_id: string
  total_alerts: number
  active_alerts: number
  manually_closed_alerts: number
  alerts: AlertDetail[]
}

export interface IntutrackData {
  id: number
  phone_number: string
  current_consent: string
  consent: string
  operator: string
  updated_at: string
}

export type ViewMode = "list" | "map"
export type MapMode = "current" | "actual"
export type SortField = "id" | "status" | "Vehicle_number" | "Start_Time" | "End_Time" | "driverName"
export type SortOrder = "asc" | "desc"

export interface FilterState {
  vehicleGroup: string[]
  customerGroup: string[]
  customerName: string[]
  vehicleStatus: string[]
  tripStatus: string
  startDate: string
  endDate: string
  searchQuery: string
}

export interface TripHeaderProps {
  filters: FilterState
  setFilters: (filters: FilterState) => void
  vehicleGroups: VehicleGroup[]
  customerGroups: CustomerGroup[]
  customerNames: Customer[]
  onRefresh: () => void
  isLoading: boolean
  onApplyFilters: () => void
}

export interface TripStatusCardsProps {
  statusCounts: StatusCounts
  onStatusClick: (status: string) => void
  onAlarmClick: (alarmType: string) => void
  selectedStatus?: string | string[] | null
  selectedAlarm?: string | null
}

export interface TripAlertsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  loadingAlerts: boolean
  alerts: AlertDetail[]
  selectedTrip: TripApi | null
  handleToggleAlert: (alertId: number) => void
}

export interface TripDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedTrip: TripApi | null
  intutrackData: IntutrackData | null
  loadingIntutrack: boolean
  handleRefreshIntutrack: () => void
  getStatusColor: (status: string) => string

}

export interface TripMapProps {
  trips: TripApi[]
  selectedTrip: TripApi | null
  mapMode: MapMode
  setMapMode: (mode: MapMode) => void
}

export interface TripTableProps {
  trips: TripApi[]
  isLoading: boolean
  totalTrips: number
  sortField: SortField
  sortOrder: SortOrder
  handleSort: (field: SortField) => void
  currentPage: number
  setCurrentPage: (page: number) => void
  totalPages: number
  indexOfFirstTrip: number
  indexOfLastTrip: number
  tripsPerPage: number
}

export interface ViewControlsProps {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  mapMode: MapMode
  setMapMode: (mode: MapMode) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  onExport: (format: "csv" | "pdf") => void
}