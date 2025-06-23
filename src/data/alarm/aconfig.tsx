import axios from "axios"
import type { Alarm } from "../../types/alarm/aconfig_type"

// Mock data for alarms (will be replaced with API data)
export const mockAlarms: Alarm[] = []

// Fetch all alarms from the API with related data
export const fetchAlarms = async (): Promise<Alarm[]> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/alarm`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
    const alarms = response.data.data || []

    // Fetch detailed data for each alarm including related groups, emails, and phone numbers
    const detailedAlarms = await Promise.all(
      alarms.map(async (alarm: any) => {
        try {
          // Fetch detailed alarm data with relations
          const detailResponse = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/alarm/${alarm.id}`,
            {
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
              },
            }
          )
          const detailData = detailResponse.data.data || alarm

          return {
            id: alarm.id?.toString() || "",
            type: getAlarmTypeFromId(alarm.alarm_type_id || 1),
            severityType: alarm.alarm_category || "General",
            description: alarm.descrption || "",
            assignedTo: getAssignedToString(detailData),
            createdOn: alarm.created_at || new Date().toISOString(),
            updatedOn: alarm.updated_at || null,
            alarmGeneration: alarm.alarm_generation ? "Always" : "Conditional",
            enableGeofence: alarm.alarm_type_id === 6, // 6 is for Geofence (1-based)
            thresholdValue: alarm.alarm_value?.toString() || "0",
            status: alarm.alarm_status ? "Active" : "Inactive",
            restDuration: alarm.rest_duration || 0,
            geofenceStatus:
              alarm.geofence_status === 1
                ? "In"
                : alarm.geofence_status === 0
                ? "Out"
                : alarm.geofence_status === 2
                ? "Both"
                : "Out",
            activeTrip: Boolean(alarm.active_trip),
            activeStartTimeRange: alarm.active_start_time_range || "",
            activeEndTimeRange: alarm.active_end_time_range || "",
            vehicleGroups: detailData.vehicleGroups?.map((g: any) => g.vehicle_group_id) || [],
            customerGroups: detailData.customerGroups?.map((g: any) => g.customer_group_id) || [],
            geofenceGroups: detailData.geofenceGroups?.map((g: any) => g.geofence_group_id) || [],
            emails: detailData.emails?.map((e: any) => e.email_address) || [],
            phoneNumbers: detailData.phoneNumbers?.map((p: any) => p.phone_number) || [],
          }
        } catch (error) {
          // console.error(Error `fetching details for alarm ${alarm.id}:`, error)
          // Return basic alarm data if detail fetch fails
          return {
            id: alarm.id?.toString() || "",
            type: getAlarmTypeFromId(alarm.alarm_type_id || 1),
            severityType: alarm.alarm_category || "General",
            description: alarm.descrption || "",
            assignedTo: "None",
            createdOn: alarm.created_at || new Date().toISOString(),
            updatedOn: alarm.updated_at || null,
            alarmGeneration: alarm.alarm_generation ? "Always" : "Conditional",
            enableGeofence: alarm.alarm_type_id === 6,
            thresholdValue: alarm.alarm_value?.toString() || "0",
            status: alarm.alarm_status ? "Active" : "Inactive",
            restDuration: alarm.rest_duration || 0,
            geofenceStatus:
              alarm.geofence_status === 1
                ? "In"
                : alarm.geofence_status === 0
                ? "Out"
                : alarm.geofence_status === 2
                ? "Both"
                : "Out",
            activeTrip: Boolean(alarm.active_trip),
            activeStartTimeRange: alarm.active_start_time_range || "",
            activeEndTimeRange: alarm.active_end_time_range || "",
            vehicleGroups: [],
            customerGroups: [],
            geofenceGroups: [],
            emails: [],
            phoneNumbers: [],
          }
        }
      }),
    )

    return detailedAlarms
  } catch (error) {
    console.error("Error fetching alarms:", error)
    throw error
  }
}

// Helper function to get alarm type name from ID (1-based mapping)
const getAlarmTypeFromId = (id: number): string => {
  const types = [
    "Stoppage", // 1
    "Overspeeding", // 2
    "Continuous Driving", // 3
    "No GPS Feed", // 4
    "Reached Stop", // 5
    "Geofence", // 6
    "Route Deviation", // 7
  ]
  return types[id - 1] || "Unknown"
}

// Helper function to get alarm type ID from name (1-based mapping)
const getAlarmTypeId = (typeName: string): number => {
  const types = [
    "Stoppage", // 1
    "Overspeeding", // 2
    "Continuous Driving", // 3
    "No GPS Feed", // 4
    "Reached Stop", // 5
    "Geofence", // 6
    "Route Deviation", // 7
  ]
  const index = types.findIndex((type) => type.toLowerCase() === typeName.toLowerCase())
  return index !== -1 ? index + 1 : 1 // Default to 1 (Stoppage) if not found
}

// Helper function to get assigned to string
const getAssignedToString = (alarm: any): string => {
  const groups = []
  if (alarm.vehicleGroups?.length) groups.push(`${alarm.vehicleGroups.length} Vehicle Groups`)
  if (alarm.customerGroups?.length) groups.push(`${alarm.customerGroups.length} Customer Groups`)
  if (alarm.geofenceGroups?.length) groups.push(`${alarm.geofenceGroups.length} Geofence Groups`)

  return groups.length ? groups.join(", ") : "None"
}

// Create a new alarm
export const createAlarm = async (alarmData: Partial<Alarm>): Promise<any> => {
  try {
    // Transform frontend data to backend format
    const backendData = {
      alarm_type_id: getAlarmTypeId(alarmData.type || "Stoppage"),
      alarm_category: alarmData.severityType || "General",
      alarm_value:
        alarmData.thresholdValue !== undefined && alarmData.thresholdValue !== ""
          ? Number(alarmData.thresholdValue)
          : 0,
      rest_duration: alarmData.type === "Continuous Driving" ? alarmData.restDuration || 0 : null,
      geofence_status:
        alarmData.type === "Geofence" && alarmData.geofenceStatus
          ? alarmData.geofenceStatus === "In"
            ? 1
            : alarmData.geofenceStatus === "Out"
            ? 0
            : alarmData.geofenceStatus === "Both"
            ? 2
            : null
          : null,
      alarm_generation: alarmData.alarmGeneration === "Always",
      active_start_time_range: alarmData.activeStartTimeRange || "",
      active_end_time_range: alarmData.activeEndTimeRange || "",
      active_trip: Boolean(alarmData.activeTrip),
      alarm_status: alarmData.status === "Active",
      descrption: alarmData.description || "",
      vehicleGroups: Array.isArray(alarmData.vehicleGroups) ? alarmData.vehicleGroups : [],
      customerGroups: Array.isArray(alarmData.customerGroups) ? alarmData.customerGroups : [],
      geofenceGroups: Array.isArray(alarmData.geofenceGroups) ? alarmData.geofenceGroups : [],
      emails: Array.isArray(alarmData.emails)
        ? alarmData.emails
            .filter((email) => typeof email === "string" && email.trim())
            .map((email) => email.replace(/['"]/g, '').trim()) // Remove both single and double quotes
        : [],
      phoneNumbers: Array.isArray(alarmData.phoneNumbers)
        ? alarmData.phoneNumbers
            .filter((phone) => typeof phone === "string" && phone.trim())
            .map((phone) => phone.replace(/['"]/g, '').trim()) // Remove both single and double quotes
        : [],
    }

    // Additional logging to see the exact format
    console.log("Creating alarm with data:", backendData)
    console.log("Emails array:", JSON.stringify(backendData.emails))
    console.log("Phone numbers array:", JSON.stringify(backendData.phoneNumbers))

    // Ensure at least one vehicle group is included
    if (!backendData.vehicleGroups || backendData.vehicleGroups.length === 0) {
      throw new Error("At least one vehicle group is required")
    }

    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/alarm`,
      backendData,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
    
    return response.data

  } catch (error) {
    console.error("Error creating alarm:", error)
    throw error
  }
}

// Update an existing alarm
export const updateAlarm = async (id: string, alarmData: Partial<Alarm>): Promise<any> => {
  try {
    // Transform frontend data to backend format
    const backendData = {
      alarm_type_id: getAlarmTypeId(alarmData.type || "Stoppage"),
      alarm_category: alarmData.severityType || "General",
      alarm_value:
        alarmData.thresholdValue !== undefined && alarmData.thresholdValue !== ""
          ? Number(alarmData.thresholdValue)
          : 0,
      rest_duration: alarmData.type === "Continuous Driving" ? alarmData.restDuration || 0 : null,
      geofence_status:
        alarmData.type === "Geofence" && alarmData.geofenceStatus
          ? alarmData.geofenceStatus === "In"
            ? 1
            : alarmData.geofenceStatus === "Out"
            ? 0
            : alarmData.geofenceStatus === "Both"
            ? 2
            : null
          : null,
      alarm_generation: alarmData.alarmGeneration === "Always",
      active_start_time_range: alarmData.activeStartTimeRange || "",
      active_end_time_range: alarmData.activeEndTimeRange || "",
      active_trip: Boolean(alarmData.activeTrip),
      alarm_status: alarmData.status === "Active",
      descrption: alarmData.description || "",
      vehicleGroups: Array.isArray(alarmData.vehicleGroups) ? alarmData.vehicleGroups : [],
      customerGroups: Array.isArray(alarmData.customerGroups) ? alarmData.customerGroups : [],
      geofenceGroups: Array.isArray(alarmData.geofenceGroups) ? alarmData.geofenceGroups : [],
      emails: Array.isArray(alarmData.emails)
        ? alarmData.emails
            .filter((email) => typeof email === "string" && email.trim())
            .map((email) => email.replace(/['"]/g, '').trim()) // Remove both single and double quotes
        : [],
      phoneNumbers: Array.isArray(alarmData.phoneNumbers)
        ? alarmData.phoneNumbers
            .filter((phone) => typeof phone === "string" && phone.trim())
            .map((phone) => phone.replace(/['"]/g, '').trim()) // Remove both single and double quotes
        : [],
    }

    // Additional logging to see the exact format
    console.log("Updating alarm with data:", backendData)
    console.log("Emails array:", JSON.stringify(backendData.emails))
    console.log("Phone numbers array:", JSON.stringify(backendData.phoneNumbers))

    // Ensure at least one vehicle group is included
    if (!backendData.vehicleGroups || backendData.vehicleGroups.length === 0) {
      throw new Error("At least one vehicle group is required")
    }

    const response = await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/alarm/${id}`,
      backendData,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
    return response.data
  } catch (error) {
    console.error("Error updating alarm:", error)
    throw error
  }
}

// Delete an alarm
export const deleteAlarm = async (id: string): Promise<any> => {
  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_BACKEND_URL}/alarm/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
    return response.data
  } catch (error) {
    console.error("Error deleting alarm:", error)
    throw error
  }
}

// Import functions from other files to use in this component
import { fetchGroups } from "../manage/group"
import { fetchGeofenceGroups } from "../geofence/ggroup"
import { fetchCustomerGroups } from "../manage/customergroup"
import { fetchUsers } from "../usermanage/user"

export { fetchGroups, fetchGeofenceGroups, fetchCustomerGroups, fetchUsers }