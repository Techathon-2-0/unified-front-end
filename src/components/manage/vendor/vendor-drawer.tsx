import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { VendorDrawerProps } from "../../../types/manage/vendor_type"
import { useToast } from "@/hooks/use-toast"

export function VendorDrawer({ open, onClose, vendor, onSave }: VendorDrawerProps) {
  const [name, setName] = useState(vendor?.name || "")
  const [active, setActive] = useState(vendor?.active || false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { showSuccessToast, Toaster } = useToast({ position: "top-right" })

  // Reset form when vendor changes
  useEffect(() => {
    if (open) {
      setName(vendor?.name || "")
      setActive(vendor?.active || false)
      setErrors({})
    }
  }, [vendor, open])

  const handleSave = () => {
    // Validate form
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = "Vendor name is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const updatedVendor = {
      name,
      active,
    }

    onSave(updatedVendor)
  }

  const isFormValid = () => {
    return name.trim() !== ""
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
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden relative"
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
                  <h2 className="text-2xl font-bold tracking-tight">{vendor ? "Edit Vendor" : "Create New Vendor"}</h2>
                  <p className="text-white text-sm mt-1 opacity-90">Configure vendor details and status</p>
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
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                      Vendor Name <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        if (errors.name) {
                          setErrors((prev) => {
                            const newErrors = { ...prev }
                            delete newErrors.name
                            return newErrors
                          })
                        }
                      }}
                      placeholder="Enter vendor name"
                      className={`${errors.name ? "border-red-500 ring-1 ring-red-500" : ""} dark:bg-gray-700 dark:text-white dark:border-gray-600`}
                      disabled={!!vendor} // Disable editing name for existing vendors
                    />
                    {errors.name && (
                      <p className="mt-1.5 text-sm text-red-500 flex items-center">
                        <X size={14} className="mr-1" /> {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="active" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </Label>
                    <Select
                      value={active ? "active" : "inactive"}
                      onValueChange={(value) => setActive(value === "active")}
                    >
                      <SelectTrigger className="w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        <SelectItem value="active" className="dark:text-gray-300">Active</SelectItem>
                        <SelectItem value="inactive" className="dark:text-gray-300">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {vendor && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vendor Information</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Vendor ID:</span>
                          <span className="ml-2 font-medium text-black dark:text-white">{vendor.id}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex flex-row justify-between rounded-b-xl border-t border-gray-200 dark:border-gray-700 sticky bottom-0 space-y-0 space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setName(vendor?.name || "")
                    setActive(vendor?.active || false)
                    setErrors({})

                    showSuccessToast("Form Reset", "All form fields have been reset successfully")
                  }}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors"
                >
                  Reset
                </button>
                <div className="flex flex-row space-x-2">
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
                    {vendor ? "Update" : "Create"}
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
