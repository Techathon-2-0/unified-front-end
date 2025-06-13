import type { TrailPoint } from "../../types/trail/trail_type"
import type { Vehicle } from "../../types/live/list_type"
import type { TripApi, PlannedStop, VehicleGroup } from "../../types/dashboard/trip_type"

// Mock data for vehicles
const mockVehicles: Vehicle[] = [
  {
    id: "v1",
    vehicleNumber: "NL01L5993",
    deviceName: "NL01L5993_GTROPY",
    speed: 16,
    address: "Oragadam Industrial Area, Tamil Nadu",
    altitude: "42m",
    gpsTime: "2025-05-19T08:30:06",
    gprsTime: "2025-05-19T08:30:10",
    type: "Truck",
    status: "Moving",
    distance: "15.03",
    gpsPing: "Active",
    drivers: "John Doe",
    rfid: "RF123456",
    tag: "Delivery",
    gpsStatus: "Active",
    gprsStatus: "Connected",
    lastAlarm: "None",
    ignitionStatus: "On",
    sensor: "Normal",
    power: "External",
    battery: "100%",
    ac: "Off",
    lockStatus: "Unlocked",
    domainName: "logistics.com",
    driverName: "John Doe",
    driverMobile: "+91 9876543210",
    gpsType: "GPS+GLONASS",
    shipmentId: "SH12345",
    shipmentSource: "Chennai",
    vendorName: "ABC Logistics",
    group: ["Delivery Fleet"],
    hasSpeedChart: true,
    lat: 13.1827,
    lng: 80.1707,
    todayDistance: "120.5",
    trip_status: "Completed",
  },
]

// Generate sequential ping points between two locations
const generateSequentialPings = (
  startPoint: [number, number],
  endPoint: [number, number],
  numPoints: number,
): [number, number][] => {
  const path: [number, number][] = []

  // Calculate direct distance and direction
  const dx = endPoint[0] - startPoint[0]
  const dy = endPoint[1] - startPoint[1]

  // Generate sequential points along the direct path
  for (let i = 0; i < numPoints; i++) {
    const ratio = i / (numPoints - 1)
    const lat = startPoint[0] + dx * ratio
    const lng = startPoint[1] + dy * ratio
    path.push([lat, lng])
  }

  return path
}

// Generate mock trail points for vehicle-based tracking
const generateVehicleTrailPoints = (
  baseLocation: [number, number],
  startTime: Date,
  endTime: Date,
  count: number,
): TrailPoint[] => {
  const duration = endTime.getTime() - startTime.getTime()

  // Generate a destination point (roughly 10-15km away)
  const angle = Math.random() * Math.PI * 2
  const distance = 0.1 + Math.random() * 0.05 // ~10-15km in degrees
  const endLocation: [number, number] = [
    baseLocation[0] + Math.sin(angle) * distance,
    baseLocation[1] + Math.cos(angle) * distance,
  ]

  // Generate sequential pings between start and end
  const pings = generateSequentialPings(baseLocation, endLocation, count)

  // Convert pings to trail points
  const points: TrailPoint[] = []

  for (let i = 0; i < pings.length; i++) {
    const progress = i / (pings.length - 1)
    const timestamp = new Date(startTime.getTime() + progress * duration)

    // Calculate speed with some variation (10-70 km/h)
    const speedBase = 10 + Math.sin(progress * Math.PI) * 30
    const speed = speedBase + Math.random() * 20

    // Calculate distance (cumulative)
    const pointDistance = progress * 15.03 // Total distance 15.03 km

    points.push({
      lat: pings[i][0],
      lng: pings[i][1],
      timestamp: timestamp.toISOString(),
      speed,
      location: `Unnamed Road, Oragadam Industrial Area, Tamil Nadu`,
      distance: pointDistance,
      duration: `${Math.floor(progress * 65)}m`, // 65 minutes total
    })
  }

  return points
}

// Generate mock trips with correct TripApi structure
const generateMockTripsForVehicle = (): TripApi[] => {
  // Trip 1: Yesterday
  const trip1StartTime = new Date()
  trip1StartTime.setDate(trip1StartTime.getDate() - 1)
  trip1StartTime.setHours(10, 23, 0, 0)

  const trip1EndTime = new Date(trip1StartTime)
  trip1EndTime.setHours(trip1StartTime.getHours() + 22)
  trip1EndTime.setMinutes(trip1StartTime.getMinutes() + 35)

  // Trip 2: Today
  const trip2StartTime = new Date()
  trip2StartTime.setHours(8, 30, 0, 0)

  const trip2EndTime = new Date()
  trip2EndTime.setHours(9, 35, 0, 0)

  // Generate planned stops for trip 1
  const trip1Stops: PlannedStop[] = [
    {
      planned_stop: 1,
      location_id: "loc1",
      location_name: "Vandalur Walajabad Highway",
      pickup_location: "Vandalur Industrial Area",
      stop_type: "Pickup",
      lr_number: "LR001",
      customer_name: "ABC Industries",
      status: "Completed",
      loading_unloading_time: "00:15:00",
      entry_time: new Date(trip1StartTime.getTime() + 28 * 60000).toISOString(),
      exit_time: new Date(trip1StartTime.getTime() + 43 * 60000).toISOString(),
      actual_sequence: 1,
      ceta: new Date(trip1StartTime.getTime() + 25 * 60000).toISOString(),
      geta: new Date(trip1StartTime.getTime() + 30 * 60000).toISOString(),
      detention_time: "00:15:00",
      name: "Vandalur Walajabad Highway",
    },
    {
      planned_stop: 2,
      location_id: "loc2",
      location_name: "Tambaram",
      pickup_location: "Tambaram Central",
      stop_type: "Delivery",
      lr_number: "LR002",
      customer_name: "XYZ Logistics",
      status: "Completed",
      loading_unloading_time: "00:20:00",
      entry_time: new Date(trip1StartTime.getTime() + 118 * 60000).toISOString(),
      exit_time: new Date(trip1StartTime.getTime() + 138 * 60000).toISOString(),
      actual_sequence: 2,
      ceta: new Date(trip1StartTime.getTime() + 115 * 60000).toISOString(),
      geta: new Date(trip1StartTime.getTime() + 120 * 60000).toISOString(),
      detention_time: "00:20:00",
      name: "Tambaram",
    },
    {
      planned_stop: 3,
      location_id: "loc3",
      location_name: "Sriperumbudur",
      pickup_location: "Sriperumbudur Industrial Park",
      stop_type: "Delivery",
      lr_number: "LR003",
      customer_name: "PQR Manufacturing",
      status: "Completed",
      loading_unloading_time: "00:10:00",
      entry_time: new Date(trip1StartTime.getTime() + 238 * 60000).toISOString(),
      exit_time: new Date(trip1StartTime.getTime() + 248 * 60000).toISOString(),
      actual_sequence: 3,
      ceta: new Date(trip1StartTime.getTime() + 235 * 60000).toISOString(),
      geta: new Date(trip1StartTime.getTime() + 240 * 60000).toISOString(),
      detention_time: "00:10:00",
      name: "Sriperumbudur",
    },
  ]

  // Generate planned stops for trip 2
  const trip2Stops: PlannedStop[] = [
    {
      planned_stop: 1,
      location_id: "loc4",
      location_name: "Oragadam Industrial Area",
      pickup_location: "Oragadam Phase 1",
      stop_type: "Pickup",
      lr_number: "LR004",
      customer_name: "Tech Solutions Inc",
      status: "Completed",
      loading_unloading_time: "00:10:00",
      entry_time: new Date(trip2StartTime.getTime() + 14 * 60000).toISOString(),
      exit_time: new Date(trip2StartTime.getTime() + 24 * 60000).toISOString(),
      actual_sequence: 1,
      ceta: new Date(trip2StartTime.getTime() + 12 * 60000).toISOString(),
      geta: new Date(trip2StartTime.getTime() + 15 * 60000).toISOString(),
      detention_time: "00:10:00",
      name: "Oragadam Industrial Area",
    },
    {
      planned_stop: 2,
      location_id: "loc5",
      location_name: "Chengalpattu",
      pickup_location: "Chengalpattu Main Road",
      stop_type: "Delivery",
      lr_number: "LR005",
      customer_name: "Global Enterprises",
      status: "Completed",
      loading_unloading_time: "00:05:00",
      entry_time: new Date(trip2StartTime.getTime() + 59 * 60000).toISOString(),
      exit_time: new Date(trip2StartTime.getTime() + 64 * 60000).toISOString(),
      actual_sequence: 2,
      ceta: new Date(trip2StartTime.getTime() + 58 * 60000).toISOString(),
      geta: new Date(trip2StartTime.getTime() + 60 * 60000).toISOString(),
      detention_time: "00:05:00",
      name: "Chengalpattu",
    },
  ]

  // Mock vehicle groups
  const mockVehicleGroups: VehicleGroup[] = [
    { group_id: 1, group_name: "Delivery Fleet" },
    { group_id: 2, group_name: "Express Fleet" }
  ]

  return [
    {
      id: "trip1",
      route_Name: "Vandalur to Sriperumbudur",
      Domain_Name: "logistics.com",
      Start_Time: trip1StartTime.toISOString(),
      End_Time: trip1EndTime.toISOString(),
      driverName: "John Doe",
      driverMobile: "+91 9876543210",
      serviceProviderAlias: "ABC Logistics",
      Vehicle_number: "NL01L5993",
      vehicle_type: "Truck",
      vehicle_groups: mockVehicleGroups,
      cuurent_location_address: "Sriperumbudur Thiruvallur Redhills Road, Perumathangal, Chengalpattu",
      current_location_coordindates: [12.9698, 79.9403],
      last_gps_ping: trip1EndTime.toISOString(),
      shipment_source: "Chennai",
      gps_vendor: "GTROPY",
      gps_frequency: "30 seconds",
      total_distance: "45.5 km",
      total_covered_distance: "45.5 km",
      status: "Completed",
      origin: "Chennai",
      destination: "Sriperumbudur",
      origin_coordinates: [13.0827, 80.2707],
      destination_coordinates: [12.9698, 79.9403],
      ceta: new Date(trip1StartTime.getTime() + 22 * 3600000).toISOString(),
      geta: trip1EndTime.toISOString(),
      alert_counts_by_type: {
        "Speed Violation": { active: 0, inactive: 2 },
        "Route Deviation": { active: 0, inactive: 1 },
        "Geofence": { active: 1, inactive: 0 }
      },
      Vehicle_status: "Stopped",
      status_duration: "22:35:47",
      total_detention_time: "00:45:00",
      total_drive_time: "20:35:47",
      total_stoppage_time: "01:15:00",
      planned_stops: trip1Stops,
    },
    {
      id: "trip2",
      route_Name: "Oragadam to Chengalpattu",
      Domain_Name: "logistics.com",
      Start_Time: trip2StartTime.toISOString(),
      End_Time: trip2EndTime.toISOString(),
      driverName: "John Doe",
      driverMobile: "+91 9876543210",
      serviceProviderAlias: "ABC Logistics",
      Vehicle_number: "NL01L5993",
      vehicle_type: "Truck",
      vehicle_groups: mockVehicleGroups,
      cuurent_location_address: "Chengalpattu, Tamil Nadu",
      current_location_coordindates: [12.9249, 79.9282],
      last_gps_ping: trip2EndTime.toISOString(),
      shipment_source: "Oragadam",
      gps_vendor: "GTROPY",
      gps_frequency: "30 seconds",
      total_distance: "25.8 km",
      total_covered_distance: "25.8 km",
      status: "Completed",
      origin: "Oragadam",
      destination: "Chengalpattu",
      origin_coordinates: [13.1827, 80.1707],
      destination_coordinates: [12.9249, 79.9282],
      ceta: new Date(trip2StartTime.getTime() + 65 * 60000).toISOString(),
      geta: trip2EndTime.toISOString(),
      alert_counts_by_type: {
        "Speed Violation": { active: 0, inactive: 1 },
        "Route Deviation": { active: 0, inactive: 0 }
      },
      Vehicle_status: "Stopped",
      status_duration: "01:05:00",
      total_detention_time: "00:15:00",
      total_drive_time: "00:30:00",
      total_stoppage_time: "00:20:00",
      planned_stops: trip2Stops,
    },
  ]
}

// Generate trail points for a trip that passes through all stops
const generateTripTrailPoints = (trip: TripApi, startTime: Date, endTime: Date): TrailPoint[] => {
  const duration = endTime.getTime() - startTime.getTime()
  const points: TrailPoint[] = []

  // Define stop coordinates based on the trip
  let stopCoordinates: [number, number][] = []

  // Extract stop coordinates from the trip data
  if (trip.planned_stops && trip.planned_stops.length > 0) {
    stopCoordinates = [
      trip.origin_coordinates, // Start with origin
      ...trip.planned_stops.map(() => {
        // Generate coordinates for each stop (you can replace with actual coordinates if available)
        return [
          trip.origin_coordinates[0] + (Math.random() - 0.5) * 0.1,
          trip.origin_coordinates[1] + (Math.random() - 0.5) * 0.1
        ] as [number, number]
      }),
      trip.destination_coordinates // End with destination
    ]
  } else {
    // Fallback coordinates
    if (trip.id === "trip1") {
      stopCoordinates = [
        [13.0827, 80.2707], // Chennai (start)
        [12.9975, 80.2006], // Vandalur
        [12.9249, 79.9282], // Tambaram
        [12.9698, 79.9403], // Sriperumbudur (end)
      ]
    } else if (trip.id === "trip2") {
      stopCoordinates = [
        [13.1827, 80.1707], // Oragadam (start)
        [12.9249, 79.9282], // Chengalpattu (end)
      ]
    }
  }

  // Generate points between each pair of stops
  for (let i = 0; i < stopCoordinates.length - 1; i++) {
    const segmentStartPoint = stopCoordinates[i]
    const segmentEndPoint = stopCoordinates[i + 1]

    // Calculate segment progress within the whole trip
    const segmentStartProgress = i / (stopCoordinates.length - 1)
    const segmentEndProgress = (i + 1) / (stopCoordinates.length - 1)

    // Calculate segment duration
    const segmentStartTime = new Date(startTime.getTime() + segmentStartProgress * duration)
    const segmentEndTime = new Date(startTime.getTime() + segmentEndProgress * duration)
    const segmentDuration = segmentEndTime.getTime() - segmentStartTime.getTime()

    // Number of points for this segment
    const segmentPointCount = Math.max(10, Math.floor(segmentDuration / (2 * 60 * 1000)))

    // Generate sequential pings for this segment
    const segmentPings = generateSequentialPings(segmentStartPoint, segmentEndPoint, segmentPointCount)

    // Convert segment pings to trail points
    for (let j = 0; j < segmentPings.length; j++) {
      // Skip the last point of each segment except the final one
      if (j === segmentPings.length - 1 && i < stopCoordinates.length - 2) continue

      const segmentProgress = j / (segmentPings.length - 1)
      const timestamp = new Date(segmentStartTime.getTime() + segmentProgress * segmentDuration)

      // Calculate overall trip progress
      const overallProgress = segmentStartProgress + (segmentEndProgress - segmentStartProgress) * segmentProgress

      // Calculate speed with some variation
      const speedBase = 10 + Math.sin(overallProgress * Math.PI) * 30
      const speed = speedBase + Math.random() * 20

      // Calculate distance (cumulative)
      const pointDistance = overallProgress * parseFloat(trip.total_distance.replace(' km', ''))

      points.push({
        lat: segmentPings[j][0],
        lng: segmentPings[j][1],
        timestamp: timestamp.toISOString(),
        speed,
        location: `${trip.route_Name} - Tamil Nadu`,
        distance: pointDistance,
        duration: `${Math.floor(overallProgress * 65)}m`,
      })
    }
  }

  return points
}

// API functions
export const fetchVehicles = async (): Promise<Vehicle[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockVehicles
}

export const fetchVehicleTrails = async (vehicleId: string, startDate: Date, endDate: Date): Promise<TrailPoint[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Find the vehicle
  const vehicle = mockVehicles.find((v) => v.id === vehicleId)
  if (!vehicle) return []

  // Generate trail points
  const baseLocation: [number, number] = [vehicle.lat, vehicle.lng]
  const pointCount = Math.max(20, Math.floor((endDate.getTime() - startDate.getTime()) / (5 * 60 * 1000)))

  return generateVehicleTrailPoints(baseLocation, startDate, endDate, pointCount)
}

export const fetchVehicleTrips = async (): Promise<TripApi[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Generate trips for the vehicle
  return generateMockTripsForVehicle()
}

export const fetchTripTrail = async (trip: TripApi): Promise<TrailPoint[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Generate trail points that pass through all stops
  return generateTripTrailPoints(trip, new Date(trip.Start_Time), new Date(trip.End_Time))
}

// API function to fetch trips from backend
export const fetchTripsFromApi = async (
  page: number = 1,
  limit: number = 10,
  sortField: string = 'id',
  sortOrder: 'asc' | 'desc' = 'asc',
  filters: Record<string, string> = {}
): Promise<{
  data: TripApi[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}> => {
  try {
    // Build query params
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortField,
      sortOrder
    })

    // Add filters if any
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value)
    })

    // Make API call
    const response = await fetch(`/api/trips?${queryParams.toString()}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Failed to fetch trips:", error)
    
    // If API call fails, fall back to mock data
    console.warn("Falling back to mock data")
    const mockTrips = generateMockTrips(limit)
    
    return {
      data: mockTrips,
      pagination: {
        page,
        limit,
        total: mockTrips.length,
        totalPages: 1
      }
    }
  }
}

// API function to fetch a single trip by ID
export const fetchTripById = async (tripId: string): Promise<TripApi | null> => {
  try {
    const response = await fetch(`/api/trips/${tripId}`)
    
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Failed to fetch trip ${tripId}:`, error)
    return null
  }
}

// Seed trip data
export const seedTripData = async (): Promise<{ message: string, count?: number }> => {
  try {
    const response = await fetch('/api/trips/seed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error("Failed to seed trip data:", error)
    return { message: "Failed to seed trip data" }
  }
}

// Create helper function to generate mock trips (for fallback)
export function generateMockTrips(count: number): TripApi[] {
  const statuses = ["Active", "Completed", "Delayed", "Cancelled", "Manually Closed"]
  // const routeTypes = ["Pick", "Delivery", "Transfer", "Return"]
  const vehicleStatuses = ["Moving", "Stopped", "Parked"]
  const vehicleTypes = ["Truck", "Van", "Trailer", "Container"]

  // Mock vehicle groups
  const mockVehicleGroups: VehicleGroup[] = [
    { group_id: 1, group_name: "Fleet A" },
    { group_id: 2, group_name: "Fleet B" },
    { group_id: 3, group_name: "Express Fleet" }
  ]

  return Array.from({ length: count }, (_, i) => ({
    id: `trip${i + 100}`,
    route_Name: `Route ${String.fromCharCode(65 + (i % 26))} to ${String.fromCharCode(90 - (i % 26))}`,
    Domain_Name: "logistics.com",
    Start_Time: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
    End_Time: new Date(Date.now() + Math.random() * 86400000 * 3).toISOString(),
    driverName: `Driver ${i + 1}`,
    driverMobile: `+91 98765${(43210 + i).toString().slice(-5)}`,
    serviceProviderAlias: `Provider ${i + 1}`,
    Vehicle_number: `TN${(10 + i).toString().padStart(2, '0')}X${(5000 + i)}`,
    vehicle_type: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
    vehicle_groups: [mockVehicleGroups[i % mockVehicleGroups.length]],
    cuurent_location_address: `Location ${i + 1}, Tamil Nadu`,
    current_location_coordindates: [
      12.9716 + (Math.random() - 0.5) * 0.5, 
      77.5946 + (Math.random() - 0.5) * 0.5
    ],
    last_gps_ping: new Date(Date.now() - Math.random() * 3600000 * 12).toISOString(),
    shipment_source: `Source ${i + 1}`,
    gps_vendor: "GTROPY",
    gps_frequency: "30 seconds",
    total_distance: `${(Math.random() * 100 + 10).toFixed(1)} km`,
    total_covered_distance: `${(Math.random() * 90 + 5).toFixed(1)} km`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    origin: `Origin ${i + 1}`,
    destination: `Destination ${i + 1}`,
    origin_coordinates: [
      12.9716 + (Math.random() - 0.5) * 0.3,
      77.5946 + (Math.random() - 0.5) * 0.3
    ],
    destination_coordinates: [
      12.9716 + (Math.random() - 0.5) * 0.3,
      77.5946 + (Math.random() - 0.5) * 0.3
    ],
    ceta: new Date(Date.now() + Math.random() * 86400000).toISOString(),
    geta: new Date(Date.now() + Math.random() * 86400000).toISOString(),
    alert_counts_by_type: {
      "Speed Violation": { 
        active: Math.floor(Math.random() * 3), 
        inactive: Math.floor(Math.random() * 5) 
      },
      "Route Deviation": { 
        active: Math.floor(Math.random() * 2), 
        inactive: Math.floor(Math.random() * 3) 
      }
    },
    Vehicle_status: vehicleStatuses[Math.floor(Math.random() * vehicleStatuses.length)],
    status_duration: `${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
    total_detention_time: `0${Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00`,
    total_drive_time: `${Math.floor(Math.random() * 20)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
    total_stoppage_time: `0${Math.floor(Math.random() * 3)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00`,
    planned_stops: Array.from({ length: 2 + Math.floor(Math.random() * 3) }, (_, j) => ({
      planned_stop: j + 1,
      location_id: `loc${i * 10 + j}`,
      location_name: `Stop ${j + 1} for Trip ${i + 100}`,
      pickup_location: `Pickup Location ${j + 1}`,
      stop_type: j === 0 ? "Pickup" : "Delivery",
      lr_number: `LR${(i * 100 + j).toString().padStart(6, '0')}`,
      customer_name: `Customer ${j + 1}`,
      status: j < 2 ? "Completed" : (Math.random() > 0.5 ? "Pending" : "In Progress"),
      loading_unloading_time: `00:${Math.floor(Math.random() * 30 + 10).toString().padStart(2, '0')}:00`,
      entry_time: j < 2 ? new Date(Date.now() - (3 - j) * 3600000).toISOString() : "",
      exit_time: j < 2 ? new Date(Date.now() - (3 - j) * 3600000 + 1200000).toISOString() : "",
      actual_sequence: j + 1,
      ceta: new Date(Date.now() + j * 7200000 - 600000).toISOString(),
      geta: new Date(Date.now() + j * 7200000).toISOString(),
      detention_time: j < 2 ? "00:20:00" : "",
      name: `Stop ${j + 1} for Trip ${i + 100}`,
    }))
  }))
}