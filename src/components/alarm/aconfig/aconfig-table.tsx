import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { AlarmTypeIcon } from "./AlarmTypeIcon"
import { SeverityBadge } from "./SeverityBadge"
import type { Alarm, AlarmTableProps } from "../../../types/alarm/aconfig_type"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatDate } from "../../formatdate"
import { fetchRolesByUserId } from "../../../data/usermanage/responsibility"
import { useAuth } from "@/context/AuthContext"

// Add alarmTabAccess to props
export const AlarmTable = ({
  alarms,
  onEdit,
  onDelete,
  loading,
  currentPage,
  pageCount,
  onPageChange,
  totalCount,
  onSort,
  onViewAssignedGroups,
  // Add new prop
}: AlarmTableProps) => {
  const { user } = useAuth()
  const [alarmTabAccess, setAlarmTabAccess] = useState<number | null>(null)
  const [actionsOpen, setActionsOpen] = useState<string | null>(null)
  const [sortField, setSortField] = useState<keyof Alarm | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [actionPositions, setActionPositions] = useState<Record<string, { top: boolean; right: boolean }>>({})

  const tableRef = useRef<HTMLDivElement>(null)
  const actionRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsOpen && !actionRefs.current[actionsOpen]?.contains(event.target as Node)) {
        setActionsOpen(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [actionsOpen])

  useEffect(() => {
    const fetchAccess = async () => {
      if (user && user.id) {
        try {
          const roles = await fetchRolesByUserId(user.id)
          if (roles && roles.length > 0) {
            const tabsAccess = roles[0].tabs_access
            const alarmTab = tabsAccess.find((tab: any) => tab.hasOwnProperty("alarm"))
            setAlarmTabAccess(alarmTab ? alarmTab.alarm : null)
          }
        } catch {
          setAlarmTabAccess(null)
        }
      }
    }
    fetchAccess()
  }, [user])

  const handleSortClick = (field: keyof Alarm) => {
    // Only allow sorting on created/updated dates
    if (field !== "createdOn" && field !== "updatedOn") return

    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
      onSort(field, sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Default to ascending for new field
      setSortField(field)
      setSortDirection("asc")
      onSort(field, "asc")
    }
  }

  const getSortIcon = (field: keyof Alarm) => {
    // Only show sort icons for sortable fields
    if (field !== "createdOn" && field !== "updatedOn") return null

    if (sortField !== field) {
      return <ArrowUp className="h-3 w-3 opacity-30" />
    }
    return sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
  }

  // Calculate optimal position for dropdown
  const toggleActions = (id: string, event: React.MouseEvent) => {
    event.stopPropagation()

    if (actionsOpen === id) {
      setActionsOpen(null)
      return
    }

    // Get button position
    const button = actionRefs.current[id]
    const table = tableRef.current

    if (button && table) {
      const buttonRect = button.getBoundingClientRect()
      const tableRect = table.getBoundingClientRect()
      const windowWidth = window.innerWidth

      // Calculate available space
      const spaceBelow = tableRect.bottom - buttonRect.bottom
      const spaceAbove = buttonRect.top - tableRect.top
      const spaceRight = tableRect.right - buttonRect.right
      const spaceLeft = buttonRect.left - tableRect.left

      // Force left positioning on small screens
      const isSmallScreen = windowWidth < 768

      // Determine optimal position
      const showOnTop = spaceBelow < 100 && spaceAbove > 100
      // On small screens, always show on left if possible
      const showOnLeft = isSmallScreen || (spaceRight < 150 && spaceLeft > 150)

      setActionPositions({
        ...actionPositions,
        [id]: { top: showOnTop, right: !showOnLeft },
      })
    }

    setActionsOpen(id)
  }

  const handleDeleteClick = (alarmId: string) => {
    setDeleteConfirmId(alarmId)
    setActionsOpen(null) // Close the actions dropdown
  }

  const confirmDelete = () => {
    if (deleteConfirmId) {
      onDelete(deleteConfirmId)
      setDeleteConfirmId(null)
    }
  }

  const renderStatusIcon = (status: string | undefined) => {
    if (status === "Active") {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  return (
    <>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        ref={tableRef}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10 h-15">
              <tr>
                {/* Conditionally render Actions column */}
                {alarmTabAccess !== 1 && (
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-sm whitespace-nowrap font-medium text-gray-500 dark:text-gray-400"
                  >
                    Actions
                  </th>
                )}
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm whitespace-nowrap font-medium text-gray-500 dark:text-gray-400"
                >
                  <div className="flex items-center gap-1">Alarm Type</div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm whitespace-nowrap font-medium text-gray-500 dark:text-gray-400"
                >
                  <div className="flex items-center gap-1">Severity Type</div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm whitespace-nowrap font-medium text-gray-500 dark:text-gray-400"
                >
                  <div className="flex items-center gap-1">Description</div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm whitespace-nowrap font-medium text-gray-500 dark:text-gray-400"
                >
                  <div className="flex items-center gap-1">Assigned To</div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm whitespace-nowrap font-medium text-gray-500 dark:text-gray-400"
                >
                  <button
                    className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
                    onClick={() => handleSortClick("createdOn")}
                  >
                    Created On {getSortIcon("createdOn")}
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm whitespace-nowrap font-medium text-gray-500 dark:text-gray-400"
                >
                  <button
                    className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
                    onClick={() => handleSortClick("updatedOn")}
                  >
                    Updated On {getSortIcon("updatedOn")}
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-sm whitespace-nowrap font-medium text-gray-500 dark:text-gray-400"
                >
                  <div className="flex items-center justify-center gap-1">Status</div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex justify-center items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                      <span>Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : alarms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No alarms found
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {alarms.map((alarm, index) => (
                    <motion.tr
                      key={alarm.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      {/* Conditionally render Actions cell */}
                      {alarmTabAccess !== 1 && (
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium relative">
                          <button
                            ref={(el) => { actionRefs.current[alarm.id] = el; }}
                            onClick={(e) => toggleActions(alarm.id, e)}
                            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>
                          <AnimatePresence>
                            {actionsOpen === alarm.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.1 }}
                                className="fixed bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700 w-30"
                              // style={{
                              //   // Position based on calculated optimal position
                              //   top: actionPositions[alarm.id]?.top
                              //     ? actionRefs.current[alarm.id]?.getBoundingClientRect().top! - 80
                              //     : actionRefs.current[alarm.id]?.getBoundingClientRect().bottom! + 5,
                              //   left: actionPositions[alarm.id]?.right
                              //     ? actionRefs.current[alarm.id]?.getBoundingClientRect().left! - 150
                              //     : window.innerWidth < 768
                              //       ? Math.max(10, actionRefs.current[alarm.id]?.getBoundingClientRect().left! - 160)
                              //       : actionRefs.current[alarm.id]?.getBoundingClientRect().left! - 10,
                              // }}
                              >
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      onEdit(alarm)
                                      setActionsOpen(null)
                                    }}
                                    className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                  >
                                    <Edit className="mr-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(alarm.id)}
                                    className="flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                  >
                                    <Trash2 className="mr-3 h-4 w-4 text-red-400 dark:text-red-500" />
                                    Delete
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <AlarmTypeIcon type={alarm.type} className="mr-2" />
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{alarm.type}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <SeverityBadge severity={alarm.severityType} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {alarm.description}
                        {alarm.description.length > 20 && (
                          <button className="ml-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs">
                            view more
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          {alarm.assignedTo && (
                            <button
                              onClick={() => onViewAssignedGroups(alarm)}
                              className="ml-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs flex items-center"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              View All
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(alarm.createdOn || "-")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(alarm.updatedOn || "-")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          {renderStatusIcon(alarm.status)}
                          <span
                            className={
                              alarm.status === "Active"
                                ? "px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                                : "px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                            }
                            style={{ lineHeight: "1.5", display: "inline-block" }}
                          >
                            {alarm.status === "Active" ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{alarms.length > 0 ? (currentPage - 1) * 5 + 1 : 0}</span> to{" "}
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
            <div className="bg-black dark:bg-gray-700 text-white px-3 py-1 rounded-md">
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
              Are you sure you want to delete this alarm? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
