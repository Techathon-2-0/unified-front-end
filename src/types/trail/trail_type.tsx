import type { DateRange } from "react-day-picker"
import type { VehicleTrailResponse, TripTrailResponse } from "../../data/trail/traildata"

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