import type { TrailPoint } from "../../types/trail/trail"
import type { Vehicle } from "../../types/live/list"
import type { Trip, TripStop } from "../../types/dashboard/trip"

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
    gpsPing: "Active", // kitne baar gps aaay ha
    drivers: "John Doe",
    rfid: "RF123456"  , // at present nhi aahre
    tag: "Delivery", // kuch bhi
    gpsStatus: "Active", // 
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
    group: "Delivery Fleet",
    hasSpeedChart: true,
    lat: 13.1827,
    lng: 80.1707,
  },
  {
    id: "v2",
    vehicleNumber: "KA01M4567",
    deviceName: "KA01M4567_SEDAN",
    speed: 0,
    address: "Bangalore, Karnataka",
    altitude: "920m",
    gpsTime: "2025-05-19T08:15:22",
    gprsTime: "2025-05-19T08:15:30",
    type: "Car",
    status: "Stopped",
    distance: "0",
    gpsPing: "Active",
    drivers: "Rahul Kumar",
    rfid: "RF789012",
    tag: "Executive",
    gpsStatus: "Active",
    gprsStatus: "Connected",
    lastAlarm: "None",
    ignitionStatus: "Off",
    sensor: "Normal",
    power: "External",
    battery: "95%",
    ac: "Off",
    lockStatus: "Locked",
    domainName: "logistics.com",
    driverName: "Rahul Kumar",
    driverMobile: "+91 9876543211",
    gpsType: "GPS",
    shipmentId: "",
    shipmentSource: "",
    vendorName: "XYZ Corp",
    group: "Executive Fleet",
    hasSpeedChart: true,
    lat: 12.9716,
    lng: 77.5946,
  },
  {
    id: "v3",
    vehicleNumber: "TN07K8901",
    deviceName: "TN07K8901_TRUCK",
    speed: 45,
    address: "Chennai-Bangalore Highway",
    altitude: "321m",
    gpsTime: "2025-05-19T08:25:18",
    gprsTime: "2025-05-19T08:25:22",
    type: "Heavy Truck",
    status: "Moving",
    distance: "120.5",
    gpsPing: "Active",
    drivers: "Suresh M",
    rfid: "RF345678",
    tag: "Logistics",
    gpsStatus: "Active",
    gprsStatus: "Connected",
    lastAlarm: "None",
    ignitionStatus: "On",
    sensor: "Normal",
    power: "External",
    battery: "90%",
    ac: "On",
    lockStatus: "Unlocked",
    domainName: "logistics.com",
    driverName: "Suresh M",
    driverMobile: "+91 9876543212",
    gpsType: "GPS+GLONASS",
    shipmentId: "SH67890",
    shipmentSource: "Chennai",
    vendorName: "PQR Logistics",
    group: "Heavy Fleet",
    hasSpeedChart: true,
    lat: 13.0827,
    lng: 80.2707,
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

// Generate mock trips with stops


const generateMockTripsForVehicle = (vehicleId: string): Trip[] => {
  const chennai: [number, number] = [13.0827, 80.2707] // Chennai coordinates

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

  // Define stop coordinates for trip 1
  const trip1StopCoordinates = [
    [13.0827, 80.2707], // Chennai (start)
    [12.9975, 80.2006], // Vandalur
    [12.9249, 79.9282], // Tambaram
    [12.9698, 79.9403], // Sriperumbudur (end)
  ]

  // Define stop coordinates for trip 2
  const trip2StopCoordinates = [
    [13.1827, 80.1707], // Oragadam (start)
    [12.9249, 79.9282], // Chengalpattu (end)
  ]

  // Generate stops for trip 1
  const trip1Stops: TripStop[] = [
    {
      point: 1,
      name: "Vandalur Walajabad Highway",
      status: "Completed",
      locationId: "loc1",
      stopType: "Pickup",
      plannedTime: new Date(trip1StartTime.getTime() + 30 * 60000).toISOString(),
      eta: new Date(trip1StartTime.getTime() + 25 * 60000).toISOString(),
      actualSequence: 1,
      entryTime: new Date(trip1StartTime.getTime() + 28 * 60000).toISOString(),
      exitTime: new Date(trip1StartTime.getTime() + 43 * 60000).toISOString(),
      detentionTime: "00:15:00",
    },
    {
      point: 2,
      name: "Tambaram",
      status: "Completed",
      locationId: "loc2",
      stopType: "Delivery",
      plannedTime: new Date(trip1StartTime.getTime() + 120 * 60000).toISOString(),
      eta: new Date(trip1StartTime.getTime() + 115 * 60000).toISOString(),
      actualSequence: 2,
      entryTime: new Date(trip1StartTime.getTime() + 118 * 60000).toISOString(),
      exitTime: new Date(trip1StartTime.getTime() + 138 * 60000).toISOString(),
      detentionTime: "00:20:00",
    },
    {
      point: 3,
      name: "Sriperumbudur",
      status: "Completed",
      locationId: "loc3",
      stopType: "Delivery",
      plannedTime: new Date(trip1StartTime.getTime() + 240 * 60000).toISOString(),
      eta: new Date(trip1StartTime.getTime() + 235 * 60000).toISOString(),
      actualSequence: 3,
      entryTime: new Date(trip1StartTime.getTime() + 238 * 60000).toISOString(),
      exitTime: new Date(trip1StartTime.getTime() + 248 * 60000).toISOString(),
      detentionTime: "00:10:00",
    },
  ]

  // Generate stops for trip 2
  const trip2Stops: TripStop[] = [
    {
      point: 1,
      name: "Oragadam Industrial Area",
      status: "Completed",
      locationId: "loc4",
      stopType: "Pickup",
      plannedTime: new Date(trip2StartTime.getTime() + 15 * 60000).toISOString(),
      eta: new Date(trip2StartTime.getTime() + 12 * 60000).toISOString(),
      actualSequence: 1,
      entryTime: new Date(trip2StartTime.getTime() + 14 * 60000).toISOString(),
      exitTime: new Date(trip2StartTime.getTime() + 24 * 60000).toISOString(),
      detentionTime: "00:10:00",
    },
    {
      point: 2,
      name: "Chengalpattu",
      status: "Completed",
      locationId: "loc5",
      stopType: "Delivery",
      plannedTime: new Date(trip2StartTime.getTime() + 60 * 60000).toISOString(),
      eta: new Date(trip2StartTime.getTime() + 58 * 60000).toISOString(),
      actualSequence: 2,
      entryTime: new Date(trip2StartTime.getTime() + 59 * 60000).toISOString(),
      exitTime: new Date(trip2StartTime.getTime() + 64 * 60000).toISOString(),
      detentionTime: "00:05:00",
    },
  ]

  return [
    {
      id: "trip1",
      status: "Completed",
      routeId: "route1",
      routeName: "Vandalur to Sriperumbudur",
      routeType: "Delivery",
      startTime: trip1StartTime.toISOString(),
      endTime: trip1EndTime.toISOString(),
      driverName: "John Doe",
      driverMobile: "+91 9876543210",
      driverDetails: "License: DL123456",
      location: "Sriperumbudur Thiruvallur Redhills Road, Perumathangal, Chengalpattu",
      locationDateTime: trip1EndTime.toISOString(),
      shipmentId: "SH12345",
      vehicleName: "NL01L5993_GTROPY",
      vehicleStatus: "Completed",
      statusDuration: "22:35:47",
      totalDetentionTime: "00:45:00",
      totalStoppageTime: "01:15:00",
      totalDriveTime: "20:35:47",
      domainName: "logistics.com",
      equipmentId: "EQ12345",
      coordinates: trip1StopCoordinates[trip1StopCoordinates.length - 1] as [number, number],
      stops: trip1Stops,
    },
    {
      id: "trip2",
      status: "Completed",
      routeId: "route2",
      routeName: "Oragadam to Chengalpattu",
      routeType: "Delivery",
      startTime: trip2StartTime.toISOString(),
      endTime: trip2EndTime.toISOString(),
      driverName: "John Doe",
      driverMobile: "+91 9876543210",
      driverDetails: "License: DL123456",
      location: "Chengalpattu, Tamil Nadu",
      locationDateTime: trip2EndTime.toISOString(),
      shipmentId: "SH12346",
      vehicleName: "NL01L5993_GTROPY",
      vehicleStatus: "Completed",
      statusDuration: "01:05:00",
      totalDetentionTime: "00:15:00",
      totalStoppageTime: "00:20:00",
      totalDriveTime: "00:30:00",
      domainName: "logistics.com",
      equipmentId: "EQ12345",
      coordinates: trip2StopCoordinates[trip2StopCoordinates.length - 1] as [number, number],
      stops: trip2Stops,
    },
  ]
}

// Generate trail points for a trip that passes through all stops
const generateTripTrailPoints = (trip: Trip, startTime: Date, endTime: Date): TrailPoint[] => {
  const duration = endTime.getTime() - startTime.getTime()
  const points: TrailPoint[] = []

  // Define stop coordinates based on the trip
  let stopCoordinates: [number, number][] = [];

  // Extract stop coordinates from the trip data
  if (trip.stops && trip.stops.length > 0) {
    stopCoordinates = [
      trip.coordinates, // Start with the vehicle's current position
      ...trip.stops.map(stop => {
        // Use actual stop coordinates if available
        if (stop.coordinates) {
          return stop.coordinates;
        } else if (stop.latitude && stop.longitude) {
          return [stop.latitude, stop.longitude] as [number, number];
        } else {
          // Fallback to generated coordinates
          return [
            trip.coordinates[0] + (stop.point * 0.01),
            trip.coordinates[1] + (stop.point * 0.01)
          ] as [number, number];
        }
      })
    ];
  } else if (trip.id === "trip1") {
    // Fallback to hardcoded coordinates if no stops are available
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

    // Number of points for this segment (more points for longer segments)
    const segmentPointCount = Math.max(10, Math.floor(segmentDuration / (2 * 60 * 1000))) // One point every ~2 minutes

    // Generate sequential pings for this segment
    const segmentPings = generateSequentialPings(segmentStartPoint, segmentEndPoint, segmentPointCount)

    // Convert segment pings to trail points
    for (let j = 0; j < segmentPings.length; j++) {
      // Skip the last point of each segment except the final one (to avoid duplicates)
      if (j === segmentPings.length - 1 && i < stopCoordinates.length - 2) continue

      const segmentProgress = j / (segmentPings.length - 1)
      const timestamp = new Date(segmentStartTime.getTime() + segmentProgress * segmentDuration)

      // Calculate overall trip progress
      const overallProgress = segmentStartProgress + (segmentEndProgress - segmentStartProgress) * segmentProgress

      // Calculate speed with some variation
      const speedBase = 10 + Math.sin(overallProgress * Math.PI) * 30
      const speed = speedBase + Math.random() * 20

      // Calculate distance (cumulative)
      const pointDistance = overallProgress * 15.03 // Total distance 15.03 km

      points.push({
        lat: segmentPings[j][0],
        lng: segmentPings[j][1],
        timestamp: timestamp.toISOString(),
        speed,
        location: `Unnamed Road, Tamil Nadu`,
        distance: pointDistance,
        duration: `${Math.floor(overallProgress * 65)}m`, // 65 minutes total
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

export const fetchVehicleTrips = async (vehicleId: string): Promise<Trip[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Generate trips for the vehicle
  return generateMockTripsForVehicle(vehicleId)
}

export const fetchTripTrail = async (trip: Trip): Promise<TrailPoint[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Generate trail points that pass through all stops
  return generateTripTrailPoints(trip, new Date(trip.startTime), new Date(trip.endTime))
}

// API function to fetch trips from backend
export const fetchTripsFromApi = async (
  page: number = 1,
  limit: number = 10,
  sortField: string = 'id',
  sortOrder: 'asc' | 'desc' = 'asc',
  filters: Record<string, string> = {}
): Promise<{
  data: Trip[],
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
    });

    // Add filters if any
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    // Make API call
    const response = await fetch(`/api/trips?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch trips:", error);
    
    // If API call fails, fall back to mock data
    console.warn("Falling back to mock data");
    const mockTrips = generateMockTrips(limit);
    
    return {
      data: mockTrips,
      pagination: {
        page,
        limit,
        total: mockTrips.length,
        totalPages: 1
      }
    };
  }
};

// API function to fetch a single trip by ID
export const fetchTripById = async (tripId: string): Promise<Trip | null> => {
  try {
    const response = await fetch(`/api/trips/${tripId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch trip ${tripId}:`, error);
    return null;
  }
};

// Seed trip data
export const seedTripData = async (): Promise<{ message: string, count?: number }> => {
  try {
    const response = await fetch('/api/trips/seed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to seed trip data:", error);
    return { message: "Failed to seed trip data" };
  }
};

// Create helper function to generate mock trips (for fallback)
export function generateMockTrips(count: number): Trip[] {
  const statuses: Trip["status"][] = ["Active", "Completed", "Delayed", "Cancelled", "Manually Closed"];
  const routeTypes = ["Pick", "Delivery", "Transfer", "Return"];
  const vehicleStatuses = ["Moving", "Stopped", "Parked"];

  // Generate trips similar to the original code
  // This is just a fallback in case the API call fails
  return Array.from({ length: count }, (_, i) => ({
    id: `trip${i + 100}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    routeId: `route${i + 100}`,
    routeName: `Route ${String.fromCharCode(65 + (i % 26))} to ${String.fromCharCode(90 - (i % 26))}`,
    routeType: routeTypes[Math.floor(Math.random() * routeTypes.length)],
    startTime: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(), // Within last week
    endTime: new Date(Date.now() + Math.random() * 86400000 * 3).toISOString(), // Within next 3 days
    driverName: `Driver ${i + 1}`,
    driverMobile: `+91 98765${43210 + i}`,
    driverDetails: `License: DL${123456 + i}`,
    location: `Location ${i + 1}, Tamil Nadu`,
    locationDateTime: new Date(Date.now() - Math.random() * 3600000 * 12).toISOString(), // Within last 12 hours
    shipmentId: `SH${12345 + i}`,
    vehicleName: `TN${10 + i}X${5000 + i}`,
    vehicleStatus: vehicleStatuses[Math.floor(Math.random() * vehicleStatuses.length)],
    statusDuration: `${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60)}:${Math.floor(Math.random() * 60)}`,
    totalDetentionTime: `0${Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60)}:00`,
    totalStoppageTime: `0${Math.floor(Math.random() * 3)}:${Math.floor(Math.random() * 60)}:00`,
    totalDriveTime: `${Math.floor(Math.random() * 20)}:${Math.floor(Math.random() * 60)}:${Math.floor(Math.random() * 60)}`,
    domainName: "logistics.com",
    equipmentId: `EQ${12345 + i}`,
    coordinates: [
      12.9716 + (Math.random() - 0.5) * 0.5, 
      77.5946 + (Math.random() - 0.5) * 0.5
    ] as [number, number],
    stops: Array.from({ length: 2 + Math.floor(Math.random() * 3) }, (_, j) => ({
      point: j + 1,
      name: `Stop ${j + 1} for Trip ${i + 100}`,
      status: j < 2 ? "Completed" : (Math.random() > 0.5 ? "Pending" : "In Progress"),
      locationId: `loc${i * 10 + j}`,
      stopType: j === 0 ? "Pickup" : "Delivery",
      plannedTime: new Date(Date.now() + j * 7200000).toISOString(),
      eta: new Date(Date.now() + j * 7200000 - 600000).toISOString(),
      actualSequence: j + 1,
      entryTime: (j < 2 ? new Date(Date.now() - (3 - j) * 3600000).toISOString() : ""),
      exitTime: (j < 2 ? new Date(Date.now() - (3 - j) * 3600000 + 1200000).toISOString() : ""),
      detentionTime: (j < 2 ? "00:20:00" : "")
    }))
  }));
}
