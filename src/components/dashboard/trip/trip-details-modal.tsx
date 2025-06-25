import { motion } from "framer-motion"
import {
  X,
  RefreshCw,
  BadgeInfo,
  FileText,
  MapPin,
  User,
  Phone,
  Globe,
  Car,
  Package,
  Building,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "../../../components/formatdate"
import {
  fetchIntutrackData,
  refreshIntutrackData,
} from "../../../data/dashboard/trip"
import type { TripDetailsModalProps } from "../../../types/dashboard/trip_type"
import type { IntutrackData } from "../../../types/dashboard/trip_type"
import type { RegistrationDbResponse } from "@/types/live/list_type"
import { fetchRegistrationFromDb, refreshRegistrationDetails } from "../../../data/live/list"
import { reverseGeocode } from "../../reversegeocoding"

export function TripDetailsModal({
  open,
  onOpenChange,
  selectedTrip,
}: Omit<TripDetailsModalProps, "intutrackData" | "loadingIntutrack" | "handleRefreshIntutrack" | "getStatusColor">) {
  const [activeTab, setActiveTab] = useState<"stops" | "trip" | "registration" | "intutrack">("stops")
  const [intutrackData, setIntutrackData] = useState<IntutrackData | null>(null)
  const [loadingIntutrack, setLoadingIntutrack] = useState(false)
  const [dbData, setDbData] = useState<RegistrationDbResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasLoadedDb, setHasLoadedDb] = useState(false)
  const [currentLocationAddress, setCurrentLocationAddress] = useState<string>("")
  const [currentLocationLoading, setCurrentLocationLoading] = useState(false)

  // Always show "Stop Details" as the first section when modal opens
  useEffect(() => {
    if (open) setActiveTab("stops")
  }, [open])

  // Fetch intutrack data when details modal opens and vendor is Intugine
  useEffect(() => {
    if (open && selectedTrip?.gps_vendor === "Intugine") {
      setLoadingIntutrack(true)
      fetchIntutrackData(selectedTrip.id)
        .then((data) => setIntutrackData(data))
        .catch(() => setIntutrackData(null))
        .finally(() => setLoadingIntutrack(false))
    } else {
      setIntutrackData(null)
      setLoadingIntutrack(false)
    }
  }, [open, selectedTrip])

  const handleRefreshIntutrack = async () => {
    if (!selectedTrip) return
    setLoadingIntutrack(true)
    try {
      const data = await refreshIntutrackData(selectedTrip.id)
      setIntutrackData(data)
    } catch {
      // ignore error
    } finally {
      setLoadingIntutrack(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "on_time":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "delayed":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  // Helper to check if a date string is valid and in the future
  const getDateStatus = (dateStr?: string) => {
    if (!dateStr) return { valid: false, color: "text-gray-500", icon: null }

    let date

    // Handle different date formats
    if (dateStr.includes("-") && dateStr.split("-").length === 3) {
      // Handle formats like "30-Jan-2026" or "30-06-2026"
      const parts = dateStr.split("-")

      if (parts[1].length === 2) {
        // Format: "30-06-2026" (DD-MM-YYYY)
        const [day, month, year] = parts
        date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
      } else {
        // Format: "30-Jan-2026" (DD-MMM-YYYY)
        const monthNames = {
          Jan: 0,
          Feb: 1,
          Mar: 2,
          Apr: 3,
          May: 4,
          Jun: 5,
          Jul: 6,
          Aug: 7,
          Sep: 8,
          Oct: 9,
          Nov: 10,
          Dec: 11,
        }
        const [day, monthStr, year] = parts
        const monthIndex = monthNames[monthStr as keyof typeof monthNames]
        if (monthIndex !== undefined) {
          date = new Date(Number.parseInt(year), monthIndex, Number.parseInt(day))
        } else {
          return { valid: false, color: "text-gray-500", icon: null }
        }
      }
    } else {
      // Try to parse as standard date string
      date = new Date(dateStr)
    }

    const now = new Date()
    now.setHours(0, 0, 0, 0) // Set to start of day for accurate comparison
    date.setHours(0, 0, 0, 0) // Set to start of day for accurate comparison

    if (isNaN(date.getTime())) {
      return { valid: false, color: "text-gray-500", icon: null }
    }

    if (date >= now) {
      return {
        valid: true,
        color: "text-green-600",
        icon: <CheckCircle className="inline h-4 w-4 text-green-600 mb-0.5 mr-1" />,
      }
    } else {
      return {
        valid: false,
        color: "text-red-600",
        icon: <XCircle className="inline h-4 w-4 text-red-600 mb-0.5 mr-1" />,
      }
    }
  }

  // Fetch reverse geocoded address when Trip Details tab is opened and trip is not inactive
  useEffect(() => {
    if (
      open &&
      selectedTrip &&
      activeTab === "trip" &&
      selectedTrip.status?.toLowerCase() !== "inactive" &&
      Array.isArray(selectedTrip.current_location_coordindates) &&
      selectedTrip.current_location_coordindates.length === 2
    ) {
      setCurrentLocationLoading(true)
      reverseGeocode(
        selectedTrip.current_location_coordindates[0],
        selectedTrip.current_location_coordindates[1]
      )
        .then(addr => setCurrentLocationAddress(addr))
        .catch(() => setCurrentLocationAddress("Error retrieving address"))
        .finally(() => setCurrentLocationLoading(false))
    } else if (
      open &&
      selectedTrip &&
      activeTab === "trip" &&
      selectedTrip.status?.toLowerCase() === "inactive"
    ) {
      setCurrentLocationAddress("")
      setCurrentLocationLoading(false)
    }
  }, [open, selectedTrip, activeTab])

  // Handle tab change and load registration data if needed
  const handleTabChange = async (tab: "stops" | "trip" | "registration" | "intutrack") => {
    setActiveTab(tab)

    // Load registration data when registration tab is selected for the first time
    if (tab === "registration" && !hasLoadedDb && selectedTrip) {
      setIsLoading(true)
      setError(null)

      try {
        const data = await fetchRegistrationFromDb(selectedTrip.Vehicle_number)
        setDbData(data)
        setHasLoadedDb(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch registration data from database")
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Handle refreshing registration details
  const handleRefreshRegistration = async () => {
    if (!selectedTrip) return
    setIsRefreshing(true)
    setError(null)

    try {
      const data = await refreshRegistrationDetails(selectedTrip.Vehicle_number)
      setDbData(data)
      setHasLoadedDb(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh registration details")
    } finally {
      setIsRefreshing(false)
    }
  }

  // Render registration details content
  const renderRegistrationDetails = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading registration details...</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="p-6">
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      )
    }

    if (!dbData) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400">No registration data found</p>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Registration & Owner Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Registration Info */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
            <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              Registration Information
            </h5>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Registration Number</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {dbData.rc_regn_no || "Not Available"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Registration Date</p>
                <p className="text-sm text-gray-900 dark:text-white">{dbData.rc_regn_dt || "Not Available"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Registration Valid Until</p>
                <p className={`text-sm font-medium flex items-center ${getDateStatus(dbData.rc_regn_upto).color}`}>
                  {getDateStatus(dbData.rc_regn_upto).icon}
                  {dbData.rc_regn_upto || "Not Available"}
                </p>
              </div>
            </div>
          </div>

          {/* Owner Information */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
            <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              Owner Information
            </h5>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Owner Name</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {dbData.rc_owner_name || "Not Available"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Present Address</p>
                <p className="text-sm text-gray-900 dark:text-white leading-relaxed">
                  {dbData.rc_present_address || "Not Available"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vehicle Specifications */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
            <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              Vehicle Specifications
            </h5>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Vehicle Category</p>
                <p className="text-sm text-gray-900 dark:text-white">{dbData.rc_vch_catg_desc || "Not Available"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Vehicle Class</p>
                <p className="text-sm text-gray-900 dark:text-white">{dbData.rc_vh_class_desc || "Not Available"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Maker & Model</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {dbData.rc_maker_model || "Not Available"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Manufacturer</p>
                <p className="text-sm text-gray-900 dark:text-white">{dbData.rc_maker_desc || "Not Available"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Color</p>
                <p className="text-sm text-gray-900 dark:text-white">{dbData.rc_color || "Not Available"}</p>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
            <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              Technical Details
            </h5>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Chassis Number</p>
                <p className="text-sm font-mono text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">
                  {dbData.rc_chasi_no || "Not Available"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Engine Number</p>
                <p className="text-sm font-mono text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">
                  {dbData.rc_eng_no || "Not Available"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Fuel Type</p>
                <p className="text-sm text-gray-900 dark:text-white">{dbData.rc_fuel_desc || "Not Available"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Emission Norms</p>
                <p className="text-sm text-gray-900 dark:text-white">{dbData.rc_norms_desc || "Not Available"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Fitness Valid Until</p>
                <p className={`text-sm font-medium flex items-center ${getDateStatus(dbData.rc_fit_upto).color}`}>
                  {getDateStatus(dbData.rc_insurance_upto).icon}
                  {dbData.rc_insurance_upto || "Not Available"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Insurance & Permits Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Insurance Information */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
            <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              Insurance Information
            </h5>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Insurance Company</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {dbData.rc_insurance_comp || "Not Available"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Policy Number</p>
                <p className="text-sm font-mono text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">
                  {dbData.rc_insurance_policy_no || "Not Available"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Insurance Valid Until</p>
                <p className={`text-sm font-medium flex items-center ${getDateStatus(dbData.rc_insurance_upto).color}`}>
                  {getDateStatus(dbData.rc_insurance_upto).icon}
                  {dbData.rc_insurance_upto || "Not Available"}
                </p>
              </div>
            </div>
          </div>

          {/* Permits & Compliance */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
            <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              Permits & Compliance
            </h5>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Permit Number</p>
                <p className="text-sm font-mono text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">
                  {dbData.rc_permit_no || "Not Available"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Permit Type</p>
                <p className="text-sm text-gray-900 dark:text-white">{dbData.rc_permit_type || "Not Available"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Permit Valid Until</p>
                <p
                  className={`text-sm font-medium flex items-center ${getDateStatus(dbData.rc_permit_valid_upto).color}`}
                >
                  {getDateStatus(dbData.rc_permit_valid_upto).icon}
                  {dbData.rc_permit_valid_upto || "Not Available"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tax & PUCC Information - Full Width */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
          <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Tax & Pollution Certificate
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Road Tax Valid Until</p>
              <p className={`text-sm font-medium flex items-center ${getDateStatus(dbData.rc_tax_upto).color}`}>
                {getDateStatus(dbData.rc_tax_upto).icon}
                {dbData.rc_tax_upto || "Not Available"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">PUCC Valid Until</p>
              <p className={`text-sm font-medium flex items-center ${getDateStatus(dbData.rc_pucc_upto).color}`}>
                {getDateStatus(dbData.rc_pucc_upto).icon}
                {dbData.rc_pucc_upto || "Not Available"}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!open) return null

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  }

  const modalVariants = {
    hidden: { scale: 0.9, opacity: 0, y: 20 },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 25 },
    },
    exit: {
      scale: 0.9,
      opacity: 0,
      y: 20,
      transition: { duration: 0.2 },
    },
  }

  return (
    <motion.div
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 bg-opacity-50"
      onClick={() => onOpenChange(false)}
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center font-bold ${getStatusColor(selectedTrip?.status || "")}`}
            >
              <Car className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Trip Details{selectedTrip?.id ? ` - ${selectedTrip.id}` : ""}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === "registration" && (
              <button
                onClick={handleRefreshRegistration}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-md transition-colors"
              >
                <RefreshCw className={`h-4 w-4 flex-shrink-0 ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="hidden xs:inline sm:inline">
                  {isRefreshing ? "Refreshing..." : "Refresh Registration"}
                </span>
                <span className="inline xs:hidden sm:hidden">{isRefreshing ? "Refreshing..." : "Refresh"}</span>
              </button>
            )}
            <button
              onClick={() => onOpenChange(false)}
              className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => handleTabChange("stops")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "stops"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
            >
              <div className="flex items-center gap-2">
                <BadgeInfo className="h-4 w-4" />
                Stop Details
              </div>
            </button>
            <button
              onClick={() => handleTabChange("trip")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "trip"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Trip Details
              </div>
            </button>
            <button
              onClick={() => handleTabChange("registration")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "registration"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Registration Details
              </div>
            </button>
            {selectedTrip?.gps_vendor === "Intugine" && (
              <button
                onClick={() => handleTabChange("intutrack")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "intutrack"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Intugine Details
                </div>
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {selectedTrip && activeTab === "stops" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 dark:border-gray-700">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="py-2 pl-3 px-6 text-left border-b">Planned Sequence</th>
                    {/* <th className="py-2 px-6 text-left border-b whitespace-nowrap">Location ID</th> */}
                    <th className="py-2 px-6 text-center border-b whitespace-nowrap">Stop Type</th>
                    <th className="py-2 px-6 text-center border-b whitespace-nowrap">LR Number</th>
                    <th className="py-2 px-6 text-center border-b whitespace-nowrap">Location Name</th>
                    <th className="py-2 px-6 text-center border-b whitespace-nowrap">Customer Name</th>
                    <th className="py-2 px-6 text-center border-b whitespace-nowrap">Location</th>
                    <th className="py-2 px-6 text-center border-b whitespace-nowrap">ETA</th>
                    <th className="py-2 px-6 text-center border-b ">Actual Sequence</th>
                    <th className="py-2 px-6 text-center border-b whitespace-nowrap">Entry Time</th>
                    <th className="py-2 px-6 text-center border-b whitespace-nowrap">Exit Time</th>
                    <th className="py-2 px-6 text-center border-b whitespace-nowrap">Loading/Unloading Time</th>
                    <th className="py-2 px-6 text-center border-b whitespace-nowrap">Detention Time</th>
                    <th className="py-2 pr-3 px-6 text-left border-b whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTrip.planned_stops.map((stop) => (
                    <tr key={stop.planned_stop} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-2 pl-3 text-center px-6">{stop.planned_stop || "-"}</td>
                      {/* <td className="py-2 px-6 whitespace-nowrap">{stop.location_id}</td> */}
                      <td className="py-2 px-6 text-center whitespace-nowrap">{stop.stop_type || "-"}</td>
                      <td className="py-2 px-6 text-center whitespace-nowrap">{stop.lr_number || "-"}</td>
                      <td className="py-2 px-6 text-center whitespace-nowrap">{stop.geofence_name || "-"}</td>
                      <td className="py-2 px-6 text-center whitespace-nowrap">{stop.customer_name || "-"}</td>
                      <td className="py-2 px-6 text-center whitespace-nowrap">
                        <div className="relative group max-w-xs">
                          <div className="truncate cursor-default max-w-[200px]">
                            {stop.pickup_location || "-"}

                          </div>
                          {stop.pickup_location && (
                            <div className="absolute left-0 bottom-full mb-2 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-md shadow-xl border border-slate-700 z-10 min-w-0 w-max max-w-[400px] break-words whitespace-normal opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out transform group-hover:-translate-y-1 translate-y-1">
                              <div className="font-medium text-slate-100 leading-snug break-words">
                                {stop.pickup_location}
                              </div>

                              {/* Tooltip arrow pointing down */}
                              <div className="absolute -bottom-1 left-4 w-2 h-2 bg-slate-900 dark:bg-slate-800 border-r border-b border-slate-700 transform rotate-45"></div>
                            </div>
                          )}
                        </div>

                      </td>

                      <td className="py-2 px-6 text-center whitespace-nowrap">
                        <div className="space-y-3">
                          <div className="text-xs">C-ETA: {stop.ceta}</div>
                          <div className="text-xs">G-ETA: {stop.geta}</div>
                        </div>
                      </td>
                      <td className="py-2 px-6 text-center">{stop.actual_sequence || "-"}</td>
                      <td className="py-2 px-6 text-center whitespace-nowrap">{stop.entry_time || "-"}</td>
                      <td className="py-2 px-6 text-center whitespace-nowrap">{stop.exit_time || "-"}</td>
                      <td className="py-2 px-6 text-center whitespace-nowrap">{stop.loading_unloading_time || "-"}</td>
                      <td className="py-2 px-6 text-center whitespace-nowrap">{stop.detention_time || "-"}</td>
                      <td className="py-2 pr-3 px-6 whitespace-nowrap">
                        <Badge className={getStatusColor(stop.status)}>{stop.status || "-"}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedTrip && activeTab === "trip" && (
            <div className="grid grid-cols-1 gap-6">
              {/* First row: 2 columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Route Information */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                    Route Information
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div>
                      <Globe className="inline h-4 w-4 mr-1 text-blue-500" />
                      <strong>Route Name:</strong> {selectedTrip.route_Name}
                    </div>
                    <div>
                      <Building className="inline h-4 w-4 mr-1 text-blue-500" />
                      <strong>Domain:</strong> {selectedTrip.Domain_Name}
                    </div>
                    <div>
                      <Package className="inline h-4 w-4 mr-1 text-blue-500" />
                      <strong>Service Provider:</strong> {selectedTrip.serviceProviderAlias}
                    </div>
                  </div>
                </div>
                {/* Location Information */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                    Location Information
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div>
                      <MapPin className="inline h-4 w-4 mr-1 text-blue-500" />
                      <strong>Current Location:</strong>{" "}
                      {selectedTrip.status?.toLowerCase() === "inactive"
                        ? ""
                        : (
                          <span>
                            {Array.isArray(selectedTrip.current_location_coordindates) &&
                            selectedTrip.current_location_coordindates.length === 2 ? (
                              <>
                                <span className="ml-2 text-sm">
                                  {/* Address with tooltip, similar to VehicleDetailsModal */}
                                  <span className="relative group">
                                    <span className="truncate max-w-[180px] inline-block align-bottom">
                                      {currentLocationLoading
                                        ? "Loading address..."
                                        : currentLocationAddress
                                          ? currentLocationAddress
                                          : ""}
                                    </span>
                                    {currentLocationAddress && !currentLocationLoading && (
                                      <span className="absolute left-0 bottom-full mb-2 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-md shadow-xl border border-slate-700 z-10 min-w-0 w-max max-w-[300px] break-words whitespace-normal opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out transform group-hover:-translate-y-1 translate-y-1">
                                        <span className="font-medium text-slate-100 leading-snug break-words">
                                          {currentLocationAddress}
                                        </span>
                                        <span className="absolute -bottom-1 left-4 w-2 h-2 bg-slate-900 dark:bg-slate-800 border-r border-b border-slate-700 transform rotate-45"></span>
                                      </span>
                                    )}
                                  </span>
                                </span>
                              </>
                            ) : (
                              "No location"
                            )}
                          </span>
                        )
                      }
                    </div>
                    <div>
                      <MapPin className="inline h-4 w-4 mr-1 text-blue-500" />
                      <strong>Origin:</strong> {selectedTrip.origin || "-"}
                    </div>
                    <div>
                      <MapPin className="inline h-4 w-4 mr-1 text-blue-500" />
                      <strong>Destination:</strong> {selectedTrip.destination}
                    </div>
                   <div>
                      <FileText className="inline h-4 w-4 mr-1 text-blue-500" />
                      <strong>Last GPS Ping:</strong> {selectedTrip.last_gps_ping || "-"}
                    </div>
                    <div>
                      <FileText className="inline h-4 w-4 mr-1 text-blue-500" />
                      <strong>Last GPS Vendor:</strong> {selectedTrip.last_gps_vendor || "-"}
                    </div>
                  </div>
                </div>
              </div>
              {/* Second row: 3 columns, with Distance & Time wider */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Distance & Time - wide */}
                <div className="md:col-span-2 bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                    Distance & Time
                  </h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {/* Distance Column */}
                    <div className="space-y-2">
                      <div>
                        <strong>Total Kms:</strong> {selectedTrip.total_distance}
                      </div>
                      <div>
                        <strong>Covered Kms:</strong> {selectedTrip.total_covered_distance}
                      </div>
                      <div>
                        <strong>Average Distance:</strong> {selectedTrip.average_distance}
                      </div>
                    </div>
                    {/* Time Column */}
                    <div className="space-y-2">
                      <div>
                        <strong>Total Drive Time:</strong> {selectedTrip.total_drive_time}
                      </div>
                      <div>
                        <strong>Total Detention Time:</strong> {selectedTrip.total_detention_time}
                      </div>
                      <div>
                        <strong>Total Stoppage Time:</strong> {selectedTrip.total_stoppage_time}
                      </div>
                      <div>
                        <strong>Total Time:</strong> {selectedTrip.total_time}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Driver Information - small */}
                <div className="md:col-span-1 bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                    Driver Information
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div>
                      <User className="inline h-4 w-4 mr-1 text-blue-500" />
                      <strong>Name:</strong> {selectedTrip.driverName}
                    </div>
                    <div>
                      <Phone className="inline h-4 w-4 mr-1 text-blue-500" />
                      <strong>Mobile:</strong> {selectedTrip.driverMobile}
                    </div>
                  </div>
                </div>

                {/* GPS Information - small */}
                <div className="md:col-span-1 bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                    GPS Information
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>GPS Type:</strong> {selectedTrip.gps_type}
                    </div>
                    <div>
                      <strong>GPS Frequency:</strong> {selectedTrip.gps_frequency}
                    </div>
                    <div>
                      <strong>GPS Unit ID:</strong> {selectedTrip.gps_unit_id}
                    </div>
                    <div>
                      <strong>GPS Vendor:</strong> {selectedTrip.gps_vendor}
                    </div>
                    <div>
                      <strong>Shipment Source:</strong> {selectedTrip.shipment_source}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTrip && activeTab === "registration" && renderRegistrationDetails()}

          {selectedTrip && selectedTrip.gps_vendor === "Intugine" && activeTab === "intutrack" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Intugine Details</h3>
                <Button variant="outline" onClick={handleRefreshIntutrack} disabled={loadingIntutrack}>
                  {loadingIntutrack ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Refreshing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Refresh
                    </span>
                  )}
                </Button>
              </div>
              {loadingIntutrack ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
              ) : intutrackData ? (
                <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Current Consent:</strong> {intutrackData.consent}
                    </div>
                    {/* <div>
                      <strong>Consent:</strong> {intutrackData.consent}
                    </div> */}
                    <div>
                      <strong>Last Consent:</strong> {formatDate(intutrackData.updated_at)}
                    </div>
                    <div>
                      <strong>Operator:</strong> {intutrackData.operator}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No Intugine data available</p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
