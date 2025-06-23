import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FileText, Search, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ReportTable } from "./report-table"
import { ReportDrawer } from "./report-drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import type { DashboardReportData, AllPositionsReportData, ReportFilters } from "../../../types/reports/report_type"
import {
  generateDashboardReport,
  generateAllPositionsReport,
  exportReportAsCSV,
  searchReportData,
  generateAlarmReport,
  generateTripGpsStatusReport,
  generateTripSummaryReport,
} from "../../../data/reports/report"
import type {
  AlarmReportData,
  TripGpsStatusReportData,
  TripSummaryReportData,
} from "../../../types/reports/report_type"

export function ReportManagementPage() {
  const [originalReportData, setOriginalReportData] = useState<
    | DashboardReportData[]
    | AllPositionsReportData[]
    | AlarmReportData[]
    | TripGpsStatusReportData[]
    | TripSummaryReportData[]
  >([]) // Store original data
  const [filteredReportData, setFilteredReportData] = useState<
    | DashboardReportData[]
    | AllPositionsReportData[]
    | AlarmReportData[]
    | TripGpsStatusReportData[]
    | TripSummaryReportData[]
  >([]) // Store filtered data
  const [searchQuery, setSearchQuery] = useState("")
  const [isDrawerOpen, setIsDrawerOpen] = useState(true) // Auto-open drawer on page load
  const [currentPage, setCurrentPage] = useState(1)
  const [isTableLoading, setIsTableLoading] = useState(false)
  const [currentFilters, setCurrentFilters] = useState<ReportFilters | null>(null)

  const itemsPerPage = 5
  const { showSuccessToast, showErrorToast, Toaster } = useToast({ position: "top-right" })

  // Handle search when search query changes
  useEffect(() => {
    if (originalReportData.length > 0) {
      const delaySearch = setTimeout(() => {
        handleSearch()
      }, 300) // Reduced delay for better UX

      return () => clearTimeout(delaySearch)
    }
  }, [searchQuery, originalReportData])

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      // If search is empty, restore original data
      setFilteredReportData(originalReportData)
      setCurrentPage(1)
      return
    }

    // Filter the original data based on search query
    const filtered = searchReportData(originalReportData, searchQuery)
    setFilteredReportData(filtered)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleGenerateReport = async (filters: ReportFilters) => {
    setIsTableLoading(true)

    try {
      let reportData:
        | DashboardReportData[]
        | AllPositionsReportData[]
        | AlarmReportData[]
        | TripGpsStatusReportData[]
        | TripSummaryReportData[] = []

      switch (filters.reportType) {
        case "dashboard":
          reportData = await generateDashboardReport(filters)
          break
        case "all_positions":
          reportData = await generateAllPositionsReport(filters)
          break
        case "alarm":
          reportData = await generateAlarmReport(filters)
          break
        case "trip_gps_status":
          reportData = await generateTripGpsStatusReport(filters)
          break
        case "trip_summary":
          reportData = await generateTripSummaryReport(filters)
          break
        default:
          throw new Error(`Report type ${filters.reportType} not implemented yet`)
      }

      // Store both original and filtered data
      setOriginalReportData(reportData)
      setFilteredReportData(reportData)
      setCurrentFilters(filters)
      setIsDrawerOpen(false)
      setCurrentPage(1)
      setSearchQuery("") // Clear search when generating new report

      showSuccessToast(
        "Report Generated",
        `${filters.reportType.charAt(0).toUpperCase() + filters.reportType.slice(1)} report generated successfully with ${reportData.length} records.`,
      )
    } catch (error) {
      showErrorToast("Failed to generate report", "Please check your filters and try again.")
    } finally {
      setIsTableLoading(false)
    }
  }

  const handleExportReport = async (filters: ReportFilters) => {
    try {
      let reportData:
        | DashboardReportData[]
        | AllPositionsReportData[]
        | AlarmReportData[]
        | TripGpsStatusReportData[]
        | TripSummaryReportData[] = []

      switch (filters.reportType) {
        case "dashboard":
          reportData = await generateDashboardReport(filters)
          break
        case "all_positions":
          reportData = await generateAllPositionsReport(filters)
          break
        case "alarm":
          reportData = await generateAlarmReport(filters)
          break
        case "trip_gps_status":
          reportData = await generateTripGpsStatusReport(filters)
          break
        case "trip_summary":
          reportData = await generateTripSummaryReport(filters)
          break
        default:
          throw new Error(`Report type ${filters.reportType} not implemented yet`)
      }

      if (reportData.length === 0) {
        showErrorToast("No data to export", "Please generate a report with data first.")
        return
      }

      exportReportAsCSV(reportData, filters.reportType)
      showSuccessToast(
        "Export Successful",
        `${filters.reportType.charAt(0).toUpperCase() + filters.reportType.slice(1)} report exported successfully.`,
      )
    } catch (error) {
      showErrorToast("Export failed", "Please try again.")
    }
  }

  const totalCount = filteredReportData.length
  const pageCount = Math.ceil(totalCount / itemsPerPage)
  const paginatedData = filteredReportData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true)
  }

  const handleExportCurrent = () => {
    if (filteredReportData.length > 0 && currentFilters) {
      // Export the currently filtered/searched data
      exportReportAsCSV(filteredReportData, currentFilters.reportType)
      const searchText = searchQuery ? ` (filtered by "${searchQuery}")` : ""
      showSuccessToast("Export Successful", `Current report data${searchText} exported successfully.`)
    } else {
      showErrorToast("No data to export", "Please generate a report first.")
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-gray-900">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative w-full sm:w-auto"
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search reports..."
                  className="pl-9 w-full sm:w-[300px] border-slate-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </motion.div>
              <div className="flex gap-2 w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1 sm:flex-none">
                  <Button
                    onClick={handleExportCurrent}
                    variant="outline"
                    className="border-slate-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md w-full sm:w-auto"
                    disabled={filteredReportData.length === 0}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export {searchQuery && `(${filteredReportData.length})`}
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1 sm:flex-none">
                  <Button
                    onClick={handleOpenDrawer}
                    className="bg-black hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white border-0 rounded-md w-full sm:w-auto"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                </motion.div>
              </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="text-sm font-medium px-3 sm:px-4 py-1 sm:py-2 rounded-full sm:text-sm inline-block mb-4">
                <Badge
                  variant="outline"
                  className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm border-red-200 dark:border-red-800"
                >
                  Total Count: <span className="font-bold ml-1">{totalCount}</span>
                  {searchQuery && <span className="ml-2 text-xs">(filtered from {originalReportData.length})</span>}
                </Badge>
              </div>

              <ReportTable
                reportData={paginatedData}
                reportType={currentFilters?.reportType || "dashboard"}
                currentPage={currentPage}
                pageCount={pageCount}
                onPageChange={handlePageChange}
                totalCount={totalCount}
                isTableLoading={isTableLoading}
              />
            </motion.div>
          </div>
        </main>
      </div>

      <ReportDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onGenerateReport={handleGenerateReport}
        onExportReport={handleExportReport}
        isLoading={isTableLoading}
      />
      {Toaster}
    </div>
  )
}
