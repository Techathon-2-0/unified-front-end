import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  ChevronUp,
  ChevronDown,
  MapPin,
  Clock,
  Zap,
  Battery,
  Power,
} from "lucide-react"
import type {
  ReportTableProps,
  AllPositionsReportData,
  DashboardReportData,
  AlarmReportData,
  TripGpsStatusReportData,
  TripSummaryReportData,
} from "../../../types/reports/report_type"
import { TripDetailsModal } from "./gps-details-modal"
import { TripSummaryDetailsModal } from "./trip-summary-details-modal"
import { format } from "date-fns"
import type { SortDirection } from "../../../types/reports/report_type" // Import SortDirection

type SortField =
  | "vehicleNumber"
  | "location"
  | "status"
  | "speed"
  | "gpsTime"
  | "alertName"
  | "createdAt"
  | "vendorName"
  | "shipmentId"
  | "customerName"
  | "tripStartTime"

export function ReportTable({
  reportData,
  reportType,
  currentPage = 1,
  pageCount = 1,
  onPageChange = () => {},
  totalCount = 0,
  isTableLoading = false,
}: ReportTableProps) {
  const [sortField, setSortField] = useState<SortField>("vehicleNumber")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [selectedVehicleData, setSelectedVehicleData] = useState<AllPositionsReportData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTripData, setSelectedTripData] = useState<TripSummaryReportData | null>(null)
  const [isTripModalOpen, setIsTripModalOpen] = useState(false)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Sort report data based on current sort field and direction
  const sortedData = [...reportData].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortField) {
      case "vehicleNumber":
        aValue =
          "vehicleNumber" in a
            ? (a.vehicleNumber || "").toLowerCase()
            : "vehicle_number" in a
            ? (a.vehicle_number || "").toLowerCase()
            : ""
        bValue =
          "vehicleNumber" in b
            ? (b.vehicleNumber || "").toLowerCase()
            : "vehicle_number" in b
            ? (b.vehicle_number || "").toLowerCase()
            : ""
        break
      case "location":
        aValue = "location" in a && typeof a.location === "string" ? a.location.toLowerCase() : ""
        bValue = "location" in b && typeof b.location === "string" ? b.location.toLowerCase() : ""
        break
      case "status":
        aValue = "status" in a && typeof a.status === "string" ? a.status.toLowerCase() : ""
        bValue = "status" in b && typeof b.status === "string" ? b.status.toLowerCase() : ""
        break
      case "speed":
        aValue = "speed" in a && typeof a.speed === "number" ? a.speed : 0
        bValue = "speed" in b && typeof b.speed === "number" ? b.speed : 0
        break
      case "gpsTime":
        aValue = "gpsTime" in a && a.gpsTime ? new Date(a.gpsTime).getTime() : 0
        bValue = "gpsTime" in b && b.gpsTime ? new Date(b.gpsTime).getTime() : 0
        break
      case "alertName":
        aValue = "alertName" in a && typeof a.alertName === "string" ? a.alertName.toLowerCase() : ""
        bValue = "alertName" in b && typeof b.alertName === "string" ? b.alertName.toLowerCase() : ""
        break
      case "createdAt":
        aValue = "createdAt" in a && a.createdAt ? new Date(a.createdAt).getTime() : 0
        bValue = "createdAt" in b && b.createdAt ? new Date(b.createdAt).getTime() : 0
        break
      case "vendorName":
        aValue = "vendorName" in a && typeof a.vendorName === "string" ? a.vendorName.toLowerCase() : ""
        bValue = "vendorName" in b && typeof b.vendorName === "string" ? b.vendorName.toLowerCase() : ""
        break
      case "shipmentId":
        aValue = (a as any).shipmentId ? ((a as any).shipmentId || "").toLowerCase() : ""
        bValue = (b as any).shipmentId ? ((b as any).shipmentId || "").toLowerCase() : ""
        break
      case "customerName":
        aValue = (a as any).customerName ? ((a as any).customerName || "").toLowerCase() : ""
        bValue = (b as any).customerName ? ((b as any).customerName || "").toLowerCase() : ""
        break
      case "tripStartTime":
        aValue = (a as any).tripStartTime ? new Date((a as any).tripStartTime).getTime() : 0
        bValue = (b as any).tripStartTime ? new Date((b as any).tripStartTime).getTime() : 0
        break
      default:
        aValue =
          "vehicleNumber" in a
            ? (a.vehicleNumber || "").toLowerCase()
            : "vehicle_number" in a
            ? (a.vehicle_number || "").toLowerCase()
            : ""
        bValue =
          "vehicleNumber" in b
            ? (b.vehicleNumber || "").toLowerCase()
            : "vehicle_number" in b
            ? (b.vehicle_number || "").toLowerCase()
            : ""
    }

    if (sortDirection === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const getSortArrow = (field: string) => {
    if (sortField === field) {
      return sortDirection === "asc" ? (
        <ChevronUp className="h-4 w-4 ml-1 text-indigo-600" />
      ) : (
        <ChevronDown className="h-4 w-4 ml-1 text-indigo-600" />
      )
    }
    return <ChevronUp className="h-4 w-4 ml-1 text-gray-400" />
  }

  const getStatusBadge = (status: string) => {
    const lowerStatus = status.toLowerCase();
    let badgeClass = "";
    if (lowerStatus === "active") {
      badgeClass = "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
    } else if (lowerStatus === "no data") {
      badgeClass = "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
    } else if (lowerStatus === "no update") {
      badgeClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
    } else {
      badgeClass = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
    return (
      <span
        className={`px-2 inline-flex text-xs whitespace-nowrap leading-5 font-semibold rounded-full ${badgeClass}`}
      >
        {status}
      </span>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10">
              <tr>
                {reportType === "dashboard" ? (
                  <>
                    <th
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort("vehicleNumber")}
                    >
                      <div className="flex items-center">
                        Vehicle Details
                        {getSortArrow("vehicleNumber")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort("location")}
                    >
                      <div className="flex items-center">
                        Location
                        {getSortArrow("location")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center">
                        Status
                        {getSortArrow("status")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort("speed")}
                    >
                      <div className="flex items-center">
                        Speed
                        {getSortArrow("speed")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort("gpsTime")}
                    >
                      <div className="flex items-center">
                        GPS Time
                        {getSortArrow("gpsTime")}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Additional Info
                    </th>
                  </>
                ) : reportType === "all_positions" ? (
                  <>
                    <th
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort("vehicleNumber")}
                    >
                      <div className="flex items-center">
                        Vehicle Number
                        {getSortArrow("vehicleNumber")}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Trail Points Count
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Actions
                    </th>
                  </>
                ) : reportType === "alarm" ? (
                  <>
                    <th
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort("vehicleNumber")}
                    >
                      <div className="flex items-center">
                        Vehicle Number
                        {getSortArrow("vehicleNumber")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort("vendorName")}
                    >
                      <div className="flex items-center">
                        Vendor
                        {getSortArrow("vendorName")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort("alertName")}
                    >
                      <div className="flex items-center">
                        Alert Name
                        {getSortArrow("alertName")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort("createdAt")}
                    >
                      <div className="flex items-center">
                        Created At
                        {getSortArrow("createdAt")}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Shipment Info
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Customer Names
                    </th>
                  </>
                ) : reportType === "trip_gps_status" ? (
                  <>
                    <th
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort("shipmentId")}
                    >
                      <div className="flex items-center">
                        Shipment ID
                        {getSortArrow("shipmentId")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort("vehicleNumber")}
                    >
                      <div className="flex items-center">
                        Vehicle Number
                        {getSortArrow("vehicleNumber")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort("customerName")}
                    >
                      <div className="flex items-center">
                        Customer Name
                        {getSortArrow("customerName")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort("tripStartTime")}
                    >
                      <div className="flex items-center">
                        Trip Start Time
                        {getSortArrow("tripStartTime")}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Trip End Time
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Stop Details
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      GPS Info
                    </th>
                  </>
                ) : reportType === "trip_summary" ? (
                  <>
                    <th
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort("vehicleNumber")}
                    >
                      <div className="flex items-center">
                        Vehicle Number
                        {getSortArrow("vehicleNumber")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort("shipmentId")}
                    >
                      <div className="flex items-center">
                        Shipment ID
                        {getSortArrow("shipmentId")}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Route & Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Distance & Time
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Driver Info
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Stops</th>
                  </>
                ) : (
                  <>
                    <th
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort("vehicleNumber")}
                    >
                      <div className="flex items-center">
                        Vehicle Number
                        {getSortArrow("vehicleNumber")}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Trail Points Count
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Actions
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isTableLoading && (
                <tr>
                  <td
                    colSpan={
                      reportType === "all_positions"
                        ? 3
                        : reportType === "alarm"
                          ? 8
                          : reportType === "trip_gps_status"
                            ? 7
                            : reportType === "trip_summary"
                              ? 6
                              : 6
                    }
                    className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex items-center justify-center">
                      <span className="text-gray-600 dark:text-gray-400">Loading report data...</span>
                    </div>
                  </td>
                </tr>
              )}
              {!isTableLoading && reportData.length === 0 && (
                <tr>
                  <td
                    colSpan={
                      reportType === "all_positions"
                        ? 3
                        : reportType === "alarm"
                          ? 8
                          : reportType === "trip_gps_status"
                            ? 7
                            : reportType === "trip_summary"
                              ? 6
                              : 6
                    }
                    className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="rounded-full bg-slate-100 dark:bg-gray-700 p-3">
                        <Eye className="h-6 w-6 text-slate-400 dark:text-gray-500" />
                      </div>
                      <p>No report data found</p>
                    </div>
                  </td>
                </tr>
              )}
              {!isTableLoading && reportType === "dashboard" && (
                <AnimatePresence>
                  {(sortedData as DashboardReportData[]).map((item, index) => (
                    <motion.tr
                      key={`${item.vehicleNumber}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {item.vehicleNumber}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Vendor: {item.lastVendor}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div
                            className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate"
                            title={item.location}
                          >
                            {item.location}
                          </div>
                        </div>
                        {item.latitude && item.longitude && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">{item.speed} km/h</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <div className="text-sm text-gray-900 dark:text-gray-100">{item.gpsTime || "N/A"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-4 text-xs">
                            <div className="flex items-center space-x-1">
                              <Zap className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">Ignition: {item.ignitionStatus}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Power className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">Power: {item.power}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-xs">
                            <div className="flex items-center space-x-1">
                              <Battery className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">Battery: {item.battery}</span>
                            </div>
                            <span className="text-gray-600 dark:text-gray-400">Pings: {item.gpsPingCount}</span>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
              {!isTableLoading && reportType === "all_positions" && (
                <AnimatePresence>
                  {(sortedData as AllPositionsReportData[]).map((item, index) => (
                    <motion.tr
                      key={`${item.vehicleNumber}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.vehicleNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {item.trailPoints.length} GPS Points
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedVehicleData(item)
                            setIsModalOpen(true)
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
              {!isTableLoading && reportType === "alarm" && (
                <AnimatePresence>
                  {(sortedData as AlarmReportData[]).map((item, index) => (
                    <motion.tr
                      key={`${item.vehicleNumber}-${item.createdAt}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.vehicleNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">{item.vendorName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.alertName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.severityType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {item.createdAt ? format(new Date(item.createdAt), "MMM dd, yyyy HH:mm") : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {item.startLatitude && item.startLongitude ? (
                            <div className="space-y-1">
                              <div>
                                Start: {item.startLatitude.toFixed(4)}, {item.startLongitude.toFixed(4)}
                              </div>
                              {item.endLatitude && item.endLongitude && (
                                <div className="text-xs text-gray-500">
                                  End: {item.endLatitude.toFixed(4)}, {item.endLongitude.toFixed(4)}
                                </div>
                              )}
                            </div>
                          ) : (
                            "N/A"
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {item.duration ? `${Math.floor(item.duration / 60)}m ${item.duration % 60}s` : "N/A"}
                        </div>
                        {item.alarmValue && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">Value: {item.alarmValue}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {item.shipmentId ? (
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {item.shipmentId}
                            </div>
                            {item.driverName && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Driver: {item.driverName}
                                {item.driverMobileNumber && ` (${item.driverMobileNumber})`}
                              </div>
                            )}
                            {item.serviceProviderAliasValue && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Provider: {item.serviceProviderAliasValue}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">No shipment</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {item.customerNames.length > 0 ? (
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {item.customerNames.join(", ")}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">No customers</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
              {!isTableLoading && reportType === "trip_gps_status" && (
                <AnimatePresence>
                  {(sortedData as TripGpsStatusReportData[]).map((item, index) => (
                    <motion.tr
                      key={`${item.shipmentId}-${item.plannedSequence}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.shipmentId}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.tripStatus}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">{item.vehicleNumber}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.gpsVendor}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.customerName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">LR: {item.lrNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {item.tripStartTime ? format(new Date(item.tripStartTime), "MMM dd, yyyy HH:mm") : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {item.tripEndTime ? format(new Date(item.tripEndTime), "MMM dd, yyyy HH:mm") : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            Seq: {item.plannedSequence} → {item.actualSequence}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Type: {item.stopType}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Entry: {item.entryTime ? format(new Date(item.entryTime), "HH:mm") : "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900 dark:text-gray-100">Pings: {item.gpsPingCount}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Last: {item.lastPingVendor}</div>
                          <div className="text-xs">
                            <span
                              className={`px-1 py-0.5 rounded text-xs ${
                                item.hasFasttagPing
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                              }`}
                            >
                              Fasttag: {item.hasFasttagPing ? "Yes" : "No"}
                            </span>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
              {!isTableLoading && reportType === "trip_summary" && (
                <AnimatePresence>
                  {(sortedData as TripSummaryReportData[]).map((item, index) => (
                    <motion.tr
                      key={`${item.shipment_id}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {item.vehicle_number}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.gps_vendor}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.shipment_id}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.trip_status}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900 dark:text-gray-100">{item.route_name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.start_location} → {item.end_location}
                          </div>
                          <div className="text-xs">
                            <span
                              className={`px-1 py-0.5 rounded text-xs ${
                                item.vehicle_status === "Active"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                              }`}
                            >
                              {item.vehicle_status}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {item.covered_distance}/{item.total_distance} km
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Total: {item.total_time}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Drive: {item.total_drive_time}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900 dark:text-gray-100">{item.driver_name || "N/A"}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{item.driver_mobile || "N/A"}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.service_provider_alias_value}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-900 dark:text-gray-100 mr-2">{item.stops.length} stops</div>
                          <button
                            onClick={() => {
                              setSelectedTripData(item)
                              setIsTripModalOpen(true)
                            }}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{reportData.length > 0 ? (currentPage - 1) * 5 + 1 : 0}</span> to{" "}
            <span className="font-medium">{Math.min(currentPage * 5, totalCount)}</span> of{" "}
            <span className="font-medium">{totalCount}</span> entries
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-md border ${
                currentPage === 1
                  ? "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="bg-black dark:bg-gray-600 text-white px-3 py-1 rounded-md">
              {currentPage}/{pageCount || 1}
            </div>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === pageCount}
              className={`relative inline-flex items-center px-2 py-2 rounded-md border ${
                currentPage === pageCount
                  ? "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <TripDetailsModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedVehicleData(null)
        }}
        vehicleData={selectedVehicleData}
      />
      <TripSummaryDetailsModal
        open={isTripModalOpen}
        onClose={() => {
          setIsTripModalOpen(false)
          setSelectedTripData(null)
        }}
        tripData={selectedTripData}
      />
    </>
  )
}
