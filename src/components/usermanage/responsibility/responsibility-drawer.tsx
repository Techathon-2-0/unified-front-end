import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X, Users } from "lucide-react"
import type { Responsibility } from "../../../types/usermanage/responsibilty_type"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { FeatureSection, ResponsibilityModalProps } from "../../../types/usermanage/responsibilty_type"
import { availableReports } from "../../../data/usermanage/responsibility"
import { useToast } from "@/hooks/use-toast"

export function ResponsibilityModal({ open, onClose, responsibility, onSave }: ResponsibilityModalProps) {
  const [name, setName] = useState(responsibility?.role_name || "")
  const [activeCategory, setActiveCategory] = useState("reports")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeSection, setActiveSection] = useState<string>("basic")
  const { showSuccessToast, showErrorToast, Toaster } = useToast({ position: "top-right" })

  // Initialize feature sections with dynamic reports
  const [featureSections, setFeatureSections] = useState<FeatureSection[]>([
    {
      id: "reports",
      name: "Reports",
      features: availableReports.map((report) => ({
        id: report.toLowerCase().replace(/\s+/g, "-"),
        name: report,
        checked: false,
      })),
    },
  ])

  // Initialize tabs access state
  const [tabsAccess, setTabsAccess] = useState({
    dashboard: false,
    tripDashboard: false,
    listMapView: false,
    trail: false,
    reports: {
      allReports: "none" as "view" | "both" | "none",
      scheduleReport: "none" as "view" | "both" | "none",
    },
    alarm: "none" as "view" | "both" | "none",
    geofence: {
      config: "none" as "view" | "both" | "none",
      group: "none" as "view" | "both" | "none",
      stats: "none" as "view" | "both" | "none",
    },
    userManagement: {
      responsibilities: "none" as "view" | "both" | "none",
      user: "none" as "view" | "both" | "none",
    },
    manage: {
      entities: "none" as "view" | "both" | "none",
      group: "none" as "view" | "both" | "none",
      vendors: "none" as "view" | "both" | "none",
      customer: "none" as "view" | "both" | "none",
    },
  })

  // Convert backend format to frontend format
  const convertBackendToFrontend = (responsibility: Responsibility) => {
    const newTabsAccess = { ...tabsAccess }
    console.log("abhi abhi ", responsibility.report_access)
    responsibility.tabs_access.forEach((tabObj) => {
      const [key, value] = Object.entries(tabObj)[0]

      switch (key) {
        case "dashboard":
          newTabsAccess.dashboard = value === 1
          break
        case "trip_dashboard":
          newTabsAccess.tripDashboard = value === 1
          break
        case "list_map":
          newTabsAccess.listMapView = value === 1
          break
        case "trail":
          newTabsAccess.trail = value === 1
          break
        case "report":
          newTabsAccess.reports.allReports = value === 1 ? "view" : value === 2 ? "both" : "none"
          break
        case "schedule_report":
          newTabsAccess.reports.scheduleReport = value === 1 ? "view" : value === 2 ? "both" : "none"
          break
        case "alarm":
          newTabsAccess.alarm = value === 1 ? "view" : value === 2 ? "both" : "none"
          break
        case "geofence_config":
          newTabsAccess.geofence.config = value === 1 ? "view" : value === 2 ? "both" : "none"
          break
        case "geofence_group":
          newTabsAccess.geofence.group = value === 1 ? "view" : value === 2 ? "both" : "none"
          break
        case "geofence_stats":
          newTabsAccess.geofence.stats = value === 1 ? "view" : value === 2 ? "both" : "none"
          break
        case "user_reponsibility":
          newTabsAccess.userManagement.responsibilities = value === 1 ? "view" : value === 2 ? "both" : "none"
          break
        case "user_access":
          newTabsAccess.userManagement.user = value === 1 ? "view" : value === 2 ? "both" : "none"
          break
        case "entities":
          newTabsAccess.manage.entities = value === 1 ? "view" : value === 2 ? "both" : "none"
          break
        case "group":
          newTabsAccess.manage.group = value === 1 ? "view" : value === 2 ? "both" : "none"
          break
        case "vendors":
          newTabsAccess.manage.vendors = value === 1 ? "view" : value === 2 ? "both" : "none"
          break
        case "customer":
          newTabsAccess.manage.customer = value === 1 ? "view" : value === 2 ? "both" : "none"
          break
      }
    })

    setTabsAccess(newTabsAccess)

    // Set selected reports
    const updatedSections = featureSections.map((section) => ({
      ...section,
      features: section.features.map((feature) => ({
        ...feature,
        checked: responsibility.report_access.includes(feature.name),
      })),
    }))
    setFeatureSections(updatedSections)
  }

  // Convert frontend format to backend format
  const convertFrontendToBackend = (): { tabs_access: Array<Record<string, number>>; report_access: string[] } => {
    const tabs_access: Array<Record<string, number>> = []

    if (tabsAccess.dashboard) tabs_access.push({ dashboard: 1 })
    if (tabsAccess.tripDashboard) tabs_access.push({ trip_dashboard: 1 })
    if (tabsAccess.listMapView) tabs_access.push({ list_map: 1 })
    if (tabsAccess.trail) tabs_access.push({ trail: 1 })

    if (tabsAccess.reports.allReports !== "none") {
      tabs_access.push({ report: tabsAccess.reports.allReports === "view" ? 1 : 2 })
    }
    if (tabsAccess.reports.scheduleReport !== "none") {
      tabs_access.push({ schedule_report: tabsAccess.reports.scheduleReport === "view" ? 1 : 2 })
    }
    if (tabsAccess.alarm !== "none") {
      tabs_access.push({ alarm: tabsAccess.alarm === "view" ? 1 : 2 })
    }
    if (tabsAccess.geofence.config !== "none") {
      tabs_access.push({ geofence_config: tabsAccess.geofence.config === "view" ? 1 : 2 })
    }
    if (tabsAccess.geofence.group !== "none") {
      tabs_access.push({ geofence_group: tabsAccess.geofence.group === "view" ? 1 : 2 })
    }
    if (tabsAccess.geofence.stats !== "none") {
      tabs_access.push({ geofence_stats: tabsAccess.geofence.stats === "view" ? 1 : 2 })
    }
    if (tabsAccess.userManagement.responsibilities !== "none") {
      tabs_access.push({ user_reponsibility: tabsAccess.userManagement.responsibilities === "view" ? 1 : 2 })
    }
    if (tabsAccess.userManagement.user !== "none") {
      tabs_access.push({ user_access: tabsAccess.userManagement.user === "view" ? 1 : 2 })
    }
    if (tabsAccess.manage.entities !== "none") {
      tabs_access.push({ entities: tabsAccess.manage.entities === "view" ? 1 : 2 })
    }
    if (tabsAccess.manage.group !== "none") {
      tabs_access.push({ group: tabsAccess.manage.group === "view" ? 1 : 2 })
    }
    if (tabsAccess.manage.vendors !== "none") {
      tabs_access.push({ vendors: tabsAccess.manage.vendors === "view" ? 1 : 2 })
    }
    if (tabsAccess.manage.customer !== "none") {
      tabs_access.push({ customer: tabsAccess.manage.customer === "view" ? 1 : 2 })
    }

    let report_access = featureSections[0].features.filter((feature) => feature.checked).map((feature) => feature.name)
    if (tabsAccess.reports.allReports == "none") {
      report_access = []
    }
    return { tabs_access, report_access }
  }

  // Reset form when responsibility changes
  useEffect(() => {
    setName(responsibility?.role_name || "")
    setErrors({})
    setActiveSection("basic")

    if (responsibility) {
      convertBackendToFrontend(responsibility)
    } else {
      // Reset for new responsibility
      setTabsAccess({
        dashboard: false,
        tripDashboard: false,
        listMapView: false,
        trail: false,
        reports: {
          allReports: "none",
          scheduleReport: "none",
        },
        alarm: "none",
        geofence: {
          config: "none",
          group: "none",
          stats: "none",
        },
        userManagement: {
          responsibilities: "none",
          user: "none",
        },
        manage: {
          entities: "none",
          group: "none",
          vendors: "none",
          customer: "none",
        },
      })

      const resetSections = featureSections.map((section) => ({
        ...section,
        features: section.features.map((feature) => ({
          ...feature,
          checked: false,
        })),
      }))
      setFeatureSections(resetSections)
    }
  }, [responsibility, open])

  // Calculate feature counts
  const getReportsCount = () => {
    return featureSections[0].features.filter((f) => f.checked).length
  }

  const getTabsAccessCount = () => {
    const { tabs_access } = convertFrontendToBackend()
    return tabs_access.length
  }

  const getTotalFeatureCount = () => {
    return getReportsCount() + getTabsAccessCount()
  }

  // Check if reports are enabled
  const isReportsEnabled = () => {
    return tabsAccess.reports.allReports !== "none"
  }

  // Reset form function
  const resetForm = () => {
    try {
      setName("")
      setActiveCategory("reports")
      setActiveSection("basic")
      setErrors({})
      setTabsAccess({
        dashboard: false,
        tripDashboard: false,
        listMapView: false,
        trail: false,
        reports: {
          allReports: "none",
          scheduleReport: "none",
        },
        alarm: "none",
        geofence: {
          config: "none",
          group: "none",
          stats: "none",
        },
        userManagement: {
          responsibilities: "none",
          user: "none",
        },
        manage: {
          entities: "none",
          group: "none",
          vendors: "none",
          customer: "none",
        },
      })
      const resetSections = featureSections.map((section) => ({
        ...section,
        features: section.features.map((feature) => ({
          ...feature,
          checked: false,
        })),
      }))
      setFeatureSections(resetSections)

      // Show success toast
      showSuccessToast("Form Reset", "All form fields have been reset successfully")
    } catch (error) {
      // Show error toast if something goes wrong
      showErrorToast("Failed to reset form", "")
    }
  }

  const handleSelectAll = (checked: boolean) => {
    setFeatureSections(
      featureSections.map((section) => {
        if (section.id === activeCategory) {
          return {
            ...section,
            features: section.features.map((feature) => ({
              ...feature,
              checked,
            })),
          }
        }
        return section
      }),
    )
  }

  const handleFeatureChange = (featureId: string, checked: boolean) => {
    setFeatureSections(
      featureSections.map((section) => {
        if (section.id === activeCategory) {
          return {
            ...section,
            features: section.features.map((feature) => {
              if (feature.id === featureId) {
                return {
                  ...feature,
                  checked,
                }
              }
              return feature
            }),
          }
        }
        return section
      }),
    )
  }

  const handleSubmit = () => {
    // Validate form
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = "Profile name is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const { tabs_access, report_access } = convertFrontendToBackend()

    // Create updated or new responsibility object
    const updatedResponsibility: Responsibility = {
      id: responsibility?.id || 0, // Will be set by backend for new ones
      role_name: name,
      created_at: responsibility?.created_at || "", // Backend will handle timestamps
      updated_at: "", // Backend will handle timestamps
      tabs_access,
      report_access,
    }
    console.log("Submitting responsibility:")
    onSave(updatedResponsibility)
    resetForm()
  }

  const activeFeatureSection = featureSections.find((section) => section.id === activeCategory) || featureSections[0]

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

  // Add isFormValid function
  const isFormValid = () => {
    return name.trim() !== ""
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <motion.div
            className="fixed inset-0 bg-black/50  dark:bg-black/70  bg-opacity-50"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          <div className="flex items-center justify-center min-h-screen p-4">
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden relative"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-black via-gray-900 to-gray-800 text-white px-8 py-6 flex justify-between items-center rounded-t-xl relative overflow-hidden dark:bg-gradient-to-r dark:from-black dark:via-gray-900 dark:to-gray-800">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]"></div>
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-600 rounded-full opacity-20 blur-3xl"></div>

                <div className="relative">
                  <h2 className="text-2xl font-bold tracking-tight">
                    {responsibility ? "Edit Profile" : "Create New Profile"}
                  </h2>
                  <p className="text-white text-sm mt-1 opacity-90">Configure access permissions and features</p>
                </div>

                <button
                  onClick={onClose}
                  className="relative text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Tab navigation */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeSection === "basic"
                    ? "text-black dark:text-white border-b-2 border-black dark:border-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  onClick={() => setActiveSection("basic")}
                >
                  Basic Settings
                  {errors.name ? (
                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
                  ) : null}
                </button>
                <button
                  className={`px-6 py-3 text-sm font-medium transition-colors ${activeSection === "tabsAccess"
                    ? "text-black dark:text-white border-b-2 border-black dark:border-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  onClick={() => setActiveSection("tabsAccess")}
                >
                  Tabs Access
                </button>
                {isReportsEnabled() && (
                  <button
                    className={`px-6 py-3 text-sm font-medium transition-colors ${activeSection === "categories"
                      ? "text-black dark:text-white border-b-2 border-black dark:border-white"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    onClick={() => setActiveSection("categories")}
                  >
                    Access Categories
                  </button>
                )}
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)] pb-20 sm:pb-6 bg-white dark:bg-gray-900">
                {activeSection === "basic" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-5"
                  >
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-1 flex items-center">
                        Profile Name <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <div className="relative">
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
                          placeholder="Enter profile name"
                          className={`pl-10 ${errors.name ? "border-red-500 ring-1 ring-red-500" : ""
                            } w-full rounded-md`}
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <Users size={18} />
                        </div>
                      </div>
                      {errors.name && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-1.5 text-sm text-red-500 flex items-center"
                        >
                          <X size={14} className="mr-1" /> {errors.name}
                        </motion.p>
                      )}
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Summary</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Reports Selected:</span>
                          <span className="ml-2 font-medium text-black dark:text-white">{getReportsCount()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Tabs Access:</span>
                          <span className="ml-2 font-medium text-black dark:text-white">{getTabsAccessCount()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Total Features:</span>
                          <span className="ml-2 font-medium text-black dark:text-white">{getTotalFeatureCount()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSection === "categories" && isReportsEnabled() && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-5"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="w-full lg:w-1/4">
                        <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">Access Categories</h3>
                        <div className="space-y-1">
                          {featureSections.map((section) => (
                            <motion.button
                              key={section.id}
                              whileHover={{ backgroundColor: "rgba(79, 70, 229, 0.05)" }}
                              whileTap={{ backgroundColor: "rgba(79, 70, 229, 0.1)" }}
                              onClick={() => setActiveCategory(section.id)}
                              className={`w-full text-left px-4 py-3 rounded-lg transition-colors text-sm ${activeCategory === section.id
                                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium border border-gray-300 dark:border-gray-600"
                                : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{section.name}</span>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${activeCategory === section.id
                                    ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                    }`}
                                >
                                  {section.features.filter((f) => f.checked).length}
                                </span>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <div className="w-full lg:w-3/4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
                          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{activeFeatureSection.name}</h2>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-black dark:text-white border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200 text-xs"
                              onClick={() => handleSelectAll(true)}
                            >
                              Select All
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs"
                              onClick={() => handleSelectAll(false)}
                            >
                              Deselect All
                            </Button>
                          </div>
                        </div>

                        <ScrollArea className="h-[400px]">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {activeFeatureSection.features.map((feature) => (
                              <motion.div
                                key={feature.id}
                                whileHover={{
                                  scale: 1.02,
                                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                }}
                                className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${feature.checked
                                  ? "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600"
                                  }`}
                              >
                                <Checkbox
                                  id={`${activeCategory}-${feature.id}`}
                                  checked={feature.checked}
                                  onCheckedChange={(checked) => handleFeatureChange(feature.id, checked === true)}
                                  className="text-black dark:text-white rounded-sm"
                                />
                                <Label
                                  htmlFor={`${activeCategory}-${feature.id}`}
                                  className="font-medium cursor-pointer text-gray-800 dark:text-gray-200 text-sm flex-1"
                                >
                                  {feature.name}
                                </Label>
                              </motion.div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSection === "tabsAccess" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Tabs Access Configuration</h2>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-6">
                        {/* View Only Tabs */}
                        <div>
                          <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">View Only Tabs</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                              { key: "dashboard", label: "Dashboard" },
                              { key: "tripDashboard", label: "Trip Dashboard" },
                              { key: "listMapView", label: "List/Map View" },
                              { key: "trail", label: "Trail" },
                            ].map((tab) => (
                              <motion.div
                                key={tab.key}
                                whileHover={{ scale: 1.02 }}
                                className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${tabsAccess[tab.key as keyof typeof tabsAccess]
                                  ? "border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                                  }`}
                              >
                                <Checkbox
                                  id={`tabs-${tab.key}`}
                                  checked={tabsAccess[tab.key as keyof typeof tabsAccess] as boolean}
                                  onCheckedChange={(checked) =>
                                    setTabsAccess((prev) => ({ ...prev, [tab.key]: checked === true }))
                                  }
                                  className="text-blue-600 dark:text-blue-400 rounded-sm"
                                />
                                <Label
                                  htmlFor={`tabs-${tab.key}`}
                                  className="font-medium cursor-pointer text-gray-800 dark:text-gray-200 text-sm flex-1"
                                >
                                  {tab.label}
                                </Label>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* Reports Access */}
                        <div>
                          <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">Reports Access</h3>
                          <div className="space-y-4">
                            { [
                              { key: "allReports", label: "All Reports" },
                              { key: "scheduleReport", label: "Schedule Report" },
                            ].map((item) => (
                              <div key={item.key} className="border dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{item.label}</h4>
                                <div className="flex gap-2">
                                  {/* Remove "both" option for allReports */}
                                  {item.key === "allReports"
                                    ? [
                                      { value: "none", label: "None" },
                                      { value: "view", label: "View" },
                                    ].map((option) => (
                                      <button
                                        key={option.value}
                                        onClick={() =>
                                          setTabsAccess((prev) => ({
                                            ...prev,
                                            reports: { ...prev.reports, [item.key]: option.value as any },
                                          }))
                                        }
                                        className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                          tabsAccess.reports[item.key as keyof typeof tabsAccess.reports] === option.value
                                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600"
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                        }`}
                                      >
                                        {option.label}
                                      </button>
                                    ))
                                    : [
                                      { value: "none", label: "None" },
                                      { value: "view", label: "View" },
                                      { value: "both", label: "Both" },
                                    ].map((option) => (
                                      <button
                                        key={option.value}
                                        onClick={() =>
                                          setTabsAccess((prev) => ({
                                            ...prev,
                                            reports: { ...prev.reports, [item.key]: option.value as any },
                                          }))
                                        }
                                        className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                          tabsAccess.reports[item.key as keyof typeof tabsAccess.reports] === option.value
                                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600"
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                        }`}
                                      >
                                        {option.label}
                                      </button>
                                    ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Alarm Access */}
                        <div>
                          <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">Alarm Access</h3>
                          <div className="space-y-2">
                            {[
                              { value: "none", label: "No Access" },
                              { value: "view", label: "View Only" },
                              { value: "both", label: "View & Edit" },
                            ].map((option) => (
                              <motion.div
                                key={option.value}
                                whileHover={{ scale: 1.01 }}
                                className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${tabsAccess.alarm === option.value
                                  ? "border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20"
                                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                                  }`}
                                onClick={() => setTabsAccess((prev) => ({ ...prev, alarm: option.value as any }))}
                              >
                                <div
                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${tabsAccess.alarm === option.value
                                    ? "border-green-500 dark:border-green-400"
                                    : "border-gray-300 dark:border-gray-600"
                                    }`}
                                >
                                  {tabsAccess.alarm === option.value && (
                                    <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400"></div>
                                  )}
                                </div>
                                <Label className="font-medium cursor-pointer text-gray-800 dark:text-gray-200 text-sm flex-1">
                                  {option.label}
                                </Label>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* Geofence Access */}
                        <div>
                          <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">Geofence Access</h3>
                          <div className="space-y-4">
                            { [
                              { key: "config", label: "Config" },
                              { key: "group", label: "Group" },
                              { key: "stats", label: "Stats" },
                            ].map((item) => (
                              <div key={item.key} className="border dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{item.label}</h4>
                                <div className="flex gap-2">
                                  {/* Remove "both" option for stats */}
                                  {item.key === "stats"
                                    ? [
                                      { value: "none", label: "None" },
                                      { value: "view", label: "View" },
                                    ].map((option) => (
                                      <button
                                        key={option.value}
                                        onClick={() =>
                                          setTabsAccess((prev) => ({
                                            ...prev,
                                            geofence: { ...prev.geofence, [item.key]: option.value as any },
                                          }))
                                        }
                                        className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                          tabsAccess.geofence[item.key as keyof typeof tabsAccess.geofence] === option.value
                                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-600"
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                        }`}
                                      >
                                        {option.label}
                                      </button>
                                    ))
                                    : [
                                      { value: "none", label: "None" },
                                      { value: "view", label: "View" },
                                      { value: "both", label: "Both" },
                                    ].map((option) => (
                                      <button
                                        key={option.value}
                                        onClick={() =>
                                          setTabsAccess((prev) => ({
                                            ...prev,
                                            geofence: { ...prev.geofence, [item.key]: option.value as any },
                                          }))
                                        }
                                        className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                          tabsAccess.geofence[item.key as keyof typeof tabsAccess.geofence] === option.value
                                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-600"
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                        }`}
                                      >
                                        {option.label}
                                      </button>
                                    ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* User Management Access */}
                        <div>
                          <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">User Management Access</h3>
                          <div className="space-y-4">
                            {[
                              { key: "responsibilities", label: "Responsibilities" },
                              { key: "user", label: "User" },
                            ].map((item) => (
                              <div key={item.key} className="border dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{item.label}</h4>
                                <div className="flex gap-2">
                                  {[
                                    { value: "none", label: "None" },
                                    { value: "view", label: "View" },
                                    { value: "both", label: "Both" },
                                  ].map((option) => (
                                    <button
                                      key={option.value}
                                      onClick={() =>
                                        setTabsAccess((prev) => ({
                                          ...prev,
                                          userManagement: {
                                            ...prev.userManagement,
                                            [item.key]: option.value as any,
                                          },
                                        }))
                                      }
                                      className={`px-3 py-1 text-xs rounded-md transition-colors ${tabsAccess.userManagement[
                                        item.key as keyof typeof tabsAccess.userManagement
                                      ] === option.value
                                        ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-600"
                                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                        }`}
                                    >
                                      {option.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Manage Access */}
                        <div>
                          <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">Manage Access</h3>
                          <div className="space-y-4">
                            {[
                              { key: "entities", label: "Entities" },
                              { key: "group", label: "Group" },
                              { key: "vendors", label: "Vendors" },
                              { key: "customer", label: "Customer" },
                            ].map((item) => (
                              <div key={item.key} className="border dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{item.label}</h4>
                                <div className="flex gap-2">
                                  {[
                                    { value: "none", label: "None" },
                                    { value: "view", label: "View" },
                                    { value: "both", label: "Both" },
                                  ].map((option) => (
                                    <button
                                      key={option.value}
                                      onClick={() =>
                                        setTabsAccess((prev) => ({
                                          ...prev,
                                          manage: { ...prev.manage, [item.key]: option.value as any },
                                        }))
                                      }
                                      className={`px-3 py-1 text-xs rounded-md transition-colors ${tabsAccess.manage[item.key as keyof typeof tabsAccess.manage] === option.value
                                        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-600"
                                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                        }`}
                                    >
                                      {option.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </motion.div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 flex flex-row justify-between rounded-b-xl border-t border-gray-200 dark:border-gray-700 sticky bottom-0 space-y-0 space-x-2">
                <button
                  type="button"
                  onClick={resetForm}
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
                    onClick={handleSubmit}
                    disabled={!isFormValid()}
                    className="px-4 py-1.5 sm:px-5 sm:py-2 border border-transparent rounded-lg shadow-sm sm:text-sm font-medium text-white bg-black dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {responsibility ? "Update" : "Create"}
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
