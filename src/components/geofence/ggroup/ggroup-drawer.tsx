import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X, Search, Loader2, Upload } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { AddEditFormProps } from "../../../types/geofence/ggroup_type"
import { getGeofenceTypeName } from "../../../data/geofence/ggroup"
import { useToast } from "@/hooks/use-toast"

export function AddEditForm({
  isOpen,
  onClose,
  formData,
  onInputChange,
  onGeofenceSelection,
  onSave,
  geofenceData,
  isEditing,
  isLoading = false,
}: AddEditFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeSection, setActiveSection] = useState<string>("basic")
  const [geofenceSearch, setGeofenceSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { showSuccessToast, Toaster } = useToast({ position: "top-right" })

  // Get unique values for filters
  // const uniqueTypes = Array.from(new Set(geofenceData.map((g) => g.geofence_type)))

  // Filtered geofences based on search and filters
  const filteredGeofences = geofenceData.filter((geofence) => {
    const matchesSearch =
      geofence.geofence_name.toLowerCase().includes(geofenceSearch.toLowerCase()) ||
      (geofence.location_id && geofence.location_id.toLowerCase().includes(geofenceSearch.toLowerCase())) ||
      geofence.id.toString().includes(geofenceSearch.toLowerCase())

    const matchesType = typeFilter === "all" || geofence.geofence_type.toString() === typeFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && geofence.status) ||
      (statusFilter === "inactive" && !geofence.status)

    return matchesSearch && matchesType && matchesStatus
  })

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setErrors({})
      setActiveSection("basic")
      setGeofenceSearch("")
      setTypeFilter("all")
      setStatusFilter("all")
    }
  }, [isOpen])

  const handleReset = () => {
    onInputChange({ target: { name: "geo_group", value: "" } } as React.ChangeEvent<HTMLInputElement>)

    formData.geofenceIds.forEach((id) => {
      onGeofenceSelection(id)
    })

    setErrors({})
    setActiveSection("basic")
    setGeofenceSearch("")
    setTypeFilter("all")
    setStatusFilter("all")

    showSuccessToast("Form Reset", "All form fields have been reset successfully")
  }

  const handleSave = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.geo_group.trim()) newErrors.geo_group = "Group name is required"
    if (formData.geofenceIds.length === 0) newErrors.geofences = "Please select at least one geofence"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave()
  }

  const isFormValid = () => {
    return formData.geo_group.trim() !== "" && formData.geofenceIds.length > 0
  }

  const handleSelectAll = () => {
    const allFilteredIds = filteredGeofences.map((geofence) => geofence.id)
    // Add all filtered geofence IDs that aren't already selected
    allFilteredIds.forEach((id) => {
      if (!formData.geofenceIds.includes(id)) {
        onGeofenceSelection(id)
      }
    })
  }

  const handleDeselectAll = () => {
    const filteredIds = filteredGeofences.map((geofence) => geofence.id)
    // Remove all filtered geofence IDs that are currently selected
    filteredIds.forEach((id) => {
      if (formData.geofenceIds.includes(id)) {
        onGeofenceSelection(id)
      }
    })
  }

  // Bulk select/deselect from CSV
  const handleBulkCsv = async (mode: "select" | "deselect") => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".csv"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = async (event) => {
          const csv = event.target?.result as string
          const lines = csv.split("\n").filter(line => line.trim())
          if (lines.length < 2) return
          const headers = lines[0].split(",").map(h => h.trim().toLowerCase())
          const nameIdx = headers.indexOf("geofence_name")
          const locIdx = headers.indexOf("location_id")
          if (nameIdx === -1 || locIdx === -1) return

          // Find geofence IDs matching CSV
          const idsToChange: number[] = []
          for (let i = 1; i < lines.length; i++) {
            const vals = lines[i].split(",").map(v => v.trim())
            const name = vals[nameIdx]
            const loc = vals[locIdx]
            const found = geofenceData.find(
              g => g.geofence_name === name && String(g.location_id) === loc
            )
            if (found) idsToChange.push(found.id)
          }
          if (mode === "select") {
            idsToChange.forEach(id => {
              if (!formData.geofenceIds.includes(id)) onGeofenceSelection(id)
            })
            showSuccessToast("Bulk Select", `${idsToChange.length} geofences selected from CSV`)
          } else {
            idsToChange.forEach(id => {
              if (formData.geofenceIds.includes(id)) onGeofenceSelection(id)
            })
            showSuccessToast("Bulk Deselect", `${idsToChange.length} geofences deselected from CSV`)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  // Download template
  const handleDownloadTemplate = () => {
    const template = "geofence_name,location_id\nSample Geofence,LOC123\n"
    const blob = new Blob([template], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "geofence_bulk_template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      y: 50,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.2,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <motion.div
            className="fixed inset-0 bg-black/50 bg-opacity-50"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          <div className="flex items-center justify-center min-h-screen p-4">
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden relative"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header remains largely unchanged because it already has a dark gradient */}
              <div className="bg-gradient-to-r from-black via-gray-900 to-gray-800 text-white px-8 py-6 flex justify-between items-center rounded-t-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]"></div>
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-600 rounded-full opacity-20 blur-3xl"></div>

                <div className="relative">
                  <h2 className="text-2xl font-bold tracking-tight">
                    {isEditing ? "Edit Geofence Group" : "Create New Geofence Group"}
                  </h2>
                  <p className="text-white text-sm mt-1 opacity-90">Configure group details and geofence assignments</p>
                </div>

                <button
                  onClick={onClose}
                  className="relative text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                  disabled={isLoading}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeSection === "basic"
                    ? "text-black dark:text-white border-b-2 border-black dark:border-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  onClick={() => setActiveSection("basic")}
                  disabled={isLoading}
                >
                  Basic Details
                  {errors.geo_group ? (
                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
                  ) : null}
                </button>
                <button
                  className={`px-6 py-3 text-sm font-medium transition-colors ${activeSection === "geofences"
                    ? "text-black dark:text-white border-b-2 border-black dark:border-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  onClick={() => setActiveSection("geofences")}
                  disabled={isLoading}
                >
                  Geofence Assignment
                  {errors.geofences ? (
                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
                  ) : null}
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)] pb-20 sm:pb-6">
                {activeSection === "basic" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-5"
                  >
                    <div>
                      <Label htmlFor="geo_group" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                        Group Name <span className="text-red-500 dark:text-red-400 ml-1">*</span>
                      </Label>
                      <Input
                        id="geo_group"
                        name="geo_group"
                        value={formData.geo_group}
                        onChange={(e) => {
                          onInputChange(e)
                          if (errors.geo_group) {
                            setErrors((prev) => {
                              const newErrors = { ...prev }
                              delete newErrors.geo_group
                              return newErrors
                            })
                          }
                        }}
                        placeholder="Enter group name"
                        className={errors.geo_group ? "border-red-500 ring-1 ring-red-500 dark:border-red-500 dark:ring-red-500" : "dark:bg-gray-700 dark:border-gray-600 dark:text-white"}
                        disabled={isLoading}
                      />
                      {errors.geo_group && (
                        <p className="mt-1.5 text-sm text-red-500 dark:text-red-400 flex items-center">
                          <X size={14} className="mr-1" /> {errors.geo_group}
                        </p>
                      )}
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assignment Summary</h3>
                      <div className="text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Selected Geofences:</span>
                        <span className="ml-2 font-medium text-black dark:text-white">{formData.geofenceIds.length}</span>
                      </div>
                      {errors.geofences && (
                        <p className="mt-1.5 text-sm text-red-500 dark:text-red-400 flex items-center">
                          <X size={14} className="mr-1" /> {errors.geofences}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeSection === "geofences" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Geofence Selection</h3>

                      {/* Search and Filters */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <Input
                            placeholder="Search geofences..."
                            value={geofenceSearch}
                            onChange={(e) => setGeofenceSearch(e.target.value)}
                            className="pl-9 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            disabled={isLoading}
                          />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter} disabled={isLoading}>
                          <SelectTrigger className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <SelectValue placeholder="Filter by Status" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                            <SelectItem value="all" className="dark:text-gray-200">All Status</SelectItem>
                            <SelectItem value="active" className="dark:text-gray-200">Active</SelectItem>
                            <SelectItem value="inactive" className="dark:text-gray-200">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter} disabled={isLoading}>
                          <SelectTrigger className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <SelectValue placeholder="Filter by Type" />
                          </SelectTrigger >
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                            <SelectItem value="all" className="dark:text-gray-200">All Types</SelectItem>
                            <SelectItem value="0" className="dark:text-gray-200">Circle</SelectItem>
                            <SelectItem value="1" className="dark:text-gray-200">Pointer</SelectItem>
                            <SelectItem value="2" className="dark:text-gray-200">Polygon</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Selection Summary */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2 sm:gap-0">
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          Showing {filteredGeofences.length} geofences ({formData.geofenceIds.length} selected)
                        </div>
                        <div className="flex flex-wrap sm:flex-nowrap space-x-0 sm:space-x-2 gap-2 h-6 items-center">
                          <button
                            onClick={() => !isLoading && handleSelectAll()}
                            disabled={isLoading || filteredGeofences.length === 0}
                            className="px-2 py-1 text-xs bg-black dark:bg-gray-700 text-white rounded hover:bg-gray-800 dark:hover:bg-gray-600"
                          >
                            Select All
                          </button>
                          <button
                            onClick={() => !isLoading && handleDeselectAll()}
                            disabled={isLoading || formData.geofenceIds.length === 0}
                            className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                          >
                            Deselect All
                          </button>
                          {/* Bulk Option Dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                className="rounded-md h-8 px-2 py-1 text-xs flex items-center dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                disabled={isLoading}
                              >
                                <Upload className="mr-2 h-4 w-4" />
                                Bulk
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="dark:bg-gray-800 dark:border-gray-700">
                              <DropdownMenuItem onClick={() => handleBulkCsv("select")} className="dark:text-gray-300 dark:hover:bg-gray-700">
                                Bulk Select (CSV)
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleBulkCsv("deselect")} className="dark:text-gray-300 dark:hover:bg-gray-700">
                                Bulk Deselect (CSV)
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={handleDownloadTemplate} className="dark:text-gray-300 dark:hover:bg-gray-700">
                                Download Template
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Geofence List */}
                      <ScrollArea className="h-96">
                        <div className="grid grid-cols-1 gap-2">
                          {filteredGeofences.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                              <p className="text-sm">No geofences found</p>
                              {geofenceSearch && <p className="text-xs mt-1">Try adjusting your search terms</p>}
                            </div>
                          ) : (
                            filteredGeofences.map((geofence) => (
                              <div
                                key={geofence.id}
                                className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer dark:bg-gray-800"
                                onClick={() => !isLoading && onGeofenceSelection(geofence.id)}
                              >
                                <Checkbox
                                  id={`geofence-${geofence.id}`}
                                  checked={formData.geofenceIds.includes(geofence.id)}
                                  onCheckedChange={() => !isLoading && onGeofenceSelection(geofence.id)}
                                  disabled={isLoading}
                                  className="dark:border-gray-500"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {geofence.geofence_name}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">ID: {geofence.id}</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">Location ID: {geofence.location_id}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {getGeofenceTypeName(geofence.geofence_type)}
                                      </p>
                                      <p className="text-xs text-gray-400 dark:text-gray-500">
                                        {geofence.geofence_type === 0 ? `${geofence.radius}m` : "Polygon"}
                                      </p>
                                      <p className={`text-xs ${geofence.status ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                        {geofence.status ? "Active" : "Inactive"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selection Summary</h3>
                      <div className="text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Selected Geofences:</span>
                        <span className="ml-2 font-medium text-black dark:text-white">{formData.geofenceIds.length}</span>
                      </div>
                      {errors.geofences && (
                        <p className="mt-1.5 text-sm text-red-500 dark:text-red-400 flex items-center">
                          <X size={14} className="mr-1" /> {errors.geofences}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex flex-row justify-between rounded-b-xl border-t border-gray-200 dark:border-gray-700 sticky bottom-0 space-y-0 space-x-2">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isLoading}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none transition-colors mb-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset
                </button>
                <div className="flex flex-row space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!isFormValid() || isLoading}
                    className="px-4 py-1.5 sm:px-5 sm:py-2 border border-transparent rounded-lg shadow-sm sm:text-sm font-medium text-white bg-black dark:bg-gray-900 hover:bg-gray-700 dark:hover:bg-gray-800 focus:outline-none transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isEditing ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        {isEditing ? "Update" : "Create"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
          {Toaster}
        </div>
      )}
    </AnimatePresence>
  )
}
