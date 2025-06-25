import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Info } from "lucide-react"
import type { VehicleTableProps } from "../../types/live/list_type"
import VehicleDetailsModal from "./VehicleDetailsModal"
import type { Vehicle } from "../../types/live/list_type"

const VehicleTable = ({
  vehicles,
  loading,
  currentPage,
  pageCount,
  onPageChange,
  onSort,
  // selectedVehicles,
  // onSelectVehicle,
  // onSelectAll,
  totalCount,
}: VehicleTableProps) => {
  const [detailsVehicle, setDetailsVehicle] = useState<Vehicle | null>(null)
  const [sortField, setSortField] = useState<keyof Vehicle | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const handleSortClick = (field: keyof Vehicle) => {
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

  const getSortIcon = (field: keyof Vehicle) => {
    if (sortField !== field) {
      return <ArrowUp className="h-3 w-3 opacity-30" />
    }
    return sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
  }

  // Helper to get the latest time between gpsTime and gprsTime
  const getLatestTime = (vehicle: Vehicle) => {
    const gps = vehicle.gpsTime ? new Date(vehicle.gpsTime) : null
    const gprs = vehicle.gprsTime ? new Date(vehicle.gprsTime) : null
    if (gps && gprs) {
      return gps > gprs ? vehicle.gpsTime : vehicle.gprsTime
    }
    return gps ? vehicle.gpsTime : gprs ? vehicle.gprsTime : "No Data"
  }

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case "Active":
  //       return "bg-green-100 text-green-800"
  //     case "Idle":
  //       return "bg-yellow-100 text-yellow-800"
  //     case "Stopped":
  //       return "bg-red-100 text-red-800"
  //     case "No Data":
  //       return "bg-gray-100 text-gray-800"
  //     default:
  //       return "bg-gray-100 text-gray-800"
  //   }
  // }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900 h-15">
              <tr>
                {/* <th
                  scope="col"
                  className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-red-600 border-gray-300 dark:border-gray-600 rounded"
                      checked={selectedVehicles.length > 0 && selectedVehicles.length === vehicles.length}
                      onChange={(e) => onSelectAll(e.target.checked)}
                    />
                  </div>
                </th> */}
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  <button className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300">
                    ID
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  <button
                    className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
                    onClick={() => handleSortClick("vehicleNumber")}
                  >
                    Name {getSortIcon("vehicleNumber")}
                  </button>
                </th>
                {/* <th
                  scope="col"
                  className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap"
                >
                  Device Name
                </th> */}
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  <button
                    className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
                    onClick={() => handleSortClick("speed")}
                  >
                    Speed {getSortIcon("speed")}
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  <button
                    className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
                    // No sort for lat/lng
                  >
                    Location
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  <button
                    className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
                    // No sort for vendorName
                  >
                    GPS Vendor
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-6 pr-13 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  <button
                    className="flex items-center gap-1 justify-center hover:text-gray-700 dark:hover:text-gray-300 whitespace-nowrap "
                    onClick={() => handleSortClick("gpsTime")}
                  >
                    GPS Time {getSortIcon("gpsTime")}
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No vehicles found
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {vehicles.map((vehicle, index) => (
                    <motion.tr
                      key={vehicle.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      {/* <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-red-600 border-gray-300 dark:border-gray-600 rounded"
                          checked={selectedVehicles.includes(vehicle.id)}
                          onChange={(e) => onSelectVehicle(vehicle.id, e.target.checked)}
                        />
                      </td> */}
                      <td className="px-6 py-4 text-left text-sm text-gray-500 dark:text-gray-400">{vehicle.id || "NULL"}</td>
                       <td className="px-6 py-4 text-left font-medium text-sm text-gray-900 dark:text-gray-400">{vehicle.vehicleNumber || "NULL"}</td>
                      {/* <td className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">{vehicle.deviceName}</td> */}
                      <td className="px-6 py-4 text-left text-sm text-gray-500 dark:text-gray-400">{vehicle.speed || 0} km/h</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                        <div className="truncate cursor-default">
                          {vehicle.lat && vehicle.lng
                            ? `${vehicle.lat.toFixed(6)}, ${vehicle.lng.toFixed(6)}`
                            : "No location"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {vehicle.vendorName || "-"}
                      </td>
                      {/* <td className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">{vehicle.altitude}</td> */}
                      <td className="px-6 pr-13  py-4 text-center text-sm text-gray-500 dark:text-gray-400 w-1 whitespace-nowrap">
                        {getLatestTime(vehicle)}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">{vehicle.type}</td>
                      <td className="px-6 py-4 text-center ">
                        <span
                          className={`px-2 inline-flex text-xs whitespace-nowrap leading-5 font-semibold rounded-full ${vehicle.status === "Active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                              : vehicle.status === "No Data"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                                : vehicle.status === "No Update"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                            }`}
                        >
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-medium">
                        <button
                          onClick={() => setDetailsVehicle(vehicle)}
                          className="text-black dark:text-white hover:text-gray-800 dark:hover:text-gray-300"
                        >
                          <Info className="h-5 w-5" />
                        </button>
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
            Showing <span className="font-medium">{vehicles.length > 0 ? (currentPage - 1) * 5 + 1 : 0}</span> to{" "}
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
              {currentPage}/{pageCount}
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

      {detailsVehicle && <VehicleDetailsModal vehicle={detailsVehicle} onClose={() => setDetailsVehicle(null)} />}
    </>
  )
}



export default VehicleTable
