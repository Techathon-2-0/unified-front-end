import { RefreshCw, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
//import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { GeofenceHeaderProps } from "../../../types/geofence/gstats_type"

export function GeofenceHeader({
  totalCount,
  onRefresh,
  onExport,
  //matrixType,
  //onMatrixTypeChange,
}: GeofenceHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 relative z-10 rounded-t-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 px-3 py-1 rounded text-red-700 dark:text-red-200 text-sm font-medium">
            Total Count: {totalCount}
          </div>
        </div>

        <div className="flex items-center space-x-4 relative z-10">
          <Button
            variant="outline"
            onClick={onRefresh}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
              <DropdownMenuItem onClick={() => onExport("csv")} className="dark:hover:bg-gray-700">
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("pdf")} className="dark:hover:bg-gray-700">
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}