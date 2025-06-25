import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { PlusCircle, Search, RefreshCw, Download, Upload, Filter, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { EntityTable } from "./entity-table"
import { EntityDrawer } from "./entity-drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
//import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import type { Entity, Vendor } from "../../../types/manage/entity_type"
import {
  fetchEntities,
  createEntity,
  updateEntity,
  deleteEntity,
  searchEntities,
  fetchVendors,
} from "../../../data/manage/entity"
import { Checkbox } from "@/components/ui/checkbox"
import { formatDate } from "../../formatdate"
import { fetchRolesByUserId } from "@/data/usermanage/responsibility"
import { useAuth } from "@/context/AuthContext"

export function EntityManagementPage() {
  const [entities, setEntities] = useState<Entity[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  // Change filter states to arrays for multi-select
  const [typeFilter, setTypeFilter] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [vendorFilter, setVendorFilter] = useState<string[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isTableLoading, setIsTableLoading] = useState(true)
  const itemsPerPage = 5

  const { showSuccessToast, showErrorToast, Toaster } = useToast({ position: "top-right" })
  const { user } = useAuth()
  const [entitiesAccess, setEntitiesAccess] = useState<number | null>(null)

  // Load entities and vendors on component mount
  useEffect(() => {
    loadEntities()
    loadVendors()
  }, [])

  // Load entities from API
  const loadEntities = async () => {
    setIsTableLoading(true)
    try {
      const data = await fetchEntities()
      setEntities(data)
    } catch (error) {
      showErrorToast("Failed to load entities", "Please try again later.")
    } finally {
      setIsTableLoading(false)
    }
  }

  // Load vendors from API
  const loadVendors = async () => {
    try {
      const data = await fetchVendors()
      setVendors(data)
    } catch (error) {
      showErrorToast("Failed to load vendors", "Please try again later.")
    }
  }

  // Fetch entities access on user change
  useEffect(() => {
    const fetchAccess = async () => {
      if (user && user.id) {
        try {
          const roles = await fetchRolesByUserId(user.id)
          if (roles && roles.length > 0) {
            const tabsAccess = roles[0].tabs_access
            const entitiesTab = tabsAccess.find((tab: any) => tab.hasOwnProperty("entities"))
            setEntitiesAccess(entitiesTab ? entitiesTab.entities : null)
          }
        } catch {
          setEntitiesAccess(null)
        }
      }
    }
    fetchAccess()
  }, [user])

  // Handle search when search query changes
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch()
      } else {
        loadEntities()
      }
    }, 500)

    return () => clearTimeout(delaySearch)
  }, [searchQuery])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsTableLoading(true)
    try {
      const data = await searchEntities(searchQuery)
      setEntities(data)
    } catch (error) {
      showErrorToast("Search failed", "Please try again.")
    } finally {
      setIsTableLoading(false)
    }
  }

  // Filtering logic: OR within group, AND across groups
  const filteredEntities = entities.filter((entity) => {
    // Type filter
    const matchesType =
      typeFilter.length === 0 || typeFilter.includes(entity.type)
    // Status filter
    const statusString = entity.status ? "Active" : "Inactive"
    const matchesStatus =
      statusFilter.length === 0 || statusFilter.includes(statusString)
    // Vendor filter
    const entityVendorIds = entity.vendors.map((v) => v.id.toString())
    const matchesVendor =
      vendorFilter.length === 0 ||
      entityVendorIds.some((id) => vendorFilter.includes(id))
    // AND across groups
    return matchesType && matchesStatus && matchesVendor
  })

  const totalCount = filteredEntities.length
  const pageCount = Math.ceil(totalCount / itemsPerPage)
  const paginatedEntities = filteredEntities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleEdit = (entity: Entity) => {
    setSelectedEntity(entity)
    setIsDrawerOpen(true)
  }

  const handleCreate = () => {
    setSelectedEntity(null)
    setIsDrawerOpen(true)
  }

  const handleSave = async (entityData: Omit<Entity, "id" | "createdAt" | "updatedAt">) => {
    try {
      if (selectedEntity) {
        // Update existing entity
        const updatedEntity = await updateEntity(selectedEntity.id, entityData)
        setEntities(entities.map((e) => (e.id === updatedEntity.id ? updatedEntity : e)))
        showSuccessToast("Entity updated", `Entity ${updatedEntity.vehicleNumber} has been updated successfully.`)
      } else {
        // Create new entity
        const newEntity = await createEntity(entityData)
        setEntities([...entities, newEntity])
        showSuccessToast("Entity created", `Entity ${newEntity.vehicleNumber} has been created successfully.`)
      }
      setIsDrawerOpen(false)
    } catch (error) {
      showErrorToast(
        selectedEntity ? "Failed to update entity" : "Failed to create entity",
        "Please check your input and try again.",
      )
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteEntity(id)
      setEntities(entities.filter((e) => e.id !== id))
      showSuccessToast("Entity deleted", "The entity has been deleted successfully.")
    } catch (error) {
      showErrorToast("Failed to delete entity", "Please try again later.")
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setIsTableLoading(true)
    try {
      await loadEntities()
      showSuccessToast("Data refreshed", "Entity data has been refreshed successfully.")
    } catch (error) {
      showErrorToast("Failed to refresh data", "Please try again later.")
    } finally {
      setIsRefreshing(false)
      setIsTableLoading(false)
    }
  }

  const handleExport = (format: "csv" | "pdf") => {
    try {
      const data = filteredEntities.map((entity) => ({
        "Entity ID": entity.id,
        "Vehicle Number": entity.vehicleNumber,
        Vendors: entity.vendors.map((v) => v.name).join(", "),
        Type: entity.type,
        Status: entity.status ? "Active" : "Inactive",
        "Created On": formatDate(entity.createdAt),
        "Updated On": formatDate(entity.updatedAt),
      }))

      if (data.length === 0) {
        showSuccessToast("No data available to export", "")
        return
      }

      if (format === "csv") {
        // Helper function to properly escape CSV values
        const escapeCsvValue = (value: any): string => {
          const stringValue = String(value)
          // If value contains comma, newline, or quote, wrap in quotes and escape internal quotes
          if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`
          }
          return stringValue
        }

        // Create CSV with proper escaping
        const headers = Object.keys(data[0]).join(",")
        const rows = data.map((row) => 
          Object.values(row).map(escapeCsvValue).join(",")
        )
        const csv = [headers, ...rows].join("\n")

        const blob = new Blob([csv], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `entities_${new Date().toISOString().split("T")[0]}.csv`
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
              <title>Entities Report</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                h1 { color: #333; }
              </style>
            </head>
            <body>
              <h1>Entities Report</h1>
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

          // Simple CSV parser that handles quoted fields
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
          // const headers = parseCSVLine(lines[0])

          setIsTableLoading(true)
          try {
            const createdEntities: Entity[] = []
            const updatedEntities: Entity[] = []

            for (let i = 1; i < lines.length; i++) {
              const values = parseCSVLine(lines[i])
              if (values.length >= 3 && values[0]) {
                // Parse vendors from the CSV
                let entityVendors: Vendor[] = []
                if (values[3]) {
                  const vendorNames = values[3].split(",").map((v) => v.trim())
                  // Find vendor IDs from names
                  entityVendors = vendors.filter((v) => vendorNames.includes(v.name))
                }

                // Prepare entity data
                const entityData = {
                  vehicleNumber: values[0],
                  vendors: entityVendors,
                  type: values[1] as "Car" | "Truck" | "Excavator",
                  status: values[2].toLowerCase() === "active",
                }

                // Check if entity exists by vehicle number
                const existingEntity = entities.find(e => e.vehicleNumber === values[0])
                if (existingEntity) {
                  // Update existing entity
                  const updatedEntity = await updateEntity(existingEntity.id, entityData)
                  updatedEntities.push(updatedEntity)
                  setEntities(prev => prev.map(e => e.id === updatedEntity.id ? updatedEntity : e))
                } else {
                  // Create entity via API
                  const newEntity = await createEntity(entityData)
                  createdEntities.push(newEntity)
                  setEntities(prev => [...prev, newEntity])
                }
              }
            }

            if (createdEntities.length > 0 || updatedEntities.length > 0) {
              let msg = ""
              if (createdEntities.length > 0) {
                msg += `${createdEntities.length} entities created. `
              }
              if (updatedEntities.length > 0) {
                msg += `${updatedEntities.length} entities updated.`
              }
              showSuccessToast(
                "Bulk upload completed",
                msg.trim()
              )
            } else {
              showErrorToast("Upload failed", "No valid data found in the CSV file.")
            }
          } catch (error) {
            showErrorToast("Bulk upload failed", "Please check your CSV file and try again.")
          } finally {
            setIsTableLoading(false)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  // Bulk Edit Handler
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

          // Simple CSV parser that handles quoted fields
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

          setIsTableLoading(true)
          try {
            let updatedCount = 0

            for (let i = 1; i < lines.length; i++) {
              const values = parseCSVLine(lines[i])
              if (values.length >= 3) {
                // Try to find entity by ID or vehicle number
                let entity: Entity | undefined
                // Try by ID (if present and numeric)
                if (headers[0].toLowerCase().includes("id") && values[0] && !isNaN(Number(values[0]))) {
                  entity = entities.find(e => e.id === Number(values[0]))
                }
                // Try by vehicle number if not found by ID
                if (!entity && headers.some(h => h.toLowerCase().includes("vehicle")) && values[0]) {
                  entity = entities.find(e => e.vehicleNumber === values[0])
                }
                if (entity) {
                  // Parse vendors from the CSV
                  let entityVendors: Vendor[] | undefined = undefined
                  const vendorIdx = headers.findIndex(h => h.toLowerCase().includes("vendor"))
                  if (vendorIdx !== -1) {
                    if (values[vendorIdx] && values[vendorIdx].trim() !== "") {
                      const vendorNames = values[vendorIdx].split(",").map((v) => v.trim())
                      entityVendors = vendors.filter((v) => vendorNames.includes(v.name))
                    } else {
                      entityVendors = []
                    }
                  }

                  // Prepare updated data
                  const typeIdx = headers.findIndex(h => h.toLowerCase() === "type")
                  const statusIdx = headers.findIndex(h => h.toLowerCase() === "status")
                  const updateData = {
                    vehicleNumber: values[headers.findIndex(h => h.toLowerCase().includes("vehicle"))] || entity.vehicleNumber,
                    vendors: entityVendors !== undefined ? entityVendors : entity.vendors,
                    type: typeIdx !== -1 ? (values[typeIdx] as "Car" | "Truck" | "Excavator") : entity.type,
                    status: statusIdx !== -1 ? values[statusIdx].toLowerCase() === "active" : entity.status,
                  }

                  // Update entity via API
                  const updatedEntity = await updateEntity(entity.id, updateData)
                  setEntities(prev => prev.map(e => e.id === updatedEntity.id ? updatedEntity : e))
                  updatedCount++
                }
              }
            }

            if (updatedCount > 0) {
              showSuccessToast(
                "Bulk edit successful",
                `${updatedCount} entities have been updated successfully.`,
              )
            } else {
              showErrorToast("Bulk edit failed", "No matching entities found in the CSV file.")
            }
          } catch (error) {
            showErrorToast("Bulk edit failed", "Please check your CSV file and try again.")
          } finally {
            setIsTableLoading(false)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const downloadTemplate = () => {
    const template = [
      "Vehicle Number,Type,Status,Vendors",
      "SAMPLE123,Car,Active,Vendor A",
      'SAMPLE456,Truck,Inactive,"Vendor B,Vendor C,Vendor D"',
      "SAMPLE789,Excavator,Active,",
      'SAMPLE101,Car,Active,"Vendor E,Vendor F"',
    ].join("\n")

    const blob = new Blob([template], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "entity_template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  // Multi-select checkbox handler
  const handleCheckboxFilter = (
    value: string,
    filter: string[],
    setFilter: (v: string[]) => void
  ) => {
    if (filter.includes(value)) {
      setFilter(filter.filter((v) => v !== value))
    } else {
      setFilter([...filter, value])
    }
  }

  // Update clearFilter for array-based filters
  // const clearFilter = (filterType: string) => {
  //   switch (filterType) {
  //     case "type":
  //       setTypeFilter([])
  //       break
  //     case "status":
  //       setStatusFilter([])
  //       break
  //     case "vendor":
  //       setVendorFilter([])
  //       break
  //   }
  // }

  // Update activeFilters for array-based filters
  const activeFilters = [
    ...typeFilter.map((v) => ({ type: "type", value: v, label: `Type: ${v}` })),
    ...statusFilter.map((v) => ({ type: "status", value: v, label: `Status: ${v}` })),
    ...vendorFilter.map((v) => {
      const vendorObj = vendors.find((ven) => ven.id.toString() === v)
      return {
        type: "vendor",
        value: v,
        label: `Vendor: ${vendorObj ? vendorObj.name : v}`,
      }
    }),
  ]

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-gray-900">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
            {/* Search and Actions */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative w-full lg:w-auto"
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search entities..."
                  className="pl-9 w-full lg:w-[300px] border-slate-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </motion.div>

              <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                {/* Refresh Button */}
                <Button 
                  variant="outline" 
                  onClick={handleRefresh} 
                  disabled={isRefreshing} 
                  className="rounded-md  dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </Button>

                {/* Export */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="rounded-md  dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="dark:bg-gray-800 dark:border-gray-700">
                    <DropdownMenuItem onClick={() => handleExport("csv")} className="dark:text-gray-300 dark:hover:bg-gray-700">Export as CSV</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("pdf")} className="dark:text-gray-300 dark:hover:bg-gray-700">Export as PDF</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Bulk Upload - hide if entitiesAccess === 1 */}
                {entitiesAccess !== 1 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="rounded-md  dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
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
                )}

                {/* Create Button - hide if entitiesAccess === 1 */}
                {entitiesAccess !== 1 && (
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      onClick={handleCreate}
                      className="bg-black hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white border-0 rounded-md "
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create New Entity
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Total Count and Filter Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div className="text-sm font-medium px-3 sm:px-4 py-1 sm:py-2 rounded-full sm:text-sm inline-block mb-4">
                <Badge variant="outline" className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm border-red-200 dark:border-red-800">
                  Total Count: <span className="font-bold ml-1">{totalCount}</span>
                </Badge>
              </div>
              {/* Filters */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="rounded-md dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-50 h-70 right-8 dark:bg-gray-800 dark:border-gray-700">
                   <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                        onClick={() => {
                          setTypeFilter([])
                          setStatusFilter([])
                          setVendorFilter([])
                        }}
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  
                  <div className="p-2 space-y-3">
                    {/* Type Multi-select */}
                    <div>
                      <label className="text-sm font-medium dark:text-gray-200">Type</label>
                      <div className="border rounded-md p-2 bg-white dark:bg-gray-800 max-h-32 overflow-y-auto">
                        {["Car", "Truck", "Excavator"].map((type) => (
                          <div key={type} className="flex items-center space-x-2 py-1">
                            <Checkbox
                              checked={typeFilter.includes(type)}
                              onCheckedChange={() => handleCheckboxFilter(type, typeFilter, setTypeFilter)}
                              id={`type-${type}`}
                            />
                            <label htmlFor={`type-${type}`} className="text-sm dark:text-gray-100 cursor-pointer">{type}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Status Multi-select */}
                    <div>
                      <label className="text-sm font-medium dark:text-gray-200">Status</label>
                      <div className="border rounded-md p-2 bg-white dark:bg-gray-800 max-h-32 overflow-y-auto">
                        {["Active", "Inactive"].map((status) => (
                          <div key={status} className="flex items-center space-x-2 py-1">
                            <Checkbox
                              checked={statusFilter.includes(status)}
                              onCheckedChange={() => handleCheckboxFilter(status, statusFilter, setStatusFilter)}
                              id={`status-${status}`}
                            />
                            <label htmlFor={`status-${status}`} className="text-sm dark:text-gray-100 cursor-pointer">{status}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Vendor Multi-select */}
                    <div>
                      <label className="text-sm font-medium dark:text-gray-200">Vendor</label>
                      <div className="border rounded-md p-2 bg-white dark:bg-gray-800 max-h-32 overflow-y-auto">
                        {vendors.map((vendor) => (
                          <div key={vendor.id} className="flex items-center space-x-2 py-1">
                            <Checkbox
                              checked={vendorFilter.includes(vendor.id.toString())}
                              onCheckedChange={() => handleCheckboxFilter(vendor.id.toString(), vendorFilter, setVendorFilter)}
                              id={`vendor-${vendor.id}`}
                            />
                            <label htmlFor={`vendor-${vendor.id}`} className="text-sm dark:text-gray-100 cursor-pointer">{vendor.name}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Clear All Filters Button */}
                   
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
                  {activeFilters.map((filter) => (
                    <Badge
                      key={filter.type + filter.value}
                      variant="secondary"
                      className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 cursor-pointer text-base px-3 py-1"
                      onClick={() => {
                        // Remove only this value from the filter
                        switch (filter.type) {
                          case "type":
                            setTypeFilter(typeFilter.filter((v) => v !== filter.value))
                            break
                          case "status":
                            setStatusFilter(statusFilter.filter((v) => v !== filter.value))
                            break
                          case "vendor":
                            setVendorFilter(vendorFilter.filter((v) => v !== filter.value))
                            break
                        }
                      }}
                    >
                      {filter.label}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <EntityTable
                entities={paginatedEntities}
                onEdit={handleEdit}
                onDelete={handleDelete}
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

      <EntityDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        entity={selectedEntity}
        onSave={handleSave}
        availableVendors={vendors}
      />
      {Toaster}
    </div>
  )
}
