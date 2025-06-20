import axios from "axios"

// API Functions
export const fetchGeofences = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/geofence/all`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
    return response.data.data.map(transformBackendToFrontend)
  } catch (error) {
    console.error("Error fetching geofences:", error)
    throw error
  }
}

export const createGeofence = async (geofenceData: any) => {
  try {
    const backendData = transformFrontendToBackend(geofenceData)
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/geofence`,
      backendData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
    return transformBackendToFrontend(response.data.data)
  } catch (error) {
    console.error("Error creating geofence:", error)
    throw error
  }
}

export const updateGeofence = async (id: number, geofenceData: any) => {
  try {
    const backendData = transformFrontendToBackend(geofenceData)
    const response = await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/geofence/${id}`,
      backendData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
    return transformBackendToFrontend(response.data.data)
  } catch (error) {
    console.error("Error updating geofence:", error)
    throw error
  }
}

export const deleteGeofence = async (id: number) => {
  try {
    await axios.delete(
      `${import.meta.env.VITE_BACKEND_URL}/geofence/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
    return { id }
  } catch (error) {
    console.error("Error deleting geofence:", error)
    throw error
  }
}

export const searchGeofences = async (query: string) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/geofence/all?query=${encodeURIComponent(query)}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
    return response.data.data.map(transformBackendToFrontend)
  } catch (error) {
    console.error("Error searching geofences:", error)
    throw error
  }
}

// Transform functions
const transformBackendToFrontend = (backendGeofence: any) => {
  const geofenceTypeMap = {
    0: "circle",
    1: "pointer",
    2: "polygon",
  }

  let polygonPoints = []
  if (backendGeofence.polygon_points && Array.isArray(backendGeofence.polygon_points)) {
    polygonPoints = backendGeofence.polygon_points
      .sort((a: any, b: any) => a.corner_points - b.corner_points)
      .map((point: any) => ({
        lat: point.latitude,
        lng: point.longitude,
      }))
  }

  return {
    id: backendGeofence.id,
    geofence_name: backendGeofence.geofence_name,
    name: backendGeofence.geofence_name,
    type: geofenceTypeMap[backendGeofence.geofence_type as keyof typeof geofenceTypeMap] || "circle",
    geofence_type: backendGeofence.geofence_type,
    radius: backendGeofence.radius || 0,
    coordinates: {
      lat: backendGeofence.latitude,
      lng: backendGeofence.longitude,
    },
    latitude: backendGeofence.latitude,
    longitude: backendGeofence.longitude,
    location_id: backendGeofence.location_id,
    locationId: backendGeofence.location_id,
    tag: backendGeofence.tag,
    stop_type: backendGeofence.stop_type,
    stopType: backendGeofence.stop_type,
    status: backendGeofence.status,
    created_at: backendGeofence.created_at,
    createdAt: backendGeofence.created_at,
    updated_at: backendGeofence.updated_at,
    updatedAt: backendGeofence.updated_at,
    polygonPoints: polygonPoints,
    polygon_points: backendGeofence.polygon_points,
    address: backendGeofence.address || "", // Include address from backend
    time: backendGeofence.time || "", // Include time if available
  }
}

const transformFrontendToBackend = (frontendGeofence: any) => {
  const typeMap = {
    circle: 0,
    pointer: 1,
    polygon: 2,
  }

  const backendData: any = {
    geofence_name: frontendGeofence.name || frontendGeofence.geofence_name,
    latitude: frontendGeofence.coordinates?.lat || frontendGeofence.latitude,
    longitude: frontendGeofence.coordinates?.lng || frontendGeofence.longitude,
    location_id: frontendGeofence.locationId || frontendGeofence.location_id || "",
    tag: frontendGeofence.tag || "tms_api",
    stop_type: frontendGeofence.stopType || frontendGeofence.stop_type || "",
    geofence_type: typeMap[frontendGeofence.type as keyof typeof typeMap] || 0,
    status: frontendGeofence.status !== undefined ? frontendGeofence.status : true,
    address: frontendGeofence.address || "", // Include address in backend data
    time: frontendGeofence.time || "", // Include time if available
  }

  // Add radius for circle type
  if (frontendGeofence.type === "circle" && frontendGeofence.radius) {
    backendData.radius = frontendGeofence.radius
  }

  // Add polygon points for polygon type
  if (frontendGeofence.type === "polygon" && frontendGeofence.polygonPoints) {
    backendData.polygon_points = frontendGeofence.polygonPoints.map((point: any) => ({
      latitude: point.lat,
      longitude: point.lng,
    }))
  }

  return backendData
}

// Keep initial data for fallback
// export const initialGeofenceData = []


// By USER ID

export const fetchGeofencesbyuserid = async (userId : String) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/geofence/user/${userId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
    // Use response.data directly, since it's an array
    return response.data.map(transformBackendToFrontend)
  } catch (error) {
    console.error("Error fetching geofences:", error)
    throw error
  }
}