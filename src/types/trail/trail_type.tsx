import type { DateRange } from "react-day-picker"

export type TrailType = "vehicle" | "trip"

export interface TrailPoint {
  id: number
  latitude: number
  longitude: number
  timestamp: number
  time: string
  address: string
  speed: number
  heading: number
  gpstimestamp: number
  gprstime?: string
}

export interface Stop {
  id: number
  locationId: string
  stopName: string
  stopType: string
  latitude: number
  longitude: number
  address: string
  plannedSequence: number
  actualSequence: number
  entryTime: string | null
  exitTime: string | null
  geoFenceRadius: number
  status: string
  customerName: string
  lrNumber: string
}

export interface DatePickerWithRangeProps {
  dateRange: DateRange
  onChange: (range: DateRange) => void
  className?: string
}

export interface SpeedChartProps {
  trailPoints: Array<{
    time: string
    speed: number
  }>
  currentPointIndex: number
}

export interface VehicleDetailsProps {
  data: VehicleTrailResponse | TripTrailResponse | null
  type: "vehicle" | "trip"
  onPlayTrail: () => void
}

export interface TrailTypeSelectorProps {
  value: TrailType
  onChange: (value: TrailType) => void
}

export interface TrailMapProps {
  trailPoints: TrailPoint[]
  stops?: Stop[]
  isPlaying: boolean
  currentPointIndex: number
  setCurrentPointIndex: (index: number) => void
  playbackSpeed: number
  trailType: "vehicle" | "trip"
  setIsPlaying: (isPlaying: boolean) => void
  showPoints: boolean
  showPlannedSequence?: boolean
  setShowPlannedSequence?: (showPlannedSequence: boolean) => void
}

// Extend the Leaflet Map type to include custom layer properties
export interface CustomLeafletMap extends L.Map {
  normalLayer?: L.TileLayer;
  satelliteLayer?: L.TileLayer;
}

// Vehicle Trail Response Interface
export interface VehicleTrailResponse {
  vehicleNumber: string
  vehicleId: string
  totalPoints: number
  dateRange: {
    startTime: string
    endTime: string
  }
  trailPoints: Array<{
    id: number
    timestamp: number
    time: string
    address: string
    latitude: number
    longitude: number
    speed: number
    heading: number
    gpstimestamp: number
    gprstime: string
  }>
  metrics: {
    totalTime: number
    totalTimeFormatted: string
    avgSpeed: number
    totalDistance: number
  }
}

// Trip Trail Response Interface
export interface TripTrailResponse {
  shipmentId: string
  routeName: string
  vehicleNumber: string
  driverName: string
  driverMobile: string
  status: string
  startLocation: string
  endLocation: string
  totalDistance: string
  stops: Array<{
    id: number
    locationId: string
    stopName: string
    stopType: string
    latitude: number
    longitude: number
    address: string
    plannedSequence: number
    actualSequence: number
    entryTime: string | null
    exitTime: string | null
    geoFenceRadius: number
    status: string
    customerName: string
    lrNumber: string
  }>
  trailPoints: Array<{
    id: number
    timestamp: number
    time: string
    address: string
    latitude: number
    longitude: number
    speed: number
    heading: number
    gpstimestamp: number
  }>
  metrics: {
    totalTime: number
    totalTimeFormatted: string
    avgSpeed: number
    totalDistance: number
  }
}

