import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { PlusCircle, Search, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ResponsibilitiesTable } from "./responsibilities-table"
import { ResponsibilityModal } from "./responsibility-drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import {
  fetchRoles,
  createResponsibility,
  updateResponsibility,
  deleteResponsibility,
} from "../../../data/usermanage/responsibilities"
import type { Responsibility } from "../../../types/usermanage/responsibilities"

export function ResponsibilitiesPage() {
  const [responsibilities, setResponsibilities] = useState<Responsibility[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedResponsibility, setSelectedResponsibility] = useState<Responsibility | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const itemsPerPage = 5

  const { showSuccessToast, showErrorToast, Toaster } = useToast({ position: "top-right",});

  // Move loadRoles definition above useEffect
  const loadRoles = async () => {
    try {
      setIsLoading(true)
      const roleData = await fetchRoles();
      // responsibilities.push(...roleData); // Use push to add items to the existing array
      setResponsibilities(Array.isArray(roleData) ? [...roleData] : []);
    } catch (error) {
      showErrorToast("Error", "Failed to load responsibilities. Please try again.")
      console.error("Failed to load roles:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch initial data on component mount  
  useEffect(() => {
    loadRoles()
  }, [])

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      await loadRoles()
      showSuccessToast("Data refreshed", "Responsibilities data has been refreshed successfully.")
    } catch (error) {
      showErrorToast("Error", "Failed to refresh data. Please try again.")
    } finally {
      setIsRefreshing(false)
    }
  }

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
    setSelectedResponsibility(responsibility)
    setIsDrawerOpen(true)
  }

  const handleCreate = () => {
    setSelectedResponsibility(null)
    setIsDrawerOpen(true)
  }

  const handleSave = async (responsibility: Responsibility) => {
    try {
      if (selectedResponsibility) {
        // Update existing responsibility
        const updatedResponsibility = await updateResponsibility(responsibility)
        setResponsibilities(responsibilities.map((r) => (r.id === responsibility.id ? updatedResponsibility : r)))
        showSuccessToast("Profile updated", `${responsibility.role_name} has been updated successfully.`)
      } else {
        // Create new responsibility
        const newResponsibility = await createResponsibility(responsibility)
        setResponsibilities([...responsibilities, newResponsibility])
        showSuccessToast("Profile created", `${responsibility.role_name} has been created successfully.`)
      }
      setIsDrawerOpen(false)
      console.log("kuch toh ho rha hai");
      await loadRoles() // Fetch all roles again after submit
    } catch (error) {
      showErrorToast("Error", "Failed to save responsibility. Please try again.")
      console.error("Failed to save responsibility:", error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteResponsibility(id)
      setResponsibilities(responsibilities.filter((r) => r.id !== id))
      showSuccessToast("Profile deleted", "The profile has been deleted successfully.")
    } catch (error) {
      showErrorToast("Error", "Failed to delete responsibility. Please try again.")
      console.error("Failed to delete responsibility:", error)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-4">
                  <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                  <p className="text-gray-500">Loading responsibilities...</p>
                </div>
              </div>
            </div>
          </main>
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
                  placeholder="Search responsibilities..."
                  className="pl-9 w-full sm:w-[300px] border-slate-300 rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </motion.div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Refresh Button */}
                <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} className="rounded-md h-10">
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </Button>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1 sm:flex-none">
                  <Button
                    onClick={handleCreate}
                    className="bg-black hover:bg-gray-800 text-white border-0 rounded-md w-full sm:w-auto"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Responsibility
                  </Button>
                </motion.div>
              </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="text-sm font-medium px-3 sm:px-4 py-1 sm:py-2 rounded-full sm:text-sm inline-block mb-4">
                <Badge variant="outline" className="bg-red-50 text-red-700 text-sm border-red-200">
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
