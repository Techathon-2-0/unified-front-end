import { motion } from "framer-motion"
import { FileText, Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { ViewControlsProps } from "../../../types/dashboard/trip_type"

export function ViewControls({
  viewMode,
  setViewMode,
  mapMode,
  setMapMode,
  searchQuery,
  setSearchQuery,
  onExport,
}: ViewControlsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 md:p-5 mx-1 sm:mx-3">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left side - Map mode toggle (only visible in map view) */}
        <div className="flex items-center gap-4">
          {viewMode === "map" && (
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full px-1 py-1 flex items-center w-36 h-10">
              <div className="relative w-full h-full flex items-center justify-between px-2 text-sm cursor-pointer"
                onClick={() => setMapMode(mapMode === "current" ? "actual" : "current")}
              >
                <span
                  className={`z-10 font-medium flex items-center gap-1 ${mapMode === "current" ? "text-white" : "text-gray-700 dark:text-gray-300"}`}
                >
                  {/* <Navigation className="h-3 w-3" /> */}
                  Current
                </span>
                <span
                  className={`z-10 font-medium flex items-center gap-1 ${mapMode === "actual" ? "text-white" : "text-gray-700 dark:text-gray-300"}`}
                >
                  {/* <MapPin className="h-3 w-3" /> */}
                  Path
                </span>
                <motion.div
                  className="absolute top-0 left-0 w-1/2 h-full bg-black dark:bg-gray-900 rounded-full"
                  initial={false}
                  animate={{ x: mapMode === "current" ? 0 : "100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right side - Controls */}
        <div className="flex flex-wrap gap-2 sm:gap-4 items-center justify-start md:justify-end">
          {/* View Toggle */}
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full px-1 py-1 flex items-center w-27 h-10">
            <div
              className="relative w-full h-full flex items-center justify-between px-2 cursor-pointer text-sm"
              onClick={() => setViewMode(viewMode === "list" ? "map" : "list")}
            >
              <span
                className={`z-10 font-medium flex items-center gap-1 ${viewMode === "list" ? "text-white" : "text-gray-700 dark:text-gray-300"}`}
              >
                List
              </span>
              <span
                className={`z-10 font-medium flex items-center gap-1 ${viewMode === "map" ? "text-white" : "text-gray-700 dark:text-gray-300"}`}
              >
                Map
              </span>
              <motion.div
                className="absolute top-0 left-0 w-1/2 h-full bg-black dark:bg-gray-900 rounded-full"
                initial={false}
                animate={{ x: viewMode === "list" ? 0 : "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            </div>
          </div>

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="p-2 bg-black dark:bg-gray-800 text-white rounded-md shadow w-full h-8 sm:w-auto border-0"
              >
                <FileText className="h-4 w-4 mr-2" />
                Export
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExport("csv")}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("pdf")}>Export as PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search */}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search vehicles"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-60"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
