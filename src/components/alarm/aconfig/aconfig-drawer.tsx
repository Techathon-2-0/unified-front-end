import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react"

import type { Alarm, CreateAlarmModalProps } from "../../../types/alarm/aconfig_type"
import { GroupSelection } from "./GroupSelection"
import { NotificationSelection } from "./NotificationSelection"
import { useToast } from "@/hooks/use-toast"
import { AlarmTypeIcon } from "./AlarmTypeIcon"

export const CreateAlarmModal = ({
  isOpen,
  onClose,
  onSave,
  editAlarm = null,
  availableVehicleGroups,
  availableCustomerGroups,
  availableGeofenceGroups,
  availableUsers,
}: CreateAlarmModalProps) => {
  const [formData, setFormData] = useState<Partial<Alarm>>({
    type: "",
    severityType: "General",
    alarmGeneration: "Always",
    enableGeofence: false,
    geofenceStatus: "In",
    groups: [],
    email: "",
    sms: "",
    description: "",
    thresholdValue: "",
    status: "Active",
    restDuration: 0,
    activeTrip: false,
    activeStartTimeRange: "",
    activeEndTimeRange: "",
    vehicleGroups: [],
    customerGroups: [],
    geofenceGroups: [],
    emails: [],
    phoneNumbers: [],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showThresholdTooltip, setShowThresholdTooltip] = useState(false)
  const [activeSection, setActiveSection] = useState<string>("basic")
  const [customEmails, setCustomEmails] = useState("")
  const [customPhoneNumbers, setCustomPhoneNumbers] = useState("")
  const { showSuccessToast, showErrorToast, Toaster } = useToast({ position: "top-right" })

  // Function to clean quotes from strings
  const cleanQuotes = (str: string): string => {
    if (typeof str !== "string") return str
    return str.replace(/^"(.*)"$/, "$1")
  }

  useEffect(() => {
    if (editAlarm && isOpen) {
      console.log("Setting edit alarm data:", editAlarm)

      // Make a deep copy to avoid reference issues
      const formDataFromEdit = {
        ...editAlarm,
        vehicleGroups: editAlarm.vehicleGroups || [],
        customerGroups: editAlarm.customerGroups || [],
        geofenceGroups: editAlarm.geofenceGroups || [],
        // Clean quotes from emails and phone numbers
        emails: (editAlarm.emails || []).map((email) => cleanQuotes(email)),
        phoneNumbers: (editAlarm.phoneNumbers || []).map((phone) => cleanQuotes(phone)),
      }

      setFormData(formDataFromEdit)

      // Clean quotes before comparing
      const userEmails = availableUsers.map((user) => user.email).filter(Boolean)
      const cleanedEmails = (editAlarm.emails || []).map((email) => cleanQuotes(email))
      const customEmailsList = cleanedEmails.filter((email) => !userEmails.includes(email))
      setCustomEmails(customEmailsList.join(", "))

      // Remove custom emails from main emails array
      const selectedEmails = cleanedEmails.filter((email) => userEmails.includes(email))

      const userPhones = availableUsers.map((user) => user.phone).filter(Boolean)
      const cleanedPhones = (editAlarm.phoneNumbers || []).map((phone) => cleanQuotes(phone))
      const customPhonesList = cleanedPhones.filter((phone) => !userPhones.includes(phone))
      setCustomPhoneNumbers(customPhonesList.join(", "))

      // Remove custom phones from main phones array
      const selectedPhones = cleanedPhones.filter((phone) => userPhones.includes(phone))

      setFormData({
        ...editAlarm,
        vehicleGroups: editAlarm.vehicleGroups || [],
        customerGroups: editAlarm.customerGroups || [],
        geofenceGroups: editAlarm.geofenceGroups || [],
        emails: selectedEmails,
        phoneNumbers: selectedPhones,
      })
      setErrors({})
    } else if (!editAlarm && isOpen) {
      resetForm()
      setErrors({})
    }
  }, [editAlarm, isOpen, availableUsers])

  const resetForm = (showToastMessage = false) => {
    try {
      // Only reset to default values if creating new alarm
      if (!editAlarm) {
        setFormData({
          type: "",
          severityType: "General",
          alarmGeneration: "Always",
          enableGeofence: false,
          geofenceStatus: "In",
          groups: [],
          email: "",
          sms: "",
          description: "",
          thresholdValue: "",
          status: "Active",
          restDuration: 0,
          activeTrip: false,
          activeStartTimeRange: "",
          activeEndTimeRange: "",
          vehicleGroups: [],
          customerGroups: [],
          geofenceGroups: [],
          emails: [],
          phoneNumbers: [],
        })
        setCustomEmails("")
        setCustomPhoneNumbers("")
      } else {
        // For editing, reset to the original alarm data
        const originalData = JSON.parse(JSON.stringify(editAlarm))

        // Clean quotes from emails and phone numbers
        if (originalData.emails) {
          originalData.emails = originalData.emails.map((email: string) => cleanQuotes(email))
        }
        if (originalData.phoneNumbers) {
          originalData.phoneNumbers = originalData.phoneNumbers.map((phone: string) => cleanQuotes(phone))
        }

        setFormData(originalData)

        // Reset custom emails and phone numbers to original state
        if (editAlarm.emails && editAlarm.emails.length > 0) {
          const userEmails = availableUsers.map((user) => user.email).filter(Boolean)
          const cleanedEmails = editAlarm.emails.map((email) => cleanQuotes(email))
          const customEmailsList = cleanedEmails.filter((email) => !userEmails.includes(email))
          setCustomEmails(customEmailsList.join(", "))
        } else {
          setCustomEmails("")
        }

        if (editAlarm.phoneNumbers && editAlarm.phoneNumbers.length > 0) {
          const userPhones = availableUsers.map((user) => user.phone).filter(Boolean)
          const cleanedPhones = editAlarm.phoneNumbers.map((phone) => cleanQuotes(phone))
          const customPhonesList = cleanedPhones.filter((phone) => !userPhones.includes(phone))
          setCustomPhoneNumbers(customPhonesList.join(", "))
        } else {
          setCustomPhoneNumbers("")
        }
      }

      setErrors({}) // <-- Always clear errors on reset
      setActiveSection("basic")

      // Only show toast when explicitly requested (user action)
      if (showToastMessage) {
        showSuccessToast(
          "Form Reset",
          editAlarm ? "Form reset to saved state" : "All form fields have been reset successfully",
        )
      }
    } catch (error) {
      console.error("Error resetting form:", error)
      if (showToastMessage) {
        showErrorToast("Failed to reset form. Please try again.", "error")
      }
    }
  }

  // Handler for button clicks
  const handleResetClick = () => {
    resetForm(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        // Reset selected geofence when disabling geofence
        ...(name === "enableGeofence" && !checked ? { geofenceStatus: "In", geofenceGroups: [] } : {}),
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleVehicleGroupsChange = (selectedIds: number[]) => {
    setFormData((prev) => ({
      ...prev,
      vehicleGroups: selectedIds,
    }))
  }

  const handleCustomerGroupsChange = (selectedIds: number[]) => {
    setFormData((prev) => ({
      ...prev,
      customerGroups: selectedIds,
    }))
  }

  const handleGeofenceGroupsChange = (selectedIds: number[]) => {
    setFormData((prev) => ({
      ...prev,
      geofenceGroups: selectedIds,
    }))
  }

  const handleEmailsChange = (selectedEmails: string[]) => {
    setFormData((prev) => ({
      ...prev,
      emails: selectedEmails,
    }))
  }

  const handlePhoneNumbersChange = (selectedPhones: string[]) => {
    setFormData((prev) => ({
      ...prev,
      phoneNumbers: selectedPhones,
    }))
  }

  const handleSubmit = () => {
    // Validate form
    const newErrors: Record<string, string> = {}

    if (!formData.type) {
      newErrors.type = "Alarm type is required"
    }

    // Only validate threshold for types that need it
    const noThresholdTypes = ["Geofence", "Reached Stop", "No GPS Feed"]
    if (
      !noThresholdTypes.includes(formData.type || "") &&
      (formData.thresholdValue === undefined || formData.thresholdValue === "")
    ) {
      newErrors.thresholdValue = "Threshold value is required"
    }

    if (formData.type === "Continuous Driving" && (!formData.restDuration || formData.restDuration === 0)) {
      newErrors.restDuration = "Rest duration is required for Continuous Driving alarms"
    }

    if (formData.alarmGeneration === "Conditional" && !formData.activeStartTimeRange && !formData.activeEndTimeRange) {
      newErrors.activeTimeRange = "Time range is required for conditional alarms"
    }

    if (formData.type === "Geofence" && (!formData.geofenceGroups || formData.geofenceGroups.length === 0)) {
      newErrors.geofenceGroups = "At least one geofence group must be selected for geofence alarms"
    }

    if (!formData.vehicleGroups || formData.vehicleGroups.length === 0) {
      newErrors.vehicleGroups = "At least one vehicle group must be selected"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Process custom emails and phone numbers
    const processedEmails = [
      ...(formData.emails || []),
      ...customEmails
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0),
    ]

    const processedPhoneNumbers = [
      ...(formData.phoneNumbers || []),
      ...customPhoneNumbers
        .split(",")
        .map((phone) => phone.trim())
        .filter((phone) => phone.length > 0),
    ]

    // Create a comprehensive data object with all fields
    const dataToSave = {
      ...formData,
      emails: processedEmails,
      phoneNumbers: processedPhoneNumbers,
      vehicleGroups: formData.vehicleGroups || [],
      customerGroups: formData.customerGroups || [],
      geofenceGroups: formData.geofenceGroups || [],
      // Ensure all required fields are present
      type: formData.type || "",
      severityType: formData.severityType || "General",
      alarmGeneration: formData.alarmGeneration || "Always",
      status: formData.status || "Active",
      // For Geofence and Reached Stop, always set threshold to 0
      thresholdValue: noThresholdTypes.includes(formData.type || "")
        ? "0"
        : formData.thresholdValue !== undefined
          ? formData.thresholdValue.toString()
          : "0",
      description: formData.description || "",
      enableGeofence: formData.type === "Geofence",
      geofenceStatus: formData.type === "Geofence" ? formData.geofenceStatus || "In" : undefined,
      activeTrip: Boolean(formData.activeTrip),
      activeStartTimeRange: formData.activeStartTimeRange || "",
      activeEndTimeRange: formData.activeEndTimeRange || "",
      restDuration: formData.restDuration || 0,
    }

    console.log("Submitting alarm data:", dataToSave)

    onSave(dataToSave)
    setErrors({}) // <-- Clear errors after successful submit
    // Don't reset form here - let the parent component handle success/failure
  }

  const alarmTypes = [
    "Stoppage",
    "Overspeeding",
    "Continuous Driving",
    "No GPS Feed",
    "Reached Stop",
    "Geofence",
    "Route Deviation",
  ]

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

  const getThresholdLabel = () => {
    switch (formData.type) {
      case "Overspeeding":
        return "Speed Limit (km/h)"
      case "Stoppage":
        return "Idle Time (minutes)"
      case "Continuous Driving":
        return "Duration (hours)"
      case "Route Deviation":
        return "Deviation (km)"
      default:
        return "Threshold Value"
    }
  }

  // Check if threshold field should be shown
  const shouldShowThreshold = () => {
    return !["Geofence", "Reached Stop", "No GPS Feed"].includes(formData.type || "")
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "bg-red-500"
      case "warning":
        return "bg-amber-500"
      case "general":
      default:
        return "bg-blue-500"
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <motion.div
              className="fixed inset-0 bg-black/50 bg-opacity-50"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => {
                onClose()
                setErrors({}) // <-- Clear errors on modal close
              }}
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
                  <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-600 rounded-full opacity-20 blur-3xl"></div>

                  <div className="relative">
                    <h2 className="text-2xl font-bold tracking-tight">
                      {editAlarm ? "Edit Alarm" : "Create New Alarm"}
                    </h2>
                    <p className="text-white text-sm mt-1 opacity-90">Configure alarm settings and notifications</p>
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
                    Basic Settings
                    {errors.type || errors.thresholdValue || errors.restDuration || errors.activeTimeRange ? (
                      <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
                    ) : null}
                  </button>
                  <button
                    className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeSection === "groups"
                      ? "text-black dark:text-white border-b-2 border-black dark:border-white"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    onClick={() => setActiveSection("groups")}
                  >
                    Group Selection
                    {errors.vehicleGroups || errors.customerGroups || errors.geofenceGroups ? (
                      <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
                    ) : null}
                  </button>
                  <button
                    className={`px-6 py-3 text-sm font-medium transition-colors ${activeSection === "notifications"
                      ? "text-black dark:text-white border-b-2 border-black dark:border-white"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    onClick={() => setActiveSection("notifications")}
                  >
                    Notifications
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Alarm Type <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-3 py-2.5 border ${errors.type
                              ? "border-red-500 ring-1 ring-red-500"
                              : "border-gray-300 dark:border-gray-600"
                              } rounded-lg shadow-sm focus:outline-none transition-colors text-gray-900 dark:text-white dark:bg-gray-700`}
                          >
                            <option value="">Select Alarm Type</option>
                            {alarmTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            {formData.type ? (
                              <AlarmTypeIcon type={formData.type} />
                            ) : (
                              <AlertTriangle size={18} className="text-gray-400" />
                            )}
                          </div>
                        </div>
                        {errors.type && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-1.5 text-sm text-red-500 flex items-center"
                          >
                            <AlertTriangle size={14} className="mr-1" /> {errors.type}
                          </motion.p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Severity
                        </label>
                        <div className="flex space-x-4">
                          {["General", "Critical", "Warning"].map((severity) => (
                            <label key={severity} className="relative flex items-center">
                              <input
                                type="radio"
                                name="severityType"
                                checked={formData.severityType === severity}
                                onChange={() => handleRadioChange("severityType", severity)}
                                className="sr-only"
                              />
                              <div
                                className={`w-5 h-5 rounded-full border-2 ${formData.severityType === severity
                                  ? `${getSeverityColor(severity)} border-transparent`
                                  : "border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700"
                                  } mr-2 flex items-center justify-center transition-colors`}
                              >
                                {formData.severityType === severity && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-2 h-2 bg-white rounded-full"
                                  />
                                )}
                              </div>
                              <span
                                className={`text-sm ${formData.severityType === severity ? "text-gray-900 dark:text-gray-100 font-medium" : "text-gray-700 dark:text-gray-300"}`}
                              >
                                {severity}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Only show threshold field for types that need it */}
                      {shouldShowThreshold() && (
                        <div className="relative">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 items-center">
                            {getThresholdLabel()}
                            <span className="text-red-500 ml-1">*</span>
                            <button
                              type="button"
                              className="ml-1.5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                              onMouseEnter={() => setShowThresholdTooltip(true)}
                              onMouseLeave={() => setShowThresholdTooltip(false)}
                            >
                              <Info className="h-4 w-4" />
                            </button>
                          </label>
                          {showThresholdTooltip && (
                            <div className="absolute z-50 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg -top-2 left-40">
                              This value sets the threshold limit for triggering the alarm (e.g., speed limit for
                              overspeeding, time duration for idle alerts)
                              <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 -left-1 top-3"></div>
                            </div>
                          )}
                          <input
                            type="text"
                            name="thresholdValue"
                            value={formData.thresholdValue}
                            onChange={handleChange}
                            placeholder={
                              formData.type === "Overspeeding"
                                ? "e.g., 80"
                                : formData.type === "Stoppage"
                                  ? "e.g., 180"
                                  : formData.type === "Continuous Driving"
                                    ? "e.g., 4"
                                    : ""
                            }
                            className={`w-full px-3 py-2.5 border ${errors.thresholdValue
                              ? "border-red-500 ring-1 ring-red-500"
                              : "border-gray-300 dark:border-gray-600"
                              } rounded-lg shadow-sm focus:outline-none text-gray-900 dark:text-white dark:bg-gray-700`}
                          />
                          {errors.thresholdValue && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="mt-1.5 text-sm text-red-500 flex items-center"
                            >
                              <AlertTriangle size={14} className="mr-1" /> {errors.thresholdValue}
                            </motion.p>
                          )}
                        </div>
                      )}

                      {/* Rest Duration for Continuous Driving */}
                      {formData.type === "Continuous Driving" && (
                        <div className="relative">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 items-center">
                            Rest Duration (minutes) <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="number"
                            name="restDuration"
                            value={formData.restDuration || ""}
                            onChange={handleChange}
                            placeholder="e.g., 30"
                            className={`w-full px-3 py-2.5 border ${errors.restDuration
                              ? "border-red-500 ring-1 ring-red-500"
                              : "border-gray-300 dark:border-gray-600"
                              } rounded-lg shadow-sm focus:outline-none text-gray-900 dark:text-white dark:bg-gray-700`}
                          />
                          {errors.restDuration && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="mt-1.5 text-sm text-red-500 flex items-center"
                            >
                              <AlertTriangle size={14} className="mr-1" /> {errors.restDuration}
                            </motion.p>
                          )}
                        </div>
                      )}

                      {/* Geofence Status (In/Out/Both) */}
                      {formData.type === "Geofence" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Geofence Status
                          </label>
                          <div className="flex space-x-4">
                            {["In", "Out", "Both"].map((status) => (
                              <label key={status} className="relative flex items-center">
                                <input
                                  type="radio"
                                  name="geofenceStatus"
                                  checked={formData.geofenceStatus === status}
                                  onChange={() => handleRadioChange("geofenceStatus", status)}
                                  className="sr-only"
                                />
                                <div
                                  className={`w-5 h-5 rounded-full border-2 ${formData.geofenceStatus === status
                                    ? "bg-blue-600 border-transparent"
                                    : "border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700"
                                    } mr-2 flex items-center justify-center transition-colors`}
                                >
                                  {formData.geofenceStatus === status && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="w-2 h-2 bg-white rounded-full"
                                    />
                                  )}
                                </div>
                                <span
                                  className={`text-sm ${formData.geofenceStatus === status ? "text-gray-900 dark:text-gray-100 font-medium" : "text-gray-700 dark:text-gray-300"}`}
                                >
                                  {status}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Alarm Generation
                        </label>
                        <div className="flex space-x-4">
                          <label className="relative flex items-center">
                            <input
                              type="radio"
                              name="alarmGeneration"
                              checked={formData.alarmGeneration === "Always"}
                              onChange={() => handleRadioChange("alarmGeneration", "Always")}
                              className="sr-only"
                            />
                            <div
                              className={`w-5 h-5 rounded-full border-2 ${formData.alarmGeneration === "Always"
                                ? "bg-blue-600 border-transparent"
                                : "border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700"
                                } mr-2 flex items-center justify-center transition-colors`}
                            >
                              {formData.alarmGeneration === "Always" && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-2 h-2 bg-white rounded-full"
                                />
                              )}
                            </div>
                            <span
                              className={`text-sm ${formData.alarmGeneration === "Always" ? "text-gray-900 dark:text-gray-100 font-medium" : "text-gray-700 dark:text-gray-300"}`}
                            >
                              Always
                            </span>
                          </label>
                          <label className="relative flex items-center">
                            <input
                              type="radio"
                              name="alarmGeneration"
                              checked={formData.alarmGeneration === "Conditional"}
                              onChange={() => handleRadioChange("alarmGeneration", "Conditional")}
                              className="sr-only"
                            />
                            <div
                              className={`w-5 h-5 rounded-full border-2 ${formData.alarmGeneration === "Conditional"
                                ? "bg-blue-600 border-transparent"
                                : "border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700"
                                } mr-2 flex items-center justify-center transition-colors`}
                            >
                              {formData.alarmGeneration === "Conditional" && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-2 h-2 bg-white rounded-full"
                                />
                              )}
                            </div>
                            <span
                              className={`text-sm ${formData.alarmGeneration === "Conditional" ? "text-gray-900 dark:text-gray-100 font-medium" : "text-gray-700 dark:text-gray-300"}`}
                            >
                              Conditional
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Conditional Alarm Settings */}
                      <AnimatePresence>
                        {formData.alarmGeneration === "Conditional" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700"
                          >
                            <div>
                              <label className="inline-flex items-center">
                                <div className="relative flex items-center">
                                  <input
                                    type="checkbox"
                                    name="activeTrip"
                                    checked={formData.activeTrip}
                                    onChange={(e) => handleChange(e)}
                                    className="sr-only"
                                  />
                                  <div
                                    className={`w-10 h-5 rounded-full transition-colors ${formData.activeTrip ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                                      }`}
                                  >
                                    <motion.div
                                      initial={false}
                                      animate={{
                                        x: formData.activeTrip ? 21 : 2,
                                        backgroundColor: formData.activeTrip ? "#ffffff" : "#ffffff",
                                      }}
                                      transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                      className="w-4 h-4 rounded-full bg-white shadow-md absolute top-0.5"
                                    />
                                  </div>
                                </div>
                                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Active Trip Only</span>
                              </label>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Start Time
                                </label>
                                <input
                                  type="time"
                                  name="activeStartTimeRange"
                                  value={formData.activeStartTimeRange || ""}
                                  onChange={handleChange}
                                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none text-gray-900 dark:text-white dark:bg-gray-700"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  End Time
                                </label>
                                <input
                                  type="time"
                                  name="activeEndTimeRange"
                                  value={formData.activeEndTimeRange || ""}
                                  onChange={handleChange}
                                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none text-gray-900 dark:text-white dark:bg-gray-700"
                                />
                              </div>
                            </div>
                            {errors.activeTimeRange && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-1.5 text-sm text-red-500 flex items-center"
                              >
                                <AlertTriangle size={14} className="mr-1" /> {errors.activeTimeRange}
                              </motion.p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Alarm Status
                        </label>
                        <div className="flex space-x-4">
                          <label className="relative flex items-center">
                            <input
                              type="radio"
                              name="status"
                              checked={formData.status === "Active"}
                              onChange={() => handleRadioChange("status", "Active")}
                              className="sr-only"
                            />
                            <div
                              className={`w-5 h-5 rounded-full border-2 ${formData.status === "Active"
                                ? "bg-green-600 border-transparent"
                                : "border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700"
                                } mr-2 flex items-center justify-center transition-colors`}
                            >
                              {formData.status === "Active" && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-2 h-2 bg-white rounded-full"
                                />
                              )}
                            </div>
                            <span
                              className={`text-sm flex items-center ${formData.status === "Active" ? "text-gray-900 dark:text-gray-100 font-medium" : "text-gray-700 dark:text-gray-300"}`}
                            >
                              <CheckCircle className="h-4 w-4 mr-1 text-green-500" /> Active
                            </span>
                          </label>
                          <label className="relative flex items-center">
                            <input
                              type="radio"
                              name="status"
                              checked={formData.status === "Inactive"}
                              onChange={() => handleRadioChange("status", "Inactive")}
                              className="sr-only"
                            />
                            <div
                              className={`w-5 h-5 rounded-full border-2 ${formData.status === "Inactive"
                                ? "bg-red-600 border-transparent"
                                : "border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700"
                                } mr-2 flex items-center justify-center transition-colors`}
                            >
                              {formData.status === "Inactive" && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-2 h-2 bg-white rounded-full"
                                />
                              )}
                            </div>
                            <span
                              className={`text-sm flex items-center ${formData.status === "Inactive" ? "text-gray-900 dark:text-gray-100 font-medium" : "text-gray-700 dark:text-gray-300"}`}
                            >
                              <XCircle className="h-4 w-4 mr-1 text-red-500" /> Inactive
                            </span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows={3}
                          className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none text-gray-900 dark:text-white dark:bg-gray-700"
                          placeholder="Enter alarm description"
                        />
                      </div>
                    </motion.div>
                  )}

                  {activeSection === "groups" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div>
                        {/* <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Group Selection</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                          Select the groups that this alarm will be applied to. At least one vehicle group is required.
                        </p> */}

                        <div className="space-y-6">
                          <div>
                            <GroupSelection
                              title="Vehicle Groups"
                              groups={availableVehicleGroups}
                              selectedGroups={formData.vehicleGroups || []}
                              onChange={handleVehicleGroupsChange}
                              nameField="name"
                              idField="id"
                            />
                            {errors.vehicleGroups && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-1.5 text-sm text-red-500 flex items-center"
                              >
                                <AlertTriangle size={14} className="mr-1" /> {errors.vehicleGroups}
                              </motion.p>
                            )}
                          </div>

                          <div>
                            <GroupSelection
                              title="Customer Groups"
                              groups={availableCustomerGroups}
                              selectedGroups={formData.customerGroups || []}
                              onChange={handleCustomerGroupsChange}
                              nameField="group_name"
                              idField="id"
                            />
                          </div>

                          {formData.type === "Geofence" && (
                            <div>
                              <GroupSelection
                                title="Geofence Groups"
                                groups={availableGeofenceGroups}
                                selectedGroups={formData.geofenceGroups || []}
                                onChange={handleGeofenceGroupsChange}
                                nameField="geo_group"
                                idField="id"
                              />
                              {errors.geofenceGroups && (
                                <motion.p
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  className="mt-1.5 text-sm text-red-500 flex items-center"
                                >
                                  <AlertTriangle size={14} className="mr-1" /> {errors.geofenceGroups}
                                </motion.p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeSection === "notifications" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div>
                        {/* <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                          Notification Settings
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                          Configure who will receive notifications when this alarm is triggered.
                        </p> */}

                        <NotificationSelection
                          users={availableUsers}
                          selectedEmails={formData.emails || []}
                          selectedPhoneNumbers={formData.phoneNumbers || []}
                          onEmailsChange={handleEmailsChange}
                          onPhoneNumbersChange={handlePhoneNumbersChange}
                          customEmails={customEmails}
                          customPhoneNumbers={customPhoneNumbers}
                          onCustomEmailsChange={setCustomEmails}
                          onCustomPhoneNumbersChange={setCustomPhoneNumbers}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex flex-row justify-between rounded-b-xl border-t border-gray-200 dark:border-gray-700 sticky bottom-0 space-y-0 space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleResetClick()
                      setErrors({}) // <-- Clear errors on reset
                    }}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors"
                  >
                    Reset
                  </button>
                  <div className="flex flex-row space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose()
                        setErrors({}) // <-- Clear errors on cancel
                      }}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="px-4 py-1.5 sm:px-5 sm:py-2 border border-transparent rounded-lg shadow-sm sm:text-sm font-medium text-white bg-black dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editAlarm ? "Update" : "Create"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
      {Toaster}
    </>
  )
}
