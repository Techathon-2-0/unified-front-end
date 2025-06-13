import { Button } from "@/components/ui/button"
import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Search,
  ChevronUp,
  ChevronDown,
  Filter,
  X,
  AlertTriangle,
  Car,
  Truck,
  Tractor,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { fetchGroupsbyuserId } from "../../../data/manage/group"
import type { GeofenceMatrixProps, SortField, SortDirection} from "../../../types/geofence/gstats_type"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import type { Group } from "@/types/manage/group_type"


export function GeofenceMatrix({
  vehicles,
  selectedGeofence,
  matrixType,
  onVehicleClick,
  highlightedVehicle,
  onFilteredCountChange,
  onAlertClick,
}: GeofenceMatrixProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("vehicleNumber")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [tripStatusFilter, setTripStatusFilter] = useState<string>("all")
  const [groupFilter, setGroupFilter] = useState<string>("all")
  const [locationFilter, setLocationFilter] = useState<string>("all")
  const [groups, setGroups] = useState<Group[]>([])
  const itemsPerPage = 5
  const { user } = useAuth()
  const { showErrorToast, Toaster } = useToast({ position: "top-right" })

  useEffect(() => {
    if (user?.id) {
      fetchGroupsbyuserId(user.id)
        .then(setGroups)
        .catch((error) => {
          console.error("Error fetching groups:", error)
          setGroups([])
        })
    }
  }, [user?.id])

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

  // Get unique vehicle types
  const vehicleTypes = useMemo(() => {
    const types = new Set<string>()
    vehicles.forEach((vehicle) => {
      if (vehicle.type) types.add(vehicle.type)
    })
    return Array.from(types).sort()
  }, [vehicles])

  // Get unique vehicle statuses
  const vehicleStatuses = useMemo(() => {
    const statuses = new Set<string>()
    vehicles.forEach((vehicle) => {
      if (vehicle.status) statuses.add(vehicle.status)
    })
    return Array.from(statuses).sort()
  }, [vehicles])

  // Get unique trip statuses
  const tripStatuses = useMemo(() => {
    const statuses = new Set<string>()
    vehicles.forEach((vehicle) => {
      if (vehicle.trip_status) statuses.add(vehicle.trip_status)
    })
    return Array.from(statuses).sort()
  }, [vehicles])

  // Filter and sort vehicles
  const filteredAndSortedVehicles = useMemo(() => {
    let filtered = vehicles

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (vehicle) =>
          vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (vehicle.shipmentId && vehicle.shipmentId.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((vehicle) => vehicle.type === typeFilter)
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((vehicle) => vehicle.status === statusFilter)
    }

    // Apply trip status filter
    if (tripStatusFilter !== "all") {
      filtered = filtered.filter((vehicle) => vehicle.trip_status === tripStatusFilter)
    }

    // Apply group filter
    if (groupFilter !== "all") {
      filtered = filtered.filter((vehicle) => vehicle.group && vehicle.group.includes(groupFilter))
    }

    // Apply location filter (inside/outside) for geofence matrix
    if (matrixType === "geofence" && locationFilter !== "all") {
      filtered = filtered.filter((vehicle) => vehicle.geofenceStatus === locationFilter)
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
          aValue = a.type.toLowerCase()
          bValue = b.type.toLowerCase()
          break
        case "status":
          aValue = a.status.toLowerCase()
          bValue = b.status.toLowerCase()
          break
        case "distanceFromGeofence":
          aValue = a.distanceFromGeofence
          bValue = b.distanceFromGeofence
          break
        case "gpsTime":
          aValue = a.gpsTime || ""
          bValue = b.gpsTime || ""
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
  }, [
    vehicles,
    searchTerm,
    sortField,
    sortDirection,
    typeFilter,
    statusFilter,
    tripStatusFilter,
    groupFilter,
    locationFilter,
    matrixType,
  ])

  // Update filtered count whenever filteredAndSortedVehicles changes
  useEffect(() => {
    onFilteredCountChange(filteredAndSortedVehicles.length)
  }, [filteredAndSortedVehicles.length, onFilteredCountChange])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedVehicles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentVehicles = filteredAndSortedVehicles.slice(startIndex, endIndex)

  // Statistics for distance matrix
  const distanceStats = useMemo(() => {
    // Distance distribution based on filtered vehicles
    const distanceRanges = {
      "0-2 Km": filteredAndSortedVehicles.filter((v) => v.distanceFromGeofence >= 0 && v.distanceFromGeofence <= 2)
        .length,
      "2-5 Km": filteredAndSortedVehicles.filter((v) => v.distanceFromGeofence > 2 && v.distanceFromGeofence <= 5)
        .length,
      "5-10 Km": filteredAndSortedVehicles.filter((v) => v.distanceFromGeofence > 5 && v.distanceFromGeofence <= 10)
        .length,
      "10-20 Km": filteredAndSortedVehicles.filter((v) => v.distanceFromGeofence > 10 && v.distanceFromGeofence <= 20)
        .length,
      "20-50 Km": filteredAndSortedVehicles.filter((v) => v.distanceFromGeofence > 20 && v.distanceFromGeofence <= 50)
        .length,
      "50+ Km": filteredAndSortedVehicles.filter((v) => v.distanceFromGeofence > 50).length,
    }

    return distanceRanges
  }, [filteredAndSortedVehicles])

  // Statistics for geofence matrix
  const geofenceStats = useMemo(() => {
    const insideCount = filteredAndSortedVehicles.filter((v) => v.geofenceStatus === "inside").length
    const outsideCount = filteredAndSortedVehicles.filter((v) => v.geofenceStatus === "outside").length

    return { insideCount, outsideCount }
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

  const clearFilter = (filterType: string) => {
    switch (filterType) {
      case "type":
        setTypeFilter("all")
        break
      case "status":
        setStatusFilter("all")
        break
      case "tripStatus":
        setTripStatusFilter("all")
        break
      case "group":
        setGroupFilter("all")
        break
      case "location":
        setLocationFilter("all")
        break
      case "search":
        setSearchTerm("")
        break
    }
  }

  const activeFilters = [
    { type: "search", value: searchTerm, label: `Search: "${searchTerm}"` },
    { type: "type", value: typeFilter, label: `Type: ${typeFilter}` },
    { type: "status", value: statusFilter, label: `Status: ${statusFilter}` },
    { type: "tripStatus", value: tripStatusFilter, label: `Trip Status: ${tripStatusFilter}` },
    { type: "group", value: groupFilter, label: `Group: ${groupFilter}` },
    { type: "location", value: locationFilter, label: `Location: ${locationFilter}` },
  ].filter((filter) => filter.value && filter.value !== "all")

  // Vehicle icon based on type
  const getVehicleIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "car":
        return <Car className="h-4 w-4" />
      case "truck":
        return <Truck className="h-4 w-4" />
      case "excavator":
        return <Tractor className="h-4 w-4" />
      default:
        return <Car className="h-4 w-4" />
    }
  }

  return (
    <Card className="h-full shadow-sm dark:bg-gray-900">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-white dark:bg-gray-900">
        <CardTitle className="text-lg font-semibold flex items-center dark:text-gray-100">{getMatrixTitle()}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 dark:bg-gray-900 dark:border-gray-700">
            <div className="p-2 space-y-2 grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium dark:text-gray-200">Vehicle Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100">
                    <SelectItem value="all" className="dark:hover:bg-gray-800">
                      All Types
                    </SelectItem>
                    {vehicleTypes.map((type) => (
                      <SelectItem key={type} value={type} className="dark:hover:bg-gray-800">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium dark:text-gray-200">Vehicle Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100">
                    <SelectItem value="all" className="dark:hover:bg-gray-800">
                      All Statuses
                    </SelectItem>
                    {vehicleStatuses.map((status) => (
                      <SelectItem key={status} value={status} className="dark:hover:bg-gray-800">
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium dark:text-gray-200">Trip Status</label>
                <Select value={tripStatusFilter} onValueChange={setTripStatusFilter}>
                  <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100">
                    <SelectItem value="all" className="dark:hover:bg-gray-800">
                      All Trip Statuses
                    </SelectItem>
                    {tripStatuses.map((status) => (
                      <SelectItem key={status} value={status} className="dark:hover:bg-gray-800">
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium dark:text-gray-200">Vehicle Group</label>
                <Select value={groupFilter} onValueChange={setGroupFilter}>
                  <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100">
                    <SelectItem value="all" className="dark:hover:bg-gray-800">
                      All Groups
                    </SelectItem>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.name} className="dark:hover:bg-gray-800">
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {matrixType === "geofence" && (
                <div className="col-span-2">
                  <label className="text-sm font-medium dark:text-gray-200">Current Location</label>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100">
                      <SelectItem value="all" className="dark:hover:bg-gray-800">
                        All Locations
                      </SelectItem>
                      <SelectItem value="inside" className="dark:hover:bg-gray-800">
                        Inside
                      </SelectItem>
                      <SelectItem value="outside" className="dark:hover:bg-gray-800">
                        Outside
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="bg-white dark:bg-gray-900">
        {/* Charts Section */}
        {matrixType === "geofence" && (
          <div className="mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {/* Inside - Green */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="20"
                    strokeDasharray={`${(geofenceStats.insideCount / (geofenceStats.insideCount + geofenceStats.outsideCount || 1)) * 502.4} 502.4`}
                    transform="rotate(-90 100 100)"
                  />
                  {/* Outside - Red */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="20"
                    strokeDasharray={`${(geofenceStats.outsideCount / (geofenceStats.insideCount + geofenceStats.outsideCount || 1)) * 502.4} 502.4`}
                    strokeDashoffset={`-${(geofenceStats.insideCount / (geofenceStats.insideCount + geofenceStats.outsideCount || 1)) * 502.4}`}
                    transform="rotate(-90 100 100)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{geofenceStats.insideCount + geofenceStats.outsideCount}</div>
                    <div className="text-sm text-gray-500">Total</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center space-x-4 mb-6 flex-wrap">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm">Inside: {geofenceStats.insideCount}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm">Outside: {geofenceStats.outsideCount}</span>
              </div>
            </div>
          </div>
        )}

        {matrixType === "distance" && (
          <div className="mb-6">
            <div className="h-48 flex items-end justify-center space-x-2 mb-4">
              {Object.entries(distanceStats).map(([range, count]) => (
                <div key={range} className="flex flex-col items-center">
                  <div
                    className="w-12 rounded-t"
                    style={{
                      height: `${Math.max((count / Math.max(...Object.values(distanceStats), 1)) * 150, 10)}px`,
                      background: `linear-gradient(to top, #ef4444, #ef444480)`,
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
              <span className="text-sm text-gray-600 dark:text-gray-300">Active filters:</span>
              {activeFilters.map((filter) => (
                <Badge
                  key={filter.type}
                  variant="secondary"
                  className="bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 cursor-pointer text-xs px-2 py-1"
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search by vehicle number or shipment ID..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800">
                  <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Alerts
                  </TableHead>
                  <TableHead
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("vehicleNumber")}
                  >
                    <div className="flex items-center">
                      Vehicle No.
                      {getSortArrow("vehicleNumber")}
                    </div>
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Shipment ID
                  </TableHead>
                  {matrixType === "geofence" ? (
                    <TableHead
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center">
                        Status
                        {getSortArrow("status")}
                      </div>
                    </TableHead>
                  ) : (
                    <TableHead
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("distanceFromGeofence")}
                    >
                      <div className="flex items-center">
                        Distance (Km)
                        {getSortArrow("distanceFromGeofence")}
                      </div>
                    </TableHead>
                  )}
                  <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vehicle Status
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Trip Status
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Driver Name
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Driver Mobile
                  </TableHead>
                  <TableHead
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("type")}
                  >
                    <div className="flex items-center">
                      Type
                      {getSortArrow("type")}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {currentVehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3">
                          <Users className="h-6 w-6 text-slate-400 dark:text-slate-500" />
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
                        className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          highlightedVehicle === vehicle.id
                            ? "bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500"
                            : ""
                        }`}
                        onClick={() => onVehicleClick(vehicle.id)}
                      >
                        <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (selectedGeofence) {
                                onAlertClick(vehicle.id, selectedGeofence)
                              } else {
                                showErrorToast("No geofence selected.", "Error")
                              }
                            }}
                          >
                            <AlertTriangle className="h-5 w-5" />
                          </button>
                        </TableCell>
                        <TableCell className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          {vehicle.vehicleNumber}
                        </TableCell>
                        <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {vehicle.shipmentId || "-"}
                        </TableCell>
                        {matrixType === "geofence" ? (
                          <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            <Badge
                              className={`border ${
                                vehicle.geofenceStatus === "inside"
                                  ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800"
                                  : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800"
                              }`}
                            >
                              {vehicle.geofenceStatus === "inside" ? "Inside" : "Outside"}
                            </Badge>
                          </TableCell>
                        ) : (
                          <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {vehicle.distanceFromGeofence.toFixed(2)}
                          </TableCell>
                        )}
                        <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          <Badge
                            className={`border ${
                              vehicle.status === "Active"
                                ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800"
                                : vehicle.status === "No Update"
                                  ? "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800"
                                  : "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
                            }`}
                          >
                            {vehicle.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {vehicle.trip_status || "-"}
                        </TableCell>
                        <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {vehicle.driverName || "-"}
                        </TableCell>
                        <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {vehicle.driverMobile || "-"}
                        </TableCell>
                        <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          <div className="flex items-center">
                            {getVehicleIcon(vehicle.type)}
                            <span className="ml-2">{vehicle.type}</span>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-700 dark:text-gray-200">
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
                  ? "border-gray-300 bg-white text-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-700 cursor-not-allowed"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="bg-black dark:bg-gray-800 text-white dark:text-gray-100 px-3 py-1 rounded-md">
              {currentPage}/{totalPages || 1}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`relative inline-flex items-center px-2 py-2 rounded-md border ${
                currentPage === totalPages || totalPages === 0
                  ? "border-gray-300 bg-white text-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-700 cursor-not-allowed"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        {Toaster}
      </CardContent>
    </Card>
  )
}