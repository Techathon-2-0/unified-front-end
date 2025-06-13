import type { DateRange } from "react-day-picker"
import type { PlannedStop } from "../dashboard/trip_type"

export type TrailType = "vehicle" | "trip"

export interface TrailPoint {
  lat: number
  lng: number
  timestamp: string
  speed?: number
  location?: string
  distance?: number
  duration?: string
}

export interface VehicleTrail {
  id: string
  vehicleId: string
  points: TrailPoint[]
  startLocation: string
  endLocation: string
  startTime: string
  endTime: string
  distance: number
  duration: string
  averageSpeed: number
  maxSpeed?: number
  idleTime?: string
  stopCount?: number
  fuelConsumed?: number
  timestamp: string
  location: string
  showPoints: boolean
}

export interface VehicleTrip {
  id: string
  vehicleId: string
  points: TrailPoint[]
  stops: TrailPoint[]
  startLocation: string
  endLocation: string
  startTime: string
  endTime: string
  distance: number
  duration: string
  averageSpeed: number
  maxSpeed?: number
  idleTime?: string
  stopCount?: number
  fuelConsumed?: number
  timestamp: string
  location: string
}

export interface DatePickerWithRangeProps {
  dateRange: DateRange
  onChange: (range: DateRange) => void
  className?: string
}

export interface TrailControlsProps {
  trail: VehicleTrail | null
  trip: VehicleTrip | null
  isPlaying: boolean
  playbackSpeed: number
  onPlayPause: () => void
  onSpeedChange: (speed: number) => void
  trailType: "vehicle" | "trip"
}

export interface TrailDetailsProps {
  trail: VehicleTrail | null
  trip: VehicleTrip | null
  trailType: "vehicle" | "trip"
}

export interface TrailMapProps {
  trailPoints: TrailPoint[]
  tripStops: PlannedStop[]
  isPlaying: boolean
  currentPointIndex: number
  setCurrentPointIndex: (index: number) => void
  playbackSpeed: number
  trailType: TrailType
  setIsPlaying: (isPlaying: boolean) => void
  showPoints: boolean
}

export interface TrailTypeSelectorProps {
  value: TrailType
  onChange: (value: TrailType) => void
}

export interface VehicleSelectorProps {
  selectedVehicle: string | null
  onChange: (vehicleId: string) => void
}