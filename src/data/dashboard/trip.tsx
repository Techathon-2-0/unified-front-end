import type {
  TripApi,
  AlertResponse,
  IntutrackData,
} from "../../types/dashboard/trip_type"
import axios from "axios"

export async function fetchTrips(
  userId: string,
  filters?: {
    status?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  },
) {
  if (!userId) {
    return []
  }

  try {
    const params = new URLSearchParams()

    // Set default values if no filters provided
    const status = filters?.status || "active"
    const page = filters?.page || 1
    const limit = filters?.limit || 100

    // Set default date range (last 7 days)
    const endDate = filters?.endDate || new Date().toISOString().split("T")[0]
    const startDate = filters?.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    params.append("status", status)
    params.append("startDate", startDate)
    params.append("endDate", endDate)
    params.append("page", page.toString())
    params.append("limit", limit.toString())

    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/trip/v1/${userId}?${params}`)

    if (res.data && res.data.data) {
      return res.data.data as TripApi[]
    } else {
      throw new Error("Invalid response structure")
    }
  } catch (error) {
    console.error("Error fetching trips:", error)
    return []
  }
}

export async function fetchAlertsByShipment(shipmentId: string): Promise<AlertResponse> {
  try {
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/alerts/shipment/${shipmentId}`)
    return res.data
  } catch (error) {
    console.error("Error fetching alerts:", error)
    throw error
  }
}

export async function toggleAlertStatus(alertId: number, shipmentId: string): Promise<any> {
  try {
    const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/alerts/${alertId}`, {
      status: 2,
      shipmentId: shipmentId,
    })
    return res.data
  } catch (error) {
    console.error("Error toggling alert status:", error)
    throw error
  }
}

export async function fetchIntutrackData(shipmentId: string): Promise<IntutrackData> {
  try {
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/intutrack/db?shipment_id=${shipmentId}`)
    return res.data.data
  } catch (error) {
    console.error("Error fetching intutrack data:", error)
    throw error
  }
}

export async function refreshIntutrackData(shipmentId: string): Promise<IntutrackData> {
  try {
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/intutrack/refresh?shipment_id=${shipmentId}`)
    return res.data.data
  } catch (error) {
    console.error("Error refreshing intutrack data:", error)
    throw error
  }
}

// Legacy function for backward compatibility
export async function generateMockTrips(userId: string) {
  return fetchTrips(userId)
}
