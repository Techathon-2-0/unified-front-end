import axios from "axios"
import type { GeofenceGroup} from "../../types/geofence/ggroup_type"
//import type { Geofence } from "../../types/geofence/gconfig"

// Fetch all geofence groups
export const fetchGeofenceGroups = async (): Promise<GeofenceGroup[]> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/geofence-group`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
    const groups = response.data.data || []

    return groups.map((group: any) => ({
      id: typeof group.id === "object" ? group.id.id : group.id,
      geo_group: group.geo_group,
      geofenceIds: group.geofences?.map((g: any) => g.id) || [],
      created_at: group.created_at,
      updated_at: group.updated_at,
      geofences: group.geofences || [],
    }))
  } catch (error) {
    console.error("Error fetching geofence groups:", error)
    throw error
  }
}

// Create new geofence group
export const createGeofenceGroup = async (data: {
  geo_group: string
  geofenceIds: number[]
}): Promise<GeofenceGroup> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/geofence-group`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
    const group = response.data.data

    return {
      id: typeof group.id === "object" ? group.id.id : group.id,
      geo_group: group.geo_group,
      geofenceIds: group.geofences?.map((g: any) => g.id) || [],
      created_at: group.created_at,
      updated_at: group.updated_at,
      geofences: group.geofences || [],
    }
  } catch (error) {
    console.error("Error creating geofence group:", error)
    throw error
  }
}

// Update geofence group
export const updateGeofenceGroup = async (
  id: number,
  data: { geo_group?: string; geofenceIds?: number[] },
): Promise<GeofenceGroup> => {
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/geofence-group/${id}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
    const group = response.data.data

    return {
      id: typeof group.id === "object" ? group.id.id : group.id,
      geo_group: group.geo_group,
      geofenceIds: group.geofences?.map((g: any) => g.id) || [],
      created_at: group.created_at,
      updated_at: group.updated_at,
      geofences: group.geofences || [],
    }
  } catch (error) {
    console.error("Error updating geofence group:", error)
    throw error
  }
}

// Delete geofence group
export const deleteGeofenceGroup = async (id: number): Promise<void> => {
  try {
    await axios.delete(
      `${import.meta.env.VITE_BACKEND_URL}/geofence-group/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
  } catch (error) {
    console.error("Error deleting geofence group:", error)
    throw error
  }
}

// Search geofence groups
export const searchGeofenceGroups = async (query: string): Promise<GeofenceGroup[]> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/geofence-group`,
      {
        params: { query },
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
    const groups = response.data.data || []

    return groups.map((group: any) => ({
      id: typeof group.id === "object" ? group.id.id : group.id,
      geo_group: group.geo_group,
      geofenceIds: group.geofences?.map((g: any) => g.id) || [],
      created_at: group.created_at,
      updated_at: group.updated_at,
      geofences: group.geofences || [],
    }))
  } catch (error) {
    console.error("Error searching geofence groups:", error)
    throw error
  }
}

// Fetch all geofences
// export const fetchAllGeofences = async (): Promise<Geofence[]> => {
//   try {
//     const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/geofence/all`)
//     const geofences = response.data.data || []

//     return geofences.map((geofence: any) => ({
//       id: geofence.id,
//       geofence_name: geofence.geofence_name,
//       latitude: geofence.latitude,
//       longitude: geofence.longitude,
//       location_id: geofence.location_id,
//       tag: geofence.tag,
//       stop_type: geofence.stop_type,
//       geofence_type: geofence.geofence_type,
//       radius: geofence.radius || 0,
//       status: geofence.status,
//       created_at: geofence.created_at,
//       updated_at: geofence.updated_at,
//     }))
//   } catch (error) {
//     console.error("Error fetching geofences:", error)
//     throw error
//   }
// }

// Helper function to get geofence type name
export const getGeofenceTypeName = (type: number): string => {
  switch (type) {
    case 0:
      return "Circle"
    case 1:
      return "Pointer"
    case 2:
      return "Polygon"
    default:
      return "Unknown"
  }
}


