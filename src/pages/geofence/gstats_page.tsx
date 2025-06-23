import { useState, useMemo, useEffect } from "react"
import { GeofenceHeader } from "../../components/geofence/gstats/gstats-header"
import { GeofenceSelector } from "../../components/geofence/gstats/gstats-selector"
import { GeofenceMatrix } from "../../components/geofence/gstats/gstats-matrix"
import { GeofenceMap } from "../../components/geofence/gstats/gstats-map"
import { AlertDialog } from "../../components/geofence/gstats/alert-dialog"
import { fetchVehicles } from "../../data/live/list"
import { convertToGeofenceVehicles } from "../../data/geofence/gstats"
import { fetchGeofencesbyuserid } from "../../data/geofence/gconfig"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/AuthContext"
import type { Geofence, SortField, SortDirection } from "../../types/geofence/gstats_type"


export default function GeofenceStats() {
  const [selectedGeofence, setSelectedGeofence] = useState<string | null>(null)
  const [matrixType, setMatrixType] = useState<"geofence" | "distance">("geofence")
  // const [isRefreshing, setIsRefreshing] = useState(false)
  const [highlightedVehicle, setHighlightedVehicle] = useState<string | null>(null)
  const [filteredCount, setFilteredCount] = useState(0)
  const [geofences, setGeofences] = useState<Geofence[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isMapFullScreen, setIsMapFullScreen] = useState(() => {
    return typeof window !== "undefined" && localStorage.getItem("gstats-map-fullscreen") === "1"
  })
  const [alertDialogOpen, setAlertDialogOpen] = useState(false)
  const [alertVehicleId, setAlertVehicleId] = useState<string>("")
  const { showSuccessToast, showErrorToast, Toaster } = useToast({ position: "top-right" })
  const { user } = useAuth()

  // Listen for full screen toggle event
  useEffect(() => {
    const handleToggleFullScreen = () => {
      setIsMapFullScreen((prev) => !prev)
    }

    window.addEventListener("toggle-map-fullscreen", handleToggleFullScreen)

    return () => {
      window.removeEventListener("toggle-map-fullscreen", handleToggleFullScreen)
    }
  }, [])

  useEffect(() => {
    if (user?.id) {
      fetchGeofencesbyuserid(String(user.id))
        .then(setGeofences)
        .catch((error) => {
          console.error("Error fetching geofences:", error)
          setGeofences([])
        })
    }
  }, [user?.id])

  useEffect(() => {
    // Fetch vehicles on mount
    if (user?.id) {
      setLoading(true)
      fetchVehicles(String(user.id))
        .then((data) => {
          setVehicles(data)
          setLoading(false)
        })
        .catch((error) => {
          console.error("Error fetching vehicles:", error)
          setVehicles([])
          setLoading(false)
        })
    }
  }, [user?.id])

  // Get selected geofence data
  const selectedGeofenceData = useMemo(() => {
    return geofences.find((g) => g.id.toString() === selectedGeofence) || null
  }, [geofences, selectedGeofence])

  // Convert vehicles to geofence vehicles with status
  const geofenceVehicles = useMemo(() => {
    return convertToGeofenceVehicles(vehicles, selectedGeofenceData)
  }, [vehicles, selectedGeofenceData])

  // Filter states (lifted from GeofenceMatrix)
  const [typeFilter, setTypeFilter] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [tripStatusFilter, setTripStatusFilter] = useState<string[]>([])
  const [groupFilter, setGroupFilter] = useState<string[]>([])
  const [locationFilter, setLocationFilter] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("vehicleNumber")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  // Filtering logic (copied from GeofenceMatrix)
  const filteredAndSortedVehicles = useMemo(() => {
    let filtered = convertToGeofenceVehicles(vehicles, selectedGeofenceData)

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (vehicle) =>
          vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (vehicle.shipmentId && vehicle.shipmentId.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Apply type filter (OR logic)
    if (typeFilter.length > 0) {
      filtered = filtered.filter((vehicle) => typeFilter.includes(vehicle.type))
    }

    // Apply status filter (OR logic)
    if (statusFilter.length > 0) {
      filtered = filtered.filter((vehicle) => statusFilter.includes(vehicle.status))
    }

    // Apply trip status filter (OR logic)
    if (tripStatusFilter.length > 0) {
      filtered = filtered.filter((vehicle) => tripStatusFilter.includes(vehicle.trip_status))
    }

    // Apply group filter (OR logic)
    if (groupFilter.length > 0) {
      filtered = filtered.filter((vehicle) => vehicle.group && groupFilter.some((g) => vehicle.group.includes(g)))
    }

    // Apply location filter (OR logic)
    if (matrixType === "geofence" && locationFilter.length > 0) {
      filtered = filtered.filter((vehicle) => locationFilter.includes(vehicle.geofenceStatus))
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      // Always show vehicles with lat/lng at the top
      const aHasLatLng =
        a.lat !== undefined &&
        a.lat !== null &&
        a.lat.toString() !== "" &&
        a.lng !== undefined &&
        a.lng !== null &&
        a.lng.toString() !== ""
      const bHasLatLng =
        b.lat !== undefined &&
        b.lng !== null &&
        b.lat.toString() !== "" &&
        b.lng !== undefined &&
        b.lng !== null &&
        b.lng.toString() !== ""

      if (aHasLatLng && !bHasLatLng) return -1
      if (!aHasLatLng && bHasLatLng) return 1

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
    selectedGeofenceData,
    searchTerm,
    typeFilter,
    statusFilter,
    tripStatusFilter,
    groupFilter,
    locationFilter,
    matrixType,
    sortField,
    sortDirection,
  ])

  const handleRefresh = () => {
    // Only refresh vehicle data, not the whole page
    if (user?.id) {
      setLoading(true)
      fetchVehicles(String(user.id))
        .then((data) => {
          setVehicles(data)
          setLoading(false)
          showSuccessToast("Vehicles refreshed successfully", "The vehicle data has been updated.")
        })
        .catch((error) => {
          console.error("Error refreshing vehicles:", error)
          setVehicles([])
          setLoading(false)
          showErrorToast("Failed to refresh vehicles", "An error occurred while refreshing vehicle data.")
        })
    }
  }

  const handleExport = (format: "csv" | "pdf") => {
    try {
      // Only export data for the selected geofence
      const geofenceVehiclesArray = Array.isArray(geofenceVehicles) ? geofenceVehicles : []
      const dataToExport = selectedGeofence
        ? geofenceVehiclesArray.filter((v) => v.assignedGeofenceId === selectedGeofence)
        : geofenceVehiclesArray

      interface ExportVehicle {
        "Vehicle Number": string
        "Shipment ID": string
        Status: string
        "Distance (Km)": string
        "Vehicle Status": string
        "Trip Status": string
        Driver: string
        "Driver Mobile": string
        Type: string
        Speed: string
        "GPS Time": string
      }

      const data: ExportVehicle[] = (dataToExport as Array<{
        vehicleNumber: string
        shipmentId?: string
        geofenceStatus: string
        distanceFromGeofence: number
        status: string
        trip_status?: string
        driverName?: string
        driverMobile?: string
        type: string
        speed: number
        gpsTime?: string
      }>).map((vehicle) => ({
        "Vehicle Number": vehicle.vehicleNumber,
        "Shipment ID": vehicle.shipmentId || "-",
        Status: vehicle.geofenceStatus === "inside" ? "Inside" : "Outside",
        "Distance (Km)": vehicle.distanceFromGeofence.toFixed(2),
        "Vehicle Status": vehicle.status,
        "Trip Status": vehicle.trip_status || "-",
        Driver: vehicle.driverName || "-",
        "Driver Mobile": vehicle.driverMobile || "-",
        Type: vehicle.type,
        Speed: `${vehicle.speed} km/h`,
        "GPS Time": vehicle.gpsTime || "-",
      }))

      if (data.length === 0) {
        showErrorToast("No data to export", "There are no vehicles in the selected geofence.")
        return
      }

      const matrixTitle = matrixType === "geofence" ? "Geofence Matrix" : "Distance Matrix"
      const geofenceName = selectedGeofenceData?.geofence_name || "All Geofences"

      if (format === "csv") {
        const csv = [Object.keys(data[0]).join(","), ...data.map((row) => Object.values(row).join(","))].join("\n")

        const blob = new Blob([csv], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${matrixTitle.toLowerCase().replace(" ", "_")}_${geofenceName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)

        showSuccessToast("CSV file downloaded successfully", `Exported data for ${geofenceName}`)
      } else {
        // Generate PDF using browser print
        const printWindow = window.open("", "_blank")
        if (printWindow) {
          const htmlContent = `
            <!DOCTYPE html>
            <html>
              <head>
                <title>${matrixTitle} Report - ${geofenceName}</title>
                <style>
                  body { font-family: Arial, sans-serif; margin: 20px; }
                  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
                  th { background-color: #f2f2f2; }
                  h1 { color: #333; }
                </style>
              </head>
              <body>
                <h1>${matrixTitle} Report</h1>
                <p>Generated on: ${new Date().toLocaleString()}</p>
                <p>Geofence: ${geofenceName}</p>
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

          showSuccessToast("PDF report generated successfully", `Exported data for ${geofenceName}`)
        } else {
          showErrorToast("Failed to open print window", "Please check your browser settings to allow pop-ups.")
        }
      }
    } catch (error) {
      console.error("Export error:", error)
      showErrorToast("Export failed", "An error occurred while exporting the data.")
    }
  }

  const handleVehicleClick = (vehicleId: string) => {
    setHighlightedVehicle(highlightedVehicle === vehicleId ? null : vehicleId)
  }

  const handleMatrixTypeChange = (type: "geofence" | "distance") => {
    setMatrixType(type)
    setHighlightedVehicle(null) // Clear highlighting when switching matrix types
  }

  const handleAlertClick = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId)
    if (vehicle) {
      setAlertVehicleId(vehicle.vehicleNumber)
      setAlertDialogOpen(true)
    }
  }

  // Callback to receive filtered count from matrix component
  const handleFilteredCountChange = (count: number) => {
    setFilteredCount(count)
  }

  // Pass filter state and handlers to GeofenceMatrix
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <GeofenceHeader
        totalCount={filteredCount}
        onRefresh={handleRefresh}
        onExport={handleExport}
        matrixType={matrixType}
        onMatrixTypeChange={handleMatrixTypeChange}
      />

      {/* Geofence Selection */}
      <GeofenceSelector selectedGeofence={selectedGeofence} onGeofenceChange={setSelectedGeofence} />

      {/* Main Content */}
      {isMapFullScreen ? (
        <GeofenceMap
          vehicles={filteredAndSortedVehicles}
          selectedGeofence={selectedGeofence}
          matrixType={matrixType}
          highlightedVehicle={highlightedVehicle}
          isFullScreen={true}
          onVehicleClick={handleVehicleClick}
          onClose={() => {
            setIsMapFullScreen(false)
            localStorage.removeItem("gstats-map-fullscreen")
          }}
        />
      ) : (
        <div className="flex h-[calc(100vh-180px)]">
          {/* Left Panel */}
          <div className="w-1/2 p-6 overflow-auto">
            <GeofenceMatrix
              vehicles={filteredAndSortedVehicles}
              selectedGeofence={selectedGeofence}
              matrixType={matrixType}
              onVehicleClick={handleVehicleClick}
              highlightedVehicle={highlightedVehicle}
              onFilteredCountChange={handleFilteredCountChange}
              onAlertClick={handleAlertClick}
              onMatrixTypeChange={handleMatrixTypeChange}
              // Pass filter state and handlers
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              tripStatusFilter={tripStatusFilter}
              setTripStatusFilter={setTripStatusFilter}
              groupFilter={groupFilter}
              setGroupFilter={setGroupFilter}
              locationFilter={locationFilter}
              setLocationFilter={setLocationFilter}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortField={sortField}
              setSortField={setSortField}
              sortDirection={sortDirection}
              setSortDirection={setSortDirection}
              allVehicles={convertToGeofenceVehicles(vehicles, selectedGeofenceData)}
              loading={loading}
            />
          </div>

          {/* Right Panel - Map */}
          <div className="w-1/2 p-6 relative z-10">
            <GeofenceMap
              vehicles={filteredAndSortedVehicles}
              selectedGeofence={selectedGeofence}
              matrixType={matrixType}
              highlightedVehicle={highlightedVehicle}
            />
          </div>
        </div>
      )}

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alertDialogOpen}
        onClose={() => setAlertDialogOpen(false)}
        vehicleNumber={alertVehicleId}
        geofenceId={selectedGeofence || ""}
      />
      {Toaster}
    </div>
  )
}