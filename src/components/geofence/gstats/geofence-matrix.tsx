import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Navigation,
  BarChart3,
  PieChart,
  Search,
  ChevronUp,
  ChevronDown,
  Filter,
  X,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { initialGeofenceData } from "../../../data/geofence/gconfig"
import type { GeofenceMatrixProps,SortField,SortDirection } from "../../../types/geofence/gstats"

export function GeofenceMatrix({
  vehicles,
  selectedGeofence,
  matrixType,
  onVehicleClick,
  highlightedVehicle,
  onFilteredCountChange,
}: GeofenceMatrixProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("vehicleNumber")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [directionFilter, setDirectionFilter] = useState<string>("all")
  const itemsPerPage = 5

  const selectedGeofenceData = initialGeofenceData.find((g) => g.id === selectedGeofence)

  // Get geofence color based on type
  const getGeofenceColor = (type: string) => {
    switch (type) {
      case "circle":
        return "#3b82f6" // Blue
      case "polygon":
        return "#8b5cf6" // Purple
      case "pointer":
        return "#10b981" // Green
      default:
        return "#3b82f6"
    }
  }

  // Sorting functions
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
        <ChevronUp className="h-4 w-4 ml-1 text-blue-600" />
      ) : (
        <ChevronDown className="h-4 w-4 ml-1 text-blue-600" />
      )
    }
    return <ChevronUp className="h-4 w-4 ml-1 text-gray-400" />
  }

  // Filter and sort vehicles
  const filteredAndSortedVehicles = useMemo(() => {
    let filtered = vehicles

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (vehicle) =>
          vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.status.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((vehicle) => vehicle.type === typeFilter)
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((vehicle) => vehicle.geofenceStatus === statusFilter)
    }

    // Apply direction filter
    if (directionFilter !== "all") {
      filtered = filtered.filter((vehicle) => vehicle.geofenceStatus === directionFilter)
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case "vehicleNumber":
          aValue = a.vehicleNumber.toLowerCase()
          bValue = b.vehicleNumber.toLowerCase()
          break
        case "type":
          if (matrixType === "geofence") {
            // For geofence matrix, sort by status
            aValue =
              a.geofenceStatus === "inside"
                ? "still inside"
                : a.entryTime && a.exitTime
                  ? "arrived and left"
                  : "not arrived"
            bValue =
              b.geofenceStatus === "inside"
                ? "still inside"
                : b.entryTime && b.exitTime
                  ? "arrived and left"
                  : "not arrived"
          } else {
            // For other matrices, sort by vehicle type
            aValue = a.type.toLowerCase()
            bValue = b.type.toLowerCase()
          }
          break
        case "status":
          aValue = a.geofenceStatus.toLowerCase()
          bValue = b.geofenceStatus.toLowerCase()
          break
        case "distanceFromGeofence":
          aValue = a.distanceFromGeofence
          bValue = b.distanceFromGeofence
          break
        case "gpsTime":
          aValue = a.gpsTime || ""
          bValue = b.gpsTime || ""
          break
        case "duration":
          aValue = a.duration || ""
          bValue = b.duration || ""
          break
        default:
          aValue = a.vehicleNumber.toLowerCase()
          bValue = b.vehicleNumber.toLowerCase()
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return sorted
  }, [vehicles, searchTerm, sortField, sortDirection, matrixType, typeFilter, statusFilter, directionFilter])

  // Update filtered count whenever filteredAndSortedVehicles changes
  useEffect(() => {
    onFilteredCountChange(filteredAndSortedVehicles.length)
  }, [filteredAndSortedVehicles.length, onFilteredCountChange])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedVehicles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentVehicles = filteredAndSortedVehicles.slice(startIndex, endIndex)

  // Statistics
  const stats = useMemo(() => {
    // Use filtered vehicles for all calculations
    const relevantVehicles = filteredAndSortedVehicles

    const notArrivedCount = relevantVehicles.filter((v) => v.category === "not_arrived").length
    const stillInsideCount = relevantVehicles.filter((v) => v.category === "still_inside").length
    const arrivedAndLeftCount = relevantVehicles.filter((v) => v.category === "arrived_and_left").length
    const totalCount = relevantVehicles.length

    // Distance distribution based on filtered vehicles
    const distanceRanges = {
      "0-2 Km": relevantVehicles.filter((v) => v.distanceFromGeofence >= 0 && v.distanceFromGeofence <= 2).length,
      "2-5 Km": relevantVehicles.filter((v) => v.distanceFromGeofence > 2 && v.distanceFromGeofence <= 5).length,
      "5-10 Km": relevantVehicles.filter((v) => v.distanceFromGeofence > 5 && v.distanceFromGeofence <= 10).length,
      "10-20 Km": relevantVehicles.filter((v) => v.distanceFromGeofence > 10 && v.distanceFromGeofence <= 20).length,
      "20-50 Km": relevantVehicles.filter((v) => v.distanceFromGeofence > 20 && v.distanceFromGeofence <= 50).length,
      "50+ Km": relevantVehicles.filter((v) => v.distanceFromGeofence > 50).length,
    }

    return {
      notArrivedCount,
      stillInsideCount,
      arrivedAndLeftCount,
      totalCount,
      distanceRanges,
    }
  }, [filteredAndSortedVehicles])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const getMatrixTitle = () => {
    switch (matrixType) {
      case "geofence":
        return "Geofence Matrix"
      case "distance":
        return "Distance Matrix"
      default:
        return "Matrix"
    }
  }

  const getSearchPlaceholder = () => {
    switch (matrixType) {
      case "geofence":
        return "Search device by name or type..."
      case "distance":
        return "Search vehicle by name or type..."
      default:
        return "Search..."
    }
  }

  const clearFilter = (filterType: string) => {
    switch (filterType) {
      case "type":
        setTypeFilter("all")
        break
      case "status":
        setStatusFilter("all")
        break
      case "direction":
        setDirectionFilter("all")
        break
    }
  }

  const activeFilters = [
    { type: "type", value: typeFilter, label: `Type: ${typeFilter}` },
    { type: "status", value: statusFilter, label: `Status: ${statusFilter}` },
    { type: "direction", value: directionFilter, label: `Direction: ${directionFilter}` },
  ].filter((filter) => filter.value !== "all")

  const geofenceColor = selectedGeofenceData ? getGeofenceColor(selectedGeofenceData.type) : "#3b82f6"

  return (
    <Card className="h-full shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-white">
        <CardTitle className="text-lg font-semibold flex items-center">
          {matrixType === "geofence" && <PieChart className="h-5 w-5 mr-2" />}
          {matrixType === "distance" && <BarChart3 className="h-5 w-5 mr-2" />}
          {getMatrixTitle()}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 hover:bg-gray-100 rounded">
              <Filter className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <div className="p-2 space-y-2">
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Car">Car</SelectItem>
                    <SelectItem value="Truck">Truck</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="inside">Inside</SelectItem>
                    <SelectItem value="outside">Outside</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Direction</label>
                <Select value={directionFilter} onValueChange={setDirectionFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Directions</SelectItem>
                    <SelectItem value="inside">Inside</SelectItem>
                    <SelectItem value="outside">Outside</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="bg-white">
        {/* Charts Section */}
        {matrixType === "geofence" && (
          <div className="mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {/* Not Arrived - Gray */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#9ca3af"
                    strokeWidth="20"
                    strokeDasharray={`${(stats.notArrivedCount / (stats.notArrivedCount + stats.stillInsideCount + stats.arrivedAndLeftCount || 1)) * 502.4} 502.4`}
                    transform="rotate(-90 100 100)"
                  />
                  {/* Still Inside - Geofence color */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke={geofenceColor}
                    strokeWidth="20"
                    strokeDasharray={`${(stats.stillInsideCount / (stats.notArrivedCount + stats.stillInsideCount + stats.arrivedAndLeftCount || 1)) * 502.4} 502.4`}
                    strokeDashoffset={`-${(stats.notArrivedCount / (stats.notArrivedCount + stats.stillInsideCount + stats.arrivedAndLeftCount || 1)) * 502.4}`}
                    transform="rotate(-90 100 100)"
                  />
                  {/* Arrived and Left - Yellow */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="20"
                    strokeDasharray={`${(stats.arrivedAndLeftCount / (stats.notArrivedCount + stats.stillInsideCount + stats.arrivedAndLeftCount || 1)) * 502.4} 502.4`}
                    strokeDashoffset={`-${((stats.notArrivedCount + stats.stillInsideCount) / (stats.notArrivedCount + stats.stillInsideCount + stats.arrivedAndLeftCount || 1)) * 502.4}`}
                    transform="rotate(-90 100 100)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {stats.notArrivedCount + stats.stillInsideCount + stats.arrivedAndLeftCount}
                    </div>
                    <div className="text-sm text-gray-500">Total</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center space-x-4 mb-6 flex-wrap">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                <span className="text-sm">Not Arrived: {stats.notArrivedCount}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: geofenceColor }}></div>
                <span className="text-sm">Still Inside: {stats.stillInsideCount}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                <span className="text-sm">Arrived and Left: {stats.arrivedAndLeftCount}</span>
              </div>
            </div>
          </div>
        )}

        {matrixType === "distance" && (
          <div className="mb-6">
            <div className="h-48 flex items-end justify-center space-x-2 mb-4">
              {Object.entries(stats.distanceRanges).map(([range, count], index) => (
                <div key={range} className="flex flex-col items-center">
                  <div
                    className="w-12 rounded-t"
                    style={{
                      height: `${Math.max((count / Math.max(...Object.values(stats.distanceRanges))) * 150, 10)}px`,
                      background: `linear-gradient(to top, ${geofenceColor}, ${geofenceColor}80)`,
                    }}
                  ></div>
                  <div className="text-xs mt-2 text-center">{range}</div>
                  <div className="text-xs font-bold">{count}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600">Active filters:</span>
              {activeFilters.map((filter) => (
                <Badge
                  key={filter.type}
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer text-xs px-2 py-1"
                  onClick={() => clearFilter(filter.type)}
                >
                  {filter.label}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={getSearchPlaceholder()}
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S. No.
                  </TableHead>
                  {matrixType === "geofence" ? (
                    <>
                      <TableHead
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("vehicleNumber")}
                      >
                        <div className="flex items-center">
                          Device
                          {getSortArrow("vehicleNumber")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("type")}
                      >
                        <div className="flex items-center">
                          Type
                          {getSortArrow("type")}
                        </div>
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entry Time
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exit Time
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("vehicleNumber")}
                      >
                        <div className="flex items-center">
                          Vehicle Name
                          {getSortArrow("vehicleNumber")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center">
                          Direction
                          {getSortArrow("status")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("type")}
                      >
                        <div className="flex items-center">
                          Type
                          {getSortArrow("type")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("distanceFromGeofence")}
                      >
                        <div className="flex items-center">
                          Distance (Km)
                          {getSortArrow("distanceFromGeofence")}
                        </div>
                      </TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white divide-y divide-gray-200">
                {currentVehicles.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={matrixType === "geofence" ? 7 : 5}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="rounded-full bg-slate-100 p-3">
                          <Users className="h-6 w-6 text-slate-400" />
                        </div>
                        <p>No vehicles found</p>
                        {searchTerm && <p className="text-xs">Try adjusting your search terms</p>}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <AnimatePresence>
                    {currentVehicles.map((vehicle, index) => (
                      <motion.tr
                        key={vehicle.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`hover:bg-gray-50 cursor-pointer ${
                          highlightedVehicle === vehicle.id ? "bg-blue-50 border-l-4 border-blue-500" : ""
                        }`}
                        onClick={() => onVehicleClick(vehicle.id)}
                      >
                        <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {startIndex + index + 1}
                        </TableCell>
                        {matrixType === "geofence" ? (
                          <>
                            <TableCell className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {vehicle.vehicleNumber}
                            </TableCell>
                            <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              <Badge
                                className={`border ${
                                  vehicle.category === "still_inside"
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : vehicle.category === "arrived_and_left"
                                      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                      : "bg-gray-100 text-gray-800 border-gray-200"
                                }`}
                              >
                                {vehicle.category === "still_inside"
                                  ? "Still Inside"
                                  : vehicle.category === "arrived_and_left"
                                    ? "Arrived and Left"
                                    : "Not Arrived"}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {vehicle.entryTime || "-"}
                            </TableCell>
                            <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {vehicle.exitTime || "-"}
                            </TableCell>
                            <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {vehicle.duration || "-"}
                            </TableCell>
                            <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              <Badge
                                className={`border ${
                                  vehicle.geofenceStatus === "inside"
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : "bg-red-100 text-red-800 border-red-200"
                                }`}
                              >
                                {vehicle.geofenceStatus === "inside" ? "Inside" : "Outside"}
                              </Badge>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {vehicle.vehicleNumber}
                            </TableCell>
                            <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center">
                                <Navigation className="h-4 w-4 text-blue-500 mr-2" />
                                {vehicle.geofenceStatus === "inside" ? "Inside" : "Outside"}
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              <Badge
                                className={`border ${
                                  vehicle.geofenceStatus === "inside"
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : "bg-red-100 text-red-800 border-red-200"
                                }`}
                              >
                                {vehicle.geofenceStatus === "inside" ? "Inside" : "Outside"}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {vehicle.distanceFromGeofence.toFixed(2)}
                            </TableCell>
                          </>
                        )}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{currentVehicles.length > 0 ? startIndex + 1 : 0}</span> to{" "}
              <span className="font-medium">{Math.min(endIndex, filteredAndSortedVehicles.length)}</span> of{" "}
              <span className="font-medium">{filteredAndSortedVehicles.length}</span> entries
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
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
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-md border ${
                  currentPage === totalPages
                    ? "border-gray-300 bg-white text-gray-300 cursor-not-allowed"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
