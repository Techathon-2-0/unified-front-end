import { RefreshCw, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { GeofenceHeaderProps } from "../../../types/geofence/gstats"

export function GeofenceHeader({
  totalCount,
  onRefresh,
  onExport,
  matrixType,
  onMatrixTypeChange,
}: GeofenceHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 relative z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-red-50 border border-red-200 px-3 py-1 rounded text-red-700 text-sm font-medium">
            Total Count: {totalCount}
          </div>
        </div>

        <div className="flex items-center space-x-4 relative z-10">
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onExport("csv")}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("pdf")}>Export as PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Select value={matrixType} onValueChange={onMatrixTypeChange}>
            <SelectTrigger className="w-48 relative z-50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="relative z-50">
              <SelectItem value="geofence">Geofence Matrix</SelectItem>
              <SelectItem value="distance">Distance Matrix</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
