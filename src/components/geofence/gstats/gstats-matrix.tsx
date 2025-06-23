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
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { fetchGroupsbyuserId } from "../../../data/manage/group"
import type { GeofenceMatrixProps, SortField, SortDirection } from "../../../types/geofence/gstats_type"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import type { Group } from "@/types/manage/group_type"
import { Checkbox } from "@/components/ui/checkbox"


export function GeofenceMatrix({
  vehicles,
  selectedGeofence,
  matrixType,
  onVehicleClick,
  highlightedVehicle,
  onFilteredCountChange,
  onAlertClick,
  onMatrixTypeChange,
  // New props for filters and sorting
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  tripStatusFilter,
  setTripStatusFilter,
  groupFilter,
  setGroupFilter,
  locationFilter,
  setLocationFilter,
  searchTerm,
  setSearchTerm,
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  allVehicles,
  loading, // <-- add loading prop
}: GeofenceMatrixProps & {
  typeFilter: string[]
  setTypeFilter: (v: string[]) => void
  statusFilter: string[]
  setStatusFilter: (v: string[]) => void
  tripStatusFilter: string[]
  setTripStatusFilter: (v: string[]) => void
  groupFilter: string[]
  setGroupFilter: (v: string[]) => void
  locationFilter: string[]
  setLocationFilter: (v: string[]) => void
  searchTerm: string
  setSearchTerm: (v: string) => void
  sortField: SortField
  setSortField: (v: SortField) => void
  sortDirection: SortDirection
  setSortDirection: (v: SortDirection) => void
  allVehicles: any[]
  loading?: boolean
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const [groups, setGroups] = useState<Group[]>([])
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

  // Get unique vehicle types/statuses/tripStatuses from allVehicles (not filtered)
  const vehicleTypes = useMemo(() => {
    const types = new Set<string>()
    allVehicles.forEach((vehicle) => {
      if (vehicle.type) types.add(vehicle.type)
    })
    return Array.from(types).sort()
  }, [allVehicles])

  const vehicleStatuses = useMemo(() => {
    const statuses = new Set<string>()
    allVehicles.forEach((vehicle) => {
      if (vehicle.status) statuses.add(vehicle.status)
    })
    return Array.from(statuses).sort()
  }, [allVehicles])

  const tripStatuses = useMemo(() => {
    const statuses = new Set<string>()
    allVehicles.forEach((vehicle) => {
      if (vehicle.trip_status) statuses.add(vehicle.trip_status)
    })
    return Array.from(statuses).sort()
  }, [allVehicles])

  // Helper for toggling multi-select filter values
  const toggleFilterValue = (filter: string[], setFilter: (v: string[]) => void, value: string) => {
    setFilter(filter.includes(value) ? filter.filter((v) => v !== value) : [...filter, value])
  }

  // Filtered and sorted vehicles for pagination and display
  const filteredAndSortedVehicles = useMemo(() => {
    let result = [...vehicles];
    // Sorting logic
    if (sortField) {
      result.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;
        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [vehicles, sortField, sortDirection]);

  // Pagination
  const itemsPerPage = 5
  const totalPages = Math.ceil(filteredAndSortedVehicles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentVehicles = filteredAndSortedVehicles.slice(startIndex, endIndex)

  // Statistics for distance matrix
  const distanceStats = useMemo(() => {
    const distanceRanges = {
      "0-2 Km": vehicles.filter((v) => v.distanceFromGeofence >= 0 && v.distanceFromGeofence <= 2).length,
      "2-5 Km": vehicles.filter((v) => v.distanceFromGeofence > 2 && v.distanceFromGeofence <= 5).length,
      "5-10 Km": vehicles.filter((v) => v.distanceFromGeofence > 5 && v.distanceFromGeofence <= 10).length,
      "10-20 Km": vehicles.filter((v) => v.distanceFromGeofence > 10 && v.distanceFromGeofence <= 20).length,
      "20-50 Km": vehicles.filter((v) => v.distanceFromGeofence > 20 && v.distanceFromGeofence <= 50).length,
      "50+ Km": vehicles.filter((v) => v.distanceFromGeofence > 50).length,
    }
    return distanceRanges
  }, [vehicles])

  // Statistics for geofence matrix
  const geofenceStats = useMemo(() => {
    const insideCount = vehicles.filter((v) => v.geofenceStatus === "inside").length
    const outsideCount = vehicles.filter((v) => v.geofenceStatus === "outside").length
    return { insideCount, outsideCount }
  }, [vehicles])

  // Update filtered count whenever vehicles changes
  useEffect(() => {
    onFilteredCountChange(vehicles.length)
  }, [vehicles.length, onFilteredCountChange])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  // const getMatrixTitle = () => {
  //   switch (matrixType) {
  //     case "geofence":
  //       return "Geofence Matrix"
  //     case "distance":
  //       return "Distance Matrix"
  //     default:
  //       return "Matrix"
  //   }
  // }

  // Clear individual filter or all
  const clearFilter = (filterType: string) => {
    switch (filterType) {
      case "type":
        setTypeFilter([])
        break
      case "status":
        setStatusFilter([])
        break
      case "tripStatus":
        setTripStatusFilter([])
        break
      case "group":
        setGroupFilter([])
        break
      case "location":
        setLocationFilter([])
        break
      case "search":
        setSearchTerm("")
        break
      case "all":
        setTypeFilter([])
        setStatusFilter([])
        setTripStatusFilter([])
        setGroupFilter([])
        setLocationFilter([])
        setSearchTerm("")
        break
    }
  }

  // Active filters with OR display
  const activeFilters = [
    { type: "search", value: searchTerm, label: `Search: "${searchTerm}"` },
    ...(typeFilter.length > 0 ? [{ type: "type", value: typeFilter, label: `Type: ${typeFilter.join(" , ")}` }] : []),
    ...(statusFilter.length > 0 ? [{ type: "status", value: statusFilter, label: `Status: ${statusFilter.join(" , ")}` }] : []),
    ...(tripStatusFilter.length > 0 ? [{ type: "tripStatus", value: tripStatusFilter, label: `Trip Status: ${tripStatusFilter.join(" , ")}` }] : []),
    ...(groupFilter.length > 0 ? [{ type: "group", value: groupFilter, label: `Group: ${groupFilter.join(" , ")}` }] : []),
    ...(locationFilter.length > 0 ? [{ type: "location", value: locationFilter, label: `Location: ${locationFilter.join(" , ")}` }] : []),
  ].filter((filter) => filter.value && (Array.isArray(filter.value) ? filter.value.length > 0 : filter.value !== ""))

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
    <Card className="shadow-sm dark:bg-gray-900">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-white dark:bg-gray-900">
        <Select value={matrixType} onValueChange={onMatrixTypeChange}>
          <SelectTrigger className="w-40 shadow-sm border border-gray-200 bg-white rounded-md transition-colors hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:border-gray-300 dark:focus:border-gray-600">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg dark:bg-gray-900 dark:border-gray-700">
            <SelectItem value="geofence" className="px-3 py-2 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800 cursor-pointer">
              Geofence Matrix
            </SelectItem>
            <SelectItem value="distance" className="px-3 py-2 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800 cursor-pointer">
              Distance Matrix
            </SelectItem>
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-50 h-70 right-10 dark:bg-gray-900 dark:border-gray-700">
            {/* Clear All Filters Button */}
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="ghost"
                className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                onClick={() => clearFilter("all")}
              >
                Clear All Filters
              </Button>
            </div>

            <div className="p-2 space-y-3">
              {/* Vehicle Type Multi-select */}
              <div>
                <label className="text-sm font-medium dark:text-gray-200">Vehicle Type</label>
                <div className="border rounded-md p-2 bg-white dark:bg-gray-800 max-h-32 overflow-y-auto">
                  {vehicleTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        checked={typeFilter.includes(type)}
                        onCheckedChange={() => toggleFilterValue(typeFilter, setTypeFilter, type)}
                        id={`type-${type}`}
                      />
                      <label htmlFor={`type-${type}`} className="text-sm dark:text-gray-100 cursor-pointer">{type}</label>
                    </div>
                  ))}
                </div>
              </div>
              {/* Vehicle Status Multi-select */}
              <div>
                <label className="text-sm font-medium dark:text-gray-200">Vehicle Status</label>
                <div className="border rounded-md p-2 bg-white dark:bg-gray-800 max-h-32 overflow-y-auto">
                  {vehicleStatuses.map((status) => (
                    <div key={status} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        checked={statusFilter.includes(status)}
                        onCheckedChange={() => toggleFilterValue(statusFilter, setStatusFilter, status)}
                        id={`status-${status}`}
                      />
                      <label htmlFor={`status-${status}`} className="text-sm dark:text-gray-100 cursor-pointer">{status}</label>
                    </div>
                  ))}
                </div>
              </div>
              {/* Trip Status Multi-select */}
              <div>
                <label className="text-sm font-medium dark:text-gray-200">Trip Status</label>
                <div className="border rounded-md p-2 bg-white dark:bg-gray-800 max-h-32 overflow-y-auto">
                  {tripStatuses.map((status) => (
                    <div key={status} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        checked={tripStatusFilter.includes(status)}
                        onCheckedChange={() => toggleFilterValue(tripStatusFilter, setTripStatusFilter, status)}
                        id={`tripstatus-${status}`}
                      />
                      <label htmlFor={`tripstatus-${status}`} className="text-sm dark:text-gray-100 cursor-pointer">{status}</label>
                    </div>
                  ))}
                </div>
              </div>
              {/* Vehicle Group Multi-select */}
              <div>
                <label className="text-sm font-medium dark:text-gray-200">Vehicle Group</label>
                <div className="border rounded-md p-2 bg-white dark:bg-gray-800 max-h-32 overflow-y-auto">
                  {groups.map((group) => (
                    <div key={group.id} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        checked={groupFilter.includes(group.name)}
                        onCheckedChange={() => toggleFilterValue(groupFilter, setGroupFilter, group.name)}
                        id={`group-${group.id}`}
                      />
                      <label htmlFor={`group-${group.id}`} className="text-sm dark:text-gray-100 cursor-pointer">{group.name}</label>
                    </div>
                  ))}
                </div>
              </div>
              {/* Location Multi-select (only for geofence) */}
              {matrixType === "geofence" && (
                <div>
                  <label className="text-sm font-medium dark:text-gray-200">Current Location</label>
                  <div className="border rounded-md p-2 bg-white dark:bg-gray-800 flex flex-col space-y-1">
                    {["inside", "outside"].map((loc) => (
                      <div key={loc} className="flex items-center space-x-2">
                        <Checkbox
                          checked={locationFilter.includes(loc)}
                          onCheckedChange={() => toggleFilterValue(locationFilter, setLocationFilter, loc)}
                          id={`location-${loc}`}
                        />
                        <label htmlFor={`location-${loc}`} className="text-sm dark:text-gray-100 cursor-pointer capitalize">{loc}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="bg-white rounded-b-2xl dark:bg-gray-900">
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
                  <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vendor
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
                  <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last GPS Ping
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={12} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-300">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3 animate-pulse">
                          <Users className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                        </div>
                        <p>Loading vehicles...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : currentVehicles.length === 0 ? (
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
                    {currentVehicles.map((vehicle, index) => {
                      const hasLatLng =
                        vehicle.lat !== undefined &&
                        vehicle.lat !== null &&
                        vehicle.lat.toString() !== "" &&
                        vehicle.lng !== undefined &&
                        vehicle.lng !== null &&
                        vehicle.lng.toString() !== "";
                      return (
                        <motion.tr
                          key={vehicle.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${highlightedVehicle === vehicle.id
                              ? "bg-red-50 dark:bg-gray-800/60"
                              : ""
                            }`}
                          onClick={() => onVehicleClick(vehicle.id)}
                        >
                          <TableCell className="px-4 py-4 text-center whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            <button
                              className="text-red-500 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (selectedGeofence) {
                                  onAlertClick(vehicle.id, selectedGeofence)
                                } else {
                                  showErrorToast("No geofence selected.", "")
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
                              {/* Only show Badge if lat/lng is present */}
                              {hasLatLng ? (
                                <Badge
                                  className={`border ${vehicle.geofenceStatus === "inside"
                                    ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800"
                                    : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800"
                                    }`}
                                >
                                  {vehicle.geofenceStatus === "inside" ? "Inside" : "Outside"}
                                </Badge>
                              ) : (
                                <Badge className="bg-gray-200 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                                  NA
                                </Badge>
                              )}
                            </TableCell>
                          ) : (
                            <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {/* Only show Distance if lat/lng is present */}
                              {hasLatLng ? vehicle.distanceFromGeofence.toFixed(2) : "NA"}
                            </TableCell>
                          )}
                          <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            <Badge
                              className={`border ${vehicle.status === "Active"
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
                            {vehicle.vendorName || "-"}
                          </TableCell>
                          <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            <div className="flex items-center">
                              {getVehicleIcon(vehicle.type)}
                              <span className="ml-2">{vehicle.type}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {
                              vehicle.gpsTime && vehicle.gprsTime
                                ? (new Date(vehicle.gpsTime) > new Date(vehicle.gprsTime) ? vehicle.gpsTime : vehicle.gprsTime)
                                : (vehicle.gpsTime || vehicle.gprsTime || "-")
                            }
                          </TableCell>
                        </motion.tr>
                      )
                    })}
                  </AnimatePresence>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        <div className="px-6 pt-3 flex items-center justify-between border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-700 dark:text-gray-200">
            Showing <span className="font-medium">{currentVehicles.length > 0 ? startIndex + 1 : 0}</span> to{" "}
            <span className="font-medium">{Math.min(endIndex, filteredAndSortedVehicles.length)}</span> of{" "}
            <span className="font-medium">{filteredAndSortedVehicles.length}</span> entries
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-md border ${currentPage === 1
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
              className={`relative inline-flex items-center px-2 py-2 rounded-md border ${currentPage === totalPages || totalPages === 0
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