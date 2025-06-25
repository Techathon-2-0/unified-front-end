import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, FileText, Download } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { ReportDrawerProps, ReportType, Group, CustomerGroup } from "../../../types/reports/report_type"
import { fetchGroupsbyuserId, fetchCustomerGroupsbyuser, getAlarmTypes } from "../../../data/reports/report"
import { useToast } from "@/hooks/use-toast"
import { DatePickerWithRange } from "./date-picker-with-range"
import { useAuth } from "@/context/AuthContext"
import { fetchRolesByUserId } from "@/data/usermanage/responsibility"

interface ReportFilters {
  reportType: ReportType
  vehicleGroups: number[]
  tripStatus?: "active" | "inactive" | "all"
  startDate?: string
  endDate?: string
  customerGroups?: number[]
  alarmTypes?: number[]
}

export function ReportDrawer({
  open,
  onClose,
  onGenerateReport,
  onExportReport,
  isLoading = false,
}: ReportDrawerProps) {
  const [reportType, setReportType] = useState<ReportType>("dashboard")
  const [vehicleGroups, setVehicleGroups] = useState<number[]>([])
  const [tripStatus, setTripStatus] = useState<"active" | "inactive" | "all">("all")
  const [availableGroups, setAvailableGroups] = useState<Group[]>([])
  const [selectAllGroups, setSelectAllGroups] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { showErrorToast } = useToast({ position: "top-right" })
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })

  const [availableCustomerGroups, setAvailableCustomerGroups] = useState<CustomerGroup[]>([])
  const [customerGroups, setCustomerGroups] = useState<number[]>([])
  const [selectAllCustomerGroups, setSelectAllCustomerGroups] = useState(false)
  const [alarmTypes, setAlarmTypes] = useState<number[]>([])
  const [selectAllAlarmTypes, setSelectAllAlarmTypes] = useState(false)
  const alarmTypeOptions = getAlarmTypes()
  const { user } = useAuth()
  const [reportAccess, setReportAccess] = useState<string[]>([])

  // Load groups on component mount
  useEffect(() => {
    if (open) {
      loadGroups()
    }
  }, [open])

  // Fetch report access for current user
  useEffect(() => {
    const fetchAccess = async () => {
      if (user && user.id) {
        try {
          const roles = await fetchRolesByUserId(user.id)
          if (roles && roles.length > 0) {
            const access = roles[0].report_access || []
            setReportAccess(access)
          }
        } catch {
          setReportAccess([])
        }
      }
    }
    fetchAccess()
  }, [user])

  // Handle select all groups
  useEffect(() => {
    if (selectAllGroups) {
      setVehicleGroups(availableGroups.map((group) => group.id))
    } else if (vehicleGroups.length === availableGroups.length && availableGroups.length > 0) {
      setVehicleGroups([])
    }
  }, [selectAllGroups, availableGroups])

  // Update select all state when individual groups change
  useEffect(() => {
    setSelectAllGroups(vehicleGroups.length === availableGroups.length && availableGroups.length > 0)
  }, [vehicleGroups, availableGroups])

  // Handle select all customer groups
  useEffect(() => {
    if (selectAllCustomerGroups) {
      setCustomerGroups(availableCustomerGroups.map((group) => group.id))
    } else if (customerGroups.length === availableCustomerGroups.length && availableCustomerGroups.length > 0) {
      setCustomerGroups([])
    }
  }, [selectAllCustomerGroups, availableCustomerGroups])

  // Update select all customer groups state when individual groups change
  useEffect(() => {
    setSelectAllCustomerGroups(
      customerGroups.length === availableCustomerGroups.length && availableCustomerGroups.length > 0,
    )
  }, [customerGroups, availableCustomerGroups])

  // Remove the problematic useEffect for alarm types and replace with this:

  // Handle select all alarm types - fix infinite loop
  const handleSelectAllAlarmTypes = (checked: boolean) => {
    if (checked) {
      setAlarmTypes(alarmTypeOptions.map((type) => type.id))
      setSelectAllAlarmTypes(true)
    } else {
      setAlarmTypes([])
      setSelectAllAlarmTypes(false)
    }
  }

  // Update select all alarm types state when individual types change
  useEffect(() => {
    const allSelected = alarmTypes.length === alarmTypeOptions.length && alarmTypeOptions.length > 0
    const noneSelected = alarmTypes.length === 0

    if (allSelected && !selectAllAlarmTypes) {
      setSelectAllAlarmTypes(true)
    } else if (noneSelected && selectAllAlarmTypes) {
      setSelectAllAlarmTypes(false)
    } else if (!allSelected && !noneSelected && selectAllAlarmTypes) {
      setSelectAllAlarmTypes(false)
    }
  }, [alarmTypes.length, alarmTypeOptions.length]) // Only depend on lengths, not the full arrays

  const loadGroups = async () => {
    try {
      // Get user ID from localStorage or context
     // Replace with actual user ID logic
      const groups = await fetchGroupsbyuserId(user?.id ?? 0) // Use user ID from context or localStorage
      setAvailableGroups(groups)

      // Load customer groups for alarm reports
      const customerGroups = await fetchCustomerGroupsbyuser((user?.id ?? 0).toString())
      setAvailableCustomerGroups(customerGroups)
    } catch (error) {
      showErrorToast("Failed to load groups", "Please try again later.")
    }
  }

  const handleGroupToggle = (groupId: number) => {
    setVehicleGroups((prev) => (prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]))
  }

  const handleCustomerGroupToggle = (groupId: number) => {
    setCustomerGroups((prev) => (prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]))
  }

  const handleAlarmTypeToggle = (typeId: number) => {
    setAlarmTypes((prev) => (prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId]))
  }

  const handleGenerateReport = () => {
    const newErrors: Record<string, string> = {}

    // Dashboard report validations
    if (reportType === "dashboard") {
      if (vehicleGroups.length === 0) {
        newErrors.vehicleGroups = "Please select at least one vehicle group"
      }
    }

    // All positions report validations
    if (reportType === "all_positions") {
      if (vehicleGroups.length === 0) {
        newErrors.vehicleGroups = "Please select at least one vehicle group"
      }
      if (!dateRange.from || !dateRange.to) {
        newErrors.dateRange = "Please select a date range"
      }
    }

    // Alarm report validations
    if (reportType === "alarm") {
      if (vehicleGroups.length === 0) {
        newErrors.vehicleGroups = "Please select at least one vehicle group"
      }
      if (!dateRange.from || !dateRange.to) {
        newErrors.dateRange = "Please select a date range"
      }
      if (alarmTypes.length === 0) {
        newErrors.alarmTypes = "Please select at least one alarm type"
      }
    }

    // Trip GPS status report validations
    if (reportType === "trip_gps_status") {
      if (customerGroups.length === 0) {
        newErrors.customerGroups = "Please select at least one customer group"
      }
      if (!dateRange.from || !dateRange.to) {
        newErrors.dateRange = "Please select a date range"
      }
    }

    // Trip summary report validations
    if (reportType === "trip_summary") {
      if (customerGroups.length === 0) {
        newErrors.customerGroups = "Please select at least one customer group"
      }
      if (!dateRange.from || !dateRange.to) {
        newErrors.dateRange = "Please select a date range"
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const filters: ReportFilters = {
      reportType,
      vehicleGroups,
      ...(reportType === "dashboard" && { tripStatus }),
      ...(reportType === "all_positions" && {
        startDate: dateRange.from?.toISOString(),
        endDate: dateRange.to?.toISOString(),
      }),
      ...(reportType === "alarm" && {
        customerGroups,
        alarmTypes,
        startDate: dateRange.from?.toISOString(),
        endDate: dateRange.to?.toISOString(),
      }),
      ...(reportType === "trip_gps_status" && {
        customerGroups,
        tripStatus,
        startDate: dateRange.from?.toISOString(),
        endDate: dateRange.to?.toISOString(),
      }),
      ...(reportType === "trip_summary" && {
        customerGroups,
        tripStatus,
        startDate: dateRange.from?.toISOString(),
        endDate: dateRange.to?.toISOString(),
      }),
    }

    onGenerateReport(filters)
  }

  const handleExportReport = () => {
    const newErrors: Record<string, string> = {}

    // Dashboard report validations
    if (reportType === "dashboard") {
      if (vehicleGroups.length === 0) {
        newErrors.vehicleGroups = "Please select at least one vehicle group"
      }
    }

    // All positions report validations
    if (reportType === "all_positions") {
      if (vehicleGroups.length === 0) {
        newErrors.vehicleGroups = "Please select at least one vehicle group"
      }
      if (!dateRange.from || !dateRange.to) {
        newErrors.dateRange = "Please select a date range"
      }
    }

    // Alarm report validations
    if (reportType === "alarm") {
      if (vehicleGroups.length === 0) {
        newErrors.vehicleGroups = "Please select at least one vehicle group"
      }
      if (!dateRange.from || !dateRange.to) {
        newErrors.dateRange = "Please select a date range"
      }
      if (alarmTypes.length === 0) {
        newErrors.alarmTypes = "Please select at least one alarm type"
      }
    }

    // Trip GPS status report validations
    if (reportType === "trip_gps_status") {
      if (customerGroups.length === 0) {
        newErrors.customerGroups = "Please select at least one customer group"
      }
      if (!dateRange.from || !dateRange.to) {
        newErrors.dateRange = "Please select a date range"
      }
    }

    // Trip summary report validations
    if (reportType === "trip_summary") {
      if (customerGroups.length === 0) {
        newErrors.customerGroups = "Please select at least one customer group"
      }
      if (!dateRange.from || !dateRange.to) {
        newErrors.dateRange = "Please select a date range"
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const filters: ReportFilters = {
      reportType,
      vehicleGroups,
      ...(reportType === "dashboard" && { tripStatus }),
      ...(reportType === "all_positions" && {
        startDate: dateRange.from?.toISOString(),
        endDate: dateRange.to?.toISOString(),
      }),
      ...(reportType === "alarm" && {
        customerGroups,
        alarmTypes,
        startDate: dateRange.from?.toISOString(),
        endDate: dateRange.to?.toISOString(),
      }),
      ...(reportType === "trip_gps_status" && {
        customerGroups,
        tripStatus,
        startDate: dateRange.from?.toISOString(),
        endDate: dateRange.to?.toISOString(),
      }),
      ...(reportType === "trip_summary" && {
        customerGroups,
        tripStatus,
        startDate: dateRange.from?.toISOString(),
        endDate: dateRange.to?.toISOString(),
      }),
    }

    onExportReport(filters)
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
        <div className="fixed inset-0 z-[9998] overflow-y-auto">
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
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden relative z-[9999]"
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
                  <h2 className="text-2xl font-bold tracking-tight">Generate Report</h2>
                  <p className="text-white text-sm mt-1 opacity-90">Configure report filters and options</p>
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
                    <Label htmlFor="reportType" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Report Type <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select value={reportType} onValueChange={(value: ReportType) => setReportType(value)}>
                      <SelectTrigger className="w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent
                        className="dark:bg-gray-800 dark:border-gray-700 z-[10000]"
                      >
                        {/* Only show report types if present in reportAccess */}
                        {reportAccess.includes("Dashboard") && (
                          <SelectItem value="dashboard" className="dark:text-gray-300">
                            Dashboard Report
                          </SelectItem>
                        )}
                        {reportAccess.includes("Stops By Day report") && (
                          <SelectItem value="all_positions" className="dark:text-gray-300">
                            All Position Report
                          </SelectItem>
                        )}
                        {reportAccess.includes("Alarm Log") && (
                          <SelectItem value="alarm" className="dark:text-gray-300">
                            Alarm Reports
                          </SelectItem>
                        )}
                        {reportAccess.includes("Communication status report") && (
                          <SelectItem value="trip_gps_status" className="dark:text-gray-300">
                            Trip GPS Status Report
                          </SelectItem>
                        )}
                        {reportAccess.includes("Trip Summary Report") && (
                          <SelectItem value="trip_summary" className="dark:text-gray-300">
                            Trip Summary Report
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {reportType === "dashboard" && (
                    <>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                          Vehicle Groups <span className="text-red-500 ml-1">*</span>
                        </Label>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="selectAll"
                              checked={selectAllGroups}
                              onCheckedChange={(checked) => setSelectAllGroups(!!checked)}
                              className="border-gray-300 dark:border-gray-600"
                            />
                            <Label htmlFor="selectAll" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Select All Groups
                            </Label>
                          </div>

                          <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md p-2 space-y-2">
                            {availableGroups.map((group) => (
                              <div key={group.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`group-${group.id}`}
                                  checked={vehicleGroups.includes(group.id)}
                                  onCheckedChange={() => handleGroupToggle(group.id)}
                                  className="border-gray-300 dark:border-gray-600"
                                />
                                <Label
                                  htmlFor={`group-${group.id}`}
                                  className="text-sm text-gray-700 dark:text-gray-300"
                                >
                                  {group.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {errors.vehicleGroups && (
                          <p className="mt-1.5 text-sm text-red-500 flex items-center">
                            <X size={14} className="mr-1" /> {errors.vehicleGroups}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="tripStatus"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Trip Status
                        </Label>
                        <Select
                          value={tripStatus}
                          onValueChange={(value: "active" | "inactive" | "all") => setTripStatus(value)}
                        >
                          <SelectTrigger className="w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                            <SelectValue placeholder="Select trip status" />
                          </SelectTrigger>
                          <SelectContent
                            className="dark:bg-gray-800 dark:border-gray-700 z-[10000]"
                          >
                            <SelectItem value="all" className="dark:text-gray-300">
                              All
                            </SelectItem>
                            <SelectItem value="active" className="dark:text-gray-300">
                              Active
                            </SelectItem>
                            <SelectItem value="inactive" className="dark:text-gray-300">
                              Inactive
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {reportType === "all_positions" && (
                    <>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                          Vehicle Groups <span className="text-red-500 ml-1">*</span>
                        </Label>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="selectAll"
                              checked={selectAllGroups}
                              onCheckedChange={(checked) => setSelectAllGroups(!!checked)}
                              className="border-gray-300 dark:border-gray-600"
                            />
                            <Label htmlFor="selectAll" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Select All Groups
                            </Label>
                          </div>

                          <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md p-2 space-y-2">
                            {availableGroups.map((group) => (
                              <div key={group.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`group-${group.id}`}
                                  checked={vehicleGroups.includes(group.id)}
                                  onCheckedChange={() => handleGroupToggle(group.id)}
                                  className="border-gray-300 dark:border-gray-600"
                                />
                                <Label
                                  htmlFor={`group-${group.id}`}
                                  className="text-sm text-gray-700 dark:text-gray-300"
                                >
                                  {group.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {errors.vehicleGroups && (
                          <p className="mt-1.5 text-sm text-red-500 flex items-center">
                            <X size={14} className="mr-1" /> {errors.vehicleGroups}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Date Range <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <DatePickerWithRange dateRange={dateRange} onChange={setDateRange} className="w-full" />
                        {errors.dateRange && (
                          <p className="mt-1.5 text-sm text-red-500 flex items-center">
                            <X size={14} className="mr-1" /> {errors.dateRange}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {reportType === "alarm" && (
                    <>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                          Vehicle Groups <span className="text-red-500 ml-1">*</span>
                        </Label>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="selectAllVehicle"
                              checked={selectAllGroups}
                              onCheckedChange={(checked) => setSelectAllGroups(!!checked)}
                              className="border-gray-300 dark:border-gray-600"
                            />
                            <Label
                              htmlFor="selectAllVehicle"
                              className="text-sm font-medium text-gray-900 dark:text-gray-100"
                            >
                              Select All Vehicle Groups
                            </Label>
                          </div>

                          <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md p-2 space-y-2">
                            {availableGroups.map((group) => (
                              <div key={group.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`vehicle-group-${group.id}`}
                                  checked={vehicleGroups.includes(group.id)}
                                  onCheckedChange={() => handleGroupToggle(group.id)}
                                  className="border-gray-300 dark:border-gray-600"
                                />
                                <Label
                                  htmlFor={`vehicle-group-${group.id}`}
                                  className="text-sm text-gray-700 dark:text-gray-300"
                                >
                                  {group.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {errors.vehicleGroups && (
                          <p className="mt-1.5 text-sm text-red-500 flex items-center">
                            <X size={14} className="mr-1" /> {errors.vehicleGroups}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                          Customer Groups
                        </Label>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="selectAllCustomer"
                              checked={selectAllCustomerGroups}
                              onCheckedChange={(checked) => setSelectAllCustomerGroups(!!checked)}
                              className="border-gray-300 dark:border-gray-600"
                            />
                            <Label
                              htmlFor="selectAllCustomer"
                              className="text-sm font-medium text-gray-900 dark:text-gray-100"
                            >
                              Select All Customer Groups
                            </Label>
                          </div>

                          <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md p-2 space-y-2">
                            {availableCustomerGroups.map((group) => (
                              <div key={group.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`customer-group-${group.id}`}
                                  checked={customerGroups.includes(group.id)}
                                  onCheckedChange={() => handleCustomerGroupToggle(group.id)}
                                  className="border-gray-300 dark:border-gray-600"
                                />
                                <Label
                                  htmlFor={`customer-group-${group.id}`}
                                  className="text-sm text-gray-700 dark:text-gray-300"
                                >
                                  {group.group_name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                          Alarm Types <span className="text-red-500 ml-1">*</span>
                        </Label>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="selectAllAlarms"
                              checked={selectAllAlarmTypes}
                              onCheckedChange={handleSelectAllAlarmTypes} // Use the new handler
                              className="border-gray-300 dark:border-gray-600"
                            />
                            <Label
                              htmlFor="selectAllAlarms"
                              className="text-sm font-medium text-gray-900 dark:text-gray-100"
                            >
                              Select All Alarm Types
                            </Label>
                          </div>

                          <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md p-2 space-y-2">
                            {alarmTypeOptions.map((type) => (
                              <div key={type.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`alarm-type-${type.id}`}
                                  checked={alarmTypes.includes(type.id)}
                                  onCheckedChange={() => handleAlarmTypeToggle(type.id)}
                                  className="border-gray-300 dark:border-gray-600"
                                />
                                <Label
                                  htmlFor={`alarm-type-${type.id}`}
                                  className="text-sm text-gray-700 dark:text-gray-300"
                                >
                                  {type.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {errors.alarmTypes && (
                          <p className="mt-1.5 text-sm text-red-500 flex items-center">
                            <X size={14} className="mr-1" /> {errors.alarmTypes}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Date Range <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <DatePickerWithRange dateRange={dateRange} onChange={setDateRange} className="w-full" />
                        {errors.dateRange && (
                          <p className="mt-1.5 text-sm text-red-500 flex items-center">
                            <X size={14} className="mr-1" /> {errors.dateRange}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                  {reportType === "trip_gps_status" && (
                    <>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                          Customer Groups <span className="text-red-500 ml-1">*</span>
                        </Label>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="selectAllCustomerTripGps"
                              checked={selectAllCustomerGroups}
                              onCheckedChange={(checked) => setSelectAllCustomerGroups(!!checked)}
                              className="border-gray-300 dark:border-gray-600"
                            />
                            <Label
                              htmlFor="selectAllCustomerTripGps"
                              className="text-sm font-medium text-gray-900 dark:text-gray-100"
                            >
                              Select All Customer Groups
                            </Label>
                          </div>

                          <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md p-2 space-y-2">
                            {availableCustomerGroups.map((group) => (
                              <div key={group.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`customer-group-trip-${group.id}`}
                                  checked={customerGroups.includes(group.id)}
                                  onCheckedChange={() => handleCustomerGroupToggle(group.id)}
                                  className="border-gray-300 dark:border-gray-600"
                                />
                                <Label
                                  htmlFor={`customer-group-trip-${group.id}`}
                                  className="text-sm text-gray-700 dark:text-gray-300"
                                >
                                  {group.group_name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {errors.customerGroups && (
                          <p className="mt-1.5 text-sm text-red-500 flex items-center">
                            <X size={14} className="mr-1" /> {errors.customerGroups}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="tripStatusGps"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Trip Status <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Select
                          value={tripStatus}
                          onValueChange={(value: "active" | "inactive" | "all") => setTripStatus(value)}
                        >
                          <SelectTrigger className="w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                            <SelectValue placeholder="Select trip status" />
                          </SelectTrigger>
                          <SelectContent
                            className="dark:bg-gray-800 dark:border-gray-700 z-[10000]"
                          >
                            <SelectItem value="all" className="dark:text-gray-300">
                              All
                            </SelectItem>
                            <SelectItem value="active" className="dark:text-gray-300">
                              Active
                            </SelectItem>
                            <SelectItem value="inactive" className="dark:text-gray-300">
                              Inactive
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Date Range <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <DatePickerWithRange dateRange={dateRange} onChange={setDateRange} className="w-full" />
                        {errors.dateRange && (
                          <p className="mt-1.5 text-sm text-red-500 flex items-center">
                            <X size={14} className="mr-1" /> {errors.dateRange}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                  {reportType === "trip_summary" && (
                    <>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                          Customer Groups <span className="text-red-500 ml-1">*</span>
                        </Label>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="selectAllCustomerTripSummary"
                              checked={selectAllCustomerGroups}
                              onCheckedChange={(checked) => setSelectAllCustomerGroups(!!checked)}
                              className="border-gray-300 dark:border-gray-600"
                            />
                            <Label
                              htmlFor="selectAllCustomerTripSummary"
                              className="text-sm font-medium text-gray-900 dark:text-gray-100"
                            >
                              Select All Customer Groups
                            </Label>
                          </div>

                          <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md p-2 space-y-2">
                            {availableCustomerGroups.map((group) => (
                              <div key={group.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`customer-group-summary-${group.id}`}
                                  checked={customerGroups.includes(group.id)}
                                  onCheckedChange={() => handleCustomerGroupToggle(group.id)}
                                  className="border-gray-300 dark:border-gray-600"
                                />
                                <Label
                                  htmlFor={`customer-group-summary-${group.id}`}
                                  className="text-sm text-gray-700 dark:text-gray-300"
                                >
                                  {group.group_name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {errors.customerGroups && (
                          <p className="mt-1.5 text-sm text-red-500 flex items-center">
                            <X size={14} className="mr-1" /> {errors.customerGroups}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="tripStatusSummary"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Trip Status <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Select
                          value={tripStatus}
                          onValueChange={(value: "active" | "inactive" | "all") => setTripStatus(value)}
                        >
                          <SelectTrigger className="w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                            <SelectValue placeholder="Select trip status" />
                          </SelectTrigger>
                          <SelectContent
                            className="dark:bg-gray-800 dark:border-gray-700 z-[10000]"
                          >
                            <SelectItem value="all" className="dark:text-gray-300">
                              All
                            </SelectItem>
                            <SelectItem value="active" className="dark:text-gray-300">
                              Active
                            </SelectItem>
                            <SelectItem value="inactive" className="dark:text-gray-300">
                              Inactive
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Date Range <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <DatePickerWithRange dateRange={dateRange} onChange={setDateRange} className="w-full" />
                        {errors.dateRange && (
                          <p className="mt-1.5 text-sm text-red-500 flex items-center">
                            <X size={14} className="mr-1" /> {errors.dateRange}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex flex-row justify-between rounded-b-xl border-t border-gray-200 dark:border-gray-700 sticky bottom-0 space-y-0 space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors"
                >
                  Cancel
                </button>
                <div className="flex flex-row space-x-2">
                  <button
                    type="button"
                    onClick={handleExportReport}
                    disabled={isLoading}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateReport}
                    disabled={isLoading}
                    className="px-4 py-1.5 sm:px-5 sm:py-2 border border-transparent rounded-lg shadow-sm sm:text-sm font-medium text-white bg-black dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {isLoading ? "Generating..." : "See Info"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
