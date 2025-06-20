import axios from "axios"
import type { CustomerGroup, Customer } from "../../types/manage/customergroup_type"

// Fetch all customer groups
export const fetchCustomerGroups = async (): Promise<CustomerGroup[]> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/customer-group`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
    const groups = response.data.data || []

    return groups.map((group: any) => ({
      id: group.id,
      group_name: group.group_name,
      customerIds: group.customers ? group.customers.map((customer: any) => customer.id) : [],
      created_at: group.created_at,
      updated_at: group.updated_at,
    }))
  } catch (error) {
    console.error("Error fetching customer groups:", error)
    throw error
  }
}

// Create a new customer group
export const createCustomerGroup = async (customerGroupData: {
  group_name: string
  customerIds: number[]
}): Promise<CustomerGroup> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/customer-group`,
      customerGroupData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
    return response.data.data
  } catch (error) {
    console.error("Error creating customer group:", error)
    throw error
  }
}

// Update an existing customer group
export const updateCustomerGroup = async (
  id: number,
  customerGroupData: {
    group_name?: string
    customerIds?: number[]
  },
): Promise<CustomerGroup> => {
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/customer-group/${id}`,
      customerGroupData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
    return response.data.data
  } catch (error) {
    console.error("Error updating customer group:", error)
    throw error
  }
}

// Delete a customer group
export const deleteCustomerGroup = async (id: number): Promise<void> => {
  try {
    await axios.delete(
      `${import.meta.env.VITE_BACKEND_URL}/customer-group/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
  } catch (error) {
    console.error("Error deleting customer group:", error)
    throw error
  }
}

// Search customer groups
export const searchCustomerGroups = async (query: string): Promise<CustomerGroup[]> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/customer-group`,
      {
        params: { query },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
    const groups = response.data.data || []

    return groups.map((group: any) => ({
      id: group.id,
      group_name: group.group_name,
      customerIds: group.customers ? group.customers.map((customer: any) => customer.id) : [],
      created_at: group.created_at,
      updated_at: group.updated_at,
    }))
  } catch (error) {
    console.error("Error searching customer groups:", error)
    throw error
  }
}

// Fetch all customers
export const fetchCustomers = async (): Promise<Customer[]> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/customer`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
    return response.data.data.data || []
  } catch (error) {
    console.error("Error fetching customers:", error)
    throw error
  }
}

// By USERID

export async function fetchCustomerNames(userId: string): Promise<Customer[]> {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/customer-name-by-user/${userId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
    return res.data.data?.data?.customers || []
  } catch (error) {
    console.error("Error fetching customer names:", error)
    return []
  }
}

export async function fetchCustomerGroupsbyuser(userId: string): Promise<CustomerGroup[]> {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/customer-group-by-user/${userId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
    return res.data.data?.data?.customer_groups || []
  } catch (error) {
    console.error("Error fetching customer groups:", error)
    return []
  }
}



