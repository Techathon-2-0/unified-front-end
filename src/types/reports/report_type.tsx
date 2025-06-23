export type ReportType = "dashboard" | "all_positions" | "alarm" | "trip_gps_status" | "trip_summary"

export interface Group {
  id: number
  name: string
  entityIds: number[]
  createdOn: string
  updatedOn: string
}

export interface CustomerGroup {
  id: number
  group_name: string
  created_at: string
  updated_at: string
}

export interface DashboardReportData {
  vehicleNumber: string
  location: string
  latitude: number | null
  longitude: number | null
  lastVendor: string
  gpsTime: string | null
  gprsTime: string | null
  speed: number
  status: string
  gpsPingCount: number
  power: string | number
  battery: string | number
  ignitionStatus: "ON" | "OFF"
}

export interface TrailPoint {
  vendor: string
  deviceId: string
  timestamp: number
  gpsTime: string | null
  gprsTime: string | null
  power: string
  battery: string
  ignitionStatus: "ON" | "OFF"
  latitude: number
  longitude: number
  speed: number
  address: string
  heading: number
  createdAt: string
}

export interface AllPositionsReportData {
  vehicleNumber: string
  trailPoints: TrailPoint[]
}

export interface AlarmReportData {
  vehicleNumber: string
  vendorName: string
  createdAt: string
  startLatitude: number | null
  startLongitude: number | null
  endTime: string | null
  endLatitude: number | null
  endLongitude: number | null
  alertName: string
  description: string
  duration: number | null
  severityType: string
  alarmValue: number | null
  restDuration: number | null
  shipmentId: string | null
  driverName: string | null
  driverMobileNumber: string | null
  serviceProviderAliasValue: string | null
  customerNames: string[]
  emailSentStatus: string
}

export interface TripGpsStatusReportData {
  // Common info repeated for each stop
  shipmentId: string
  tripStartTime: string
  tripEndTime: string
  vehicleNumber: string
  origin: string
  destination: string
  serviceProvider: string
  gpsVendor: string
  consentStatus?: string
  lastUpdatedTime?: string
  operator?: string
  tripStatus: string
  // Stop specific info
  plannedSequence: number
  actualSequence: number
  stopType: string
  lrNumber: string
  customerName: string
  entryTime: string
  exitTime: string
  gpsPingCount: number
  lastPingVendor: string
  hasFasttagPing: boolean
}

export interface TripSummaryStop {
  planned_sequence: number
  stop_type: string
  lr_number: string
  stop_location_address: string
  location_name: string
  customer_name: string
  actual_sequence: number
  entry_time: string
  exit_time: string
  loading_unloading_time: string
  detention_time: string
  status: string
}

export interface TripSummaryReportData {
  vehicle_number: string
  shipment_id: string
  trip_status: string
  vehicle_status: string
  current_location_address: string
  current_location_coordinates: [number, number] | [string, string]
  gps_vendor_last: string
  gprs_time: string
  gps_time: string
  vehicle_status_duration: string
  route_name: string
  domain_name: string
  service_provider_alias_value: string
  start_time: string
  start_location: string
  end_time: string
  end_location: string
  total_distance: string
  total_time: string
  covered_distance: string
  average_in_day: string
  total_stoppage_time: string
  total_detention_time: string
  total_drive_time: string
  driver_name: string
  driver_mobile: string
  gps_type: string
  gps_frequency: string
  gps_unit_id: string
  gps_vendor: string
  shipment_source: string
  intutrack_data: {
    consent_status: string
    last_updated_time: string
    operator: string
  } | null
  stops: TripSummaryStop[]
}

export interface DatePickerWithRangeProps {
  dateRange: { from: Date | undefined; to: Date | undefined }
  onChange: (range: { from: Date | undefined; to: Date | undefined }) => void
  className?: string
}

export interface ReportFilters {
  reportType: ReportType
  vehicleGroups: number[]
  customerGroups?: number[]
  alarmTypes?: number[]
  tripStatus?: "active" | "inactive" | "all"
  startDate?: string
  endDate?: string
  vehicleNumber?: string
}

export interface ReportDrawerProps {
  open: boolean
  onClose: () => void
  onGenerateReport: (filters: ReportFilters) => void
  onExportReport: (filters: ReportFilters) => void
  isLoading?: boolean
}

export interface ReportTableProps {
  reportData:
    | DashboardReportData[]
    | AllPositionsReportData[]
    | AlarmReportData[]
    | TripGpsStatusReportData[]
    | TripSummaryReportData[]
  reportType: ReportType
  currentPage?: number
  pageCount?: number
  onPageChange?: (page: number) => void
  totalCount?: number
  isTableLoading?: boolean
  onViewDetails?: (vehicleData: AllPositionsReportData) => void
}

export interface ReportManagementState {
  reportData:
    | DashboardReportData[]
    | AllPositionsReportData[]
    | AlarmReportData[]
    | TripGpsStatusReportData[]
    | TripSummaryReportData[]
  searchQuery: string
  isDrawerOpen: boolean
  currentPage: number
  isTableLoading: boolean
  currentFilters: ReportFilters | null
}

export interface TripDetailsModalProps {
  open: boolean
  onClose: () => void
  vehicleData: AllPositionsReportData | null
}

export interface TripSummaryDetailsModalProps {
  open: boolean
  onClose: () => void
  tripData: TripSummaryReportData | null
}

export type SortDirection = "asc" | "desc"
