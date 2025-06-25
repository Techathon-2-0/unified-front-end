import React, { useState, useEffect } from "react"
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
import type { UserTableProps } from "../../../types/usermanage/user_type"
import { fetchRolesByUserId } from "@/data/usermanage/responsibility"
import { useAuth } from "@/context/AuthContext"

type SortField = "name" | "status"
type SortDirection = "asc" | "desc"

export function UserTable({
  users,
  onEdit,
  onDelete,
  currentPage = 1,
  pageCount = 1,
  onPageChange = () => { },
  totalCount = 0,
}: UserTableProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const { user } = useAuth()
  const [userAccess, setUserAccess] = useState<number | null>(null)

  useEffect(() => {
    const fetchAccess = async () => {
      if (user && user.id) {
        try {
          const roles = await fetchRolesByUserId(user.id)
          if (roles && roles.length > 0) {
            const tabsAccess = roles[0].tabs_access
            const userTab = tabsAccess.find((tab: any) => tab.hasOwnProperty("user_access"))
            setUserAccess(userTab ? userTab.user_access : null)
          }
        } catch {
          setUserAccess(null)
        }
      }
    }
    fetchAccess()
  }, [user])

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
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
              <tr>
                {/* Conditionally render Actions header */}
                {userAccess !== 1 && (
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 lg:pr-0">Actions</th>
                )}
                <th
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    User Details
                    {getSortArrow("name")}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Contact Info</th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    Role & Status
                    {getSortArrow("status")}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">User Types</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Groups</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3">
                        <Eye className="h-6 w-6 text-slate-400 dark:text-slate-500" />
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
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => toggleRow(user.id)}
                      >
                        {/* Conditionally render Actions cell */}
                        {userAccess !== 1 && (
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
                                  <DropdownMenuItem onClick={() => onEdit(user)}>
                                    <Edit className="mr-2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteClick(user.id)}
                                    className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4 text-red-400 dark:text-red-500" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <ChevronDown
                              className={`mr-2 h-4 w-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${expandedRow === user.id ? "rotate-180" : ""
                                }`}
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">ID: {user.id}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white mb-1">{user.role}</div>
                          <div className="flex items-center">
                            {user.active ? (
                              <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500 dark:text-red-400 mr-2" />
                            )}
                            <Badge
                              variant={user.active ? "default" : "outline"}
                              className={
                                user.active
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 border-green-200 dark:border-green-800"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
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
                                className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-xs"
                              >
                                {type}
                              </Badge>
                            ))}
                            {user.userTypes.length > 2 && (
                              <Badge variant="outline" className="text-xs dark:text-gray-300 dark:border-gray-700">
                                +{user.userTypes.length - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white flex flex-wrap gap-1">
                            <Badge
                              variant="outline"
                              className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/40 border-purple-200 dark:border-purple-800"
                            >
                              V: {user.vehicleGroups.length}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/40 border-orange-200 dark:border-orange-800"
                            >
                              G: {user.geofenceGroups.length}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/40 border-teal-200 dark:border-teal-800"
                            >
                              CG: {user.customerGroups.length}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user.tag}</div>
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
                                <div className="p-3 sm:p-6 bg-slate-50 dark:bg-slate-800 border-t border-b border-slate-200 dark:border-slate-700">
                                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
                                    <div>
                                      <h3 className="lg:ml-10 text-sm sm:text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2 sm:mb-4">
                                        User Types
                                      </h3>
                                      <div className="max-h-20 overflow-y-auto scrollbar-none">
                                        <div className="lg:ml-10 space-y-2 pr-2">
                                          {user.userTypes.length > 0 ? (
                                            user.userTypes.map((type) => (
                                              <div key={type} className="flex items-center">
                                                <span className="text-xs sm:text-sm font-medium text-indigo-700 dark:text-indigo-400">
                                                  • {type}
                                                </span>
                                              </div>
                                            ))
                                          ) : (
                                            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                              No user types assigned
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <h3 className="text-sm sm:text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2 sm:mb-4">
                                        Vehicle Groups
                                      </h3>
                                      <div className="max-h-20 overflow-y-auto scrollbar-none">
                                        <div className="space-y-2 pr-2">
                                          {user.vehicleGroups.length > 0 ? (
                                            user.vehicleGroups.map((group) => (
                                              <div key={group} className="flex items-center">
                                                <span className="text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-400">
                                                  • {group}
                                                </span>
                                              </div>
                                            ))
                                          ) : (
                                            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                              No vehicle groups assigned
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <h3 className="text-sm sm:text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2 sm:mb-4">
                                        Geofence Groups
                                      </h3>
                                      <div className="max-h-20 overflow-y-auto scrollbar">
                              
                                        <div className="scrollbar-content space-y-2 pr-2">
                                          {user.geofenceGroups.length > 0 ? (
                                            user.geofenceGroups.map((group) => (
                                              <div key={group} className="flex items-center">
                                                <span className="text-xs sm:text-sm font-medium text-orange-700 dark:text-orange-400">
                                                  • {group}
                                                </span>
                                              </div>
                                            ))
                                          ) : (
                                            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                              No geofence groups assigned
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <h3 className="text-sm sm:text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2 sm:mb-4">
                                        Customer Groups
                                      </h3>
                                      <div className="max-h-20 overflow-y-auto scrollbar-none">
                                        <div className="space-y-2 pr-2">
                                          {user.customerGroups.length > 0 ? (
                                            user.customerGroups.map((group) => (
                                              <div key={group} className="flex items-center">
                                                <span className="text-xs sm:text-sm font-medium text-teal-700 dark:text-teal-400">
                                                  • {group}
                                                </span>
                                              </div>
                                            ))
                                          ) : (
                                            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                              No customer groups assigned
                                            </span>
                                          )}
                                        </div>
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
            Showing <span className="font-medium">{sortedUsers.length > 0 ? (currentPage - 1) * 5 + 1 : 0}</span> to{" "}
            <span className="font-medium">{Math.min(currentPage * 5, totalCount)}</span> of{" "}
            <span className="font-medium">{totalCount}</span> entries
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-md border ${currentPage === 1
                ? "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="bg-black dark:bg-gray-700 text-white px-3 py-1 rounded-md">
              {currentPage}/{pageCount || 1}
            </div>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === pageCount}
              className={`relative inline-flex items-center px-2 py-2 rounded-md border ${currentPage === pageCount
                ? "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
              Are you sure you want to delete this entity? This action cannot be undone.
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
