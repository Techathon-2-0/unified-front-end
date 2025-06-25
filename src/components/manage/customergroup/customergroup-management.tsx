import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { PlusCircle, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CustomerGroupTable } from "./customergroup-table"
import { CustomerGroupDrawer } from "./customergroup-drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import type { CustomerGroup } from "../../../types/manage/customergroup_type"
import {
  fetchCustomerGroups,
  createCustomerGroup,
  updateCustomerGroup,
  deleteCustomerGroup,
  searchCustomerGroups,
} from "../../../data/manage/customergroup"
import { fetchRolesByUserId } from "@/data/usermanage/responsibility"
import { useAuth } from "@/context/AuthContext"

export function CustomerGroupManagementPage() {
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedCustomerGroup, setSelectedCustomerGroup] = useState<CustomerGroup | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isTableLoading, setIsTableLoading] = useState(false)
  const itemsPerPage = 5

  const { showSuccessToast, showErrorToast, Toaster } = useToast({ position: "top-right" })
  const { user } = useAuth()
  const [customerAccess, setCustomerAccess] = useState<number | null>(null)

  // Load customer groups on component mount
  useEffect(() => {
    loadCustomerGroups()
  }, [])

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch()
      } else {
        loadCustomerGroups()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  useEffect(() => {
    const fetchAccess = async () => {
      if (user && user.id) {
        try {
          const roles = await fetchRolesByUserId(user.id)
          if (roles && roles.length > 0) {
            const tabsAccess = roles[0].tabs_access
            const customerTab = tabsAccess.find((tab: any) => tab.hasOwnProperty("customer"))
            setCustomerAccess(customerTab ? customerTab.customer : null)
          }
        } catch {
          setCustomerAccess(null)
        }
      }
    }
    fetchAccess()
  }, [user])

  const loadCustomerGroups = async () => {
    try {
      setIsTableLoading(true)
      const data = await fetchCustomerGroups()
      setCustomerGroups(data)
    } catch (error) {
      showErrorToast("Failed to load customer groups", "Please try again later.")
    } finally {
      setIsLoading(false)
      setIsTableLoading(false)
    }
  }

  const handleSearch = async () => {
    try {
      setIsTableLoading(true)
      const data = await searchCustomerGroups(searchQuery)
      setCustomerGroups(data)
      setCurrentPage(1)
    } catch (error) {
      showErrorToast("Search failed", "Please try again.")
    } finally {
      setIsTableLoading(false)
    }
  }

  const filteredCustomerGroups = customerGroups.filter(
    (customerGroup) =>
      customerGroup.group_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerGroup.id.toString().includes(searchQuery),
  )

  const totalCount = filteredCustomerGroups.length
  const pageCount = Math.ceil(totalCount / itemsPerPage)
  const paginatedCustomerGroups = filteredCustomerGroups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const handleEdit = (customerGroup: CustomerGroup) => {
    setSelectedCustomerGroup(customerGroup)
    setIsDrawerOpen(true)
  }

  const handleCreate = () => {
    setSelectedCustomerGroup(null)
    setIsDrawerOpen(true)
  }

  const handleSave = async (customerGroup: CustomerGroup) => {
    try {
      if (selectedCustomerGroup) {
        // Update existing customer group
        await updateCustomerGroup(selectedCustomerGroup.id, {
          group_name: customerGroup.group_name,
          customerIds: customerGroup.customerIds,
        })
        showSuccessToast("Customer group updated", `${customerGroup.group_name} has been updated successfully.`)
      } else {
        // Create new customer group
        await createCustomerGroup({
          group_name: customerGroup.group_name,
          customerIds: customerGroup.customerIds,
        })
        showSuccessToast("Customer group created", `${customerGroup.group_name} has been created successfully.`)
      }

      // Refresh the list
      await loadCustomerGroups()
      setIsDrawerOpen(false)
    } catch (error: any) {
      showErrorToast(
        selectedCustomerGroup ? "Failed to update customer group" : "Failed to create customer group",
        error.response?.data?.message || "Please try again.",
      )
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteCustomerGroup(id)
      showSuccessToast("Customer group deleted", "The customer group has been deleted successfully.")
      await loadCustomerGroups()
    } catch (error: any) {
      showErrorToast("Failed to delete customer group", error.response?.data?.message || "Please try again.")
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-gray-900 items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900 dark:text-gray-100">Loading customer groups...</div>
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
                  placeholder="Search customer groups..."
                  className="pl-9 w-full sm:w-[300px] border-slate-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </motion.div>
              {/* Hide Create New Customer Group button if customerAccess === 1 */}
              {customerAccess !== 1 && (
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                  <Button
                    onClick={handleCreate}
                    className="bg-black hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 text-white border-0 rounded-md w-full sm:w-auto"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Customer Group
                  </Button>
                </motion.div>
              )}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="text-sm font-medium px-3 sm:px-4 py-1 sm:py-2 rounded-full sm:text-sm inline-block mb-4">
                <Badge variant="outline" className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm border-red-200 dark:border-red-800">
                  Total Count: <span className="font-bold ml-1">{customerGroups.length}</span>
                </Badge>
              </div>

              <CustomerGroupTable
                customerGroups={paginatedCustomerGroups}
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

      <CustomerGroupDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        customerGroup={selectedCustomerGroup}
        onSave={handleSave}
      />
      {Toaster}
    </div>
  )
}
