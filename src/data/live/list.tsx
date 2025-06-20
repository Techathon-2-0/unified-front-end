import type { Vehicle, RegistrationDbResponse } from "../../types/live/list_type"
import axios from "axios"


// Mock data for the vehicles
export const mockVehicles: Vehicle[] = []

// Function to simulate API call to fetch vehicles
export async function fetchVehicles(userId: string) {
  // Simulate API delay
  const res = await axios.post(
    `${import.meta.env.VITE_BACKEND_URL}/live/${userId}`,
    {
      groups: []
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
      },
    }
  );

  console.log("Fetched vehicles:", res.data.message)

  return res.data.message as Vehicle[];
}


// New function for fetching registration details from database
export const fetchRegistrationFromDb = async (vehicleNumber: string): Promise<RegistrationDbResponse> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/vahn/${vehicleNumber}`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )


    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    console.log("Registration data from database:", response.data)
    return response.data.data
  } catch (error) {
    console.error("Error fetching registration data from database:", error)
    if (axios.isAxiosError(error)) {
      if (error.response) {
        if (error.response.status === 404) {
          throw new Error("Registration data not found in database")
        }
        throw new Error(`API Error: ${error.response.data?.message || error.response.statusText}`)
      } else if (error.request) {
        throw new Error("Network error: Unable to reach the server")
      }
    }
    throw new Error("Failed to fetch registration data from database")
  }
}

// New function for refreshing registration details (API call + save to DB)
export const refreshRegistrationDetails = async (vehicleNumber: string): Promise<RegistrationDbResponse> => {
  try {
    // Call the API to get fresh data and save to DB
    const apiResponse = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/vahn`,
      {
        vehiclenumber: vehicleNumber,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      },
    )

    if (apiResponse.status !== 200) {
      throw new Error(`HTTP error! status: ${apiResponse.status}`)
    }

    console.log("API response:", apiResponse.data)
    

    // // Then fetch the updated data from the database
    // const dbResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/vahn/${vehicleNumber}`, {
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // })

    // if (dbResponse.status !== 200) {
    //   throw new Error(`HTTP error! status: ${dbResponse.status}`)
    // }

    // console.log("db response JSON:", dbResponse.data)
    // return dbResponse.data
    return apiResponse.data.json

  } catch (error) {
    console.error("Error refreshing registration details:", error)
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(`API Error: ${error.response.data?.message || error.response.statusText}`)
      } else if (error.request) {
        throw new Error("Network error: Unable to reach the server")
      }
    }
    throw new Error("Failed to refresh registration details")
  }
}