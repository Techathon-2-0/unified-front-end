export interface Vehicle {
  id: string
  vehicleNumber: string
  deviceName: string
  speed: number
  address: string
  altitude: string
  gpsTime: string
  gprsTime: string
  type: string
  status: string
  distance: string
  todayDistance: string
  gpsPing: string
  drivers: string
  rfid: string
  tag: string
  gpsStatus: string
  gprsStatus: string
  lastAlarm: string
  ignitionStatus: string
  sensor: string
  power: string
  battery: string
  ac: string
  lockStatus: string
  domainName: string
  driverName: string
  driverMobile: string
  gpsType: string
  shipmentId: string
  shipmentSource: string
  vendorName: string
  group: string[]
  hasSpeedChart: boolean
  lat: number
  lng: number
  trip_status: string
  lastgpstime: string
  digitalInput1: boolean
}

export interface VehicleFilter {
  search: string
  group: string
  status: string
  type: string
  trip: string
}

export interface ActionBarProps {
  view: "list" | "map"
  setView: (view: "list" | "map") => void
  onRefresh: () => void
  tripCount: number
}

export interface FilterBarProps {
  totalCount: number
  filters: VehicleFilter
  onFilterChange: (filters: Partial<VehicleFilter>) => void
  onExport: (format: "csv" | "pdf") => void
  vehicleCounts: {
    car: number
    truck: number
    person: number
    excavator: number
    streetLight: number
    trailer: number
  }
}

export interface VehicleDetailsModalProps {
  vehicle: Vehicle
  onClose: () => void
}

export interface VehicleMapProps {
  vehicles: Vehicle[]
  loading: boolean
  filters: VehicleFilter
  onFilterChange: (filters: Partial<VehicleFilter>) => void
}

export interface VehicleTableProps {
  vehicles: Vehicle[]
  loading: boolean
  currentPage: number
  pageCount: number
  onPageChange: (page: number) => void
  onSort: (field: keyof Vehicle, direction: "asc" | "desc") => void
  selectedVehicles: string[]
  onSelectVehicle: (id: string, checked: boolean) => void
  onSelectAll: (checked: boolean) => void
  totalCount: number
}

export interface VehicleApiResponse {
  json: {
    stautsMessage: string
    rc_regn_no: string
    rc_regn_dt: string
    rc_regn_upto: string
    rc_purchase_dt: string
    rc_owner_name: string
    rc_present_address: string
    rc_vch_catg_desc: string
    rc_insurance_comp: string
    rc_insurance_policy_no: string
    rc_insurance_upto: string
    rc_permit_no: string
    rc_permit_type: string
    rc_permit_valid_upto: string
    rc_vh_class_desc: string
    rc_maker_model: string
    rc_maker_desc: string
    rc_color: string
    rc_chasi_no: string
    rc_eng_no: string
    rc_fuel_desc: string
    rc_norms_desc: string
    rc_fit_upto: string
    rc_tax_upto: string
    rc_pucc_upto: string
  }
  dbOperation?: string
}

// New type for database response
export interface RegistrationDbResponse {
  success: boolean
  message: string
  // data: {
    id?: number
    status_message: string
    rc_regn_no: string
    rc_regn_dt: string
    rc_regn_upto: string
    rc_purchase_dt: string
    rc_owner_name: string
    rc_present_address: string
    rc_vch_catg_desc: string
    rc_insurance_comp: string
    rc_insurance_policy_no: string
    rc_insurance_upto: string
    rc_permit_no: string
    rc_permit_type: string
    rc_permit_valid_upto: string
    rc_vh_class_desc: string
    rc_maker_model: string
    rc_maker_desc: string
    rc_color: string
    rc_chasi_no: string
    rc_eng_no: string
    rc_fuel_desc: string
    rc_norms_desc: string
    rc_fit_upto: string
    rc_tax_upto: string
    rc_pucc_upto: string
    entity_id?: number | null
    created_at?: string
    updated_at?: string
  // }
}