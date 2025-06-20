import axios from "axios"
import type { Vendor } from "../../types/manage/vendor_type"

// Get all vendors
export const fetchVendors = async (): Promise<Vendor[]> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/vendor`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      },
    )

    // Transform the response to match our frontend Vendor interface
    const vendors: Vendor[] = response.data.data.map((item: any) => ({
      id: item.id,
      name: item.name,
      active: item.status, // Backend uses 'status', frontend uses 'active'
      createdAt: item.created_at || item.createdAt,
      updatedAt: item.updated_at || item.updatedAt,
    }))

    return vendors
  } catch (error) {
    console.error("Error fetching vendors:", error)
    throw error
  }
}

// Create a new vendor
export const createVendor = async (vendorData: Omit<Vendor, "id" | "createdAt" | "updatedAt">): Promise<Vendor> => {
  try {
    const payload = {
      name: vendorData.name,
      status: vendorData.active, // Frontend uses 'active', backend expects 'status'
    }

    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/vendor`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      },
    )

    // Ensure we have complete data by fetching the vendor again if needed
    if (!response.data.data.created_at && !response.data.data.createdAt) {
      const vendorId = response.data.data.id
      const detailedResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/vendor/${vendorId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
          },
        },
      )
      return {
        id: detailedResponse.data.data.id,
        name: detailedResponse.data.data.name,
        active: detailedResponse.data.data.status,
        createdAt: detailedResponse.data.data.created_at || detailedResponse.data.data.createdAt,
        updatedAt: detailedResponse.data.data.updated_at || detailedResponse.data.data.updatedAt,
      }
    }

    // Transform the response to match our frontend Vendor interface
    const createdVendor: Vendor = {
      id: response.data.data.id,
      name: response.data.data.name,
      active: response.data.data.status,
      createdAt: response.data.data.created_at || response.data.data.createdAt,
      updatedAt: response.data.data.updated_at || response.data.data.updatedAt,
    }

    return createdVendor
  } catch (error) {
    console.error("Error creating vendor:", error)
    throw error
  }
}

// Update an existing vendor
export const updateVendor = async (
  id: number,
  vendorData: Partial<Omit<Vendor, "id" | "createdAt" | "updatedAt">>,
): Promise<Vendor> => {
  try {
    const payload = {
      status: vendorData.active, // Frontend uses 'active', backend expects 'status'
    }

    const response = await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/vendor/${id}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      },
    )

    // Transform the response to match our frontend Vendor interface
    const updatedVendor: Vendor = {
      id: response.data.data.id,
      name: response.data.data.name,
      active: response.data.data.status,
      createdAt: response.data.data.created_at || response.data.data.createdAt,
      updatedAt: response.data.data.updated_at || response.data.data.updatedAt,
    }

    return updatedVendor
  } catch (error) {
    console.error("Error updating vendor:", error)
    throw error
  }
}

// Delete a vendor
export const deleteVendor = async (id: number): Promise<void> => {
  try {
    await axios.delete(
      `${import.meta.env.VITE_BACKEND_URL}/vendor/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      },
    )
  } catch (error) {
    console.error("Error deleting vendor:", error)
    throw error
  }
}

// Search vendors
export const searchVendors = async (query: string): Promise<Vendor[]> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/vendor/search`,
      {
        params: { query },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      },
    )

    // Transform the response to match our frontend Vendor interface
    const vendors: Vendor[] = response.data.data.map((item: any) => ({
      id: item.id,
      name: item.name,
      active: item.status,
      createdAt: item.created_at || item.createdAt,
      updatedAt: item.updated_at || item.updatedAt,
    }))

    return vendors
  } catch (error) {
    console.error("Error searching vendors:", error)
    throw error
  }
}

// Initial empty array for vendors (will be populated from API)
export const initialVendors: Vendor[] = []
