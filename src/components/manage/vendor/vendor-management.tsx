import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { PlusCircle, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { VendorTable } from "./vendor-table"
import { VendorDrawer } from "./vendor-drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import type { Vendor } from "../../../types/manage/vendor_type"
import { fetchVendors, createVendor, updateVendor, deleteVendor, searchVendors } from "../../../data/manage/vendor"
import { fetchRolesByUserId } from "@/data/usermanage/responsibility"
import { useAuth } from "@/context/AuthContext"

export function VendorManagementPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isTableLoading, setIsTableLoading] = useState(true)
  const itemsPerPage = 5

  const { showSuccessToast, showErrorToast, Toaster } = useToast({ position: "top-right" })
  const { user } = useAuth()
  const [vendorsAccess, setVendorsAccess] = useState<number | null>(null)

  // Load vendors on component mount
  useEffect(() => {
    loadVendors()
  }, [])

  // Load vendors from API with sorting
  const loadVendors = async () => {
    setIsTableLoading(true)
    try {
      const data = await fetchVendors()
      setVendors(data)
    } catch (error) {
      showErrorToast("Failed to load vendors", "Please try again later.")
    } finally {
      setIsTableLoading(false)
    }
  }

  // Handle search when search query changes
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch()
      } else {
        loadVendors()
      }
    }, 500)

    return () => clearTimeout(delaySearch)
  }, [searchQuery])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsTableLoading(true)
    try {
      const data = await searchVendors(searchQuery)
      setVendors(data)
    } catch (error) {
      showErrorToast("Search failed", "Please try again.")
    } finally {
      setIsTableLoading(false)
    }
  }

  // Format date to Indian Standard Time

  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.id.toString().toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const totalCount = filteredVendors.length
  const pageCount = Math.ceil(totalCount / itemsPerPage)
  const paginatedVendors = filteredVendors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleEdit = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setIsDrawerOpen(true)
  }

  const handleCreate = () => {
    setSelectedVendor(null)
    setIsDrawerOpen(true)
  }

  const handleSave = async (vendorData: Omit<Vendor, "id" | "createdAt" | "updatedAt">) => {
    try {
      if (selectedVendor) {
        // Update existing vendor
        const updatedVendor = await updateVendor(selectedVendor.id, vendorData)
        setVendors(vendors.map((v) => (v.id === updatedVendor.id ? updatedVendor : v)))
        showSuccessToast("Vendor updated", `${updatedVendor.name} has been updated successfully.`)
      } else {
        // Create new vendor
        const newVendor = await createVendor(vendorData)
        // Ensure we have complete data before updating the UI
        if (newVendor && newVendor.id) {
          setVendors([...vendors, newVendor])
          showSuccessToast("Vendor created", `${newVendor.name} has been created successfully.`)
        } else {
          throw new Error("Incomplete vendor data received")
        }
      }
      setIsDrawerOpen(false)
    } catch (error) {
      showErrorToast(
        selectedVendor ? "Failed to update vendor" : "Failed to create vendor",
        "Please check your input and try again.",
      )
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteVendor(id)
      setVendors(vendors.filter((v) => v.id !== id))
      showSuccessToast("Vendor deleted", "The vendor has been deleted successfully.")
    } catch (error) {
      showErrorToast("Failed to delete vendor", "Please try again later.")
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  useEffect(() => {
    const fetchAccess = async () => {
      if (user && user.id) {
        try {
          const roles = await fetchRolesByUserId(user.id)
          if (roles && roles.length > 0) {
            const tabsAccess = roles[0].tabs_access
            const vendorsTab = tabsAccess.find((tab: any) => tab.hasOwnProperty("vendors"))
            setVendorsAccess(vendorsTab ? vendorsTab.vendors : null)
          }
        } catch {
          setVendorsAccess(null)
        }
      }
    }
    fetchAccess()
  }, [user])

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
                  placeholder="Search vendors..."
                  className="pl-9 w-full sm:w-[300px] border-slate-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </motion.div>
              {/* Hide Create New Vendor button if vendorsAccess === 1 */}
              {vendorsAccess !== 1 && (
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                  <Button
                    onClick={handleCreate}
                    className="bg-black hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white border-0 rounded-md w-full sm:w-auto"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Vendor
                  </Button>
                </motion.div>
              )}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="text-sm font-medium px-3 sm:px-4 py-1 sm:py-2 rounded-full sm:text-sm inline-block mb-4">
                <Badge variant="outline" className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm border-red-200 dark:border-red-800">
                  Total Count: <span className="font-bold ml-1">{vendors.length}</span>
                </Badge>
              </div>

              <VendorTable
                vendors={paginatedVendors}
                onEdit={handleEdit}
                onDelete={handleDelete}
                currentPage={currentPage}
                pageCount={pageCount}
                onPageChange={handlePageChange}
                totalCount={totalCount}
                isTableLoading={isTableLoading}
              />
            </motion.div>
          </div>
        </main>
      </div>

      <VendorDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        vendor={selectedVendor}
        onSave={handleSave}
      />
      {Toaster}
    </div>
  )
}
