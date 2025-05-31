import { useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MoreVertical, Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { GroupTableProps } from "../../../types/geofence/ggroup"

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString()
}

export function GroupTable({
  groups,
  sortField,
  sortDirection,
  onViewDetails,
  onEditGroup,
  onDeleteGroup,
  onSort, // Add this prop to handle sorting
}: GroupTableProps) {
  const tableRef = useRef<HTMLDivElement>(null)

  const handleSort = (field: string) => {
    if (onSort) {
      onSort(field)
    }
  }

  return (
    <div
      className="bg-white rounded-lg rounded-b-none shadow-sm border border-b-0 border-gray-200 overflow-hidden mx-4 mt-4"
      ref={tableRef}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10 h-15">
            <tr>
              <th
                scope="col"
                className="pl-12 px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
              >
                <button 
                  className="flex items-center gap-1 hover:text-gray-700"
                  onClick={() => handleSort("name")}
                >
                  Name{" "}
                  {sortField === "name" ? (
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
              <th
                scope="col"
                className="pl-3 px-6 py-3 text-sm font-medium text-gray-500 text-left"
              >
                <button 
                  className="flex items-center gap-1 hover:text-gray-700"
                  onClick={() => handleSort("geofenceIds")}
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
              {/* <th
                scope="col"
                className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
              >
                <button className="flex items-center gap-1 hover:text-gray-700">
                  Person In Charge{" "}
                  {sortField === "personInCharge" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )
                  ) : (
                    <ArrowUp className="h-3 w-3 opacity-30" />
                  )}
                </button>
              </th> */}
              <th
                scope="col"
                className="px-6 py-3 text-center text-sm font-medium text-gray-500"
              >
                <div className="flex items-center justify-center">
                  <button 
                    className="flex items-center gap-1 hover:text-gray-700"
                    onClick={() => handleSort("createdAt")}
                  >
                    Created On{" "}
                    {sortField === "createdAt" ? (
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
              <th
                scope="col"
                className="px-6 py-3 text-center text-sm font-medium text-gray-500"
              >
                <div className="flex items-center justify-center">
                  <button 
                    className="flex items-center gap-1 hover:text-gray-700"
                    onClick={() => handleSort("updatedAt")}
                  >
                    Updated On{" "}
                    {sortField === "updatedAt" ? (
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
              <th
                scope="col"
                className="px-6 py-3 text-center text-sm font-medium text-gray-500"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {groups.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
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
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => onViewDetails(group)}
                  >
                    <td className="pl-12 pr-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{group.name}</div>
                      <div className="text-xs text-gray-500">{group.id}</div>
                      {/* Mobile-only info */}
                      {/* <div className="sm:hidden text-xs text-gray-500 mt-1">
                        {group.personInCharge && (
                          <div>
                            <span className="font-medium">PIC:</span> {group.personInCharge}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Geofences:</span> {group.geofenceIds.length}
                        </div>
                      </div> */}
                    </td>
                    <td className="pl-3 px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-left text-gray-900">{group.geofenceIds.length}</div>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-sm text-gray-900">{group.personInCharge || "-"}</div>
                      <div className="text-xs text-gray-500">{group.contactInfo || "-"}</div>
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {formatDate(group.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {formatDate(group.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium relative">
                      <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEditGroup(group)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => onDeleteGroup(group)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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