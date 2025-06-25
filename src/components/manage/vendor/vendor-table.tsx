import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Edit, ChevronLeft, ChevronRight, Eye, MoreVertical, ChevronUp, ChevronDown,CheckCircle,XCircle, } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { VendorTableProps } from "../../../types/manage/vendor_type"
import { formatDate } from "../../../components/formatdate"
import { useAuth } from "@/context/AuthContext"
import { fetchRolesByUserId } from "@/data/usermanage/responsibility"

type SortField = "name" | "status" | "createdAt" | "updatedAt"
type SortDirection = "asc" | "desc"

export function VendorTable({
  vendors,
  onEdit,
  onDelete,
  currentPage = 1,
  pageCount = 1,
  onPageChange = () => { },
  totalCount = 0,
  isTableLoading = false,
}: VendorTableProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const { user } = useAuth()
  const [vendorsAccess, setVendorsAccess] = useState<number | null>(null)

  // Fetch vendors tab access

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

  // const handleDeleteClick = (id: number) => {
  //   setDeleteConfirmId(id)
  // }

  const confirmDelete = () => {
    if (deleteConfirmId !== null) {
      onDelete(deleteConfirmId)
      setDeleteConfirmId(null)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Sort vendors based on current sort field and direction
  const sortedVendors = [...vendors].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortField) {
      case "name":
        aValue = (a.name || "").toLowerCase()
        bValue = (b.name || "").toLowerCase()
        break
      case "status":
        aValue = a.active ? "active" : "inactive"
        bValue = b.active ? "active" : "inactive"
        break
      case "createdAt":
        aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0
        bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0
        break
      case "updatedAt":
        aValue = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
        bValue = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
        break
      default:
        aValue = (a.name || "").toLowerCase()
        bValue = (b.name || "").toLowerCase()
    }

    if (sortDirection === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const getSortArrow = (field: string) => {
    if (sortField === field) {
      return sortDirection === "asc" ? (
        <ChevronUp className="h-4 w-4 ml-1 text-indigo-600" />
      ) : (
        <ChevronDown className="h-4 w-4 ml-1 text-indigo-600" />
      )
    }
    return <ChevronUp className="h-4 w-4 ml-1 text-gray-400" />
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10">
              <tr>
                {/* Conditionally render Actions header */}
                {vendorsAccess !== 1 && (
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 lg:pr-0">Actions</th>
                )}
                <th
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    Vendor Details
                    {getSortArrow("name")}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    Status
                    {getSortArrow("status")}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center">
                    Created On
                    {getSortArrow("createdAt")}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleSort("updatedAt")}
                >
                  <div className="flex items-center">
                    Updated On
                    {getSortArrow("updatedAt")}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isTableLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center">
                      <span className="text-gray-600 dark:text-gray-400">Loading...</span>
                    </div>
                  </td>
                </tr>
              )}
              {!isTableLoading && vendors.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="rounded-full bg-slate-100 dark:bg-gray-700 p-3">
                        <Eye className="h-6 w-6 text-slate-400 dark:text-gray-500" />
                      </div>
                      <p>No vendors found</p>
                    </div>
                  </td>
                </tr>
              )}
              {!isTableLoading && (
                <AnimatePresence>
                  {sortedVendors.map((vendor, index) => (
                    <motion.tr
                      key={vendor.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      {/* Conditionally render Actions cell */}
                      {vendorsAccess !== 1 && (
                        <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium relative lg:pr-0">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="dark:bg-gray-800 dark:border-gray-700">
                              <DropdownMenuItem onClick={() => onEdit(vendor)} className="dark:text-gray-300 dark:hover:bg-gray-700">
                                <Edit className="mr-2 h-4 w-4 text-gray-400 dark:text-gray-400" />
                                Edit
                              </DropdownMenuItem>
                              {/* <DropdownMenuItem
                                onClick={() => handleDeleteClick(vendor.id)}
                                className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400 dark:hover:bg-gray-700"
                              >
                                <Trash2 className="mr-2 h-4 w-4 text-red-400" />
                                Delete
                              </DropdownMenuItem> */}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{vendor.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">ID: {vendor.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {vendor.active ? (
                            <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500 dark:text-red-400 mr-2" />
                          )}
                        <Badge
                          variant={vendor.active ? "default" : "outline"}
                          className={
                            vendor.active
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 border-green-200 dark:border-green-800"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700"
                          }
                        >
                          {vendor.active ? "Active" : "Inactive"}
                        </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(vendor.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(vendor.updatedAt)}</div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{vendors.length > 0 ? (currentPage - 1) * 5 + 1 : 0}</span> to{" "}
            <span className="font-medium">{Math.min(currentPage * 5, totalCount)}</span> of{" "}
            <span className="font-medium">{totalCount}</span> entries
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-md border ${currentPage === 1
                ? "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="bg-black dark:bg-gray-600 text-white px-3 py-1 rounded-md">
              {currentPage}/{pageCount || 1}
            </div>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === pageCount}
              className={`relative inline-flex items-center px-2 py-2 rounded-md border ${currentPage === pageCount
                ? "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Confirm Deletion</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Are you sure you want to delete this vendor? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
