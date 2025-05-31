import { motion, AnimatePresence } from "framer-motion"
import { Filter, ChevronDown, FileText, Settings, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { TripFiltersProps, Trip } from "../../../types/dashboard/trip"
import { useToast } from "@/hooks/use-toast"
 
interface ExtendedTripFiltersProps extends TripFiltersProps {
  filteredTrips?: Trip[]
}
 
export function TripFilters({
  showFilters,
  setShowFilters,
  statusFilter,
  setStatusFilter,
  regionFilter,
  setRegionFilter,
  vehicleStatusFilter,
  setVehicleStatusFilter,
  locationFilter,
  setLocationFilter,
  entityFilter,
  setEntityFilter,
  routeFilter,
  setRouteFilter,
  userFilter,
  setUserFilter,
  searchQuery,
  setSearchQuery,
  filteredTrips,
}: ExtendedTripFiltersProps) {
  const { showSuccessToast, showErrorToast, Toaster } = useToast({ position: "top-right",});
  const handleExport = (format: "csv" | "pdf") => {
  console.log("Export called with format:", format)
  console.log("filteredTrips:", filteredTrips)
  console.log("filteredTrips length:", filteredTrips?.length)

  try {
    if (!filteredTrips || filteredTrips.length === 0) {
      showErrorToast("No trips data available to export","")
      return
    }

    const data = filteredTrips.map((trip) => ({
      "Trip ID": trip.id,
      "Status": trip.status,
      "Route ID": trip.routeId,
      "Route Name": trip.routeName,
      "Route Type": trip.routeType,
      "Vehicle Name": trip.vehicleName,
      "Vehicle Status": trip.vehicleStatus,
      "Driver Name": trip.driverName,
      "Driver Mobile": trip.driverMobile,
      "Start Time": new Date(trip.startTime).toLocaleString(),
      "End Time": new Date(trip.endTime).toLocaleString(),
      "Location": trip.location,
      "Shipment ID": trip.shipmentId,
      "Total Drive Time": trip.totalDriveTime,
      "Total Detention Time": trip.totalDetentionTime,
      "Total Stoppage Time": trip.totalStoppageTime,
      "Domain Name": trip.domainName,
      "Equipment ID": trip.equipmentId,
    }))

    if (format === "csv") {
      const csv = [Object.keys(data[0]).join(","), ...data.map((row) => Object.values(row).join(","))].join("\n")

      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `trips_${new Date().toISOString().split("T")[0]}.csv`
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
              <title>Trips Report</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                h1 { color: #333; }
              </style>
            </head>
            <body>
              <h1>Trips Report</h1>
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
    //console.error("Export error:", error)
    showErrorToast("Failed to export trips data. Please try again.", "")
  }
}
 
  return (
    <div className="px-4 sm:px-6 py-3 bg-white border-t border-b border-gray-200">
      <div className="flex flex-wrap justify-between items-start gap-2">
  {/* Left section: Filter toggle + filters */}
  <div className="flex flex-wrap items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-1 bg-white px-3 py-2 rounded-md shadow-sm border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Filter className="h-4 w-4 text-black" />
          <span>Filters</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${showFilters ? "transform rotate-180" : ""}`}
          />
        </motion.button>
 
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full flex flex-wrap gap-2 mt-2"
            >
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 text-sm border-gray-200 bg-white w-[120px]">
                  <span className="text-xs font-medium text-gray-600 mr-1">Status:</span>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="manually closed">Manually Closed</SelectItem>
                </SelectContent>
              </Select>
 
              {/* <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="h-9 text-sm border-gray-200 bg-white w-[120px]">
                  <span className="text-xs font-medium text-gray-600 mr-1">Region:</span>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="north">North</SelectItem>
                  <SelectItem value="south">South</SelectItem>
                  <SelectItem value="east">East</SelectItem>
                  <SelectItem value="west">West</SelectItem>
                </SelectContent>
              </Select> */}
 
              <Select value={vehicleStatusFilter} onValueChange={setVehicleStatusFilter}>
                <SelectTrigger className="h-9 text-sm border-gray-200 bg-white w-[150px]">
                  <span className="text-xs font-medium text-gray-600 mr-1">Vehicle Status:</span>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vehicles</SelectItem>
                  <SelectItem value="moving">Moving</SelectItem>
                  <SelectItem value="stopped">Stopped</SelectItem>
                  <SelectItem value="parked">Parked</SelectItem>
                </SelectContent>
              </Select>
 
              {/* <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="h-9 text-sm border-gray-200 bg-white w-[130px]">
                  <span className="text-xs font-medium text-gray-600 mr-1">Location:</span>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="delhi">Delhi</SelectItem>
                  <SelectItem value="mumbai">Mumbai</SelectItem>
                  <SelectItem value="bangalore">Bangalore</SelectItem>
                </SelectContent>
              </Select> */}
 
              {/* <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="h-9 text-sm border-gray-200 bg-white w-[120px]">
                  <span className="text-xs font-medium text-gray-600 mr-1">Entity:</span>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  <SelectItem value="entity1">Entity 1</SelectItem>
                  <SelectItem value="entity2">Entity 2</SelectItem>
                </SelectContent>
              </Select> */}
 
              {/* <Select value={routeFilter} onValueChange={setRouteFilter}>
                <SelectTrigger className="h-9 text-sm border-gray-200 bg-white w-[120px]">
                  <span className="text-xs font-medium text-gray-600 mr-1">Route:</span>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Routes</SelectItem>
                  <SelectItem value="route1">Route 1</SelectItem>
                  <SelectItem value="route2">Route 2</SelectItem>
                </SelectContent>
              </Select> */}
 
              {/* <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="h-9 text-sm border-gray-200 bg-white w-[120px]">
                  <span className="text-xs font-medium text-gray-600 mr-1">User:</span>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="user1">User 1</SelectItem>
                  <SelectItem value="user2">User 2</SelectItem>
                </SelectContent>
              </Select> */}
            </motion.div>
          )}
        </AnimatePresence>
 
        </div> {/* closes left section */}
  {/* Right section: Export, Config, Search */}
  <div className="flex flex-wrap items-center gap-2 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <FileText className="h-4 w-4 mr-1.5" />
                <span>Export</span>
                <ChevronDown className="h-4 w-4 ml-1.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("csv")}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>Export as PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
 
          {/* <Button variant="secondary" size="sm" className="h-9 bg-black text-white hover:bg-black/80">
            <Settings className="h-4 w-4 mr-1.5" />
            <span>Change Configuration</span>
          </Button> */}
 
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search trips..."
              className="pl-9 h-9 w-[200px] sm:w-[250px] border-gray-200 rounded-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      {Toaster}
    </div>
  )
}