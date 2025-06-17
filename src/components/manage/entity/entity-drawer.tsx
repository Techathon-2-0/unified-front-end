import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { EntityDrawerProps, Vendor } from "../../../types/manage/entity_type"
import { useToast } from "@/hooks/use-toast"

export function EntityDrawer({ open, onClose, entity, onSave, availableVendors }: EntityDrawerProps) {
  const [vehicleNumber, setVehicleNumber] = useState(entity?.vehicleNumber || "")
  const [selectedVendors, setSelectedVendors] = useState<Vendor[]>(entity?.vendors || [])
  const [type, setType] = useState<"Car" | "Truck" | "Excavator">(entity?.type || "Car")
  const [status, setStatus] = useState<boolean>(entity?.status ?? true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { showSuccessToast, Toaster } = useToast({ position: "top-right" })

  useEffect(() => {
    if (open) {
      setVehicleNumber(entity?.vehicleNumber || "")
      setSelectedVendors(entity?.vendors || [])
      setType(entity?.type || "Car")
      setStatus(entity?.status ?? true)
      setErrors({})
    }
  }, [entity, open])

  const handleVendorChange = (vendorId: number, checked: boolean) => {
    if (checked) {
      const vendor = availableVendors.find((v) => v.id === vendorId)
      if (vendor) {
        setSelectedVendors([...selectedVendors, vendor])
      }
    } else {
      setSelectedVendors(selectedVendors.filter((v) => v.id !== vendorId))
    }
  }

  const handleSave = () => {
    const newErrors: Record<string, string> = {}

    if (!vehicleNumber.trim()) newErrors.vehicleNumber = "Vehicle number is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const updatedEntity = {
      vehicleNumber,
      vendors: selectedVendors,
      type,
      status,
    }

    onSave(updatedEntity)
  }

  const isFormValid = () => {
    return vehicleNumber.trim() !== ""
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
      {open && (
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
              <div className="bg-gradient-to-r from-black via-gray-900 to-gray-800 text-white px-8 py-6 flex justify-between items-center rounded-t-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]"></div>
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-600 rounded-full opacity-20 blur-3xl"></div>

                <div className="relative">
                  <h2 className="text-2xl font-bold tracking-tight">{entity ? "Edit Entity" : "Create New Entity"}</h2>
                  <p className="text-white text-sm mt-1 opacity-90">Configure entity details and vendor assignments</p>
                </div>

                <button
                  onClick={onClose}
                  className="relative text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)] pb-20 sm:pb-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-5"
                >
                  <div>
                    <Label htmlFor="vehicleNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                      Vehicle Number <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="vehicleNumber"
                      value={vehicleNumber}
                      onChange={(e) => {
                        setVehicleNumber(e.target.value)
                        if (errors.vehicleNumber) {
                          setErrors((prev) => {
                            const newErrors = { ...prev }
                            delete newErrors.vehicleNumber
                            return newErrors
                          })
                        }
                      }}
                      placeholder="Enter vehicle number"
                      className={`${errors.vehicleNumber ? "border-red-500 ring-1 ring-red-500" : ""} dark:bg-gray-700 dark:text-white dark:border-gray-600`}
                      disabled={!!entity} // Disable editing vehicle number for existing entities
                    />
                    {errors.vehicleNumber && (
                      <p className="mt-1.5 text-sm text-red-500 flex items-center">
                        <X size={14} className="mr-1" /> {errors.vehicleNumber}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type
                      </Label>
                      <Select value={type} onValueChange={(value: "Car" | "Truck" | "Excavator") => setType(value)}>
                        <SelectTrigger className="w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          <SelectItem value="Car" className="dark:text-gray-300">Car</SelectItem>
                          <SelectItem value="Truck" className="dark:text-gray-300">Truck</SelectItem>
                          <SelectItem value="Excavator" className="dark:text-gray-300">Excavator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status
                      </Label>
                      <Select
                        value={status ? "Active" : "Inactive"}
                        onValueChange={(value) => setStatus(value === "Active")}
                      >
                        <SelectTrigger className="w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          <SelectItem value="Active" className="dark:text-gray-300">Active</SelectItem>
                          <SelectItem value="Inactive" className="dark:text-gray-300">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                      Vendors {!entity && <span className="text-gray-500 dark:text-gray-400 text-xs">(Optional - can be set later)</span>}
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 max-h-40 overflow-y-auto border rounded-md p-3 dark:border-gray-600">
                      {availableVendors.map((vendor) => (
                        <div key={vendor.id} className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id={`vendor-${vendor.id}`}
                            checked={selectedVendors.some((v) => v.id === vendor.id)}
                            onCheckedChange={(checked) => handleVendorChange(vendor.id, checked as boolean)}
                            className="dark:border-gray-500"
                          />
                          <Label htmlFor={`vendor-${vendor.id}`} className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                            {vendor.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {selectedVendors.length > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {selectedVendors.length} vendor{selectedVendors.length !== 1 ? "s" : ""} selected
                      </p>
                    )}
                  </div>

                  {entity && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Entity Information</h3>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Entity ID:</span>
                          <span className="ml-2 font-medium text-black dark:text-white">{entity.id}</span>
                        </div>
                        {selectedVendors.length > 0 && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Selected Vendors:</span>
                            <div className="ml-2 mt-1 space-y-2">
                              {/* Active Vendors */}
                              {selectedVendors.filter(vendor => vendor.status === true).length > 0 && (
                                <div>
                                  <div className="text-xs font-medium text-green-700 dark:text-green-500 mb-1">Active:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {selectedVendors
                                      .filter(vendor => vendor.status === true)
                                      .map((vendor) => (
                                        <span key={vendor.id} className="text-black dark:text-gray-800 text-xs bg-green-100 dark:bg-green-200 px-2 py-1 rounded">
                                          {vendor.name}
                                        </span>
                                      ))}
                                  </div>
                                </div>
                              )}

                              {/* Inactive Vendors */}
                              {selectedVendors.filter(vendor => vendor.status === false).length > 0 && (
                                <div>
                                  <div className="text-xs font-medium text-red-700 dark:text-red-500 mb-1">Inactive:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {selectedVendors
                                      .filter(vendor => vendor.status === false)
                                      .map((vendor) => (
                                        <span key={vendor.id} className="text-black dark:text-gray-800 text-xs bg-red-100 dark:bg-red-200 px-2 py-1 rounded">
                                          {vendor.name}
                                        </span>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex flex-row justify-between rounded-b-xl border-t border-gray-200 dark:border-gray-700 z-10 flex-wrap gap-2 sm:gap-0">
                <button
                  type="button"
                  onClick={() => {
                    setVehicleNumber(entity?.vehicleNumber || "")
                    setSelectedVendors(entity?.vendors || [])
                    setType(entity?.type || "Car")
                    setStatus(entity?.status ?? true)
                    setErrors({})

                    showSuccessToast("Form Reset", "All form fields have been reset successfully")
                  }}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors"
                >
                  Reset
                </button>
                <div className="flex flex-row space-x-2 sm:space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!isFormValid()}
                    className="px-4 py-1.5 sm:px-5 sm:py-2 border border-transparent rounded-lg shadow-sm sm:text-sm font-medium text-white bg-black dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {entity ? "Update" : "Create"}
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
