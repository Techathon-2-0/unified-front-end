import type React from "react"
import { useState, useRef } from "react"
import type { GeofenceGroup, FormData } from "../../../types/geofence/ggroup"
import { initialGeofenceGroups, geofenceData } from "../../../data/geofence/ggroup"
import { Header } from "./headers"
import { SearchBar } from "./search-bar"
import { GroupTable } from "./group-table"
import { Pagination } from "./pagination"
import { AddEditForm } from "./add-edit-form"
import { ViewDetails } from "./view-details"
import { DeleteConfirmation } from "./delete-confirmation"
import { useToast } from "@/hooks/use-toast"

export default function GeofenceGroupManagement() {
  const [geofenceGroups, setGeofenceGroups] = useState<GeofenceGroup[]>(initialGeofenceGroups)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false)
  const [currentGroup, setCurrentGroup] = useState<GeofenceGroup | null>(null)
  const { showSuccessToast, showErrorToast, Toaster } = useToast({ position: "top-right",});
  const [formData, setFormData] = useState<FormData>({
    name: "",
    personInCharge: "",
    contactInfo: "",
    geofenceIds: [],
  })

  // Update the rowsPerPage constant to 5
  const rowsPerPage = 5

  // Add these state variables after the existing state declarations
  const [sortField, setSortField] = useState<keyof GeofenceGroup | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const tableRef = useRef<HTMLDivElement>(null)

  // Filter geofence groups based on search query
  const filteredGroups = geofenceGroups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.personInCharge.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Sort the filtered groups
  const sortedGroups = [...filteredGroups].sort((a, b) => {
    if (!sortField) return 0

    let aValue: any
    let bValue: any

    if (sortField === "geofenceIds") {
      aValue = a.geofenceIds.length
      bValue = b.geofenceIds.length
    } else if (sortField === "createdAt" || sortField === "updatedAt") {
      aValue = new Date(a[sortField]).getTime()
      bValue = new Date(b[sortField]).getTime()
    } else {
      aValue = a[sortField]
      bValue = b[sortField]
    }

    // Handle string comparison
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

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field as keyof GeofenceGroup)
      setSortDirection("asc")
    }
    setCurrentPage(1) // Reset to first page when sorting
  }

  // Update the search functionality to reflect the count of filtered items
  // Modify the handleSearch function to update the total count badge
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page when searching
  }

  // Handle add new group
  const handleAddGroup = () => {
    setFormData({
      name: "",
      personInCharge: "",
      contactInfo: "",
      geofenceIds: [],
    })
    setIsAddDialogOpen(true)
  }

  // Handle edit group
  const handleEditGroup = (group: GeofenceGroup) => {
    setCurrentGroup(group)
    setFormData({
      name: group.name,
      personInCharge: group.personInCharge,
      contactInfo: group.contactInfo,
      geofenceIds: [...group.geofenceIds],
    })
    setIsEditDialogOpen(true)
  }

  // Handle view group details
  const handleViewDetails = (group: GeofenceGroup) => {
    setCurrentGroup(group)
    setIsViewDetailsOpen(true)
  }

  // Handle delete group
  const handleDeleteGroup = (group: GeofenceGroup) => {
    setCurrentGroup(group)
    setIsDeleteAlertOpen(true)
  }

  // Confirm delete group
  const confirmDeleteGroup = () => {
  if (!currentGroup) {
    showErrorToast("No group selected for deletion", "")
    return
  }

  try {
    const groupName = currentGroup.name
    const updatedGroups = geofenceGroups.filter((group) => group.id !== currentGroup.id)
    
    setGeofenceGroups(updatedGroups)
    setIsDeleteAlertOpen(false)
    setCurrentGroup(null)
    
    showSuccessToast(`Geofence Group "${groupName}" deleted successfully!`, "")
  } catch (error) {
    //console.error("Delete geofence group error:", error)
    showErrorToast("Failed to delete geofence group. Please try again.", "")
  }
}

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Handle geofence selection
  const handleGeofenceSelection = (geofenceId: string) => {
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

  // Handle save new group
  const handleSaveNewGroup = () => {
    if (!formData.name) {
      showErrorToast("Geofence Group name is required", "")
      return
    }

    try {
      const newGroup: GeofenceGroup = {
        id: `GG${String(geofenceGroups.length + 1).padStart(3, "0")}`,
        name: formData.name,
        personInCharge: formData.personInCharge,
        contactInfo: formData.contactInfo,
        geofenceIds: formData.geofenceIds,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "Admin",
        updatedBy: "Admin",
      }

      setGeofenceGroups([...geofenceGroups, newGroup])
      setIsAddDialogOpen(false)

      showSuccessToast(`Geofence Group "${formData.name}" created successfully!`, "")
    } catch (error) {
      //console.error("Save group error:", error)
      showErrorToast("Failed to create geofence group. Please try again.", "")
    }
  }

  // Handle update group
  const handleUpdateGroup = () => {
  if (!currentGroup || !formData.name) {
    showErrorToast("Geofence Group name is required", "")
    return
  }

  try {
    const updatedGroups = geofenceGroups.map((group) => {
      if (group.id === currentGroup.id) {
        return {
          ...group,
          name: formData.name,
          personInCharge: formData.personInCharge,
          contactInfo: formData.contactInfo,
          geofenceIds: formData.geofenceIds,
          updatedAt: new Date().toISOString(),
          updatedBy: "Admin",
        }
      }
      return group
    })

    setGeofenceGroups(updatedGroups)
    setIsEditDialogOpen(false)
    setCurrentGroup(null)
    
    showSuccessToast(`Geofence Group "${formData.name}" updated successfully!`, "")
  } catch (error) {
    //console.error("Update group error:", error)
    showErrorToast("Failed to update geofence group. Please try again.", "")
  }
}

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <Header totalCount={sortedGroups.length} onAddGroup={handleAddGroup} />

      {/* Search Bar */}
      <SearchBar searchQuery={searchQuery} onSearch={handleSearch} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Group Table */}
        <GroupTable
          groups={paginatedGroups}
          sortField={sortField}
          sortDirection={sortDirection}
          onViewDetails={handleViewDetails}
          onEditGroup={handleEditGroup}
          onDeleteGroup={handleDeleteGroup}
          onSort={handleSort}
        />

        {/* Pagination */}
        <div className="mx-4 bg-white rounded-b-lg shadow-sm border border-gray-200 overflow-hidden">
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

      {/* Add Group Dialog */}
      <AddEditForm
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        formData={formData}
        onInputChange={handleInputChange}
        onGeofenceSelection={handleGeofenceSelection}
        onSave={handleSaveNewGroup}
        geofenceData={geofenceData}
        isEditing={false}
      />

      {/* Edit Group Dialog */}
      <AddEditForm
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        formData={formData}
        onInputChange={handleInputChange}
        onGeofenceSelection={handleGeofenceSelection}
        onSave={handleUpdateGroup}
        geofenceData={geofenceData}
        isEditing={true}
      />

      {/* View Group Details Dialog */}
      <ViewDetails
        isOpen={isViewDetailsOpen}
        onClose={() => setIsViewDetailsOpen(false)}
        group={currentGroup}
        geofenceData={geofenceData}
        onEdit={handleEditGroup}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        isOpen={isDeleteAlertOpen}
        onClose={() => setIsDeleteAlertOpen(false)}
        group={currentGroup}
        onConfirm={confirmDeleteGroup}
      />
      {Toaster}
    </div>
  )
}