import { useState, useMemo } from "react"
import { GeofenceHeader } from "../../components/geofence/gstats/geofence-header"
import { GeofenceSelector } from "../../components/geofence/gstats/geofence-selector"
import { GeofenceMatrix } from "../../components/geofence/gstats/geofence-matrix"
import { GeofenceMap } from "../../components/geofence/gstats/geofence-map"
import { mockVehicles } from "../../data/live/vehicle"
import { convertToGeofenceVehicles, filterVehiclesByGeofence } from "../../data/geofence/gstats"
import { initialGeofenceData } from "../../data/geofence/gconfig"
import { useToast } from "@/hooks/use-toast"

export default function GeofenceStats() {
  const [selectedGeofence, setSelectedGeofence] = useState<string>("GF001")
  const [matrixType, setMatrixType] = useState<"geofence" | "distance">("geofence")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [highlightedVehicle, setHighlightedVehicle] = useState<string | null>(null)
  const [filteredCount, setFilteredCount] = useState(0)
  const { showSuccessToast, showErrorToast, Toaster } = useToast({ position: "top-right",});


  // Convert vehicles to geofence vehicles with status
  const geofenceVehicles = useMemo(() => {
    return convertToGeofenceVehicles(mockVehicles, selectedGeofence)
  }, [selectedGeofence])

  // Filter vehicles based on matrix type
  const displayVehicles = useMemo(() => {
    if (matrixType === "geofence") {
      return filterVehiclesByGeofence(geofenceVehicles, selectedGeofence)
    }
    return geofenceVehicles
  }, [geofenceVehicles, matrixType, selectedGeofence])

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Actually refresh the page
    setTimeout(() => {
      window.location.reload()
    }, 500)
    showSuccessToast("Data refreshed", "Vehicle data has been refreshed successfully.")
  }

  const handleExport = (format: "csv" | "pdf") => {
  try {
    const data = displayVehicles.map((vehicle) => ({
      "Vehicle Number": vehicle.vehicleNumber,
      "Device Name": vehicle.deviceName,
      Type: vehicle.type,
      Status: vehicle.geofenceStatus,
      "Distance (Km)": vehicle.distanceFromGeofence.toFixed(2),
      "Entry Time": vehicle.entryTime || "-",
      "Exit Time": vehicle.exitTime || "-",
      Duration: vehicle.duration || "-",
      Speed: `${vehicle.speed} km/h`,
      Driver: vehicle.driverName,
      Address: vehicle.address,
    }))

    if (data.length === 0) {
      showErrorToast("No data available to export", "")
      return
    }

    const selectedGeofenceData = initialGeofenceData.find((g) => g.id === selectedGeofence)
    const matrixTitle = matrixType === "geofence" ? "Geofence Matrix" : "Distance Matrix"

    if (format === "csv") {
      const csv = [Object.keys(data[0]).join(","), ...data.map((row) => Object.values(row).join(","))].join("\n")

      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${matrixTitle.toLowerCase().replace(" ", "_")}_${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)

      showSuccessToast("CSV file downloaded successfully", "")
    } else {
      // Generate PDF using browser print
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>${matrixTitle} Report</title>
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
              <p>Geofence: ${selectedGeofenceData?.name || "All"}</p>
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
    //console.error("Export error:", error)
    showErrorToast("Failed to export data. Please try again.", "")
  }
}

  const handleVehicleClick = (vehicleId: string) => {
    setHighlightedVehicle(highlightedVehicle === vehicleId ? null : vehicleId)
  }

  const handleMatrixTypeChange = (type: "geofence" | "distance") => {
    setMatrixType(type)
    setHighlightedVehicle(null) // Clear highlighting when switching matrix types
  }

  // Callback to receive filtered count from matrix component
  const handleFilteredCountChange = (count: number) => {
    setFilteredCount(count)
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
      <div className="flex h-[calc(100vh-180px)]">
        {/* Left Panel */}
        <div className="w-1/2 p-6 overflow-auto">
          <GeofenceMatrix
            vehicles={displayVehicles}
            selectedGeofence={selectedGeofence}
            matrixType={matrixType}
            onVehicleClick={handleVehicleClick}
            highlightedVehicle={highlightedVehicle}
            onFilteredCountChange={handleFilteredCountChange}
          />
        </div>

        {/* Right Panel - Map */}
        <div className="w-1/2 p-6 relative z-10">
          <GeofenceMap
            vehicles={geofenceVehicles}
            selectedGeofence={selectedGeofence}
            matrixType={matrixType}
            highlightedVehicle={highlightedVehicle}
          />
        </div>
      </div>
      {Toaster}
    </div>
  )
}
