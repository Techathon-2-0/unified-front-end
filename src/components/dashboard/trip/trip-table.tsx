import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, ArrowUpDown, SortAsc, SortDesc, AlertTriangle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TripDetailsModal } from "./trip-details-modal"
import { TripAlertsDialog } from "./trip-alerts-dialog"
import {
  fetchAlertsByShipment,
  toggleAlertStatus,
} from "../../../data/dashboard/trip"
import type { TripApi, SortField, AlertDetail} from "../../../types/dashboard/trip_type"
import type { TripTableProps } from "../../../types/dashboard/trip_type"

export function TripTable({
  trips,
  isLoading,
  totalTrips,
  sortField,
  sortOrder,
  handleSort,
  currentPage,
  setCurrentPage,
  totalPages,
  indexOfFirstTrip,
  indexOfLastTrip,
}: TripTableProps) {
  const [selectedTrip, setSelectedTrip] = useState<TripApi | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showAlerts, setShowAlerts] = useState(false)
  const [alerts, setAlerts] = useState<AlertDetail[]>([])
  // const [intutrackData, setIntutrackData] = useState<IntutrackData | null>(null)
  const [loadingAlerts, setLoadingAlerts] = useState(false)
  // const [loadingIntutrack, setLoadingIntutrack] = useState(false)

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-gray-500" />
    }
    return sortOrder === "asc" ? (
      <SortAsc className="h-3.5 w-3.5 text-red-600" />
    ) : (
      <SortDesc className="h-3.5 w-3.5 text-red-600" />
    )
  }

  const handleShowAlerts = async (trip: TripApi) => {
    setSelectedTrip(trip)
    setLoadingAlerts(true)
    setShowAlerts(true)

    try {
      const alertData = await fetchAlertsByShipment(trip.id)
      setAlerts(alertData.alerts || [])
    } catch (error) {
      console.error("Error fetching alerts:", error)
      setAlerts([])
    } finally {
      setLoadingAlerts(false)
    }
  }

  const handleShowDetails = (trip: TripApi) => {
    setSelectedTrip(trip)
    setShowDetails(true)
  }

  // const handleRefreshIntutrack = async () => {
  //   if (!selectedTrip) return

  //   setLoadingIntutrack(true)
  //   try {
  //     const data = await refreshIntutrackData(selectedTrip.id)
  //     setIntutrackData(data)
  //   } catch (error) {
  //     console.error("Error refreshing intutrack data:", error)
  //   } finally {
  //     setLoadingIntutrack(false)
  //   }
  // }

  const handleToggleAlert = async (alertId: number) => {
    if (!selectedTrip) return

    try {
      await toggleAlertStatus(alertId, selectedTrip.id)
      // Refresh alerts
      const alertData = await fetchAlertsByShipment(selectedTrip.id)
      setAlerts(alertData.alerts || [])
    } catch (error) {
      console.error("Error toggling alert:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "at_stop_pickup":
      case "at_stop_delivery":
      case "in_transit":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  const getStatusText = (status: string) => {
  switch (status.toLowerCase()) {
    case "at_stop_pickup":
      return "At Pickup Stop"
    case "at_stop_delivery":
      return "At Delivery Stop"
    case "in_transit":
      return "In Transit"
    case "inactive":
      return "Inactive"
    default:
      return status
  }
}

  const getVehicleStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "no update":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "no data":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900 h-15">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Alert</th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("id")}
                >
                  <button className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 ">
                    Shipment ID {getSortIcon("id")}
                  </button>
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("Vehicle_number")}
                >
                  <button className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300">
                    Vehicle Number {getSortIcon("Vehicle_number")}
                  </button>
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("status")}
                >
                  <button className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300">
                    Status {getSortIcon("status")}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Vehicle Status
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("Start_Time")}
                >
                  <button className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300">
                    Start Time {getSortIcon("Start_Time")}
                  </button>
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("End_Time")}
                >
                  <button className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 ">
                    End Time {getSortIcon("End_Time")}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  ETA
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Status Duration
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No trips found
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {trips.map((trip, index) => (
                    <motion.tr
                      key={trip.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 text-left">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShowAlerts(trip)}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </Button>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{trip.id}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{trip.Vehicle_number}</td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusColor(trip.status)}>{getStatusText(trip.status)}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getVehicleStatusColor(trip.Vehicle_status)}>{trip.Vehicle_status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {new Date(trip.Start_Time).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {trip.End_Time ? new Date(trip.End_Time).toLocaleString() : "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        <div className="space-y-1">
                          <div className="text-xs whitespace-nowrap">C-ETA: {trip.ceta || "-"}</div>
                          <div className="text-xs whitespace-nowrap">G-ETA: {trip.geta || "-"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">{trip.status_duration}</td>
                      <td className="px-6 py-4 text-center text-sm font-medium">
                        <button
                          
                          onClick={() => handleShowDetails(trip)}
                          className="text-black dark:text-white hover:text-gray-800 dark:hover:text-gray-300"
                        >
                          <Info className="h-5 w-6" />
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
            Showing <span className="font-medium">{trips.length > 0 ? indexOfFirstTrip + 1 : 0}</span> to{" "}
            <span className="font-medium">{Math.min(indexOfLastTrip, totalTrips)}</span> of{" "}
            <span className="font-medium">{totalTrips}</span> entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-md border ${currentPage === 1
                ? "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="bg-black dark:bg-gray-700 text-white px-3 py-1 rounded-md">
              {currentPage}/{totalPages || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`relative inline-flex items-center px-2 py-2 rounded-md border ${currentPage === totalPages || totalPages === 0
                ? "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Alerts Dialog */}
      <TripAlertsDialog
        open={showAlerts}
        onOpenChange={setShowAlerts}
        loadingAlerts={loadingAlerts}
        alerts={alerts}
        selectedTrip={selectedTrip}
        handleToggleAlert={handleToggleAlert}
      />

      {/* Details Dialog */}
      <TripDetailsModal
        open={showDetails}
        onOpenChange={setShowDetails}
        selectedTrip={selectedTrip}
      />
    </>
  )
}
