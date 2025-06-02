import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Edit, Trash2, ChevronDown, ChevronLeft, ChevronRight, Eye, MoreVertical, ChevronUp, CheckCircle, XCircle } from "lucide-react"
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
import type { UserTableProps } from "../../../types/usermanage/user"

type SortField = "name" | "status"
type SortDirection = "asc" | "desc"

export function UserTable({
  users,
  onEdit,
  onDelete,
  currentPage = 1,
  pageCount = 1,
  onPageChange = () => {},
  totalCount = 0,
}: UserTableProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  const [sortField, setSortField] = useState<SortField>("name")
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

  // Sort users based on current sort field and direction
  const sortedUsers = [...users].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortField) {
      case "name":
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case "status":
        aValue = a.active ? "active" : "inactive"
        bValue = b.active ? "active" : "inactive"
        break
      default:
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
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
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    User Details
                    {getSortArrow("name")}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Contact Info</th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    Role & Status
                    {getSortArrow("status")}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">User Types</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Groups</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="rounded-full bg-slate-100 p-3">
                        <Eye className="h-6 w-6 text-slate-400" />
                      </div>
                      <p>No users found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {sortedUsers.map((user, index) => (
                    <React.Fragment key={user.id}>
                      <motion.tr
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleRow(user.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium relative lg:pr-0">
                          <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-5 w-5 text-gray-400" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(user)}>
                                  <Edit className="mr-2 h-4 w-4 text-gray-400" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(user.id)}
                                  className="text-red-600 focus:text-red-600"
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
                              className={`mr-2 h-4 w-4 text-slate-500 transition-transform duration-200 ${
                                expandedRow === user.id ? "rotate-180" : ""
                              }`}
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">ID: {user.id}</div>
                              <div className="text-sm text-gray-500">{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                          <div className="text-sm text-gray-500">{user.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 mb-1">{user.role}</div>
                          <div className="flex items-center">
                          {user.active ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500 mr-2" />
                          )}
                          <Badge
                            variant={user.active ? "default" : "outline"}
                            className={
                              user.active
                                ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
                                : "bg-slate-100 text-slate-800 hover:bg-slate-100 border-slate-200"
                            }
                          >
                            {user.active ? "Active" : "Inactive"}
                          </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {user.userTypes.slice(0, 2).map((type) => (
                              <Badge
                                key={type}
                                variant="outline"
                                className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200 text-xs"
                              >
                                {type}
                              </Badge>
                            ))}
                            {user.userTypes.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{user.userTypes.length - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex flex-wrap gap-1">
                            <Badge
                              variant="outline"
                              className="bg-purple-50 text-purple-700 hover:bg-purple-50 border-purple-200"
                            >
                              V: {user.vehicleGroups.length}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-orange-50 text-orange-700 hover:bg-orange-50 border-orange-200"
                            >
                              G: {user.geofenceGroups.length}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-teal-50 text-teal-700 hover:bg-teal-50 border-teal-200"
                            >
                              CG: {user.customerGroups.length}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">{user.tag}</div>
                        </td>
                      </motion.tr>

                      {/* Expanded row details */}
                      <AnimatePresence>
                        {expandedRow === user.id && (
                          <tr>
                            <td colSpan={6} className="p-0 border-0">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="p-3 sm:p-6 bg-slate-50 border-t border-b border-slate-200">
                                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
                                    <div>
                                      <h3 className="text-sm sm:text-lg font-semibold text-slate-800 mb-2 sm:mb-4">
                                        User Types
                                      </h3>
                                      <div className="space-y-2">
                                        {user.userTypes.length > 0 ? (
                                          user.userTypes.map((type) => (
                                            <div key={type} className="flex items-center">
                                              <span className="text-xs sm:text-sm font-medium text-indigo-700">
                                                • {type}
                                              </span>
                                            </div>
                                          ))
                                        ) : (
                                          <span className="text-xs sm:text-sm text-gray-500">
                                            No user types assigned
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <h3 className="text-sm sm:text-lg font-semibold text-slate-800 mb-2 sm:mb-4">
                                        Vehicle Groups
                                      </h3>
                                      <div className="space-y-2">
                                        {user.vehicleGroups.length > 0 ? (
                                          user.vehicleGroups.map((group) => (
                                            <div key={group} className="flex items-center">
                                              <span className="text-xs sm:text-sm font-medium text-purple-700">
                                                • {group}
                                              </span>
                                            </div>
                                          ))
                                        ) : (
                                          <span className="text-xs sm:text-sm text-gray-500">
                                            No vehicle groups assigned
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <h3 className="text-sm sm:text-lg font-semibold text-slate-800 mb-2 sm:mb-4">
                                        Geofence Groups
                                      </h3>
                                      <div className="space-y-2">
                                        {user.geofenceGroups.length > 0 ? (
                                          user.geofenceGroups.map((group) => (
                                            <div key={group} className="flex items-center">
                                              <span className="text-xs sm:text-sm font-medium text-orange-700">
                                                • {group}
                                              </span>
                                            </div>
                                          ))
                                        ) : (
                                          <span className="text-xs sm:text-sm text-gray-500">
                                            No geofence groups assigned
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <h3 className="text-sm sm:text-lg font-semibold text-slate-800 mb-2 sm:mb-4">
                                        Customer Groups
                                      </h3>
                                      <div className="space-y-2">
                                        {user.customerGroups.length > 0 ? (
                                          user.customerGroups.map((group) => (
                                            <div key={group} className="flex items-center">
                                              <span className="text-xs sm:text-sm font-medium text-teal-700">
                                                • {group}
                                              </span>
                                            </div>
                                          ))
                                        ) : (
                                          <span className="text-xs sm:text-sm text-gray-500">
                                            No customer groups assigned
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
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{sortedUsers.length > 0 ? (currentPage - 1) * 5 + 1 : 0}</span> to{" "}
            <span className="font-medium">{Math.min(currentPage * 5, totalCount)}</span> of{" "}
            <span className="font-medium">{totalCount}</span> entries
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-md border ${
                currentPage === 1
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
              className={`relative inline-flex items-center px-2 py-2 rounded-md border ${
                currentPage === pageCount
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
              Are you sure you want to delete this user? This action cannot be undone.
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
