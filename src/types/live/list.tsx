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
  group: string
  hasSpeedChart: boolean
  lat: number
  lng: number
}

export interface VehicleFilter {
  search: string
  group: string
  status: string
  type: string
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