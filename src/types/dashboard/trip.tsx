export interface TripStop {
  point: number
  name: string
  status: string
  locationId: string
  stopType: string
  plannedTime: string
  eta: string
  actualSequence: number
  entryTime: string
  exitTime: string
  detentionTime: string
  // Add coordinates for each stop
  latitude?: number
  longitude?: number
  coordinates?: [number, number]
  // Add fields from backend response
  Location_Id?: string
  StopType?: string
  StopSequence?: string
  Latitude?: string
  Longitude?: string
  GeoFenceRadius?: string
  PlannedDepartureDate?: string
  CustomerLRDetails?: {
    CustomerLRDetail: Array<{
      LrNumber: string
      Customer_ID: string
      Customer_Name: string
      Customer_Location: string
    }> | {
      LrNumber: string
      Customer_ID: string
      Customer_Name: string
      Customer_Location: string
    }
  }
}

export interface Trip {
  id: string
  status: "Active" | "Completed" | "Delayed" | "Cancelled" | "Manually Closed"
  routeId: string
  routeName: string
  routeType: string
  startTime: string
  endTime: string
  driverName: string
  driverMobile: string
  driverDetails: string
  location: string
  locationDateTime: string
  shipmentId: string
  vehicleName: string
  vehicleStatus: string
  statusDuration: string
  totalDetentionTime: string
  totalStoppageTime: string
  totalDriveTime: string
  domainName: string
  equipmentId: string
  coordinates: [number, number]
  stops: TripStop[]
}

export interface StatusCounts {
  enrouteToLoading: number
  atLoading: number
  atUnloading: number
  active: number
  yetToStart: number
  onTime: number
  delayLessThan1Hr: number
  delayMoreThan1Hr: number
  noUpdate: number
  longHalt: number
  continuousDriving: number
  routeDeviation: number
}

export type SortField = "id" | "status" | "routeId" | "routeName" | "routeType" | "startTime" | "endTime" | "driverName"

export type SortOrder = "asc" | "desc"

export interface TripExpandedDetailsProps {
  trip: Trip
}

export interface TripFiltersProps {
  showFilters: boolean
  setShowFilters: (show: boolean) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  regionFilter: string
  setRegionFilter: (region: string) => void
  vehicleStatusFilter: string
  setVehicleStatusFilter: (status: string) => void
  locationFilter: string
  setLocationFilter: (location: string) => void
  entityFilter: string
  setEntityFilter: (entity: string) => void
  routeFilter: string
  setRouteFilter: (route: string) => void
  userFilter: string
  setUserFilter: (user: string) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export interface TripHeaderProps {
  totalTrips: number
  timeRange: string
  setTimeRange: (range: string) => void
}

export interface TripMapProps {
  trips: Trip[]
  activeTrips?: Trip[]
  selectedTrip: Trip | null
  mapType: "normal" | "satellite"
  setMapType: (type: "normal" | "satellite") => void
}

export interface TripStatusCardsProps {
  statusCounts: StatusCounts
  totalTrips: number
}

export interface TripTableProps {
  trips: Trip[]
  isLoading: boolean
  totalTrips: number
  expandedTripId: string | null
  toggleExpandTrip: (tripId: string) => void
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