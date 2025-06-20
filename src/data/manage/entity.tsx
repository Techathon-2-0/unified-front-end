import axios from "axios"
import type { Entity, Vendor } from "../../types/manage/entity_type"

// Get all entities
export const fetchEntities = async (sortField?: string, sortDirection?: string): Promise<Entity[]> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/entity`,
      {
        params: {
          sortField,
          sortDirection,
        },
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )

    // Transform the response to match our frontend Entity interface
    const entities: Entity[] = response.data.data.map((item: any) => ({
      id: item.id,
      vehicleNumber: item.vehicleNumber,
      vendors: item.vendors || [],
      type: item.type as "Car" | "Truck" | "Excavator",
      status: item.status,
      createdAt: item.createdAt || item.created_at,
      updatedAt: item.updatedAt || item.updated_at,
    }))

    return entities
  } catch (error) {
    console.error("Error fetching entities:", error)
    throw error
  }
}

// Create a new entity
export const createEntity = async (entityData: Omit<Entity, "id" | "createdAt" | "updatedAt">): Promise<Entity> => {
  try {
    // Transform vendors from array of Vendor objects to array of vendor IDs
    const vendorIds = entityData.vendors.map((vendor) => vendor.id)

    // Transform status from boolean to boolean for backend
    const payload = {
      vehicleNumber: entityData.vehicleNumber,
      type: entityData.type,
      status: entityData.status,
      vendorIds: vendorIds,
    }

    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/entity`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )

    // Ensure we have complete data by fetching the entity again if needed
    if (!response.data.data.vendors || !response.data.data.createdAt) {
      const entityId = response.data.data.id
      const detailedResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/entity/${entityId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
          },
        }
      )
      return {
        id: detailedResponse.data.data.id,
        vehicleNumber: detailedResponse.data.data.vehicleNumber,
        vendors: detailedResponse.data.data.vendors || [],
        type: detailedResponse.data.data.type as "Car" | "Truck" | "Excavator",
        status: detailedResponse.data.data.status,
        createdAt: detailedResponse.data.data.createdAt || detailedResponse.data.data.created_at,
        updatedAt: detailedResponse.data.data.updatedAt || detailedResponse.data.data.updated_at,
      }
    }

    // Transform the response to match our frontend Entity interface
    const createdEntity: Entity = {
      id: response.data.data.id,
      vehicleNumber: response.data.data.vehicleNumber,
      vendors: response.data.data.vendors || [],
      type: response.data.data.type as "Car" | "Truck" | "Excavator",
      status: response.data.data.status,
      createdAt: response.data.data.createdAt || response.data.data.created_at,
      updatedAt: response.data.data.updatedAt || response.data.data.updated_at,
    }

    return createdEntity
  } catch (error) {
    console.error("Error creating entity:", error)
    throw error
  }
}

// Update an existing entity
export const updateEntity = async (
  id: number,
  entityData: Partial<Omit<Entity, "id" | "createdAt" | "updatedAt">>,
): Promise<Entity> => {
  try {
    // Transform vendors from array of Vendor objects to array of vendor IDs if present
    const vendorIds = entityData.vendors ? entityData.vendors.map((vendor) => vendor.id) : undefined

    const payload = {
      type: entityData.type,
      status: entityData.status,
      vendorIds: vendorIds,
    }

    const response = await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/entity/${id}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )

    // Transform the response to match our frontend Entity interface
    const updatedEntity: Entity = {
      id: response.data.data.id,
      vehicleNumber: response.data.data.vehicleNumber,
      vendors: response.data.data.vendors || [],
      type: response.data.data.type as "Car" | "Truck" | "Excavator",
      status: response.data.data.status,
      createdAt: response.data.data.createdAt || response.data.data.created_at,
      updatedAt: response.data.data.updatedAt || response.data.data.updated_at,
    }

    return updatedEntity
  } catch (error) {
    console.error("Error updating entity:", error)
    throw error
  }
}

// Delete an entity
export const deleteEntity = async (id: number): Promise<void> => {
  try {
    await axios.delete(
      `${import.meta.env.VITE_BACKEND_URL}/entity/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
  } catch (error) {
    console.error("Error deleting entity:", error)
    throw error
  }
}

// Search entities
export const searchEntities = async (query: string): Promise<Entity[]> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/entity/search`,
      {
        params: { query },
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )

    // Transform the response to match our frontend Entity interface
    const entities: Entity[] = response.data.data.map((item: any) => ({
      id: item.id,
      vehicleNumber: item.vehicleNumber,
      vendors: item.vendors || [],
      type: item.type as "Car" | "Truck" | "Excavator",
      status: item.status,
      createdAt: item.createdAt || item.created_at,
      updatedAt: item.updatedAt || item.updated_at,
    }))

    return entities
  } catch (error) {
    console.error("Error searching entities:", error)
    throw error
  }
}

// Get all vendors
export const fetchVendors = async (): Promise<Vendor[]> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/vendors`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
    return response.data.data
  } catch (error) {
    console.error("Error fetching vendors:", error)
    throw error
  }
}

// Initial empty array for entities (will be populated from API)
export const initialEntities: Entity[] = []

// Initial empty array for vendors (will be populated from API)
export const availableVendors: Vendor[] = []
