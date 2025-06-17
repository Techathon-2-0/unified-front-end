import type React from "react"
import { useState, useEffect } from "react"
import type { GeofenceGroup, FormData} from "../../../types/geofence/ggroup_type"
import type { Geofence } from "../../../types/geofence/gconfig_type"
import {
  fetchGeofenceGroups,
  createGeofenceGroup,
  updateGeofenceGroup,
  deleteGeofenceGroup,
  searchGeofenceGroups,
} from "../../../data/geofence/ggroup"
import { fetchGeofences } from "../../../data/geofence/gconfig"
import { Header } from "./headers"
import { SearchBar } from "./search-bar"
import { GroupTable } from "./ggroup-table"
import { Pagination } from "./pagination"
import { AddEditForm } from "./ggroup-drawer"
import { ViewDetails } from "./ggroup-view"
import { DeleteConfirmation } from "./delete-confirmation"
import { useToast } from "@/hooks/use-toast"

export default function GeofenceGroupManagement() {
  const [geofenceGroups, setGeofenceGroups] = useState<GeofenceGroup[]>([])
  const [geofenceData, setGeofenceData] = useState<Geofence[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false)
  const [currentGroup, setCurrentGroup] = useState<GeofenceGroup | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isTableLoading, setIsTableLoading] = useState(true)
  const { showSuccessToast, showErrorToast, Toaster } = useToast({ position: "top-right" })

  const [formData, setFormData] = useState<FormData>({
    geo_group: "",
    geofenceIds: [],
  })

  const rowsPerPage = 5
  const [sortField, setSortField] = useState<keyof GeofenceGroup | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Load initial data
  useEffect(() => {
    loadGeofenceGroups()
    loadGeofences()
  }, [])

  const loadGeofenceGroups = async () => {
    try {
      setIsTableLoading(true)
      const groups = await fetchGeofenceGroups()
      setGeofenceGroups(groups)
    } catch (error) {
      showErrorToast("Failed to load geofence groups", "Please try again later")
    } finally {
      setIsTableLoading(false)
    }
  }

  const loadGeofences = async () => {
    try {
      const geofences = await fetchGeofences()
      setGeofenceData(geofences)
    } catch (error) {
      showErrorToast("Failed to load geofences", "Please try again later")
    }
  }

  // Debounce searchQuery updates
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchQuery])

  // Filter and search logic
  const filteredGroups = debouncedSearchQuery
    ? geofenceGroups.filter(
        (group) =>
          group.geo_group.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          group.id.toString().includes(debouncedSearchQuery.toLowerCase()),
      )
    : geofenceGroups

  // Sort the filtered groups
  const sortedGroups = [...filteredGroups].sort((a, b) => {
    if (!sortField) return 0

    let aValue: any
    let bValue: any

    if (sortField === "geofenceIds") {
      aValue = a.geofenceIds.length
      bValue = b.geofenceIds.length
    } else if (sortField === "created_at" || sortField === "updated_at") {
      aValue = new Date(a[sortField]).getTime()
      bValue = new Date(b[sortField]).getTime()
    } else {
      aValue = a[sortField]
      bValue = b[sortField]
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (aValue < bValue) {
      return sortDirection === "asc" ? -1 : 1
    }
    if (aValue > bValue) {
      return sortDirection === "asc" ? 1 : -1
    }
    return 0
  })

  // Calculate pagination
  const totalPages = Math.ceil(sortedGroups.length / rowsPerPage)
  const paginatedGroups = sortedGroups.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field as keyof GeofenceGroup)
      setSortDirection("asc")
    }
    setCurrentPage(1)
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
    // Only trigger search API if query is not empty, but debounce is handled by useEffect below
  }

  // Debounced effect for API search
  useEffect(() => {
    const fetchSearch = async () => {
      if (debouncedSearchQuery.trim()) {
        try {
          setIsTableLoading(true)
          const searchResults = await searchGeofenceGroups(debouncedSearchQuery)
          setGeofenceGroups(searchResults)
        } catch (error) {
          showErrorToast("Search failed", "Please try again")
        } finally {
          setIsTableLoading(false)
        }
      } else {
        loadGeofenceGroups()
      }
    }
    fetchSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery])

  const handleAddGroup = () => {
    setFormData({
      geo_group: "",
      geofenceIds: [],
    })
    setIsAddDialogOpen(true)
  }

  const handleEditGroup = (group: GeofenceGroup) => {
    setCurrentGroup(group)
    setFormData({
      geo_group: group.geo_group,
      geofenceIds: [...group.geofenceIds],
    })
    setIsEditDialogOpen(true)
  }

  const handleViewDetails = (group: GeofenceGroup) => {
    setCurrentGroup(group)
    setIsViewDetailsOpen(true)
  }

  const handleDeleteGroup = (group: GeofenceGroup) => {
    setCurrentGroup(group)
    setIsDeleteAlertOpen(true)
  }

  const confirmDeleteGroup = async () => {
    if (!currentGroup) {
      showErrorToast("No group selected for deletion", "")
      return
    }

    try {
      setIsLoading(true)
      await deleteGeofenceGroup(currentGroup.id)

      setGeofenceGroups((prev) => prev.filter((group) => group.id !== currentGroup.id))
      setIsDeleteAlertOpen(false)
      setCurrentGroup(null)

      showSuccessToast(`Geofence Group "${currentGroup.geo_group}" deleted successfully!`, "")
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to delete geofence group"
      showErrorToast(errorMessage, "Please try again")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleGeofenceSelection = (geofenceId: number) => {
    setFormData((prev) => {
      if (prev.geofenceIds.includes(geofenceId)) {
        return {
          ...prev,
          geofenceIds: prev.geofenceIds.filter((id) => id !== geofenceId),
        }
      } else {
        return {
          ...prev,
          geofenceIds: [...prev.geofenceIds, geofenceId],
        }
      }
    })
  }

  const handleSaveNewGroup = async () => {
    if (!formData.geo_group.trim()) {
      showErrorToast("Geofence Group name is required", "")
      return
    }

    if (formData.geofenceIds.length === 0) {
      showErrorToast("Please select at least one geofence", "")
      return
    }

    try {
      setIsLoading(true)
      const newGroup = await createGeofenceGroup({
        geo_group: formData.geo_group.trim(),
        geofenceIds: formData.geofenceIds,
      })

      setGeofenceGroups((prev) => [...prev, newGroup])
      setIsAddDialogOpen(false)

      showSuccessToast(`Geofence Group "${formData.geo_group}" created successfully!`, "")
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to create geofence group"
      showErrorToast(errorMessage, "Please try again")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateGroup = async () => {
    if (!currentGroup || !formData.geo_group.trim()) {
      showErrorToast("Geofence Group name is required", "")
      return
    }

    if (formData.geofenceIds.length === 0) {
      showErrorToast("Please select at least one geofence", "")
      return
    }

    try {
      setIsLoading(true)
      const updatedGroup = await updateGeofenceGroup(currentGroup.id, {
        geo_group: formData.geo_group.trim(),
        geofenceIds: formData.geofenceIds,
      })

      setGeofenceGroups((prev) => prev.map((group) => (group.id === currentGroup.id ? updatedGroup : group)))
      setIsEditDialogOpen(false)
      setCurrentGroup(null)

      showSuccessToast(`Geofence Group "${formData.geo_group}" updated successfully!`, "")
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update geofence group"
      showErrorToast(errorMessage, "Please try again")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen dark:bg-gray-900">
      <Header totalCount={sortedGroups.length} onAddGroup={handleAddGroup} />
      <SearchBar searchQuery={searchQuery} onSearch={handleSearch} isLoading={isTableLoading} />

      <div className="flex-1 overflow-auto">
        <GroupTable
          groups={paginatedGroups}
          sortField={sortField}
          sortDirection={sortDirection}
          onViewDetails={handleViewDetails}
          onEditGroup={handleEditGroup}
          onDeleteGroup={handleDeleteGroup}
          onSort={handleSort}
          isLoading={isTableLoading}
        />

        <div className="mx-4 bg-white dark:bg-gray-800 rounded-b-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sortedGroups.length}
            itemsPerPage={rowsPerPage}
            currentItems={paginatedGroups.length}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      <AddEditForm
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        formData={formData}
        onInputChange={handleInputChange}
        onGeofenceSelection={handleGeofenceSelection}
        onSave={handleSaveNewGroup}
        geofenceData={geofenceData}
        isEditing={false}
        isLoading={isLoading}
      />

      <AddEditForm
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        formData={formData}
        onInputChange={handleInputChange}
        onGeofenceSelection={handleGeofenceSelection}
        onSave={handleUpdateGroup}
        geofenceData={geofenceData}
        isEditing={true}
        isLoading={isLoading}
      />

      <ViewDetails
        isOpen={isViewDetailsOpen}
        onClose={() => setIsViewDetailsOpen(false)}
        group={currentGroup}
        geofenceData={geofenceData}
        onEdit={handleEditGroup}
      />

      <DeleteConfirmation
        isOpen={isDeleteAlertOpen}
        onClose={() => setIsDeleteAlertOpen(false)}
        group={currentGroup}
        onConfirm={confirmDeleteGroup}
        isLoading={isLoading}
      />
      {Toaster}
    </div>
  )
}
