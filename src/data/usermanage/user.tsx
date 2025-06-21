import axios from "axios"
import type { User } from "../../types/usermanage/user_type"
import { fetchGroups } from "../manage/group"
import { fetchRoles } from "./responsibility"
import { fetchGeofenceGroups } from "../geofence/ggroup"
import { fetchCustomerGroups } from "../manage/customergroup"

// Initial data - will be replaced with API data
export let initialUsers: User[] = []

// User type options
export const userTypeOptions = ["Driver", "Customer", "Consignee", "Consignor", "Attendant"]

// Tag options
// export const tagOptions = ["VIP", "Priority", "Regular", "New"]

// Fetch all users from the API
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user`,{
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
      },
    })
    const users = response.data.data || []

    // Transform backend data to match our frontend User interface
    initialUsers = users.map((user: any) => ({
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      username: user.username,
      password: "", // We don't receive password from backend for security
      active: user.active,
      role: user.roles,
      tag: user.tag || "",
      userTypes: user.usertypes || [],
      vehicleGroups: user.vehiclegrp || [],
      geofenceGroups: user.geofencegrp || [],
      customerGroups: user.customergrp || [],
    }))

    return initialUsers
  } catch (error) {
    console.error("Error fetching users:", error)
    throw error
  }
}

// Create a new user
export const createUser = async (user: User): Promise<User> => {
  console.log("Creating user with data:", user)
  try {
    // Transform frontend User to match backend API expectations
    
    const userData = {
      name: user.name,
      phone: user.phone,
      username: user.username,
      email: user.email,
      password: user.password,
      roles: user.role,
      tag: user.tag,
      usertypes: user.userTypes,
      vehiclegroup: user.vehicleGroups,
      geofencegroup: user.geofenceGroups,
      custgrp: user.customerGroups,
    }

    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/user`,
      userData,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
    console.log("Response from server:", response)
    if (response.data && response.data.data) {
      // Transform the response back to our User interface
      const newUser: User = {
        id: response.data.data.userId,
        name: response.data.data.name,
        phone: response.data.data.phone,
        email: response.data.data.email,
        username: response.data.data.username,
        password: "", // We don't store the password in frontend
        active: true, // New users are active by default
        role: response.data.data.roles,
        tag: response.data.data.tag || "",
        userTypes: response.data.data.usertypes || [],
        vehicleGroups: response.data.data.vehiclegrp || [],
        geofenceGroups: response.data.data.geofencegrp || [],
        customerGroups: response.data.data.custgrp || [],
      }

      // Update our local cache
      initialUsers = [...initialUsers, newUser]

      return newUser
    } else {
      throw new Error("Invalid response from server")
    }
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

// Update an existing user
export const updateUser = async (user: User): Promise<User> => {
  try {
    // Transform frontend User to match backend API expectations
    const userData = {
      name: user.name,
      phone: user.phone,
      username: user.username,
      email: user.email,
      roles: user.role,
      tag: user.tag,
      usertypes: user.userTypes,
      vehiclegroup: user.vehicleGroups,
      geofencegroup: user.geofenceGroups,
      custgrp: user.customerGroups,
      active: user.active,
    }

    const response = await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/user/${user.id}`,
      userData,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )

    if (response.data && response.data.data) {
      // Transform the response back to our User interface
      const updatedUser: User = {
        ...user,
        name: response.data.data.name,
        phone: response.data.data.phone,
        email: response.data.data.email,
        username: response.data.data.username,
        role: response.data.data.roles,
        tag: response.data.data.tag || "",
        userTypes: response.data.data.usertypes || [],
        vehicleGroups: response.data.data.vehiclegrp || [],
        geofenceGroups: response.data.data.geofencegrp || [],
        customerGroups: response.data.data.custgrp || [],
      }

      // Update our local cache
      initialUsers = initialUsers.map((u) => (u.id === user.id ? updatedUser : u))

      return updatedUser
    } else {
      throw new Error("Invalid response from server")
    }
  } catch (error) {
    console.error("Error updating user:", error)
    throw error
  }
}

// Delete a user
export const deleteUser = async (id: number) => {
  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_BACKEND_URL}/user/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )

    // Update our local cache
    initialUsers = initialUsers.filter((user) => user.id !== id)

    // Return the full response data
    return response.data
  } catch (error) {
    console.error("Error deleting user:", error)
    throw error
  }
}

// Search users
export const searchUsers = async (query: string): Promise<User[]> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/user?searchTerm=${query}`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
    const users = response.data.data || []

    // Transform backend data to match our frontend User interface
    const searchResults = users.map((user: any) => ({
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      username: user.username,
      password: "", // We don't receive password from backend for security
      active: user.active,
      role: user.roles,
      tag: user.tag || "",
      userTypes: user.usertypes || [],
      vehicleGroups: user.vehiclegrp || [],
      geofenceGroups: user.geofencegrp || [],
      customerGroups: user.customergrp || [],
    }))

    return searchResults
  } catch (error) {
    console.error("Error searching users:", error)
    throw error
  }
}

// Fetch vehicle groups, geofence groups, customer groups, and roles
export const fetchUserRelatedData = async () => {
  try {
    // Fetch all required data in parallel
    const [vehicleGroupsData, geofenceGroupsData, customerGroupsData, rolesData] = await Promise.all([
      fetchGroups(),
      fetchGeofenceGroups(),
      fetchCustomerGroups(),
      fetchRoles(),
    ])

    return {
      vehicleGroups: vehicleGroupsData.map((group) => group.name),
      geofenceGroups: geofenceGroupsData.map((group) => group.geo_group),
      customerGroups: customerGroupsData.map((group) => group.group_name),
      roles: rolesData.map((role) => role.role_name),
    }
  } catch (error) {
    console.error("Error fetching user related data:", error)
    throw error
  }
}

// Fetch geofence groups
// export const fetchGeofenceGroups = async () => {
//   try {
//     const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/geofence/group`)
//     return response.data.data || []
//   } catch (error) {
//     console.error("Error fetching geofence groups:", error)
//     throw error
//   }
// }

// // Fetch customer groups
// export const fetchCustomerGroups = async () => {
//   try {
//     const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/customer-group`)
//     return response.data.data || []
//   } catch (error) {
//     console.error("Error fetching customer groups:", error)
//     throw error
//   }
// }
