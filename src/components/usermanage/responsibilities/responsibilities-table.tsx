import React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Edit, Trash2, ChevronDown, ChevronLeft, ChevronRight, Eye, MoreVertical, ChevronUp } from "lucide-react"
import type { ResponsibilitiesTableProps } from "../../../types/usermanage/responsibilities"
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

type SortField = "role_name" | "created_at" | "updated_at"
type SortDirection = "asc" | "desc"

export function ResponsibilitiesTable({
  responsibilities,
  onEdit,
  onDelete,
  currentPage = 1,
  pageCount = 1,
  onPageChange = () => { },
  totalCount = 0,
}: ResponsibilitiesTableProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [sortField, setSortField] = useState<SortField>("role_name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  const toggleRow = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  const handleDeleteClick = (id: number) => {
    setDeleteConfirmId(id)
  }

  const confirmDelete = () => {
    if (deleteConfirmId) {
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

  // Parse date string in ISO format
  const parseDate = (dateString: string) => {
    return new Date(dateString).getTime()
  }

  // Format date for display in IST
  const formatDate = (dateString: string) => {
    // Manual parsing to avoid timezone issues
    const [datePart, timePart] = dateString.split('T');
    const [year, month, day] = datePart.split('-');
    const [hour, minute, secondPart] = timePart.split(':');
    const second = secondPart.split('.')[0];

    // Create date object from parsed components
    const date = new Date(
      parseInt(year),
      parseInt(month) - 1, // Month is 0-indexed
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    );

    // Format using toLocaleString for proper display
    return date.toLocaleString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Calculate feature counts
  const getFeatureCount = (responsibility: any) => {
    return responsibility?.tabs_access?.length + responsibility?.report_access?.length
  }

  // Sort responsibilities based on current sort field and direction
  const sortedResponsibilities = [...responsibilities].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortField) {
      case "role_name":
        aValue = a.role_name.toLowerCase()
        bValue = b.role_name.toLowerCase()
        break
      case "created_at":
        aValue = parseDate(a.created_at)
        bValue = parseDate(b.created_at)
        break
      case "updated_at":
        aValue = parseDate(a.updated_at)
        bValue = parseDate(b.updated_at)
        break
      default:
        aValue = a.role_name.toLowerCase()
        bValue = b.role_name.toLowerCase()
    }

    if (sortDirection === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 lg:pr-0">Actions</th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 lg:pl-0 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("role_name")}
                >
                  <div className="flex items-center">
                    Responsibilities Name
                    {getSortArrow("role_name")}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("created_at")}
                >
                  <div className="flex items-center">
                    Creation Time
                    {getSortArrow("created_at")}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("updated_at")}
                >
                  <div className="flex items-center">
                    Last Update
                    {getSortArrow("updated_at")}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Feature Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedResponsibilities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="rounded-full bg-slate-100 p-3">
                        <Eye className="h-6 w-6 text-slate-400" />
                      </div>
                      <p>No responsibilities found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {sortedResponsibilities.map((responsibility, index) => (
                    <React.Fragment key={responsibility.id}>
                      <motion.tr
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleRow(responsibility.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium relative lg:pr-0">
                          <div onClick={(e) => e.stopPropagation()}>
                            <div className="group">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-5 w-5 text-gray-400" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => onEdit(responsibility)}>
                                    <Edit className="mr-2 h-4 w-4 text-gray-400" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteClick(responsibility.id)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4 text-red-400" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap lg:pl-0">
                          <div className="flex items-center">
                            <ChevronDown
                              className={`mr-2 h-4 w-4 text-slate-500 transition-transform duration-200 ${expandedRow === responsibility.id ? "rotate-180" : ""
                                }`}
                            />
                            <div className="text-sm font-medium text-gray-900">{responsibility.role_name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {responsibility.created_at ? formatDate(responsibility.created_at) : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {responsibility.updated_at ? formatDate(responsibility.updated_at) : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-indigo-200"
                          >
                            {responsibility ? getFeatureCount(responsibility) : "N/A"} Features
                          </Badge>
                        </td>
                      </motion.tr>

                      {/* Expanded row details */}
                      <AnimatePresence>
                        {expandedRow === responsibility.id && (
                          <tr>
                            <td colSpan={5} className="p-0 border-0">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="p-3 sm:p-6 bg-slate-50 border-t border-b border-slate-200">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                    <div>
                                      <h3 className="text-sm sm:text-lg font-semibold text-slate-800 mb-2 sm:mb-4">
                                        Feature Breakdown
                                      </h3>
                                      <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                          <span className="text-xs sm:text-sm text-slate-600">Reports:</span>
                                          <span className="font-medium text-xs sm:text-sm text-indigo-700">
                                            {responsibility.report_access.length}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-xs sm:text-sm text-slate-600">Tabs:</span>
                                          <span className="font-medium text-xs sm:text-sm text-indigo-700">
                                            {responsibility.tabs_access.length}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center border-t pt-2">
                                          <span className="text-xs sm:text-sm text-slate-600 font-medium">Total:</span>
                                          <span className="font-bold text-xs sm:text-sm text-slate-800">
                                            {getFeatureCount(responsibility)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <h3 className="text-sm sm:text-lg font-semibold text-slate-800 mb-2 sm:mb-4">
                                        Tabs Access
                                      </h3>
                                      <div className="space-y-1 max-h-32 overflow-y-auto">
                                        {responsibility.tabs_access.map((tabObj, index) => {
                                          const [tabName, accessLevel] = Object.entries(tabObj)[0]
                                          return (
                                            <div key={index} className="flex justify-between items-center">
                                              <span className="text-xs text-slate-600 capitalize">
                                                {tabName.replace(/_/g, " ")}:
                                              </span>
                                              <span
                                                className={`text-xs font-medium ${accessLevel === 1 ? "text-blue-600" : "text-green-600"
                                                  }`}
                                              >
                                                {accessLevel === 1 ? "View" : "Both"}
                                              </span>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    </div>

                                    <div>
                                      <h3 className="text-sm sm:text-lg font-semibold text-slate-800 mb-2 sm:mb-4">
                                        Report Access
                                      </h3>
                                      <div className="space-y-1 max-h-32 overflow-y-auto">
                                        {responsibility.report_access.length > 0 ? (
                                          responsibility.report_access.map((report, index) => (
                                            <div key={index} className="text-xs text-slate-600">
                                              • {report}
                                            </div>
                                          ))
                                        ) : (
                                          <div className="text-xs text-slate-500 italic">No reports assigned</div>
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
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing{" "}
            <span className="font-medium">{sortedResponsibilities.length > 0 ? (currentPage - 1) * 5 + 1 : 0}</span> to{" "}
            <span className="font-medium">{Math.min(currentPage * 5, totalCount)}</span> of{" "}
            <span className="font-medium">{totalCount}</span> entries
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-md border ${currentPage === 1
                  ? "border-gray-300 bg-white text-gray-300 cursor-not-allowed"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="bg-black text-white px-3 py-1 rounded-md">
              {currentPage}/{pageCount || 1}
            </div>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === pageCount}
              className={`relative inline-flex items-center px-2 py-2 rounded-md border ${currentPage === pageCount
                  ? "border-gray-300 bg-white text-gray-300 cursor-not-allowed"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this responsibility? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
