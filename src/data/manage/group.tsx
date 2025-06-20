import axios from "axios"
import type { Group } from "../../types/manage/group_type"

// API Functions
export const fetchGroups = async (): Promise<Group[]> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/groups`,
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
      name: group.group_name,
      entityIds: group.entities ? group.entities.map((entity: any) => entity.id) : [],
      createdOn: group.created_at,
      updatedOn: group.updated_at,
    }))
  } catch (error) {
    console.error("Error fetching groups:", error)
    throw error
  }
}

export const createGroup = async (groupData: { name: string; entityIds: number[] }): Promise<Group> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/groups`,
      {
        group_name: groupData.name,
        entityIds: groupData.entityIds,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )

    const group = response.data.data
    return {
      id: group.id,
      name: group.group_name,
      entityIds: group.entities ? group.entities.map((entity: any) => entity.id) : [],
      createdOn: group.created_at,
      updatedOn: group.updated_at,
    }
  } catch (error) {
    console.error("Error creating group:", error)
    throw error
  }
}

export const updateGroup = async (id: number, groupData: { name: string; entityIds: number[] }): Promise<Group> => {
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/groups/${id}`,
      {
        group_name: groupData.name,
        entityIds: groupData.entityIds,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )

    const group = response.data.data
    return {
      id: group.id,
      name: group.group_name,
      entityIds: group.entities ? group.entities.map((entity: any) => entity.id) : [],
      createdOn: group.created_at,
      updatedOn: group.updated_at,
    }
  } catch (error) {
    console.error("Error updating group:", error)
    throw error
  }
}

export const deleteGroup = async (id: number): Promise<void> => {
  try {
    await axios.delete(
      `${import.meta.env.VITE_BACKEND_URL}/groups/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      }
    )
  } catch (error) {
    console.error("Error deleting group:", error)
    throw error
  }
}

export const searchGroups = async (query: string): Promise<Group[]> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/groups/search`,
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
      name: group.group_name,
      entityIds: group.entities ? group.entities.map((entity: any) => entity.id) : [],
      createdOn: group.created_at,
      updatedOn: group.updated_at,
    }))
  } catch (error) {
    console.error("Error searching groups:", error)
    throw error
  }
}

// export const fetchEntities = async (): Promise<Entity[]> => {
//   try {
//     const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/entity`)
//     const entities = response.data.data || []

//     return entities.map((entity: any) => ({
//       id: entity.id,
//       vehicleNumber: entity.vehicleNumber,
//       type: entity.type,
//       status: entity.status,
//     }))
//   } catch (error) {
//     console.error("Error fetching entities:", error)
//     throw error
//   }
// }

// Initial empty data - will be populated from API
export const initialGroupData: Group[] = []

// By USER ID

export const fetchGroupsbyuserId = async (userId:number): Promise<Group[]> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/groups/user/${userId}`,
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
      name: group.group_name,
      entityIds: group.entities ? group.entities.map((entity: any) => entity.id) : [],
      createdOn: group.created_at,
      updatedOn: group.updated_at,
    }))
  } catch (error) {
    console.error("Error fetching groups:", error)
    throw error
  }
}
