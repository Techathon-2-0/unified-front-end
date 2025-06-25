import { useRef, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MoreVertical, Edit, Trash2, ArrowUp, ArrowDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { GroupTableProps } from "../../../types/geofence/ggroup_type"
import { formatDate } from "../../formatdate"
import { fetchRolesByUserId } from "@/data/usermanage/responsibility"
import { useAuth } from "@/context/AuthContext"

export function GroupTable({
  groups,
  sortField,
  sortDirection,
  onViewDetails,
  onEditGroup,
  onDeleteGroup,
  onSort,
  isLoading = false,
}: GroupTableProps) {
  const tableRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const [geofenceGroupAccess, setGeofenceGroupAccess] = useState<number | null>(null)

  useEffect(() => {
    const fetchAccess = async () => {
      if (user && user.id) {
        try {
          const roles = await fetchRolesByUserId(user.id)
          if (roles && roles.length > 0) {
            const tabsAccess = roles[0].tabs_access
            const groupTab = tabsAccess.find((tab: any) => tab.hasOwnProperty("geofence_group"))
            setGeofenceGroupAccess(groupTab ? groupTab.geofence_group : null)
          }
        } catch {
          setGeofenceGroupAccess(null)
        }
      }
    }
    fetchAccess()
  }, [user])

  const handleSort = (field: string) => {
    if (onSort && !isLoading) {
      onSort(field)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg rounded-b-none shadow-sm border border-b-0 border-gray-200 dark:border-gray-700 overflow-hidden mx-4 mt-4">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 dark:text-gray-500" />
          <span className="ml-2 text-gray-500 dark:text-gray-400">Loading geofence groups...</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg rounded-b-none shadow-sm border border-b-0 border-gray-200 dark:border-gray-700 overflow-hidden mx-4 mt-4"
      ref={tableRef}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10 h-15">
            <tr>
              {/* Conditionally render Actions header */}
              {geofenceGroupAccess !== 1 && (
                <th scope="col" className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              )}
              <th
                scope="col"
                className="pl-12 px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                <button
                  className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 disabled:cursor-not-allowed"
                  onClick={() => handleSort("geo_group")}
                  disabled={isLoading}
                >
                  Name{" "}
                  {sortField === "geo_group" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )
                  ) : (
                    <ArrowUp className="h-3 w-3 opacity-30" />
                  )}
                </button>
              </th>
              <th scope="col" className="pl-3 px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 text-left">
                <button
                  className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 disabled:cursor-not-allowed"
                  onClick={() => handleSort("geofenceIds")}
                  disabled={isLoading}
                >
                  No of Geofence{" "}
                  {sortField === "geofenceIds" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )
                  ) : (
                    <ArrowUp className="h-3 w-3 opacity-30" />
                  )}
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                <div className="flex items-center justify-center">
                  <button
                    className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 disabled:cursor-not-allowed"
                    onClick={() => handleSort("created_at")}
                    disabled={isLoading}
                  >
                    Created On{" "}
                    {sortField === "created_at" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )
                    ) : (
                      <ArrowUp className="h-3 w-3 opacity-30" />
                    )}
                  </button>
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                <div className="flex items-center justify-center">
                  <button
                    className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 disabled:cursor-not-allowed"
                    onClick={() => handleSort("updated_at")}
                    disabled={isLoading}
                  >
                    Updated On{" "}
                    {sortField === "updated_at" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )
                    ) : (
                      <ArrowUp className="h-3 w-3 opacity-30" />
                    )}
                  </button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {groups.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No geofence groups found
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {groups.map((group, index) => (
                  <motion.tr
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => !isLoading && onViewDetails(group)}
                  >
                    {/* Conditionally render Actions cell */}
                    {geofenceGroupAccess !== 1 && (
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium relative">
                        <div onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={isLoading} className="dark:text-gray-300 dark:hover:bg-gray-700">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="dark:bg-gray-800 dark:border-gray-700">
                              <DropdownMenuItem onClick={() => onEditGroup(group)} disabled={isLoading} className="dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:bg-gray-700">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 dark:text-red-400 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                                onClick={() => onDeleteGroup(group)}
                                disabled={isLoading}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    )}
                    <td className="pl-12 pr-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{group.geo_group}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">ID: {group.id}</div>
                    </td>
                    <td className="pl-3 px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-left text-gray-900 dark:text-white">{group.geofenceIds.length}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(group.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(group.updated_at)}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
