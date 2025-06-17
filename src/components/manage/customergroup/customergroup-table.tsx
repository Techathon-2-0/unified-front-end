import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Edit, Trash2, ChevronDown, ChevronLeft, ChevronRight, Eye, MoreVertical, ChevronUp } from "lucide-react"
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
import type { CustomerGroupTableProps } from "../../../types/manage/customergroup_type"
import { formatDate } from "../../../components/formatdate"

type SortField = "group_name" | "customerCount" | "created_at" | "updated_at"
type SortDirection = "asc" | "desc"

export function CustomerGroupTable({
  customerGroups,
  onEdit,
  onDelete,
  currentPage = 1,
  pageCount = 1,
  onPageChange = () => { },
  totalCount = 0,
  isTableLoading = false,
}: CustomerGroupTableProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  const [sortField, setSortField] = useState<SortField>("group_name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  const handleDeleteClick = (id: number) => {
    setDeleteConfirmId(id)
  }

  const confirmDelete = () => {
    if (deleteConfirmId) {
      onDelete(deleteConfirmId)
      setDeleteConfirmId(null)
    }
  }

  const toggleRow = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortArrow = (field: SortField) => {
    if (sortField === field) {
      return sortDirection === "asc" ? (
        <ChevronUp className="h-4 w-4 ml-1 text-indigo-600" />
      ) : (
        <ChevronDown className="h-4 w-4 ml-1 text-indigo-600" />
      )
    }
    return <ChevronUp className="h-4 w-4 ml-1 text-gray-400" />
  }

  // Sort customer groups based on current sort field and direction
  const sortedCustomerGroups = [...customerGroups].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortField) {
      case "group_name":
        aValue = (a.group_name || "").toLowerCase()
        bValue = (b.group_name || "").toLowerCase()
        break
      case "customerCount":
        aValue = a.customerIds?.length || 0
        bValue = b.customerIds?.length || 0
        break
      case "created_at":
        aValue = a.created_at ? new Date(a.created_at).getTime() : 0
        bValue = b.created_at ? new Date(b.created_at).getTime() : 0
        break
      case "updated_at":
        aValue = a.updated_at ? new Date(a.updated_at).getTime() : 0
        bValue = b.updated_at ? new Date(b.updated_at).getTime() : 0
        break
      default:
        aValue = (a.group_name || "").toLowerCase()
        bValue = (b.group_name || "").toLowerCase()
    }

    if (sortDirection === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 lg:pr-0">Actions</th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 lg:pl-0 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleSort("group_name")}
                >
                  <div className="flex items-center">
                    Customer Group Details
                    {getSortArrow("group_name")}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleSort("customerCount")}
                >
                  <div className="flex items-center">
                    Customer Count
                    {getSortArrow("customerCount")}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleSort("created_at")}
                >
                  <div className="flex items-center">
                    Created On
                    {getSortArrow("created_at")}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleSort("updated_at")}
                >
                  <div className="flex items-center">
                    Updated On
                    {getSortArrow("updated_at")}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 relative">
              {isTableLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center">
                      <span className="text-gray-600 dark:text-gray-400">Loading...</span>
                    </div>
                  </td>
                </tr>
              )}
              {!isTableLoading && sortedCustomerGroups.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="rounded-full bg-slate-100 dark:bg-gray-700 p-3">
                        <Eye className="h-6 w-6 text-slate-400 dark:text-gray-400" />
                      </div>
                      <p>No customer groups found</p>
                    </div>
                  </td>
                </tr>
              )}
              {!isTableLoading && (
                <AnimatePresence>
                  {sortedCustomerGroups.map((customerGroup, index) => (
                    <React.Fragment key={customerGroup.id}>
                      <motion.tr
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                        onClick={() => toggleRow(customerGroup.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium relative lg:pr-0">
                          <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => onEdit(customerGroup)}>
                                  <Edit className="mr-2 h-4 w-4 text-gray-400 dark:text-gray-400" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(customerGroup.id)}
                                  className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                                >
                                  <Trash2 className="mr-2 h-4 w-4 text-red-400" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap lg:pl-0">
                          <div className="flex items-center">
                            <ChevronDown
                              className={`mr-2 h-4 w-4 text-slate-500 dark:text-gray-400 transition-transform duration-200 ${expandedRow === customerGroup.id ? "rotate-180" : ""
                                }`}
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{customerGroup.group_name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">ID: {customerGroup.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 border-indigo-200 dark:border-indigo-800"
                          >
                            {customerGroup.customerIds?.length} Customers
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(customerGroup.created_at)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(customerGroup.updated_at)}</div>
                        </td>
                      </motion.tr>

                      {/* Expanded row details */}
                      <AnimatePresence>
                        {expandedRow === customerGroup.id && (
                          <tr>
                            <td colSpan={5} className="p-0 border-0">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="p-3 sm:p-6 bg-slate-50 dark:bg-gray-900/40 border-t border-b border-slate-200 dark:border-gray-700">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div>
                                      <h3 className="text-sm sm:text-lg font-semibold text-slate-800 dark:text-gray-200 mb-2 sm:mb-4">
                                        Customer Group Information
                                      </h3>
                                      <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                          <span className="text-xs sm:text-sm text-slate-600 dark:text-gray-400">Group Name:</span>
                                          <span className="text-xs sm:text-sm font-medium text-indigo-700 dark:text-indigo-300">
                                            {customerGroup.group_name}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-xs sm:text-sm text-slate-600 dark:text-gray-400">Total Customers:</span>
                                          <span className="text-xs sm:text-sm font-medium text-indigo-700 dark:text-indigo-300">
                                            {customerGroup.customerIds?.length}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <h3 className="text-sm sm:text-lg font-semibold text-slate-800 dark:text-gray-200 mb-2 sm:mb-4">
                                        Customer IDs
                                      </h3>
                                      <div className="space-y-1 max-h-20 overflow-y-auto">
                                        {customerGroup.customerIds.length > 0 ? (
                                          customerGroup.customerIds.map((customerId) => (
                                            <div key={customerId} className="flex items-center">
                                              <span className="text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-400">
                                                • {customerId}
                                              </span>
                                            </div>
                                          ))
                                        ) : (
                                          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                            No customers assigned
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing{" "}
            <span className="font-medium">{sortedCustomerGroups.length > 0 ? (currentPage - 1) * 5 + 1 : 0}</span> to{" "}
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
              Are you sure you want to delete this customer group? This action cannot be undone.
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
