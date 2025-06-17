import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { CustomerGroupDrawerProps, CustomerGroup, Customer } from "../../../types/manage/customergroup_type"
import { fetchCustomers } from "../../../data/manage/customergroup"
import { useToast } from "@/hooks/use-toast"

export function CustomerGroupDrawer({ open, onClose, customerGroup, onSave }: CustomerGroupDrawerProps) {
  const [name, setName] = useState(customerGroup?.group_name || "")
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<number[]>(customerGroup?.customerIds || [])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeSection, setActiveSection] = useState<string>("basic")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)
  const { showSuccessToast, Toaster } = useToast({ position: "top-right" })

  // Customer filtering states
  const [customerSearch, setCustomerSearch] = useState("")

  // Filtered customers based on search
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.customer_name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      customer.id.toString().includes(customerSearch) ||
      customer.lr_number?.toLowerCase().includes(customerSearch.toLowerCase())

    return matchesSearch
  })

  // Load customers when drawer opens
  useEffect(() => {
    if (open) {
      loadCustomers()
    }
  }, [open])

  // Reset form when customer group changes
  useEffect(() => {
    if (open) {
      setName(customerGroup?.group_name || "")
      // Fix: Properly set selected customer IDs from the customerGroup
      setSelectedCustomerIds(customerGroup?.customerIds || [])
      setErrors({})
      setActiveSection("basic")
      setCustomerSearch("")
    }
  }, [customerGroup, open])

  const loadCustomers = async () => {
    try {
      setIsLoadingCustomers(true)
      const data = await fetchCustomers()
      console.log("Fetched customers:", data)
      setCustomers(data)
    } catch (error) {
      console.error("Error loading customers:", error)
    } finally {
      setIsLoadingCustomers(false)
    }
  }

  const handleSave = () => {
    // Validate form
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = "Customer group name is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const updatedCustomerGroup: CustomerGroup = {
      id: customerGroup?.id || 0,
      group_name: name,
      customerIds: selectedCustomerIds,
      created_at: customerGroup?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    onSave(updatedCustomerGroup)
  }

  const handleCustomerChange = (customerId: number, checked: boolean) => {
    if (checked) {
      setSelectedCustomerIds([...selectedCustomerIds, customerId])
    } else {
      setSelectedCustomerIds(selectedCustomerIds.filter((id) => id !== customerId))
    }
  }

  const handleSelectAll = () => {
    const allFilteredIds = filteredCustomers.map((c) => c.id)
    setSelectedCustomerIds([...new Set([...selectedCustomerIds, ...allFilteredIds])])
  }

  const handleDeselectAll = () => {
    const filteredIds = filteredCustomers.map((c) => c.id)
    setSelectedCustomerIds(selectedCustomerIds.filter((id) => !filteredIds.includes(id)))
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
                  <h2 className="text-2xl font-bold tracking-tight">
                    {customerGroup ? "Edit Customer Group" : "Create New Customer Group"}
                  </h2>
                  <p className="text-white text-sm mt-1 opacity-90">
                    Configure customer group details and customer assignments
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="relative text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
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
                >
                  Basic Details
                  {errors.name ? (
                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
                  ) : null}
                </button>
                <button
                  className={`px-6 py-3 text-sm font-medium transition-colors ${activeSection === "customers"
                    ? "text-black dark:text-white border-b-2 border-black dark:border-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  onClick={() => setActiveSection("customers")}
                >
                  Customer Selection
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
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                        Customer Group Name <span className="text-red-500 ml-1">*</span>
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
                        placeholder="Enter customer group name"
                        className={`${errors.name ? "border-red-500 ring-1 ring-red-500" : ""} dark:bg-gray-700 dark:text-white dark:border-gray-600`}
                      />
                      {errors.name && (
                        <p className="mt-1.5 text-sm text-red-500 flex items-center">
                          <X size={14} className="mr-1" /> {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selection Summary</h3>
                      <div className="text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Selected Customers:</span>
                        <span className="ml-2 font-medium text-black dark:text-white">{selectedCustomerIds.length}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSection === "customers" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Customer Selection</h3>

                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <Input
                          placeholder="Search customers..."
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          className="pl-9 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                      </div>

                      {/* Bulk Actions */}
                      <div className="flex items-center justify-between flex-wrap gap-2 sm:flex-nowrap">
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                          {isLoadingCustomers
                            ? "Loading customers..."
                            : `Showing ${filteredCustomers.length} customers (${selectedCustomerIds.length} selected)`}
                        </div>
                        <div className="flex flex-wrap sm:flex-nowrap space-x-0 sm:space-x-2 gap-2 h-6 items-center">
                          <button
                            onClick={handleSelectAll}
                            className="px-2 py-1 text-xs bg-black dark:bg-gray-700 text-white rounded hover:bg-gray-800 dark:hover:bg-gray-600"
                            disabled={isLoadingCustomers}
                          >
                            Select All
                          </button>
                          <button
                            onClick={handleDeselectAll}
                            className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                            disabled={isLoadingCustomers}
                          >
                            Deselect All
                          </button>
                        </div>
                      </div>

                      {/* Customer List */}
                      <ScrollArea className="h-96">
                        {isLoadingCustomers ? (
                          <div className="flex items-center justify-center h-32">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Loading customers...</div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {filteredCustomers.map((customer) => (
                              <label
                                key={customer.id}
                                htmlFor={`customer-${customer.id}`}
                                className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                              >
                                <Checkbox
                                  id={`customer-${customer.id}`}
                                  checked={selectedCustomerIds.includes(customer.id)}
                                  onCheckedChange={(checked) => handleCustomerChange(customer.id, checked === true)}
                                  className="dark:border-gray-500"
                                />
                                <div className="flex-1 min-w-0 overflow-x-hidden">
                                  <div className="flex items-center justify-between ">
                                    <div>
                                      <div className="relative group w-fit">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate cursor-default group-hover:overflow-visible group-hover:whitespace-normal">
                                          {customer.customer_name}
                                        </p>
                                        {/* Tooltip appears on hover of the parent label, but for absolute positioning to work,
                                            the parent must have relative positioning and enough width. 
                                            Also, make sure parent containers do not have overflow:hidden. */}
                                        {customer.customer_name && (
                                          <div className="absolute left-0 bottom-full mb-2 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-md shadow-xl border border-slate-700 z-50 min-w-0 w-max max-w-[400px] break-words whitespace-normal opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out transform group-hover:-translate-y-1 translate-y-1 pointer-events-none">
                                            <div className="font-medium text-slate-100 leading-snug break-words">
                                              {customer.customer_name}
                                            </div>
                                            {/* Tooltip arrow pointing down */}
                                            <div className="absolute -bottom-1 left-4 w-2 h-2 bg-slate-900 dark:bg-slate-800 border-r border-b border-slate-700 transform rotate-45"></div>
                                          </div>
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">ID: {customer.id}</p>
                                    </div>
                                    {/* <div className="text-right">
                                      {customer.lr_number && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">LR: {customer.lr_number}</p>
                                      )}
                                      {customer.customer_location && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{customer.customer_location}</p>
                                      )}
                                    </div> */}
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex flex-row justify-between rounded-b-xl border-t border-gray-200 dark:border-gray-700 sticky bottom-0 space-y-0 space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setName(customerGroup?.group_name || "")
                    setSelectedCustomerIds(customerGroup?.customerIds || [])
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
                    {customerGroup ? "Update" : "Create"}
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
