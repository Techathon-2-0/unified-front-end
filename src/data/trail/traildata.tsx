import axios from "axios"

// API Base URL - adjust according to your backend
const API_BASE_URL = "http://localhost:3000"

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

// Fetch Vehicle Trail Data
export const fetchVehicleTrail = async (
  vehicleNumber: string,
  startTime: string,
  endTime: string,
): Promise<VehicleTrailResponse | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/trail/vehicle/${vehicleNumber}`, {
      params: {
        startTime,
        endTime,
      },
    })

    if (response.data.success) {
      return response.data.data
    }
    return null
  } catch (error) {
    console.error("Error fetching vehicle trail:", error)
    throw error
  }
}

// Fetch Trip Trail Data
export const fetchTripTrail = async (shipmentId: string): Promise<TripTrailResponse | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/trail/trip/${shipmentId}`)

    return response.data
  } catch (error) {
    console.error("Error fetching trip trail:", error)
    throw error
  }
}
