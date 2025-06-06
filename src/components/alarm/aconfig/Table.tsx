import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown, MoreVertical, Edit, Trash2 } from "lucide-react"
import { AlarmTypeIcon } from "./AlarmTypeIcon"
import { SeverityBadge } from "./SeverityBadge"
import type { Alarm, AlarmTableProps } from "../../../types/alarm/aconfig"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export const AlarmTable = ({
  alarms,
  onEdit,
  onDelete,
  loading,
  currentPage,
  pageCount,
  onPageChange,
  totalCount,
  selectedAlarms,
  onSelectAlarm,
  onSelectAll,
  onSort,
}: AlarmTableProps) => {
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

  const handleSortClick = (field: keyof Alarm) => {
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

  return (
    <>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" ref={tableRef}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10 h-15">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-sm whitespace-nowrap font-medium text-gray-500 "
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={selectedAlarms.length > 0 && selectedAlarms.length === alarms.length}
                    onChange={(e) => onSelectAll(e.target.checked)}
                  />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-sm whitespace-nowrap font-medium text-gray-500 "
              >
                Actions
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-sm whitespace-nowrap font-medium text-gray-500 "
              >
                <button className="flex items-center gap-1 hover:text-gray-700" onClick={() => handleSortClick("type")}>
                  Alarm Type {getSortIcon("type")}
                </button>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-sm whitespace-nowrap font-medium text-gray-500 "
              >
                <button
                  className="flex items-center gap-1 hover:text-gray-700"
                  onClick={() => handleSortClick("alarmCategory")}
                >
                  Type {getSortIcon("alarmCategory")}
                </button>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-sm whitespace-nowrap font-medium text-gray-500 "
              >
                <button
                  className="flex items-center gap-1 hover:text-gray-700"
                  onClick={() => handleSortClick("severityType")}
                >
                  Severity Type {getSortIcon("severityType")}
                </button>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-sm whitespace-nowrap font-medium text-gray-500 "
              >
                <button
                  className="flex items-center gap-1 hover:text-gray-700"
                  onClick={() => handleSortClick("description")}
                >
                  Description {getSortIcon("description")}
                </button>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-sm whitespace-nowrap font-medium text-gray-500 "
              >
                <button
                  className="flex items-center gap-1 hover:text-gray-700"
                  onClick={() => handleSortClick("assignedTo")}
                >
                  Assigned To {getSortIcon("assignedTo")}
                </button>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-sm whitespace-nowrap font-medium text-gray-500 "
              >
                <button
                  className="flex items-center gap-1 hover:text-gray-700"
                  onClick={() => handleSortClick("createdBy")}
                >
                  Created By {getSortIcon("createdBy")}
                </button>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-sm whitespace-nowrap font-medium text-gray-500 "
              >
                Created On
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-sm whitespace-nowrap font-medium text-gray-500 "
              >
                <button
                  className="flex items-center gap-1 hover:text-gray-700"
                  onClick={() => handleSortClick("updatedBy")}
                >
                  Updated By {getSortIcon("updatedBy")}
                </button>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-sm whitespace-nowrap font-medium text-gray-500 "
              >
                Updated On
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={11} className="px-6 py-4 text-center text-sm text-gray-500">
                  <div className="flex justify-center items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                    <span>Loading...</span>
                  </div>
                </td>
              </tr>
            ) : alarms.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-6 py-4 text-center text-sm text-gray-500">
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
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={selectedAlarms.includes(alarm.id)}
                        onChange={(e) => onSelectAlarm(alarm.id, e.target.checked)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium relative">
                      <button
                        ref={(el) => (actionRefs.current[alarm.id] = el)}
                        onClick={(e) => toggleActions(alarm.id, e)}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
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
                            className="fixed bg-white rounded-md shadow-lg z-50 border border-gray-200 w-48"
                            style={{
                              // Position based on calculated optimal position
                              top: actionPositions[alarm.id]?.top
                                ? actionRefs.current[alarm.id]?.getBoundingClientRect().top! - 80
                                : actionRefs.current[alarm.id]?.getBoundingClientRect().bottom! + 5,
                              left: actionPositions[alarm.id]?.right
                                ? actionRefs.current[alarm.id]?.getBoundingClientRect().left! - 150
                                : window.innerWidth < 768
                                  ? Math.max(10, actionRefs.current[alarm.id]?.getBoundingClientRect().left! - 160)
                                  : actionRefs.current[alarm.id]?.getBoundingClientRect().left! - 10,
                            }}
                          >
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  onEdit(alarm)
                                  setActionsOpen(null)
                                }}
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                <Edit className="mr-3 h-4 w-4 text-gray-400" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteClick(alarm.id)}
                                className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                              >
                                <Trash2 className="mr-3 h-4 w-4 text-red-400" />
                                Delete
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <AlarmTypeIcon type={alarm.type} className="mr-2" />
                        <div className="text-sm font-medium text-gray-900">{alarm.type}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alarm.alarmCategory || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <SeverityBadge severity={alarm.severityType} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {alarm.description}
                      {alarm.description.length > 50 && (
                        <button className="ml-1 text-blue-500 hover:text-blue-700 text-xs">view more</button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alarm.assignedTo || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alarm.createdBy || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alarm.createdOn || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alarm.updatedBy || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alarm.updatedOn || "-"}</td>

                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{alarms.length > 0 ? (currentPage - 1) * 5 + 1 : 0}</span> to{" "}
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
              Are you sure you want to delete this alarm? This action cannot be undone.
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
