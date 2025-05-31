import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useMemo, useEffect } from "react"
import {
  Search,
  Plus,
  MapIcon,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { initialGeofenceData } from "@/data/geofence/gconfig"
import GeofenceMap from "../../components/geofence/gconfig/Geofence-map"
import GeofenceForm from "../../components/geofence/gconfig/Geofence-form"
import type { Geofence } from "../../types/geofence/gconfig"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

export default function GeofenceConfiguration() {
  const [geofences, setGeofences] = useState<Geofence[]>(initialGeofenceData)
  const [selectedGeofence, setSelectedGeofence] = useState<string | null>(null)
  const [editingGeofence, setEditingGeofence] = useState<Geofence | null>(null)
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [searchHighlight, setSearchHighlight] = useState<string | null>(null)
  const [view, setView] = useState<"list" | "map">("list")
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [showGeofencePopup, setShowGeofencePopup] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedFilter, setSelectedFilter] = useState("all")
  const itemsPerPage = 5
  const [sortField, setSortField] = useState<"name" | "type" | "location">("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const { showSuccessToast, showErrorToast, Toaster } = useToast({ position: "top-right",});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleSort = (field: "name" | "type" | "location") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortArrow = (field: "name" | "type" | "location") => {
    if (sortField === field) {
      return sortDirection === "asc" ? (
        <ChevronUp className="h-4 w-4 ml-1 text-blue-600" />
      ) : (
        <ChevronDown className="h-4 w-4 ml-1 text-blue-600" />
      )
    }
    return <ChevronUp className="h-4 w-4 ml-1 text-gray-400" />
  }

  // Filter geofences based on search term and filter
  const filteredGeofences = useMemo(() => {
    let filtered = geofences

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (geofence) =>
          geofence.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          geofence.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          geofence.tag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          geofence.type.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply dropdown filter
    if (selectedFilter !== "all") {
      filtered = filtered.filter((geofence) => geofence.name === selectedFilter)
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "type":
          aValue = a.type.toLowerCase()
          bValue = b.type.toLowerCase()
          break
        case "location":
          aValue = a.location.toLowerCase()
          bValue = b.location.toLowerCase()
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return sorted
  }, [geofences, searchTerm, selectedFilter, sortField, sortDirection])

  // Add search highlighting effect
  useEffect(() => {
    if (searchTerm && filteredGeofences.length > 0) {
      // If there's a search term and results, highlight the first result
      const firstResult = filteredGeofences[0]
      setSearchHighlight(firstResult.id)

      // Auto switch to map view when searching to show results
      if (view === "list" && filteredGeofences.length === 1) {
        setView("map")
      }
    } else if (!searchTerm) {
      // Clear highlight when search is cleared
      setSearchHighlight(null)
    }
  }, [searchTerm, filteredGeofences, view])

  // Pagination
  const totalPages = Math.ceil(filteredGeofences.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentGeofences = filteredGeofences.slice(startIndex, endIndex)

  const handleSelectGeofence = (id: string | null) => {
    setSelectedGeofence(id)
    if (id) {
      setSearchHighlight(id)
      // Auto switch to map view when selecting a geofence
      if (view === "list") {
        setView("map")
      }
    } else {
      setSearchHighlight(null)
    }
  }

  const handleEditGeofence = (id: string) => {
    const geofenceToEdit = geofences.find((geofence) => geofence.id === id)
    if (geofenceToEdit) {
      setEditingGeofence(geofenceToEdit)
      setShowForm(true)
      setIsCreatingNew(false)
    }
  }

  const handleSaveGeofence = (savedGeofence: Geofence) => {
    if (savedGeofence.id === "new" || isCreatingNew) {
      const newGeofence = {
        ...savedGeofence,
        id: `GF${String(Date.now()).slice(-3).padStart(3, "0")}`,
        createdAt: new Date().toISOString(),
        createdBy: "Admin",
        updatedAt: new Date().toISOString(),
        updatedBy: "Admin",
        status: "active",
        unloadingTime: Math.floor(Math.random() * 30) + 15,
      }
      setGeofences([...geofences, newGeofence])
    } else {
      const updatedGeofences = geofences.map((geofence) =>
        geofence.id === savedGeofence.id
          ? { ...savedGeofence, updatedAt: new Date().toISOString(), updatedBy: "Admin" }
          : geofence,
      )
      setGeofences(updatedGeofences)
    }
    setEditingGeofence(null)
    setIsCreatingNew(false)
    setShowForm(false)
  }

  const handleCloseForm = () => {
    setEditingGeofence(null)
    setIsCreatingNew(false)
    setShowForm(false)
  }

  const handleAddNew = () => {
    setEditingGeofence({
      id: "new",
      name: "",
      type: "circle",
      radius: 500,
      coordinates: { lat: 19.076, lng: 72.8777 },
      location: "",
      locationId: "",
      tag: "",
      geozoneType: "",
      stopType: "",
      shipmentId: "",
    })
    setIsCreatingNew(true)
    setShowForm(true)
  }

  // const handleDeleteGeofence = (id: string) => {
  //   if (confirm("Are you sure you want to delete this geofence?")) {
  //     setGeofences(geofences.filter((geofence) => geofence.id !== id))
  //     if (selectedGeofence === id) {
  //       setSelectedGeofence(null)
  //       setSearchHighlight(null)
  //     }
  //   }
  //

  // Updated handler to open dialog instead of confirm
  const handleDeleteGeofence = (id: string) => {
    setDeleteConfirmId(id)
  }

  // Confirm delete function
  const confirmDelete = () => {
    try {
      if (deleteConfirmId) {
        const geofenceToDelete = geofences.find(g => g.id === deleteConfirmId)

        setGeofences(geofences.filter((geofence) => geofence.id !== deleteConfirmId))

        if (selectedGeofence === deleteConfirmId) {
          setSelectedGeofence(null)
          setSearchHighlight(null)
        }

        showSuccessToast(
          `Geofence "${geofenceToDelete?.name || 'Unknown'}" deleted successfully`,
          ""
        )

        setDeleteConfirmId(null)
      }
    } catch (error) {
      //console.error("Error deleting geofence:", error)
      showErrorToast("Failed to delete geofence. Please try again.", "")
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "circle":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "polygon":
        return "text-purple-600 bg-purple-50 border-purple-200"
      case "pointer":
        return "text-green-600 bg-green-50 border-green-200"
      default:
        return "text-blue-600 bg-blue-50 border-blue-200"
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Also update the search input handler to clear selection when searching
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)

    // Clear current selection when starting a new search
    if (value && selectedGeofence) {
      setSelectedGeofence(null)
    }

    // Reset to first page when searching
    setCurrentPage(1)
  }

  return (
    <>
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 pt-4 pb-2">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-4 space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="bg-red-50 border border-red-200 px-3 py-1 rounded text-red-700 text-sm font-medium">
                Total Count: {filteredGeofences.length}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {/* View Toggle - Updated to match reference */}
              <div className="bg-gray-200 rounded-full px-1 py-1 flex items-center w-full sm:w-auto h-10">
                <div
                  className="relative w-full sm:w-24 h-7 flex items-center justify-between px-2 cursor-pointer text-sm"
                  onClick={() => setView(view === "list" ? "map" : "list")}
                >
                  <span className={`z-10 font-medium ${view === "list" ? "text-white" : "text-gray-700"}`}>List</span>
                  <span className={`z-10 font-medium ${view === "map" ? "text-white" : "text-gray-700"}`}>Map</span>
                  <motion.div
                    className="absolute left-0 w-1/2 h-8 bg-black rounded-full"
                    initial={false}
                    animate={{ x: view === "list" ? 0 : "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                </div>
              </div>

              {/* Filter Dropdown - Updated to match reference */}
              {/* <Select value={selectedFilter} onValueChange={setSelectedFilter}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="All Geofences" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center justify-between w-full">
              <span>All Geofences</span>
              {selectedFilter === "all"}
            </div>
          </SelectItem>
          {geofences.map((geofence) => (
            <SelectItem key={geofence.id} value={geofence.name}>
              <div className="flex items-center justify-between w-full">
                <span>{geofence.name}</span>
                {selectedFilter === geofence.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select> */}

              {/* Export Button */}
              {/* <Button variant="outline">Export</Button> */}

              {/* Add New Button */}
              <Button onClick={handleAddNew} className="bg-black hover:bg-gray-800 w-full sm:w-auto">
                <span className="sm:hidden">Add New Geofence</span>
                <span className="hidden sm:inline">Add Geofence</span>
              </Button>
            </div>
          </div>
          <hr className="my-2 border-gray-200" />
          {/* Search Bar - Centered */}
          <div className="mt-2 flex justify-center px-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search geofence by name, ID, or location..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}

        {view === "list" ? (
          /* List View - Table */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden m-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        Name
                        {getSortArrow("name")}
                      </div>
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500">ID</TableHead>
                    <TableHead
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("type")}
                    >
                      <div className="flex items-center">
                        Type
                        {getSortArrow("type")}
                      </div>
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500">Radius (m)</TableHead>
                    <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500">Tag</TableHead>
                    <TableHead
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("location")}
                    >
                      <div className="flex items-center">
                        Location
                        {getSortArrow("location")}
                      </div>
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                      Geozone Type
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500">Location Id</TableHead>
                    <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500">Stop Type</TableHead>
                    <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500">Shipment Id</TableHead>
                    <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500">Created At</TableHead>
                    <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500">Updated At</TableHead>
                    <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500">Created By</TableHead>
                    <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500">Updated By</TableHead>
                    <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</TableHead>
                    <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white divide-y divide-gray-200">
                  {currentGeofences.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={16} className="px-6 py-4 text-center text-sm text-gray-500">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="rounded-full bg-slate-100 p-3">
                            <MapIcon className="h-6 w-6 text-slate-400" />
                          </div>
                          <p>No geofences found</p>
                          {searchTerm ? (
                            <p className="text-xs">Try adjusting your search terms</p>
                          ) : (
                            <Button onClick={handleAddNew}>
                              <Plus className="h-4 w-4 mr-2" />
                              Add Geofence
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <AnimatePresence>
                      {currentGeofences.map((geofence, index) => (
                        <motion.tr
                          key={geofence.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`cursor-pointer hover:bg-gray-50 ${selectedGeofence === geofence.id ? "bg-blue-50" : ""
                            }`}
                          onClick={() => handleSelectGeofence(geofence.id)}
                        >
                          <TableCell className="px-6 py-4 whitespace-nowrap font-medium">{geofence.name}</TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap font-medium">{geofence.id}</TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            <Badge className={`${getTypeColor(geofence.type)} border`}>{geofence.type}</Badge>
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            {geofence.type === "circle" ? geofence.radius : "-"}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">{geofence.tag || "-"}</TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">{geofence.location}</TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">{geofence.geozoneType || "-"}</TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">{geofence.locationId || "-"}</TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">{geofence.stopType || "-"}</TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">{geofence.shipmentId || "-"}</TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            {formatDateTime(geofence.createdAt || "")}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            {formatDateTime(geofence.updatedAt || "")}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">{geofence.createdBy || "Admin"}</TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">{geofence.updatedBy || "Admin"}</TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => e.stopPropagation()}
                                  className="h-8 w-8 p-0"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditGeofence(geofence.id)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteGeofence(geofence.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination - Updated to match reference style */}
            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">{Math.min(endIndex, filteredGeofences.length)}</span> of{" "}
                <span className="font-medium">{filteredGeofences.length}</span> entries
              </div>
              <div className="flex items-center space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={`relative inline-flex items-center px-2 py-2 rounded-md border ${currentPage === 1
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
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={`relative inline-flex items-center px-2 py-2 rounded-md border ${currentPage === totalPages
                    ? "border-gray-300 bg-white text-gray-300 cursor-not-allowed"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Map View */
          <div className="flex-1 relative">
            <GeofenceMap
              geofences={filteredGeofences}
              selectedGeofence={selectedGeofence}
              editingGeofence={editingGeofence}
              isCreatingNew={isCreatingNew}
              searchHighlight={searchHighlight}
              onSelectGeofence={handleSelectGeofence}
              onEditGeofence={handleEditGeofence}
            />

            {/* Geofences Popup */}
            <div className="absolute top-4 right-4 z-10">
              <Card className="w-80 shadow-lg">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <MapIcon className="h-5 w-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">Geofences</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowGeofencePopup(!showGeofencePopup)}
                      className="h-6 w-6 p-0"
                    >
                      {showGeofencePopup ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </div>

                  {showGeofencePopup && (
                    <div className="max-h-96 overflow-auto">
                      {filteredGeofences.slice(0, 10).map((geofence, index) => (
                        <div
                          key={geofence.id}
                          className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedGeofence === geofence.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                            }`}
                          onClick={() => handleSelectGeofence(geofence.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-semibold text-gray-900 text-sm">{geofence.name}</h4>
                                <Badge
                                  className={`text-xs px-2 py-1 ${geofence.type === "circle"
                                    ? "bg-blue-100 text-blue-800"
                                    : geofence.type === "polygon"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-green-100 text-green-800"
                                    }`}
                                >
                                  {geofence.type}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600 mb-1">{geofence.location}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                {geofence.type === "circle" && <span>📍 Radius: {geofence.radius}m</span>}
                                {geofence.type === "polygon" && (
                                  <span>📐 Points: {geofence.polygonPoints?.length || 0}</span>
                                )}
                                {geofence.geozoneType && <span>🏷️ {geofence.geozoneType}</span>}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500 mb-1">{geofence.tag || "No tag"}</div>
                              <div className="text-xs text-green-600 font-medium">Active</div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {filteredGeofences.length === 0 && (
                        <div className="p-4 text-center text-gray-500">
                          <MapIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No geofences found</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}


        {/* Geofence Form Modal */}
        {showForm && (
          <GeofenceForm
            onClose={handleCloseForm}
            geofence={editingGeofence}
            isNew={isCreatingNew}
            onSave={handleSaveGeofence}
          />
        )}
      </div>

      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this geofence? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {Toaster}
    </>
  )
}
