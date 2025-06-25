import { useState, useEffect, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { PlusCircle, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { GroupTable } from "./group-table"
import { GroupDrawer } from "./group-drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import type { Group } from "../../../types/manage/group_type"
import { fetchGroups, createGroup, updateGroup, deleteGroup, searchGroups } from "../../../data/manage/group"
import { fetchRolesByUserId } from "@/data/usermanage/responsibility"
import { useAuth } from "@/context/AuthContext"

export function GroupManagementPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const itemsPerPage = 5

  // Create stable toast functions that won't change on re-renders
  const { showSuccessToast, showErrorToast, Toaster } = useToast({ position: "top-right" })

  // Use refs to store the latest toast functions to prevent stale closures
  const toastRef = useRef({ showSuccessToast, showErrorToast })
  toastRef.current = { showSuccessToast, showErrorToast }

  // Stable toast functions that won't cause re-renders
  const stableShowSuccessToast = useCallback((title: string, description: string) => {
    toastRef.current.showSuccessToast(title, description)
  }, [])

  const stableShowErrorToast = useCallback((title: string, description: string) => {
    toastRef.current.showErrorToast(title, description)
  }, [])

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
      stableShowErrorToast("Failed to load groups", "Please try again later.")
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
          stableShowErrorToast("Search failed", "Please try again.")
        }
      } else {
        loadGroups()
      }
    }

    const debounceTimer = setTimeout(handleSearch, 500) // changed from 300 to 500
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

        // Use setTimeout to ensure toast shows after state update
        setTimeout(() => {
          stableShowSuccessToast("Group updated", `${group.name} has been updated successfully.`)
        }, 0)
      } else {
        // Create new group
        await createGroup({
          name: group.name,
          entityIds: group.entityIds,
        })

        // Refresh the entire groups list to ensure we have complete data
        await loadGroups()

        // Use setTimeout to ensure toast shows after state update
        setTimeout(() => {
          stableShowSuccessToast("Group created", `${group.name} has been created successfully.`)
        }, 0)
      }
      setIsDrawerOpen(false)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "An error occurred"
      setTimeout(() => {
        stableShowErrorToast("Operation failed", errorMessage)
      }, 0)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteGroup(id)
      setGroups(groups.filter((g) => g.id !== id))

      // Use setTimeout to ensure toast shows after state update
      setTimeout(() => {
        stableShowSuccessToast("Group deleted", "The group has been deleted successfully.")
      }, 0)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to delete group"
      setTimeout(() => {
        stableShowErrorToast("Delete failed", errorMessage)
      }, 0)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const { user } = useAuth()
  const [groupAccess, setGroupAccess] = useState<number | null>(null)

  useEffect(() => {
    const fetchAccess = async () => {
      if (user && user.id) {
        try {
          const roles = await fetchRolesByUserId(user.id)
          if (roles && roles.length > 0) {
            const tabsAccess = roles[0].tabs_access
            const groupTab = tabsAccess.find((tab: any) => tab.hasOwnProperty("group"))
            setGroupAccess(groupTab ? groupTab.group : null)
          }
        } catch {
          setGroupAccess(null)
        }
      }
    }
    fetchAccess()
  }, [user])

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-gray-900">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-medium text-gray-900 dark:text-gray-100">Loading groups...</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please wait while we fetch your data</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-gray-900">
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search groups..."
                  className="pl-9 w-full sm:w-[300px] border-slate-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </motion.div>
              {/* Hide Create New Group button if groupAccess === 1 */}
              {groupAccess !== 1 && (
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                  <Button
                    onClick={handleCreate}
                    className="bg-black hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white border-0 rounded-md w-full sm:w-auto"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Group
                  </Button>
                </motion.div>
              )}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="text-sm font-medium px-3 sm:px-4 py-1 sm:py-2 rounded-full sm:text-sm inline-block mb-4">
                <Badge variant="outline" className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm border-red-200 dark:border-red-800">
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
