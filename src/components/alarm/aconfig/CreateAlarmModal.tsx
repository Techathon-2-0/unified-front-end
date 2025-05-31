import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Plus,
  Info,
  AlertTriangle,
  MapPin,
  Clock,
  Wifi,
  Truck,
  Navigation,
  Satellite,
  PenToolIcon as Tool,
} from "lucide-react"

import type { Alarm, CreateAlarmModalProps } from "../../../types/alarm/aconfig"
import { initialGeofenceData } from "../../../data/geofence/gconfig"
import { useToast } from "@/hooks/use-toast"


export const CreateAlarmModal = ({
  isOpen,
  onClose,
  onSave,
  editAlarm = null,
  availableGroups,
}: CreateAlarmModalProps) => {
  const [formData, setFormData] = useState<Partial<Alarm>>({
    type: "",
    alarmCategory: "",
    severityType: "General",
    alarmGeneration: "Always",
    enableGeofence: false,
    selectedGeofence: "",
    groups: [],
    email: "",
    sms: "",
    webhook: "",
    description: "",
    thresholdValue: "",
  })

  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showThresholdTooltip, setShowThresholdTooltip] = useState(false)
  const [activeSection, setActiveSection] = useState<string>("basic")
  const { showSuccessToast, showErrorToast, Toaster } = useToast({ position: "top-right",});

  useEffect(() => {
    if (editAlarm) {
      setFormData({
        ...editAlarm,
      })
      setSelectedGroups(editAlarm.groups || [])
    } else {
      resetForm()
    }
  }, [editAlarm, isOpen])

  const resetForm = (showToastMessage = false) => {
    try {
      setFormData({
        type: "",
        alarmCategory: "",
        severityType: "General",
        alarmGeneration: "Always",
        enableGeofence: false,
        selectedGeofence: "",
        groups: [],
        email: "",
        sms: "",
        webhook: "",
        description: "",
        thresholdValue: "",
      })
      setSelectedGroups([])
      setErrors({})
      setActiveSection("basic")

      // Only show toast when explicitly requested (user action)
      if (showToastMessage) {
        showSuccessToast("Form Reset", "All form fields have been reset successfully")
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

  // Usage examples:
  // For user clicking reset button: onClick={handleResetClick}
  // For internal/initialization calls: resetForm() or resetForm(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        // Reset selected geofence when disabling geofence
        ...(name === "enableGeofence" && !checked ? { selectedGeofence: "" } : {})
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

  const toggleGroup = (group: string) => {
    setSelectedGroups((prev) => {
      const newGroups = prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]

      setFormData((prevData) => ({
        ...prevData,
        groups: newGroups,
      }))

      return newGroups
    })
  }

  const handleSubmit = () => {
    // Validate form
    const newErrors: Record<string, string> = {}

    if (!formData.type) {
      newErrors.type = "Alarm type is required"
    }

    if (!formData.alarmCategory) {
      newErrors.alarmCategory = "Type is required"
    }

    if (selectedGroups.length === 0) {
      newErrors.groups = "At least one group must be selected"
    }

    if (formData.enableGeofence && !formData.selectedGeofence) {
      newErrors.selectedGeofence = "Please select a geofence when geofence is enabled"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave({
      ...formData,
      groups: selectedGroups,
    })

    resetForm()
  }

  const alarmTypes = [
    "Overspeeding",
    "Geofence",
    "Stoppage",
    "Idle",
    "Long Halt",
    "GPRS Connectivity",
    "Continuous Driving",
    "Driving",
    "GPS Connectivity",
    "Tampered Device",
  ]

  const alarmCategories = ["Route Start", "Route End", "Stop Point"]

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
      case "Idle":
        return "Idle Time (minutes)"
      case "Long Halt":
        return "Halt Duration (hours)"
      case "Continuous Driving":
        return "Driving Duration (hours)"
      default:
        return "Threshold Value"
    }
  }

  const getAlarmTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "overspeeding":
        return <AlertTriangle size={18} className="text-amber-500" />
      case "geofence":
        return <MapPin size={18} className="text-purple-500" />
      case "stoppage":
        return <Clock size={18} className="text-red-500" />
      case "idle":
        return <Clock size={18} className="text-blue-500" />
      case "gprs connectivity":
        return <Wifi size={18} className="text-green-500" />
      case "continuous driving":
        return <Truck size={18} className="text-orange-500" />
      case "driving":
        return <Navigation size={18} className="text-cyan-500" />
      case "gps connectivity":
        return <Satellite size={18} className="text-teal-500" />
      case "tampered device":
        return <Tool size={18} className="text-rose-500" />
      default:
        return <AlertTriangle size={18} className="text-gray-500" />
    }
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
              className="fixed inset-0 bg-black/50 bg-opacity-50 "
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={onClose}
            />

            <div className="flex items-center justify-center min-h-screen p-4">
              <motion.div
                className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden relative"
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
                    <h2 className="text-2xl font-bold tracking-tight">{editAlarm ? "Edit Alarm" : "Create New Alarm"}</h2>
                    <p className="text-white text-sm mt-1 opacity-90">Configure alarm settings and notifications</p>
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
                    className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeSection === "basic"
                        ? "text-black border-b-2 border-black"
                        : "text-gray-500 hover:text-gray-700"
                      }`}
                    onClick={() => setActiveSection("basic")}
                  >
                    Basic Settings
                    {errors.type || errors.alarmCategory || errors.selectedGeofence ? (
                      <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
                    ) : null}
                  </button>
                  <button
                    className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeSection === "groups"
                        ? "text-black border-b-2 border-black"
                        : "text-gray-500 hover:text-gray-700"
                      }`}
                    onClick={() => setActiveSection("groups")}
                  >
                    Group Selection
                    {errors.groups ? (
                      <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
                    ) : null}
                  </button>
                  <button
                    className={`px-6 py-3 text-sm font-medium transition-colors ${activeSection === "notifications"
                        ? "text-black border-b-2 border-black"
                        : "text-gray-500 hover:text-gray-700"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Alarm Type <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-3 py-2.5 border ${errors.type ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                              } rounded-lg shadow-sm focus:outline-none transition-colors text-gray-900`}
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
                              getAlarmTypeIcon(formData.type)
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="alarmCategory"
                          value={formData.alarmCategory}
                          onChange={handleChange}
                          className={`w-full px-3 py-2.5 border ${errors.alarmCategory ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                            } rounded-lg shadow-sm focus:outline-none transition-colors text-gray-900`}
                        >
                          <option value="">Select Type</option>
                          {alarmCategories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                        {errors.alarmCategory && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-1.5 text-sm text-red-500 flex items-center"
                          >
                            <AlertTriangle size={14} className="mr-1" /> {errors.alarmCategory}
                          </motion.p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
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
                                    : "border-gray-300 bg-white"
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
                                className={`text-sm ${formData.severityType === severity ? "text-gray-900 font-medium" : "text-gray-700"}`}
                              >
                                {severity}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          {getThresholdLabel()}
                          <button
                            type="button"
                            className="ml-1.5 text-gray-400 hover:text-gray-500 focus:outline-none"
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
                              : formData.type === "Idle"
                                ? "e.g., 180"
                                : formData.type === "Long Halt"
                                  ? "e.g., 8"
                                  : formData.type === "Continuous Driving"
                                    ? "e.g., 4"
                                    : ""
                          }
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Alarm Generation</label>
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
                                  : "border-gray-300 bg-white"
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
                              className={`text-sm ${formData.alarmGeneration === "Always" ? "text-gray-900 font-medium" : "text-gray-700"}`}
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
                                  : "border-gray-300 bg-white"
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
                              className={`text-sm ${formData.alarmGeneration === "Conditional" ? "text-gray-900 font-medium" : "text-gray-700"}`}
                            >
                              Conditional
                            </span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="inline-flex items-center">
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              name="enableGeofence"
                              checked={formData.enableGeofence}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            <div
                              className={`w-10 h-5 rounded-full transition-colors ${formData.enableGeofence ? "bg-blue-600" : "bg-gray-300"
                                }`}
                            >
                              <motion.div
                                initial={false}
                                animate={{
                                  x: formData.enableGeofence ? 20 : 2,
                                  backgroundColor: formData.enableGeofence ? "#ffffff" : "#ffffff",
                                }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className="w-4 h-4 rounded-full bg-white shadow-md absolute top-0.5"
                              />
                            </div>
                          </div>
                          <span className="ml-3 text-sm text-gray-700">Enable Geofence</span>
                        </label>
                      </div>

                      {/* Geofence Selection - Only show when geofence is enabled */}
                      <AnimatePresence>
                        {formData.enableGeofence && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Geofence <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <select
                                  name="selectedGeofence"
                                  value={formData.selectedGeofence}
                                  onChange={handleChange}
                                  className={`w-full pl-10 pr-3 py-2.5 border ${errors.selectedGeofence ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                                    } rounded-lg shadow-sm focus:outline-none transition-colors text-gray-900`}
                                >
                                  <option value="">Select Geofence</option>
                                  {initialGeofenceData.map((geofence) => (
                                    <option key={geofence.id} value={geofence.name}>
                                      {geofence.name}
                                    </option>
                                  ))}
                                </select>
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                  <MapPin size={18} className="text-purple-500" />
                                </div>
                              </div>
                              {errors.selectedGeofence && (
                                <motion.p
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  className="mt-1.5 text-sm text-red-500 flex items-center"
                                >
                                  <AlertTriangle size={14} className="mr-1" /> {errors.selectedGeofence}
                                </motion.p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows={3}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none text-gray-900"
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
                      className="space-y-5"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Group Selection <span className="text-red-500">*</span>
                        </label>
                        <div className="border border-gray-300 rounded-lg p-4 min-h-[120px] bg-gray-50">
                          <div className="flex flex-wrap gap-2 mb-3">
                            {selectedGroups.map((group) => (
                              <motion.div
                                key={group}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm flex items-center border border-blue-200 shadow-sm"
                              >
                                {group}
                                <button
                                  onClick={() => toggleGroup(group)}
                                  className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </motion.div>
                            ))}
                            {selectedGroups.length === 0 && (
                              <div className="text-sm text-gray-500 italic">No groups selected</div>
                            )}
                          </div>
                          <div className="mt-3">
                            <select
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  toggleGroup(e.target.value)
                                  e.target.value = ""
                                }
                              }}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none transition-colors text-gray-900"
                            >
                              <option value="">Select Group</option>
                              {availableGroups
                                .filter((group) => !selectedGroups.includes(group))
                                .map((group) => (
                                  <option key={group} value={group}>
                                    {group}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>
                        {errors.groups && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-1.5 text-sm text-red-500 flex items-center"
                          >
                            <AlertTriangle size={14} className="mr-1" /> {errors.groups}
                          </motion.p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {activeSection === "notifications" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-5"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Notification</label>
                        <select
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none text-gray-900"
                        >
                          <option value="">Select Email</option>
                          <option value="admin@example.com">admin@example.com</option>
                          <option value="alerts@example.com">alerts@example.com</option>
                          <option value="support@example.com">support@example.com</option>
                        </select>
                      </div>

                      {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SMS Notification</label>
                      <select
                        name="sms"
                        value={formData.sms}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none text-gray-900"
                      >
                        <option value="">Select SMS</option>
                        <option value="+1234567890">+1234567890</option>
                        <option value="+9876543210">+9876543210</option>
                      </select>
                    </div> */}

                      {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SMS Notification</label>
                      <select
                        name="sms"
                        value={formData.sms}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none text-gray-900"
                      >
                        <option value="">Select SMS</option>
                        <option value="+1234567890">+1234567890</option>
                        <option value="+9876543210">+9876543210</option>
                      </select>
                    </div> */}

                      {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Webhook</label>
                      <select
                        name="webhook"
                        value={formData.webhook}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none text-gray-900"
                      >
                        <option value="">Select Webhook</option>
                        <option value="https://example.com/webhook1">https://example.com/webhook1</option>
                        <option value="https://example.com/webhook2">https://example.com/webhook2</option>
                      </select>
                    </div> */}

                      {/* <div className="flex items-center mt-2">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Webhook
                      </button>
                    </div> */}
                    </motion.div>
                  )}
                </div>

                <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row justify-between rounded-b-xl border-t border-gray-200 sticky bottom-0">
                  <button
                    type="button"
                    onClick={handleResetClick}
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
                      onClick={handleSubmit}
                      className="px-5 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none transition-colors"
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