import axios from "axios"
import type { VehicleTrailResponse, TripTrailResponse } from "../../types/trail/trail_type"

// Fetch Vehicle Trail Data
export const fetchVehicleTrail = async (
  vehicleNumber: string,
  startTime: string,
  endTime: string,
): Promise<VehicleTrailResponse | null> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/trail/vehicle/${vehicleNumber}`,
      {
        params: {
          startTime,
          endTime,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      },
    )

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
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/trail/trip/${shipmentId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      },
    )

    console.log("Trip Trail Response:", response.data)

    return response.data
  } catch (error) {
    console.error("Error fetching trip trail:", error)
    throw error
  }
}
