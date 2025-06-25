import { useState, useEffect, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { PlusCircle, Search, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ResponsibilitiesTable } from "./responsibility-table"
import { ResponsibilityModal } from "./responsibility-drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import {
  fetchRoles,
  createResponsibility,
  updateResponsibility,
  deleteResponsibility,
  fetchRolesByUserId,
} from "../../../data/usermanage/responsibility"
import { useAuth } from "../../../context/AuthContext"
import type { Responsibility } from "../../../types/usermanage/responsibilty_type"

export function ResponsibilitiesPage() {
  const [responsibilities, setResponsibilities] = useState<Responsibility[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedResponsibility, setSelectedResponsibility] = useState<Responsibility | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  //const [isRefreshing, setIsRefreshing] = useState(false)
  const itemsPerPage = 5

  const { user } = useAuth()
  const [userResponsibilityAccess, setUserResponsibilityAccess] = useState<number | null>(null)

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

  // Move loadRoles definition above useEffect
  const loadRoles = async () => {
    try {
      setIsLoading(true)
      const roleData = await fetchRoles()
      // responsibilities.push(...roleData); // Use push to add items to the existing array
      setResponsibilities(Array.isArray(roleData) ? [...roleData] : [])
    } catch (error) {
      stableShowErrorToast("Error", "Failed to load responsibilities. Please try again.")
      console.error("Failed to load roles:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch initial data on component mount
  useEffect(() => {
    loadRoles()
  }, [])

  useEffect(() => {
    const fetchAccess = async () => {
      if (user && user.id) {
        try {
          const roles = await fetchRolesByUserId(user.id)
          if (roles && roles.length > 0) {
            const tabsAccess = roles[0].tabs_access
            const respTab = tabsAccess.find((tab: any) => tab.hasOwnProperty("user_reponsibility"))
            setUserResponsibilityAccess(respTab ? respTab.user_reponsibility : null)
          }
        } catch {
          setUserResponsibilityAccess(null)
        }
      }
    }
    fetchAccess()
  }, [user])

  // const handleRefresh = async () => {
  //   try {
  //     setIsRefreshing(true)
  //     await loadRoles()

  //     // Use setTimeout to ensure toast shows after state update
  //     setTimeout(() => {
  //       stableShowSuccessToast("Data refreshed", "Responsibilities data has been refreshed successfully.")
  //     }, 0)
  //   } catch (error) {
  //     setTimeout(() => {
  //       stableShowErrorToast("Error", "Failed to refresh data. Please try again.")
  //     }, 0)
  //   } finally {
  //     setIsRefreshing(false)
  //   }
  // }

  const filteredResponsibilities = responsibilities.filter((responsibility) =>
    responsibility.role_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const totalCount = filteredResponsibilities.length
  const pageCount = Math.ceil(totalCount / itemsPerPage)
  const paginatedResponsibilities = filteredResponsibilities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const handleEdit = (responsibility: Responsibility) => {
    // Find the current responsibility from the array to get the latest data
    const currentResponsibility = responsibilities.find((r) => r.id === responsibility.id) || responsibility
    setSelectedResponsibility(currentResponsibility)
    setIsDrawerOpen(true)
  }

  const handleCreate = () => {
    setSelectedResponsibility(null)
    setIsDrawerOpen(true)
  }

  const handleSave = async (responsibility: Responsibility) => {
    try {
      let toastMessage = ""
      let toastTitle = ""

      if (selectedResponsibility) {
        // Update existing responsibility
        const updatedResponsibility = await updateResponsibility(responsibility)
        setResponsibilities(responsibilities.map((r) => (r.id === responsibility.id ? updatedResponsibility : r)))
        // Update selectedResponsibility with the latest data
        setSelectedResponsibility(updatedResponsibility)
        toastTitle = "Profile updated"
        toastMessage = `${responsibility.role_name} has been updated successfully.`
      } else {
        // Create new responsibility
        const newResponsibility = await createResponsibility(responsibility)
        setResponsibilities([...responsibilities, newResponsibility])
        toastTitle = "Profile created"
        toastMessage = `${responsibility.role_name} has been created successfully.`
      }

      setIsDrawerOpen(false)
      console.log("kuch toh ho rha hai")
      await loadRoles() // Fetch all roles again after submit

      // Show toast AFTER loadRoles completes to prevent interruption
      setTimeout(() => {
        stableShowSuccessToast(toastTitle, toastMessage)
      }, 100) // Slightly longer delay to ensure everything is settled
    } catch (error) {
      setTimeout(() => {
        stableShowErrorToast("Error", "Failed to save responsibility. Please try again.")
      }, 0)
      console.error("Failed to save responsibility:", error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteResponsibility(id)
      setResponsibilities(responsibilities.filter((r) => r.id !== id))

      // Use setTimeout to ensure toast shows after state update
      setTimeout(() => {
        stableShowSuccessToast("Profile deleted", "The profile has been deleted successfully.")
      }, 0)
    } catch (error) {
      setTimeout(() => {
        stableShowErrorToast("Error", "Failed to delete responsibility. Please try again.")
      }, 0)
      console.error("Failed to delete responsibility:", error)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-gray-900">
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-4">
                  <RefreshCw className="h-8 w-8 animate-spin text-gray-400 dark:text-gray-500" />
                  <p className="text-gray-500 dark:text-gray-400">Loading responsibilities...</p>
                </div>
              </div>
            </div>
          </main>
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
                  placeholder="Search responsibilities..."
                  className="pl-9 w-full sm:w-[300px] border-slate-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-400 rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </motion.div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Hide Create New Responsibility button if userResponsibilityAccess === 1 */}
                {userResponsibilityAccess !== 1 && (
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1 sm:flex-none">
                    <Button
                      onClick={handleCreate}
                      className="bg-black hover:bg-gray-800 text-white border-0 rounded-md w-full sm:w-auto dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create New Responsibility
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="text-sm font-medium px-3 sm:px-4 py-1 sm:py-2 rounded-full sm:text-sm inline-block mb-4">
                <Badge variant="outline" className="bg-red-50 text-red-700 text-sm border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                  Total Count: <span className="font-bold ml-1">{responsibilities.length}</span>
                </Badge>
              </div>

              <ResponsibilitiesTable
                responsibilities={paginatedResponsibilities}
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

      <ResponsibilityModal
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        responsibility={selectedResponsibility}
        onSave={handleSave}
      />
      {Toaster}
    </div>
  )
}
