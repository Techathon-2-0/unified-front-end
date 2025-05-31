import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Clock } from "lucide-react"
import { AlarmTable } from "../../components/alarm/aconfig/Table"
import { AlarmFilterBar } from "../../components/alarm/aconfig/FilterBar"
import { CreateAlarmModal } from "../../components/alarm/aconfig/CreateAlarmModal"
import type { Alarm } from "../../types/alarm/aconfig"
import { mockAlarms } from "../../data/alarm/aconfig"
import { initialGroupData } from "../../data/manage/groups"
import { useToast } from "@/hooks/use-toast"

const AlarmConfigPage = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editAlarm, setEditAlarm] = useState<Alarm | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedAlarms, setSelectedAlarms] = useState<string[]>([])
  const itemsPerPage = 5
  const { showSuccessToast, showErrorToast, Toaster } = useToast({ position: "top-right",});
  // Filtered and paginated alarms
  const [filteredAlarms, setFilteredAlarms] = useState<Alarm[]>([])
  const [paginatedAlarms, setPaginatedAlarms] = useState<Alarm[]>([])
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    // Simulate API call
    const fetchAlarms = async () => {
      setLoading(true)
      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setAlarms(mockAlarms)
      } catch (error) {
        console.error("Error fetching alarms:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlarms()
  }, [])

  useEffect(() => {
    // Filter alarms based on search and selected groups
    let filtered = [...alarms]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (alarm) =>
          alarm.type.toLowerCase().includes(query) ||
          alarm.description.toLowerCase().includes(query) ||
          alarm.assignedTo?.toLowerCase().includes(query) ||
          alarm.createdBy?.toLowerCase().includes(query) ||
          alarm.alarmCategory.toLowerCase().includes(query),
      )
    }

    if (selectedGroups.length > 0) {
      filtered = filtered.filter((alarm) => alarm.groups.some((group) => selectedGroups.includes(group)))
    }

    setFilteredAlarms(filtered)
    setTotalCount(filtered.length)

    // Reset to first page when filters change
    setCurrentPage(1)
  }, [alarms, searchQuery, selectedGroups])

  useEffect(() => {
    // Paginate the filtered alarms
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    setPaginatedAlarms(filteredAlarms.slice(startIndex, endIndex))
  }, [filteredAlarms, currentPage])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleExport = (format: "csv" | "pdf") => {
    console.log(`Exporting alarms as ${format}`)
    // Implementation for exporting data
  }

  const handleGroupsChange = (groups: string[]) => {
    setSelectedGroups(groups)
  }

  const handleCreateAlarm = () => {
    setEditAlarm(null)
    setIsCreateModalOpen(true)
  }

  const handleEditAlarm = (alarm: Alarm) => {
    setEditAlarm(alarm)
    setIsCreateModalOpen(true)
  }

  const handleDeleteAlarm = (alarmId: string) => {
  try {
    setAlarms((prev) => prev.filter((alarm) => alarm.id !== alarmId))
    showSuccessToast("Alarm deleted", "Alarm has been deleted successfully.")
  } catch (error) {
    console.error("Failed to delete alarm:", error)
    showErrorToast("Delete failed", "Failed to delete alarm. Please try again.")
  }
}

  const handleSaveAlarm = (alarmData: Partial<Alarm>) => {
    try {
      if (editAlarm) {
        // Update existing alarm
        setAlarms((prev) =>
          prev.map((alarm) =>
            alarm.id === editAlarm.id ? { ...alarm, ...alarmData, updatedOn: new Date().toLocaleString() } : alarm,
          ),
        )
        showSuccessToast("Alarm updated", "Alarm has been updated successfully.")
      } else {
        // Create new alarm
        const newAlarm: Alarm = {
          id: `${Date.now()}`, // Generate a unique ID
          type: alarmData.type || "",
          alarmCategory: alarmData.alarmCategory || "",
          severityType: alarmData.severityType || "General",
          description: alarmData.description || "",
          assignedTo: alarmData.assignedTo || null,
          createdBy: "Current User", // Would come from auth context in a real app
          createdOn: new Date().toLocaleString(),
          updatedBy: null,
          updatedOn: new Date().toLocaleString(),
          alarmGeneration: alarmData.alarmGeneration || "Always",
          enableGeofence: alarmData.enableGeofence || false,
          groups: alarmData.groups || [],
          email: alarmData.email || "",
          sms: alarmData.sms || "",
          webhook: alarmData.webhook || "",
          thresholdValue: alarmData.thresholdValue || "",
        }

        setAlarms((prev) => [...prev, newAlarm])
        showSuccessToast("Alarm created", "New alarm has been created successfully.")
      }

      setIsCreateModalOpen(false)
    } catch (error) {
      console.error("Failed to save alarm:", error)
      showErrorToast("Save failed", "Failed to save alarm. Please try again.")
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

  const pageCount = Math.ceil(totalCount / itemsPerPage)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-full">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end mb-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-black text-white rounded-md shadow-md flex items-center"
              onClick={handleCreateAlarm}
            >
              <Clock className="mr-2 h-5 w-5" />
              Create New Alarm
            </motion.button>
          </div>
        </div>

        <AlarmFilterBar
          totalCount={totalCount}
          onSearch={handleSearch}
          onExport={handleExport}
          onGroupsChange={handleGroupsChange}
          availableGroups={initialGroupData.map((group) => group.name)}
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
        />

        <CreateAlarmModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleSaveAlarm}
          editAlarm={editAlarm}
          availableGroups={initialGroupData.map((group) => group.name)}
        />
      </div>
      {Toaster}
    </div>
  )
}

export default AlarmConfigPage
