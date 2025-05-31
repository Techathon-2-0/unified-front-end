import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { PlusCircle, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { GroupTable } from "./group-table"
import { GroupDrawer } from "./group-drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import type { Group } from "../../../types/manage/group"
import { fetchGroups, createGroup, updateGroup, deleteGroup, searchGroups } from "../../../data/manage/groups"

export function GroupManagementPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const itemsPerPage = 5

  const { showSuccessToast, showErrorToast, Toaster } = useToast({ position: "top-right" })

  // Load groups on component mount
  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    try {
      setIsLoading(true)
      const groupsData = await fetchGroups()
      setGroups(groupsData)
    } catch (error) {
      showErrorToast("Failed to load groups", "Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle search
  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.trim()) {
        try {
          const searchResults = await searchGroups(searchQuery)
          setGroups(searchResults)
          setCurrentPage(1)
        } catch (error) {
          showErrorToast("Search failed", "Please try again.")
        }
      } else {
        loadGroups()
      }
    }

    const debounceTimer = setTimeout(handleSearch, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const filteredGroups = groups.filter(
    (group) =>
      group.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.id.toString().includes(searchQuery.toLowerCase()),
  )

  const totalCount = filteredGroups.length
  const pageCount = Math.ceil(totalCount / itemsPerPage)
  const paginatedGroups = filteredGroups.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleEdit = (group: Group) => {
    setSelectedGroup(group)
    setIsDrawerOpen(true)
  }

  const handleCreate = () => {
    setSelectedGroup(null)
    setIsDrawerOpen(true)
  }

  const handleSave = async (group: Group) => {
    try {
      if (selectedGroup) {
        // Update existing group
        const updatedGroup = await updateGroup(selectedGroup.id, {
          name: group.name,
          entityIds: group.entityIds,
        })
        setGroups(groups.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)))
        showSuccessToast("Group updated", `${group.name} has been updated successfully.`)
      } else {
        // Create new group
        const newGroup = await createGroup({
          name: group.name,
          entityIds: group.entityIds,
        })

        // Refresh the entire groups list to ensure we have complete data
        await loadGroups()
        showSuccessToast("Group created", `${group.name} has been created successfully.`)
      }
      setIsDrawerOpen(false)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "An error occurred"
      showErrorToast("Operation failed", errorMessage)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteGroup(id)
      setGroups(groups.filter((g) => g.id !== id))
      showSuccessToast("Group deleted", "The group has been deleted successfully.")
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to delete group"
      showErrorToast("Delete failed", errorMessage)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-medium text-gray-900">Loading groups...</div>
            <div className="text-sm text-gray-500 mt-1">Please wait while we fetch your data</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative w-full sm:w-auto"
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="search"
                  placeholder="Search groups..."
                  className="pl-9 w-full sm:w-[300px] border-slate-300 rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Button
                  onClick={handleCreate}
                  className="bg-black hover:bg-gray-800 text-white border-0 rounded-md w-full sm:w-auto"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Group
                </Button>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="text-sm font-medium px-3 sm:px-4 py-1 sm:py-2 rounded-full sm:text-sm inline-block mb-4">
                <Badge variant="outline" className="bg-red-50 text-red-700 text-sm border-red-200">
                  Total Count: <span className="font-bold ml-1">{groups.length}</span>
                </Badge>
              </div>

              <GroupTable
                groups={paginatedGroups}
                onEdit={handleEdit}
                onDelete={handleDelete}
                currentPage={currentPage}
                pageCount={pageCount}
                onPageChange={handlePageChange}
                totalCount={totalCount}
              />
            </motion.div>
          </div>
        </main>
      </div>

      <GroupDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        group={selectedGroup}
        onSave={handleSave}
      />
      {Toaster}
    </div>
  )
}
