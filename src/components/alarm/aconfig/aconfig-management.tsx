import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Clock } from "lucide-react"
import { AlarmTable } from "./aconfig-table"
import { AlarmFilterBar } from "./FilterBar"
import { CreateAlarmModal } from "./aconfig-drawer"
import { ViewAssignedGroupsModal } from "./ViewAssignedGroupsModal"
import type { Alarm, AlarmFilters } from "../../../types/alarm/aconfig_type"
import {
  fetchAlarms,
  createAlarm as apiCreateAlarm,
  updateAlarm as apiUpdateAlarm,
  deleteAlarm as apiDeleteAlarm,
  fetchGroups,
  fetchGeofenceGroups,
  fetchCustomerGroups,
  fetchUsers,
} from "../../../data/alarm/aconfig"
import { fetchRolesByUserId } from "../../../data/usermanage/responsibility"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/AuthContext"

const AlarmConfigPage = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery] = useState("")
  const [selectedGroups] = useState<string[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editAlarm, setEditAlarm] = useState<Alarm | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedAlarms, setSelectedAlarms] = useState<string[]>([])
  const [filters, setFilters] = useState<AlarmFilters>({
    alarmTypes: [],
    vehicleGroups: [],
    customerGroups: [],
    geofenceGroups: [],
    statuses: [],
    severityTypes: [],
  })
  const [viewAssignedModalOpen, setViewAssignedModalOpen] = useState(false)
  const [selectedAlarmForGroups, setSelectedAlarmForGroups] = useState<Alarm | null>(null)
  const [vehicleGroups, setVehicleGroups] = useState<any[]>([])
  const [customerGroups, setCustomerGroups] = useState<any[]>([])
  const [geofenceGroups, setGeofenceGroups] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const { user } = useAuth()

  // Add state for alarm tab access
  const [alarmTabAccess, setAlarmTabAccess] = useState<number | null>(null)

  const itemsPerPage = 5
  const { showSuccessToast, showErrorToast, Toaster } = useToast({ position: "top-right" })

  // Filtered and paginated alarms
  const [filteredAlarms, setFilteredAlarms] = useState<Alarm[]>([])
  const [paginatedAlarms, setPaginatedAlarms] = useState<Alarm[]>([])
  const [totalCount, setTotalCount] = useState(0)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [alarmsData, vehicleGroupsData, customerGroupsData, geofenceGroupsData, usersData] = await Promise.all([
        fetchAlarms(),
        fetchGroups(),
        fetchCustomerGroups(),
        fetchGeofenceGroups(),
        fetchUsers(),
      ])

      setAlarms(alarmsData)
      setVehicleGroups(vehicleGroupsData || [])
      setCustomerGroups(customerGroupsData || [])
      setGeofenceGroups(geofenceGroupsData || [])
      setUsers(usersData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      showErrorToast("Failed to load data", "Please try again later")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Fetch all required data
    fetchData()
  }, [])

  // Fetch user roles and set alarm tab access
  useEffect(() => {
    const fetchUserRoles = async () => {
      if (user && user.id) {
        try {
          const roles = await fetchRolesByUserId(user.id)
          // Find the first role (assuming single role per user)
          if (roles && roles.length > 0) {
            const tabsAccess = roles[0].tabs_access
            // Find the alarm tab access value
            const alarmTab = tabsAccess.find((tab: any) => tab.hasOwnProperty("alarm"))
            setAlarmTabAccess(alarmTab ? alarmTab.alarm : null)
          }
        } catch (error) {
          setAlarmTabAccess(null)
        }
      }
    }
    fetchUserRoles()
  }, [user])

  // Helper function to get group ID by name
  const getVehicleGroupIdByName = (name: string): number | null => {
    const group = vehicleGroups.find((g) => (g.name || `Group ${g.id}`) === name)
    return group?.id || null
  }

  const getCustomerGroupIdByName = (name: string): number | null => {
    const group = customerGroups.find((g) => (g.group_name || `Group ${g.id}`) === name)
    return group?.id || null
  }

  const getGeofenceGroupIdByName = (name: string): number | null => {
    const group = geofenceGroups.find((g) => (g.geo_group || `Group ${g.id}`) === name)
    return group?.id || null
  }

  useEffect(() => {
    // Filter alarms based on search, selected groups, and filters
    let filtered = [...alarms]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (alarm) =>
          alarm.type?.toLowerCase().includes(query) ||
          alarm.description?.toLowerCase().includes(query) ||
          alarm.assignedTo?.toLowerCase().includes(query),
      )
    }

    if (selectedGroups.length > 0) {
      filtered = filtered.filter((alarm) => alarm.groups?.some((group) => selectedGroups.includes(group)))
      
    }

    // Apply alarm type filters
    if (filters.alarmTypes.length > 0) {
      filtered = filtered.filter((alarm) => filters.alarmTypes.includes(alarm.type))
    }

    // Apply severity type filters
    if (filters.severityTypes.length > 0) {
      filtered = filtered.filter((alarm) => filters.severityTypes.includes(alarm.severityType))
    }

    // Apply status filters
    if (filters.statuses.length > 0) {
      filtered = filtered.filter((alarm) => {
        const status = alarm.status || "Inactive"
        return filters.statuses.includes(status)
      })
    }

    // Apply vehicle group filters
    if (filters.vehicleGroups.length > 0) {
      filtered = filtered.filter((alarm) => {
        if (!alarm.vehicleGroups || alarm.vehicleGroups.length === 0) {
          return false
        }

        // Convert filter names to IDs and check for matches
        const filterIds = filters.vehicleGroups
          .map((name) => getVehicleGroupIdByName(name))
          .filter((id) => id !== null) as number[]

        return alarm.vehicleGroups.some((groupId) => filterIds.includes(groupId))
      })
    }

    // Apply customer group filters
    if (filters.customerGroups.length > 0) {
      filtered = filtered.filter((alarm) => {
        if (!alarm.customerGroups || alarm.customerGroups.length === 0) {
          return false
        }

        // Convert filter names to IDs and check for matches
        const filterIds = filters.customerGroups
          .map((name) => getCustomerGroupIdByName(name))
          .filter((id) => id !== null) as number[]

        return alarm.customerGroups.some((groupId) => filterIds.includes(groupId))
      })
    }

    // Apply geofence group filters
    if (filters.geofenceGroups.length > 0) {
      filtered = filtered.filter((alarm) => {
        if (!alarm.geofenceGroups || alarm.geofenceGroups.length === 0) {
          return false
        }

        // Convert filter names to IDs and check for matches
        const filterIds = filters.geofenceGroups
          .map((name) => getGeofenceGroupIdByName(name))
          .filter((id) => id !== null) as number[]

        return alarm.geofenceGroups.some((groupId) => filterIds.includes(groupId))
      })
    }

    setFilteredAlarms(filtered)
    setTotalCount(filtered.length)

    // Reset to first page when filters change
    setCurrentPage(1)
  }, [alarms, searchQuery, selectedGroups, filters, vehicleGroups, customerGroups, geofenceGroups])

  useEffect(() => {
    // Paginate the filtered alarms
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    setPaginatedAlarms(filteredAlarms.slice(startIndex, endIndex))
  }, [filteredAlarms, currentPage])


  const handleFilterChange = (newFilters: AlarmFilters) => {
    setFilters(newFilters)
  }

  const handleCreateAlarm = () => {
    setEditAlarm(null)
    setIsCreateModalOpen(true)
  }

  const handleEditAlarm = (alarm: Alarm) => {
    // Make a deep copy to avoid reference issues
    const alarmToEdit = JSON.parse(JSON.stringify(alarm))

    // Ensure all required arrays are initialized
    alarmToEdit.vehicleGroups = alarmToEdit.vehicleGroups || []
    alarmToEdit.customerGroups = alarmToEdit.customerGroups || []
    alarmToEdit.geofenceGroups = alarmToEdit.geofenceGroups || []
    alarmToEdit.emails = alarmToEdit.emails || []
    alarmToEdit.phoneNumbers = alarmToEdit.phoneNumbers || []

    setEditAlarm(alarmToEdit)
    setIsCreateModalOpen(true)
  }

  const handleDeleteAlarm = async (alarmId: string) => {
    try {
      await apiDeleteAlarm(alarmId)
      setAlarms((prev) => prev.filter((alarm) => alarm.id !== alarmId))
      showSuccessToast("Alarm deleted", "Alarm has been deleted successfully.")
    } catch (error) {
      console.error("Failed to delete alarm:", error)
      showErrorToast("Delete failed", "Failed to delete alarm. Please try again.")
    }
  }

  const handleSaveAlarm = async (alarmData: Partial<Alarm>) => {
    try {
      // Clean and validate the data before sending
      const cleanedData = {
        ...alarmData,
        // Ensure arrays are properly formatted
        vehicleGroups: Array.isArray(alarmData.vehicleGroups)
          ? alarmData.vehicleGroups
              .filter(
                (id) =>
                  id !== undefined &&
                  id !== null &&
                  (typeof id !== "string" || id !== "") &&
                  !Number.isNaN(Number(id))
              )
              .map(Number)
          : [],
        customerGroups: Array.isArray(alarmData.customerGroups)
          ? alarmData.customerGroups
              .filter((id) => id !== undefined && id !== null && (typeof id !== "string" || id !== "") && !Number.isNaN(Number(id)))
              .map(Number)
          : [],
        geofenceGroups: Array.isArray(alarmData.geofenceGroups)
          ? alarmData.geofenceGroups
              .filter((id) => id !== undefined && id !== null && (typeof id !== "string" || id !== "") && !Number.isNaN(Number(id)))
              .map(Number)
          : [],
        // Clean email and phone arrays
        emails: Array.isArray(alarmData.emails) ? alarmData.emails.filter((email) => email && email.trim() !== "") : [],
        phoneNumbers: Array.isArray(alarmData.phoneNumbers)
          ? alarmData.phoneNumbers.filter((phone) => phone && phone.trim() !== "")
          : [],
        // Ensure status is properly set
        status: alarmData.status || "Active",
        // Handle threshold value (can be 0)
        thresholdValue: alarmData.thresholdValue !== undefined ? alarmData.thresholdValue.toString() : "0",
        // Ensure geofence status is set for geofence alarms
        geofenceStatus: alarmData.type === "Geofence" ? alarmData.geofenceStatus || "In" : undefined,
      }

      console.log("Alarm data before saving:", alarmData.emails)

      console.log("Saving alarm with cleaned data:", cleanedData)

      if (editAlarm) {
        // Update existing alarm
        await apiUpdateAlarm(editAlarm.id, cleanedData)
        await fetchData()
        showSuccessToast("Alarm updated", "Alarm has been updated successfully.")
      } else {
        // Create new alarm
        await apiCreateAlarm(cleanedData)
        await fetchData()
        showSuccessToast("Alarm created", "New alarm has been created successfully.")
      }

      setIsCreateModalOpen(false)
      setEditAlarm(null)
    } catch (error) {
      console.error("Failed to save alarm:", error)
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save alarm. Please check all fields and try again."
      showErrorToast("Save failed", errorMessage)
      // Don't close modal or reset form on error - let user fix the issues
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSelectAlarm = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedAlarms((prev) => [...prev, id])
    } else {
      setSelectedAlarms((prev) => prev.filter((alarmId) => alarmId !== id))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAlarms(paginatedAlarms.map((alarm) => alarm.id))
    } else {
      setSelectedAlarms([])
    }
  }

  const handleSort = (field: keyof Alarm, direction: "asc" | "desc") => {
    const sorted = [...filteredAlarms].sort((a, b) => {
      const aValue = a[field]
      const bValue = b[field]

      if (aValue === null || aValue === undefined) return direction === "asc" ? -1 : 1
      if (bValue === null || bValue === undefined) return direction === "asc" ? 1 : -1

      if (typeof aValue === "string" && typeof bValue === "string") {
        return direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return direction === "asc" ? (aValue < bValue ? -1 : 1) : aValue > bValue ? -1 : 1
    })

    setFilteredAlarms(sorted)
  }

  const handleViewAssignedGroups = (alarm: Alarm) => {
    setSelectedAlarmForGroups(alarm)
    setViewAssignedModalOpen(true)
  }

  const pageCount = Math.ceil(totalCount / itemsPerPage)

  // Get unique values for filter options
  const getUniqueAlarmTypes = () => [...new Set(alarms.map((alarm) => alarm.type).filter(Boolean))]
  const getUniqueSeverityTypes = () => [...new Set(alarms.map((alarm) => alarm.severityType).filter(Boolean))]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="container mx-auto max-w-full">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end mb-2 gap-4">
            {/* Only show button if alarmTabAccess !== 1 */}
            {alarmTabAccess !== 1 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-black dark:bg-gray-700 text-white rounded-md shadow-md hover:bg-gray-800 dark:hover:bg-gray-600 flex items-center"
                onClick={handleCreateAlarm}
              >
                <Clock className="mr-2 h-5 w-5" />
                Create New Alarm
              </motion.button>
            )}
          </div>
        </div>

        <AlarmFilterBar
          totalCount={totalCount}
          onFilterChange={handleFilterChange}
          availableGroups={[...new Set(alarms.flatMap((alarm) => alarm.groups || []))]}
          availableAlarmTypes={getUniqueAlarmTypes()}
          availableSeverityTypes={getUniqueSeverityTypes()}
        />

        <AlarmTable
          alarms={paginatedAlarms}
          onEdit={handleEditAlarm}
          onDelete={handleDeleteAlarm}
          loading={loading}
          selectedGroups={selectedGroups}
          searchQuery={searchQuery}
          currentPage={currentPage}
          pageCount={pageCount}
          onPageChange={handlePageChange}
          totalCount={totalCount}
          selectedAlarms={selectedAlarms}
          onSelectAlarm={handleSelectAlarm}
          onSelectAll={handleSelectAll}
          onSort={handleSort}
          onViewAssignedGroups={handleViewAssignedGroups}
        />

        <CreateAlarmModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false)
            setEditAlarm(null)
          }}
          onSave={handleSaveAlarm}
          editAlarm={editAlarm}
          availableGroups={[...new Set(alarms.flatMap((alarm) => alarm.groups || []))]}
          availableVehicleGroups={vehicleGroups}
          availableCustomerGroups={customerGroups}
          availableGeofenceGroups={geofenceGroups}
          availableUsers={users}
        />

        <ViewAssignedGroupsModal
          isOpen={viewAssignedModalOpen}
          onClose={() => setViewAssignedModalOpen(false)}
          alarm={selectedAlarmForGroups}
          vehicleGroups={vehicleGroups}
          customerGroups={customerGroups}
          geofenceGroups={geofenceGroups}
        />
      </div>
      {Toaster}
    </div>
  )
}

export default AlarmConfigPage
