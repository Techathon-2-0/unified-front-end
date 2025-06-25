import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useMemo, useEffect } from "react"
import {
  Search,
  MapIcon,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronUp,
  Loader2,
  CheckCircle,
  XCircle,
  MoreVertical,
  Download,
  Upload
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  fetchGeofences,
  createGeofence,
  updateGeofence,
  deleteGeofence,
  searchGeofences,
} from "@/data/geofence/gconfig"
import GeofenceMap from "./gconfig-map"
import GeofenceForm from "./gconfig-drawer"
import type { Geofence } from "../../../types/geofence/gconfig_type"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "../../formatdate"
import { fetchRolesByUserId } from "@/data/usermanage/responsibility"
import { useAuth } from "@/context/AuthContext"

// Helper functions for type conversion
const getGeofenceTypeNumber = (type: "circle" | "polygon" | "pointer"): number => {
  switch (type) {
    case "circle": return 0
    case "pointer": return 1
    case "polygon": return 2
    default: return 0
  }
}

const getGeofenceTypeString = (type: number): "circle" | "polygon" | "pointer" => {
  switch (type) {
    case 0: return "circle"
    case 1: return "pointer" 
    case 2: return "polygon"
    default: return "circle"
  }
}

export default function GeofenceConfiguration() {
  const [geofences, setGeofences] = useState<Geofence[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGeofence, setSelectedGeofence] = useState<number | null>(null)
  const [editingGeofence, setEditingGeofence] = useState<Geofence | null>(null)
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [searchHighlight, setSearchHighlight] = useState<number | null>(null)
  const [view, setView] = useState<"list" | "map">("list")
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)
  const [showForm, setShowForm] = useState(false)
  const [showGeofencePopup, setShowGeofencePopup] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedFilter] = useState("all")
  const itemsPerPage = 5
  const [sortField, setSortField] = useState<"name" | "type" | "location">("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const { showSuccessToast, showErrorToast, Toaster } = useToast({ position: "top-right" })
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const { user } = useAuth()
  const [geofenceConfigAccess, setGeofenceConfigAccess] = useState<number | null>(null)

  // Load geofences on component mount
  useEffect(() => {
    loadGeofences()
  }, [])

  useEffect(() => {
    const fetchAccess = async () => {
      if (user && user.id) {
        try {
          const roles = await fetchRolesByUserId(user.id)
          if (roles && roles.length > 0) {
            const tabsAccess = roles[0].tabs_access
            const geofenceTab = tabsAccess.find((tab: any) => tab.hasOwnProperty("geofence_config"))
            setGeofenceConfigAccess(geofenceTab ? geofenceTab.geofence_config : null)
          }
        } catch {
          setGeofenceConfigAccess(null)
        }
      }
    }
    fetchAccess()
  }, [user])

  const loadGeofences = async () => {
    try {
      setLoading(true)
      const data = await fetchGeofences()
      setGeofences(data)
    } catch (error) {
      console.error("Error loading geofences:", error)
      showErrorToast("Failed to load geofences", "Please try again")
    } finally {
      setLoading(false)
    }
  }

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

  // Debounce searchTerm by 500ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchTerm])

  // Filter geofences based on search term and filter
  const filteredGeofences = useMemo(() => {
    let filtered = geofences

    // Apply search filter
    if (debouncedSearchTerm) {
      filtered = filtered.filter(
        (geofence) =>
          (geofence.geofence_name?.toLowerCase() || "").includes(debouncedSearchTerm.toLowerCase()) ||
          (geofence.tag ? geofence.tag.toLowerCase() : "").includes(debouncedSearchTerm.toLowerCase()) ||
          getGeofenceTypeString(geofence.geofence_type).toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          geofence.id.toString().includes(debouncedSearchTerm) ||
          (geofence.location_id ? geofence.location_id.toString() : "").includes(debouncedSearchTerm),
      )
    }

    // Apply dropdown filter
    if (selectedFilter !== "all") {
      filtered = filtered.filter((geofence) => geofence.geofence_name === selectedFilter)
    }

    // Apply sorting - updated to use geofence_type number
    const sorted = [...filtered].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case "name":
          aValue = (a.geofence_name || "").toLowerCase()
          bValue = (b.geofence_name || "").toLowerCase()
          break
        case "type":
          aValue = getGeofenceTypeString(a.geofence_type).toLowerCase()
          bValue = getGeofenceTypeString(b.geofence_type).toLowerCase()
          break
        default:
          aValue = (a.geofence_name || "").toLowerCase()
          bValue = (b.geofence_name || "").toLowerCase()
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return sorted
  }, [geofences, debouncedSearchTerm, selectedFilter, sortField, sortDirection])

  // Add search highlighting effect
  useEffect(() => {
    if (searchTerm && filteredGeofences.length > 0) {
      const firstResult = filteredGeofences[0]
      setSearchHighlight(firstResult.id)
    } else if (!searchTerm) {
      setSearchHighlight(null)
    }
  }, [searchTerm, filteredGeofences])

  // Pagination
  const totalPages = Math.ceil(filteredGeofences.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentGeofences = filteredGeofences.slice(startIndex, endIndex)

  const handleSelectGeofence = (id: number | null) => {
    setSelectedGeofence(id)
    if (id) {
      setSearchHighlight(id)
      setView("map")
    } else {
      setSearchHighlight(null)
    }
  }

  const handleEditGeofence = (id: number) => {
    const geofenceToEdit = geofences.find((geofence) => geofence.id === id)
    if (geofenceToEdit) {
      setEditingGeofence(geofenceToEdit)
      setShowForm(true)
      setIsCreatingNew(false)
    }
  }

  const handleSaveGeofence = async (savedGeofence: Geofence) => {
    try {
      if (isCreatingNew) {
        const newGeofence = await createGeofence(savedGeofence)
        setGeofences([
          ...geofences,
          {
            ...newGeofence,
            type: getGeofenceTypeString(newGeofence.geofence_type)
          }
        ])
        showSuccessToast(`Geofence "${savedGeofence.geofence_name}" created successfully!`, "")
      } else {
        const updatedGeofence = await updateGeofence(savedGeofence.id, savedGeofence)
        const updatedGeofences = geofences.map((geofence) =>
          geofence.id === savedGeofence.id ? updatedGeofence : geofence,
        )
        setGeofences(
          updatedGeofences.map(g => ({
            ...g,
            // Ensure 'type' is of correct union type
            type: getGeofenceTypeString(g.geofence_type)
          }))
        )
        showSuccessToast(`Geofence "${savedGeofence.geofence_name}" updated successfully!`, "")
      }
      setEditingGeofence(null)
      setIsCreatingNew(false)
      setShowForm(false)
    } catch (error) {
      console.error("Error saving geofence:", error)
      showErrorToast("Failed to save geofence", "Please try again")
    }
  }

  const handleUpdateGeofence = (updatedGeofence: Geofence) => {
    setGeofences(prev => prev.map(g => g.id === updatedGeofence.id ? updatedGeofence : g))
    setEditingGeofence(updatedGeofence)
  }

  const handleCloseForm = () => {
    setEditingGeofence(null)
    setIsCreatingNew(false)
    setShowForm(false)
  }

  const handleAddNew = () => {
    setEditingGeofence({
      id: 0,
      geofence_name: "",
      type: "circle",
      geofence_type: 0, // Use number instead of string
      radius: 500,
      coordinates: { lat: 19.076, lng: 72.8777 },
      latitude: 19.076,
      longitude: 72.8777,
      location_id: "",
      tag: "",
      stop_type: "",
      status: true,
      address: "",
      time: ""
    })
    setIsCreatingNew(true)
    setShowForm(true)
  }

  const handleDeleteGeofence = (id: number) => {
    setDeleteConfirmId(id)
  }

  const confirmDelete = async () => {
    try {
      if (deleteConfirmId) {
        const geofenceToDelete = geofences.find((g) => g.id === deleteConfirmId)
        await deleteGeofence(deleteConfirmId)
        setGeofences(geofences.filter((geofence) => geofence.id !== deleteConfirmId))

        if (selectedGeofence === deleteConfirmId) {
          setSelectedGeofence(null)
          setSearchHighlight(null)
        }

        showSuccessToast(`Geofence "${geofenceToDelete?.geofence_name || "Unknown"}" deleted successfully`, "")

        setDeleteConfirmId(null)
      }
    } catch (error) {
      console.error("Error deleting geofence:", error)
      showErrorToast("Failed to delete geofence. Please try again.", "")
    }
  }

  // Updated to use geofence_type number
  const getTypeColor = (geofenceType: number) => {
    const typeString = getGeofenceTypeString(geofenceType)
    switch (typeString) {
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)

    if (value && selectedGeofence) {
      setSelectedGeofence(null)
    }

    setCurrentPage(1)
    // No API call here, handled in debounced effect below
  }

  // Debounced effect for API search
  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      (async () => {
        try {
          const searchResults = await searchGeofences(debouncedSearchTerm.trim())
          setGeofences(searchResults)
        } catch (error) {
          console.error("Error searching geofences:", error)
          showErrorToast("Search failed", "Please try again")
        }
      })()
    } else {
      loadGeofences()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm])

  useEffect(() => {
    if (view === "list") {
      setSelectedGeofence(null)
      setSearchHighlight(null)
    }
  }, [view])

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-gray-600 dark:text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">Loading geofences...</p>
          </div>
        </div>
      </div>
    )
  }

  // Export function - updated to handle geofence_type
  const handleExport = (format: "csv" | "pdf") => {
    try {
      const data = filteredGeofences.map((geofence) => ({
        "ID": geofence.id,
        "Name": geofence.geofence_name,
        "Type": getGeofenceTypeString(geofence.geofence_type),
        "Latitude": geofence.latitude,
        "Longitude": geofence.longitude,
        "Radius": geofence.geofence_type === 0 ? geofence.radius : "", // circle type
        "Tag": geofence.tag || "",
        "Location Id": geofence.location_id || "",
        "Stop Type": geofence.stop_type || "",
        "Address": geofence.address || "",
        "Status": geofence.status ? "Active" : "Inactive",
        "Created At": formatDate(geofence.created_at || ""),
        "Updated At": formatDate(geofence.updated_at || ""),
        "Polygon Points": geofence.geofence_type === 2 && Array.isArray(geofence.polygonPoints) // polygon type
          ? geofence.polygonPoints.map((pt) => `${pt.lat},${pt.lng}`).join(" | ")
          : "",
        "Time": geofence.time || "",
      }))

      if (data.length === 0) {
        showSuccessToast("No data available to export", "")
        return
      }

      if (format === "csv") {
        const escapeCsvValue = (value: any): string => {
          const stringValue = String(value)
          if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`
          }
          return stringValue
        }

        const headers = Object.keys(data[0]).join(",")
        const rows = data.map((row) =>
          Object.values(row).map(escapeCsvValue).join(",")
        )
        const csv = [headers, ...rows].join("\n")

        const blob = new Blob([csv], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `geofences_${new Date().toISOString().split("T")[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)

        showSuccessToast("CSV file downloaded successfully", "")
      } else {
        const printWindow = window.open("", "_blank")
        if (printWindow) {
          const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Geofences Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
              th { background-color: #f2f2f2; }
              h1 { color: #333; }
            </style>
          </head>
          <body>
            <h1>Geofences Report</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <table>
              <thead>
                <tr>
                  ${Object.keys(data[0])
              .map((key) => `<th>${key}</th>`)
              .join("")}
                </tr>
              </thead>
              <tbody>
                ${data
              .map(
                (row) =>
                  `<tr>${Object.values(row)
                    .map((value) => `<td>${value}</td>`)
                    .join("")}</tr>`,
              )
              .join("")}
              </tbody>
            </table>
          </body>
        </html>
      `
          printWindow.document.write(htmlContent)
          printWindow.document.close()
          printWindow.print()
          printWindow.close()

          showSuccessToast("PDF file downloaded successfully", "")
        } else {
          showErrorToast("Failed to open print window. Please check if popups are blocked.", "")
        }
      }
    } catch (error) {
      showErrorToast("Failed to export data. Please try again.", "")
    }
  }

  // Updated bulk upload to handle geofence_type properly
  const handleBulkUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".csv"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = async (event) => {
          const csv = event.target?.result as string

          const parseCSVLine = (line: string): string[] => {
            const result: string[] = []
            let current = ""
            let inQuotes = false

            for (let i = 0; i < line.length; i++) {
              const char = line[i]

              if (char === '"') {
                inQuotes = !inQuotes
              } else if (char === "," && !inQuotes) {
                result.push(current.trim())
                current = ""
              } else {
                current += char
              }
            }
            result.push(current.trim())
            return result
          }

          const lines = csv.split("\n").filter((line) => line.trim())
          const headers = parseCSVLine(lines[0])

          setLoading(true)
          try {
            const createdGeofences: Geofence[] = []
            const updatedGeofences: Geofence[] = []

            for (let i = 1; i < lines.length; i++) {
              const values = parseCSVLine(lines[i])
              if (values.length >= 3 && values[0]) {
                const locationIdIdx = headers.findIndex(h => h.toLowerCase().includes("location"))
                const locationId = locationIdIdx !== -1 ? values[locationIdIdx] : ""

                const existingGeofence = geofences.find(g => g.location_id === locationId && locationId !== "")

                const typeIdx = headers.findIndex(h => h.toLowerCase() === "type")
                const typeString = (typeIdx !== -1 ? values[typeIdx] : "circle") as "circle" | "polygon" | "pointer"
                const geofenceType = getGeofenceTypeNumber(typeString)

                let polygonPoints: { lat: number; lng: number }[] = []
                const polygonIdx = headers.findIndex(h => h.toLowerCase().includes("polygon"))
                if (geofenceType === 2 && polygonIdx !== -1 && values[polygonIdx]) { // polygon type
                  const points = values[polygonIdx].split(" | ")
                  polygonPoints = points.map(point => {
                    const [lat, lng] = point.split(",").map(p => parseFloat(p.trim()))
                    return { lat, lng }
                  }).filter(point => !isNaN(point.lat) && !isNaN(point.lng))
                }

                const stopTypeIdx = headers.findIndex(h => h.toLowerCase().includes("stop"))
                let stopType = stopTypeIdx !== -1 ? values[stopTypeIdx] : ""
                if (stopType && !["P", "D", "W", "R"].includes(stopType.toUpperCase())) {
                  stopType = ""
                }

                const timeIdx = headers.findIndex(h => h.toLowerCase() === "time")
                const time = timeIdx !== -1 ? values[timeIdx] : ""

                const geofenceData = {
                  geofence_name: values[0],
                  type: typeString,
                  geofence_type: geofenceType,
                  latitude: values[2] ? parseFloat(values[2]) : undefined,
                  longitude: values[3] ? parseFloat(values[3]) : undefined,
                  coordinates: { 
                    lat: values[2] ? parseFloat(values[2]) : 0, 
                    lng: values[3] ? parseFloat(values[3]) : 0 
                  },
                  radius: geofenceType === 0 && values[4] ? parseFloat(values[4]) : undefined, // circle type
                  tag: values[5] || "",
                  location_id: locationId,
                  stop_type: stopType.toUpperCase(),
                  address: values[8] || "",
                  status: values[9] ? values[9].toLowerCase() === "active" : true,
                  polygonPoints: geofenceType === 2 ? polygonPoints : undefined, // polygon type
                  time: time,
                }

                if (existingGeofence) {
                  const updatedGeofence = await updateGeofence(existingGeofence.id, geofenceData)
                    updatedGeofences.push(updatedGeofence as Geofence)
                } else {
                  const newGeofence = await createGeofence(geofenceData)
                  createdGeofences.push(newGeofence as Geofence)
                }
              }
            }

            if (updatedGeofences.length > 0) {
              setGeofences(prev => prev.map(g => {
                const updated = updatedGeofences.find(ug => ug.id === g.id)
                return updated || g
              }))
            }

            if (createdGeofences.length > 0) {
              setGeofences(prev => [...prev, ...createdGeofences])
            }

            if (createdGeofences.length > 0 || updatedGeofences.length > 0) {
              setTimeout(() => {
                showSuccessToast(
                  "Bulk upload successful",
                  `${createdGeofences.length} geofences created, ${updatedGeofences.length} geofences updated.`,
                )
              }, 100)
            } else {
              setTimeout(() => {
                showErrorToast("Upload failed", "No valid data found in the CSV file.")
              }, 100)
            }
          } catch (error) {
            setTimeout(() => {
              showErrorToast("Bulk upload failed", "Please check your CSV file and try again.")
            }, 100)
          } finally {
            setLoading(false)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  // Similar updates for handleBulkEdit...
  const handleBulkEdit = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".csv"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = async (event) => {
          const csv = event.target?.result as string

          const parseCSVLine = (line: string): string[] => {
            const result: string[] = []
            let current = ""
            let inQuotes = false

            for (let i = 0; i < line.length; i++) {
              const char = line[i]

              if (char === '"') {
                inQuotes = !inQuotes
              } else if (char === "," && !inQuotes) {
                result.push(current.trim())
                current = ""
              } else {
                current += char
              }
            }
            result.push(current.trim())
            return result
          }

          const lines = csv.split("\n").filter((line) => line.trim())
          const headers = parseCSVLine(lines[0])

          setLoading(true)
          try {
            let updatedCount = 0
            let createdCount = 0
            const newGeofences: Geofence[] = []
            const updatedGeofences: Geofence[] = []

            for (let i = 1; i < lines.length; i++) {
              const values = parseCSVLine(lines[i])
              if (values.length >= 3 && values[0]) {
                const locationIdIdx = headers.findIndex(h => h.toLowerCase().includes("location"))
                const locationId = locationIdIdx !== -1 ? values[locationIdIdx] : ""
                const existingGeofence = geofences.find(g => g.location_id === locationId && locationId !== "")

                const typeIdx = headers.findIndex(h => h.toLowerCase() === "type")
                const typeString = (typeIdx !== -1 ? values[typeIdx] : "circle") as "circle" | "polygon" | "pointer"
                const geofenceType = getGeofenceTypeNumber(typeString)

                let polygonPoints: { lat: number; lng: number }[] | undefined = undefined
                const polygonIdx = headers.findIndex(h => h.toLowerCase().includes("polygon"))
                if (geofenceType === 2 && polygonIdx !== -1 && values[polygonIdx]) { // polygon type
                  const points = values[polygonIdx].split(" | ")
                  polygonPoints = points.map(point => {
                    const [lat, lng] = point.split(",").map(p => parseFloat(p.trim()))
                    return { lat, lng }
                  }).filter(point => !isNaN(point.lat) && !isNaN(point.lng))
                }

                const stopTypeIdx = headers.findIndex(h => h.toLowerCase().includes("stop"))
                let stopType = stopTypeIdx !== -1 ? values[stopTypeIdx] : ""
                if (stopType && !["P", "D", "W", "R"].includes(stopType.toUpperCase())) {
                  stopType = ""
                }

                const timeIdx = headers.findIndex(h => h.toLowerCase() === "time")
                const time = timeIdx !== -1 ? values[timeIdx] : ""

                const geofenceData: Omit<Geofence, "id"> = {
                  geofence_name: values[0],
                  type: typeString,
                  geofence_type: geofenceType,
                  radius: geofenceType === 0 && values[4] ? parseFloat(values[4]) : undefined, // circle type
                  coordinates: { lat: values[2] ? parseFloat(values[2]) : 0, lng: values[3] ? parseFloat(values[3]) : 0 },
                  latitude: values[2] ? parseFloat(values[2]) : 0,
                  longitude: values[3] ? parseFloat(values[3]) : 0,
                  location_id: locationId,
                  tag: values[5] || "",
                  stop_type: stopType.toUpperCase(),
                  address: values[8] || "",
                  status: values[9] ? values[9].toLowerCase() === "active" : true,
                  polygonPoints: geofenceType === 2 ? polygonPoints : undefined, // polygon type
                  time: time,
                }

                if (geofenceType !== 0) geofenceData.radius = undefined // not circle
                if (geofenceType !== 2) geofenceData.polygonPoints = undefined // not polygon

                if (existingGeofence) {
                  const isDifferent =
                    existingGeofence.geofence_name !== geofenceData.geofence_name ||
                    existingGeofence.geofence_type !== geofenceData.geofence_type ||
                    existingGeofence.radius !== geofenceData.radius ||
                    existingGeofence.tag !== geofenceData.tag ||
                    existingGeofence.stop_type !== geofenceData.stop_type ||
                    existingGeofence.address !== geofenceData.address ||
                    existingGeofence.status !== geofenceData.status ||
                    existingGeofence.time !== geofenceData.time ||
                    existingGeofence.latitude !== geofenceData.latitude ||
                    existingGeofence.longitude !== geofenceData.longitude ||
                    (
                      geofenceData.polygonPoints &&
                      JSON.stringify(existingGeofence.polygonPoints || []) !== JSON.stringify(geofenceData.polygonPoints)
                    )

                  if (isDifferent) {
                    const updatedGeofence = await updateGeofence(existingGeofence.id, geofenceData)
                    updatedGeofences.push(updatedGeofence as Geofence)
                    updatedCount++
                  }
                } else if (locationId) {
                  const newGeofence = await createGeofence(geofenceData)
                  newGeofences.push(newGeofence as Geofence)
                  createdCount++
                }
              }
            }

            if (updatedGeofences.length > 0) {
              setGeofences(prev => prev.map(g => {
                const updated = updatedGeofences.find(ug => ug.id === g.id)
                return updated || g
              }))
            }

            if (createdCount > 0) {
              setGeofences(prev => [...prev, ...newGeofences])
            }

            if (updatedCount > 0 || createdCount > 0) {
              setTimeout(() => {
                showSuccessToast(
                  "Bulk edit successful",
                  `${updatedCount} geofences updated, ${createdCount} geofences created.`,
                )
              }, 100)
            } else {
              setTimeout(() => {
                showErrorToast("Bulk edit failed", "No matching geofences found or no valid location IDs provided.")
              }, 100)
            }
          } catch (error) {
            setTimeout(() => {
              showErrorToast("Bulk edit failed", "Please check your CSV file and try again.")
            }, 100)
          } finally {
            setLoading(false)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const downloadTemplate = () => {
    const template = [
      "Name,Type,Latitude,Longitude,Radius,Tag,Location Id,Stop Type,Address,Status,Polygon Points,Time",
      "Sample Circle Geofence,circle,40.7128,-74.0060,100,warehouse,LOC001,P,123 Main St,Active,,1",
      "Sample Polygon Geofence,polygon,40.7130,-74.0058,,delivery,LOC002,D,456 Oak Ave,Active,\"40.7128,-74.0060 | 40.7130,-74.0058 | 40.7132,-74.0062 | 40.7130,-74.0064\",2",
      "Inactive Circle Zone,circle,40.7500,-73.9900,250,parking,LOC003,W,789 Pine Rd,Inactive,,3",
      "Complex Polygon Zone,polygon,40.7502,-73.9898,,restricted,LOC004,R,321 Elm St,Active,\"40.7500,-73.9900 | 40.7502,-73.9898 | 40.7504,-73.9902 | 40.7502,-73.9904 | 40.7500,-73.9902\",4",
    ].join("\n")

    const blob = new Blob([template], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "geofence_template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header - existing code remains the same */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 pt-4 pb-2 rounded-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-4 space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-3 py-1 rounded text-red-700 dark:text-red-400 text-sm font-medium">
                Total Count: {filteredGeofences.length}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {/* View Toggle */}
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full px-1 py-1 flex items-center w-full sm:w-auto h-10">
                <div
                  className="relative w-full sm:w-24 h-7 flex items-center justify-between px-2 cursor-pointer text-sm"
                  onClick={() => setView(view === "list" ? "map" : "list")}
                >
                  <span className={`z-10 font-medium ${view === "list" ? "text-white" : "text-gray-700 dark:text-gray-300"}`}>List</span>
                  <span className={`z-10 font-medium ${view === "map" ? "text-white" : "text-gray-700 dark:text-gray-300"}`}>Map</span>
                  <motion.div
                    className="absolute left-0 w-1/2 h-8 bg-black dark:bg-gray-900 rounded-full"
                    initial={false}
                    animate={{ x: view === "list" ? 0 : "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                </div>
              </div>
              {/* Export Button */}
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="rounded-md dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="dark:bg-gray-800 dark:border-gray-700">
                    <DropdownMenuItem onClick={() => handleExport("csv")}>Export as CSV</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("pdf")}>Export as PDF</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="rounded-md dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Bulk Upload
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="dark:bg-gray-800 dark:border-gray-700">
                  <DropdownMenuItem onClick={handleBulkUpload} className="dark:text-gray-300 dark:hover:bg-gray-700">Upload CSV File</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleBulkEdit} className="dark:text-gray-300 dark:hover:bg-gray-700">Edit Bulk (CSV)</DropdownMenuItem>
                  <DropdownMenuItem onClick={downloadTemplate} className="dark:text-gray-300 dark:hover:bg-gray-700">Download Template</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {/* Add New Button - hide if geofenceConfigAccess === 1 */}
              {geofenceConfigAccess !== 1 && (
                <Button onClick={handleAddNew} className="bg-black hover:bg-gray-800 dark:bg-gray-900 dark:hover:bg-gray-700 w-full sm:w-auto dark:text-white">
                  <span className="sm:hidden">Add New Geofence</span>
                  <span className="hidden sm:inline">Add Geofence</span>
                </Button>
              )}
            </div>
          </div>
          <hr className="my-2 border-gray-200 dark:border-gray-700" />
          {/* Search Bar - Centered */}
          <div className="mt-2 flex justify-center px-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search geofence by name, ID, or tag..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        {view === "list" ? (
          /* List View - Table */
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden m-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-900">
                    {/* Actions header - hide if geofenceConfigAccess === 1 */}
                    {geofenceConfigAccess !== 1 && (
                      <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</TableHead>
                    )}
                    <TableHead
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        Name
                        {getSortArrow("name")}
                      </div>
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">ID</TableHead>
                    <TableHead
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleSort("type")}
                    >
                      <div className="flex items-center">
                        Type
                        {getSortArrow("type")}
                      </div>
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Radius (m)</TableHead>
                    <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Tag</TableHead>
                    <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Location Id</TableHead>
                    <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Stop Type</TableHead>
                    <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Address</TableHead>
                    <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Created At</TableHead>
                    <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Updated At</TableHead>
                    <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Loading/Unloading Time</TableHead>
                    <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</TableHead>

                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentGeofences.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3">
                            <MapIcon className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                          </div>
                          <p>No geofences found</p>
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
                          className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedGeofence === geofence.id ? "bg-blue-50 dark:bg-blue-900/30" : ""
                            }`}
                          onClick={() => handleSelectGeofence(geofence.id)}
                        >
                          {/* Actions cell - hide if geofenceConfigAccess === 1 */}
                          {geofenceConfigAccess !== 1 && (
                            <TableCell className="px-6 py-4 whitespace-nowrap">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-8 w-8 p-0 dark:text-gray-300 dark:hover:bg-gray-700"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="dark:bg-gray-800 dark:border-gray-700">
                                  <DropdownMenuItem onClick={() => handleEditGeofence(geofence.id)} className="dark:text-gray-300 dark:hover:bg-gray-700">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteGeofence(geofence.id)}
                                    className="text-red-600 dark:text-red-400 dark:hover:bg-gray-700"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          )}
                          <TableCell className="px-6 py-4 whitespace-nowrap font-medium dark:text-white">{geofence.geofence_name}</TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap font-medium dark:text-white">{geofence.id}</TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            <Badge className={`${getTypeColor(geofence.geofence_type)} border dark:bg-opacity-30 dark:border-opacity-50`}>
                              {getGeofenceTypeString(geofence.geofence_type)}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                            {geofence.geofence_type === 0 ? geofence.radius : "-"}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap dark:text-gray-300">{geofence.tag || "-"}</TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap dark:text-gray-300">{geofence.location_id || "-"}</TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap dark:text-gray-300">{geofence.stop_type || "-"}</TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                            <div className="relative group w-fit">
                              <div className="truncate w-50 cursor-default">
                                {geofence.address || "No address"}
                              </div>

                              {geofence.address && (
                                <div className="absolute left-0 bottom-full mb-2 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-md shadow-xl border border-slate-700 z-10 min-w-0 w-max max-w-[400px] break-words whitespace-normal opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out transform group-hover:-translate-y-1 translate-y-1">
                                  <div className="font-medium text-slate-100 leading-snug break-words">
                                    {geofence.address}
                                  </div>

                                  {/* Tooltip arrow pointing down */}
                                  <div className="absolute -bottom-1 left-4 w-2 h-2 bg-slate-900 dark:bg-slate-800 border-r border-b border-slate-700 transform rotate-45"></div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                            {formatDate(geofence.created_at || "")}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                            {formatDate(geofence.updated_at || "")}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-center whitespace-nowrap dark:text-gray-300">
                            {geofence.time || "-"}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {geofence.status ? (
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500 mr-2" />
                              )}
                              <Badge
                                className={
                                  geofence.status
                                    ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                                    : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                                }
                              >
                                {geofence.status ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">{Math.min(endIndex, filteredGeofences.length)}</span> of{" "}
                <span className="font-medium">{filteredGeofences.length}</span> entries
              </div>
              <div className="flex items-center space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={`relative inline-flex items-center px-2 py-2 rounded-md border ${currentPage === 1
                    ? "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                    : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="bg-black dark:bg-gray-700 text-white px-3 py-1 rounded-md">
                  {currentPage}/{totalPages || 1}
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={`relative inline-flex items-center px-2 py-2 rounded-md border ${currentPage === totalPages
                    ? "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                    : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
              onUpdateGeofence={handleUpdateGeofence}
            />

            {/* Geofences Popup - Updated to use geofence_type */}
            <div className="absolute top-4 left-4 z-10">
              <Card className="w-80 m-4  shadow-lg dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between p-4 border-b bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <MapIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">Geofences</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowGeofencePopup(!showGeofencePopup)}
                      className="h-6 w-6 p-0 dark:hover:bg-gray-700 dark:text-gray-300"
                    >
                      {showGeofencePopup ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </div>

                  {showGeofencePopup && (
                    <div className="max-h-96 overflow-auto">
                      {filteredGeofences.slice(0, 10).map((geofence) => (
                        <div
                          key={geofence.id}
                          className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedGeofence === geofence.id ? "bg-blue-50 dark:bg-blue-900/30 border-l-4 border-l-blue-500" : ""
                            }`}
                          onClick={() => handleSelectGeofence(geofence.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{geofence.geofence_name}</h4>
                                <Badge
                                  className={`text-xs px-2 py-1 ${geofence.geofence_type === 0
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                    : geofence.geofence_type === 2
                                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                                      : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                    }`}
                                >
                                  {getGeofenceTypeString(geofence.geofence_type)}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                {geofence.geofence_type === 0 && <span>📍 Radius: {geofence.radius}m</span>}
                                {geofence.geofence_type === 2 && (
                                  <span>📐 Points: {geofence.polygonPoints?.length || 0}</span>
                                )}
                                {geofence.stop_type && <span>🏷️ {geofence.stop_type}</span>}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{geofence.tag || "No tag"}</div>
                              <div
                                className={`text-xs font-medium ${geofence.status ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                              >
                                {geofence.status ? "Active" : "Inactive"}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {filteredGeofences.length === 0 && (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          <MapIcon className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
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

        {/* Geofence Form Modal - Updated to pass onUpdate prop */}
        {showForm && (
          <GeofenceForm
            onClose={handleCloseForm}
            geofence={editingGeofence}
            isNew={isCreatingNew}
            onSave={handleSaveGeofence}
            onUpdate={handleUpdateGeofence}
          />
        )}
      </div>

      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Confirm Deletion</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Are you sure you want to delete this entity? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {Toaster}
    </>
  )
}