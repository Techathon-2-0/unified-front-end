import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Info } from "lucide-react"
import type { VehicleTableProps } from "../../types/live/list"
import VehicleDetailsModal from "./VehicleDetailsModal"
import type { Vehicle } from "../../types/live/list"

const VehicleTable = ({
  vehicles,
  loading,
  currentPage,
  pageCount,
  onPageChange,
  onSort,
  selectedVehicles,
  onSelectVehicle,
  onSelectAll,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Idle":
        return "bg-yellow-100 text-yellow-800"
      case "Stopped":
        return "bg-red-100 text-red-800"
      case "No Data":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className=" min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 h-15">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-sm font-medium text-gray-500"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-red-600 border-gray-300 rounded"
                      checked={selectedVehicles.length > 0 && selectedVehicles.length === vehicles.length}
                      onChange={(e) => onSelectAll(e.target.checked)}
                    />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 "
                >
                  <button
                    className="flex items-center gap-1 hover:text-gray-700"
                    onClick={() => handleSortClick("vehicleNumber")}
                  >
                    Name {getSortIcon("vehicleNumber")}
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-sm font-medium text-gray-500 whitespace-nowrap"
                >
                  Device Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-sm font-medium text-gray-500"
                >
                  <button
                    className="flex items-center gap-1 hover:text-gray-700"
                    onClick={() => handleSortClick("speed")}
                  >
                    Speed {getSortIcon("speed")}
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-sm font-medium text-gray-500"
                >
                  <button
                    className="flex items-center gap-1 hover:text-gray-700"
                    onClick={() => handleSortClick("address")}
                  >
                    Address {getSortIcon("address")}
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-sm font-medium text-gray-500 "
                >
                  Altitude
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-sm font-medium text-gray-500 "
                >
                  <button
                    className="flex items-center gap-1 hover:text-gray-700 whitespace-nowrap"
                    onClick={() => handleSortClick("gpsTime")}
                  >
                    GPS Time {getSortIcon("gpsTime")}
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-sm font-medium text-gray-500 whitespace-nowrap"
                >
                  <button
                    className="flex items-center gap-1 hover:text-gray-700"
                    onClick={() => handleSortClick("gprsTime")}
                  >
                    GPRS Time {getSortIcon("gprsTime")}
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-sm font-medium text-gray-500 "
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-sm font-medium text-gray-500 "
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-sm font-medium text-gray-500 "
                >
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-4 text-center text-sm text-gray-500">
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
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-red-600 border-gray-300 rounded"
                          checked={selectedVehicles.includes(vehicle.id)}
                          onChange={(e) => onSelectVehicle(vehicle.id, e.target.checked)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{vehicle.vehicleNumber}</div>
                          {vehicle.hasSpeedChart && (
                            <svg
                              className="ml-2 w-4 h-4 text-blue-500"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M3 13H7L10 9L13 15L16 11L21 13"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-500">{vehicle.deviceName}</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-500">{vehicle.speed} km/h</td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{vehicle.address}</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-500">{vehicle.altitude}</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-500">{vehicle.gpsTime}</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-500">{vehicle.gprsTime}</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-500">{vehicle.type}</td>
                      <td className="px-6 py-4 text-center ">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(vehicle.status)}`}
                        >
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => setDetailsVehicle(vehicle)}
                          className="text-black hover:text-gray-800"
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

        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{vehicles.length > 0 ? (currentPage - 1) * 5 + 1 : 0}</span> to{" "}
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
              {currentPage}/{pageCount}
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

      {detailsVehicle && <VehicleDetailsModal vehicle={detailsVehicle} onClose={() => setDetailsVehicle(null)} />}
    </>
  )
}

export default VehicleTable
