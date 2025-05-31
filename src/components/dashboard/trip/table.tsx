import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronRight, ArrowUpDown, SortAsc, SortDesc, ChevronLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { TripExpandedDetails } from "./expanded-details"
import type { SortField} from "../../../types/dashboard/trip"
import type { TripTableProps } from "../../../types/dashboard/trip"

export function TripTable({
  trips,
  isLoading,
  totalTrips,
  expandedTripId,
  toggleExpandTrip,
  sortField,
  sortOrder,
  handleSort,
  currentPage,
  setCurrentPage,
  totalPages,
  indexOfFirstTrip,
  indexOfLastTrip,
}: TripTableProps) {
  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-gray-500" />
    }
    return sortOrder === "asc" ? (
      <SortAsc className="h-3.5 w-3.5 text-black" />
    ) : (
      <SortDesc className="h-3.5 w-3.5 text-black" />
    )
  }

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: i * 0.05,
      },
    }),
  }

  const expandVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
      height: "auto",
      opacity: 1,
      transition: {
        height: { type: "spring", stiffness: 100, damping: 20 },
        opacity: { duration: 0.2, delay: 0.1 },
      },
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: {
        height: { type: "spring", stiffness: 100, damping: 20 },
        opacity: { duration: 0.2 },
      },
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
    >
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Trip List</h2>
          <Badge variant="outline" className="ml-2 bg-red-50 text-[#d5233b] border-red-100">
            Total Count: {totalTrips}
          </Badge>
        </div>
      </div>

      {/* Trip Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 text-left whitespace-nowrap font-medium text-gray-700 w-10"></th>
              <th
                className="py-3 px-4 text-left whitespace-nowrap font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("id")}
              >
                <div className="flex items-center">
                  Id
                  {getSortIcon("id")}
                </div>
              </th>
              <th
                className="py-3 px-4 text-left whitespace-nowrap font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center">
                  Status
                  {getSortIcon("status")}
                </div>
              </th>
              <th
                className="py-3 px-4 whitespace-nowrap text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("routeId")}
              >
                <div className="flex items-center">
                  Route Id
                  {getSortIcon("routeId")}
                </div>
              </th>
              <th
                className="py-3 px-4 text-left whitespace-nowrap font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("routeName")}
              >
                <div className="flex items-center">
                  Route Name
                  {getSortIcon("routeName")}
                </div>
              </th>
              <th
                className="py-3 px-4 text-left whitespace-nowrap font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("routeType")}
              >
                <div className="flex items-center">
                  Route Type
                  {getSortIcon("routeType")}
                </div>
              </th>
              <th
                className="py-3 px-4 text-left whitespace-nowrap font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("startTime")}
              >
                <div className="flex items-center">
                  Start Time
                  {getSortIcon("startTime")}
                </div>
              </th>
              <th
                className="py-3 px-4 text-left whitespace-nowrap font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("endTime")}
              >
                <div className="flex items-center">
                  End Time
                  {getSortIcon("endTime")}
                </div>
              </th>
              <th
                className="py-3 px-4 text-left whitespace-nowrap font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("driverName")}
              >
                <div className="flex items-center">
                  Driver Name
                  {getSortIcon("driverName")}
                </div>
              </th>
              <th className="py-3 px-4 text-left whitespace-nowrap font-medium text-gray-700">Driver Mobile</th>
              <th className="py-3 px-4 text-left whitespace-nowrap font-medium text-gray-700">Driver Details</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="animate-pulse border-b border-gray-200">
                  <td className="py-3 px-4">
                    <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-12 bg-gray-200 rounded"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-28 bg-gray-200 rounded"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-28 bg-gray-200 rounded"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  </td>
                </tr>
              ))
            ) : trips.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-gray-500">
                  No trips found
                </td>
              </tr>
            ) : (
              trips.map((trip, index) => (
                <React.Fragment key={trip.id}>
                  <motion.tr
                    custom={index}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    className={`border-b border-gray-200 hover:bg-gray-50 ${
                      expandedTripId === trip.id ? "bg-gray-50" : ""
                    }`}
                  >
                    <td className="py-3 px-4">
                      <button
                        className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-gray-200"
                        onClick={() => toggleExpandTrip(trip.id)}
                      >
                        {expandedTripId === trip.id ? (
                          <ChevronDown className="h-4 w-4 text-black" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-medium">{trip.id}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div
                          className={`h-2 w-2 rounded-full mr-2 ${
                            trip.status === "Active"
                              ? "bg-green-500"
                              : trip.status === "Completed"
                                ? "bg-blue-500"
                                : trip.status === "Delayed"
                                  ? "bg-amber-500"
                                  : trip.status === "Cancelled"
                                    ? "bg-red-500"
                                    : "bg-gray-500"
                          }`}
                        ></div>
                        {trip.status}
                      </div>
                    </td>
                    <td className="py-3 px-4">{trip.routeId}</td>
                    <td className="py-3 px-4">{trip.routeName}</td>
                    <td className="py-3 px-4">{trip.routeType}</td>
                    <td className="py-3 px-4">{trip.startTime}</td>
                    <td className="py-3 px-4">{trip.endTime}</td>
                    <td className="py-3 px-4">{trip.driverName}</td>
                    <td className="py-3 px-4">{trip.driverMobile}</td>
                    <td className="py-3 px-4">{trip.driverDetails}</td>
                  </motion.tr>

                  {/* Expanded Trip Details */}
                  <AnimatePresence>
                    {expandedTripId === trip.id && (
                      <tr>
                        <td colSpan={11} className="p-0 border-b border-gray-200">
                          <motion.div
                            variants={expandVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="bg-gray-50 p-4"
                          >
                            <TripExpandedDetails trip={trip} />
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination - Updated to match vehicle table style */}
      <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{trips.length > 0 ? indexOfFirstTrip + 1 : 0}</span> to{" "}
          <span className="font-medium">{Math.min(indexOfLastTrip, totalTrips)}</span> of{" "}
          <span className="font-medium">{totalTrips}</span> entries
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
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
            {currentPage}/{totalPages || 1}
          </div>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className={`relative inline-flex items-center px-2 py-2 rounded-md border ${
              currentPage === totalPages || totalPages === 0
                ? "border-gray-300 bg-white text-gray-300 cursor-not-allowed"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
