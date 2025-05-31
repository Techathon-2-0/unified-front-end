import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AddEditFormProps } from "../../../types/geofence/ggroup"
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
}: AddEditFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeSection, setActiveSection] = useState<string>("basic")
  const [geofenceSearch, setGeofenceSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [locationFilter, setLocationFilter] = useState<string>("all")
  const { showSuccessToast, showErrorToast, Toaster } = useToast({ position: "top-right",});

  // Get unique values for filters
  const uniqueTypes = Array.from(new Set(geofenceData.map((g) => g.type)))
  const uniqueLocations = Array.from(new Set(geofenceData.map((g) => g.location)))

  // Filtered geofences based on search and filters
  const filteredGeofences = geofenceData.filter((geofence) => {
    const matchesSearch =
      geofence.name.toLowerCase().includes(geofenceSearch.toLowerCase()) ||
      geofence.location.toLowerCase().includes(geofenceSearch.toLowerCase()) ||
      geofence.id.toLowerCase().includes(geofenceSearch.toLowerCase())

    const matchesType = typeFilter === "all" || geofence.type === typeFilter
    const matchesLocation = locationFilter === "all" || geofence.location === locationFilter

    return matchesSearch && matchesType && matchesLocation
  })

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setErrors({})
      setActiveSection("basic")
      setGeofenceSearch("")
      setTypeFilter("all")
      setLocationFilter("all")
    }
  }, [isOpen])

  const handleReset = () => {
    // Reset form data
    onInputChange({ target: { name: 'name', value: '' } } as React.ChangeEvent<HTMLInputElement>)
    
    // Clear all selected geofences
    formData.geofenceIds.forEach(id => {
      onGeofenceSelection(id)
    })
    
    // Reset form state
    setErrors({})
    setActiveSection("basic")
    setGeofenceSearch("")
    setTypeFilter("all")
    setLocationFilter("all")
    
    // Show toast notification
    showSuccessToast("Form Reset", "All form fields have been reset successfully")
  }

  const handleSave = () => {
    // Validate form
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Group name is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave()
  }

  const isFormValid = () => {
    return formData.name.trim() !== ""
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
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
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
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex border-b border-gray-200">
                <button
                  className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                    activeSection === "basic"
                      ? "text-black border-b-2 border-black"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveSection("basic")}
                >
                  Basic Details
                  {errors.name ? (
                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
                  ) : null}
                </button>
                <button
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeSection === "geofences"
                      ? "text-black border-b-2 border-black"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveSection("geofences")}
                >
                  Geofence Assignment
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
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                        Group Name <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={(e) => {
                          onInputChange(e)
                          if (errors.name) {
                            setErrors((prev) => {
                              const newErrors = { ...prev }
                              delete newErrors.name
                              return newErrors
                            })
                          }
                        }}
                        placeholder="Enter group name"
                        className={errors.name ? "border-red-500 ring-1 ring-red-500" : ""}
                      />
                      {errors.name && (
                        <p className="mt-1.5 text-sm text-red-500 flex items-center">
                          <X size={14} className="mr-1" /> {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Assignment Summary</h3>
                      <div className="text-sm">
                        <span className="text-gray-500">Selected Geofences:</span>
                        <span className="ml-2 font-medium text-black">{formData.geofenceIds.length}</span>
                      </div>
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Geofence Selection</h3>

                      {/* Search and Filters */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            placeholder="Search geofences..."
                            value={geofenceSearch}
                            onChange={(e) => setGeofenceSearch(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Filter by Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {uniqueTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {/* <Select value={locationFilter} onValueChange={setLocationFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Filter by Location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Locations</SelectItem>
                            {uniqueLocations.map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select> */}
                      </div>

                      {/* Selection Summary */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-gray-600">
                          Showing {filteredGeofences.length} geofences ({formData.geofenceIds.length} selected)
                        </div>
                      </div>

                      {/* Geofence List */}
                      <ScrollArea className="h-96">
                        <div className="space-y-2">
                          {filteredGeofences.map((geofence) => (
                            <div
                              key={geofence.id}
                              className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                              onClick={() => onGeofenceSelection(geofence.id)}
                            >
                              <Checkbox
                                id={`geofence-${geofence.id}`}
                                checked={formData.geofenceIds.includes(geofence.id)}
                                onCheckedChange={() => onGeofenceSelection(geofence.id)}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 truncate">{geofence.name}</p>
                                    <p className="text-xs text-gray-500">{geofence.id}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500 capitalize">{geofence.type}</p>
                                    <p className="text-xs text-gray-400">
                                      {geofence.type === "circle" ? `${geofence.radius}m` : "Polygon"}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 truncate">{geofence.location}</p>
                              </div>
                            </div>
                          ))}

                          {filteredGeofences.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                              <p className="text-sm">No geofences found</p>
                              {geofenceSearch && <p className="text-xs mt-1">Try adjusting your search terms</p>}
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Selection Summary</h3>
                      <div className="text-sm">
                        <span className="text-gray-500">Selected Geofences:</span>
                        <span className="ml-2 font-medium text-black">{formData.geofenceIds.length}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row justify-between rounded-b-xl border-t border-gray-200 sticky bottom-0">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors mb-3 sm:mb-0"
                >
                  Reset
                </button>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!isFormValid()}
                    className="px-5 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-700 focus:outline-none transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {isEditing ? "Update" : "Create"}
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
