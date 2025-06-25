import axios from "axios"
import type { Responsibility, ResponsibilityOperation } from "../../types/usermanage/responsibilty_type"

// Available reports list
export const availableReports = [
  //"Trip wise alarm report",
  "Stops By Day report",
  //"Movement report",
  //"Fleet Summary report",
  "Trip Summary Report",
  //"Geofence Out In report",
  //"Geofence In Out report",
  //"Drives",
  "Dashboard",
  //"Daily Summary",
  "Communication status report",
  "Alarm Log",
]

// Initial empty state - will be populated by API call
export let initialResponsibilities: Responsibility[] = []

// Single operation data for backend calls
export let pendingOperation: ResponsibilityOperation | null = null

// Utility function to format date in IST
// const formatDateIST = (date: Date) => {
//   return new Intl.DateTimeFormat("en-IN", {
//     timeZone: "Asia/Kolkata",
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//     hour12: false,
//   })
//     .format(date)
//     .replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})/, "$1-$2-$3 $4:$5:$6")
// }

// Function to fetch initial roles data
export const fetchRoles = async (): Promise<Responsibility[]> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/roles`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
    const roles = response.data.roles
    initialResponsibilities = roles
    console.log("Fetched roles successfully:", roles)
    return roles
  } catch (error) {
    console.error("Error fetching roles:", error)
    throw error
  }
}

// Functions to handle backend operations
export const createResponsibility = async (responsibility: Responsibility): Promise<Responsibility> => {
  try {
    // Add IST timestamp for created_at
    const responsibilityWithTimestamp = {
      ...responsibility,
    }

    pendingOperation = {
      type: "create",
      data: responsibilityWithTimestamp,
    }

    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/role`,
      responsibilityWithTimestamp,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
    console.log("Create operation successful:", response.data)
    return response.data
  } catch (error) {
    console.error("Create operation failed:", error)
    throw error
  }
}

export const updateResponsibility = async (responsibility: Responsibility): Promise<Responsibility> => {
  try {
    // Add IST timestamp for updated_at
    const responsibilityWithTimestamp = {
      ...responsibility,
    }

    pendingOperation = {
      type: "update",
      data: responsibilityWithTimestamp,
    }
    console.log("Updating responsibility with data:", responsibilityWithTimestamp)
    const response = await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/role`,
      responsibilityWithTimestamp,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
    return response.data
  } catch (error) {
    console.error("Update operation failed:", error)
    throw error
  }
}

export const deleteResponsibility = async (id: number): Promise<void> => {
  try {
    pendingOperation = {
      type: "delete",
      data: { id },
    }

    await axios.delete(
      `${import.meta.env.VITE_BACKEND_URL}/role/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
    console.log("Delete operation successful for ID:", id)
  } catch (error) {
    console.error("Delete operation failed:", error)
    throw error
  }
}

// Fetch roles by user ID
export const fetchRolesByUserId = async (userId: number): Promise<Responsibility[]> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/roles/user/${userId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    );
    const roles = response.data.roles;
    return roles;
  } catch (error) {
    console.error("Error fetching roles by user ID:", error);
    throw error;
  }
}

// Keep roles array for backward compatibility - will be populated by API
export const roles = initialResponsibilities.map((responsibility) => responsibility.role_name)
