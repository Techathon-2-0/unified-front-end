import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import {
  X,
  Battery,
  Power,
  Thermometer,
  Activity,
  //Cpu,
  MapPin,
  Wifi,
  User,
  Phone,
  Package,
  Building,
  //Bell,
  Key,
  Globe,
  Lock,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  FileText,
  Car,
  XCircle,
} from "lucide-react"
import type { VehicleDetailsModalProps, RegistrationDbResponse } from "../../types/live/list_type"
import { fetchRegistrationFromDb, refreshRegistrationDetails } from "../../data/live/list"
import { reverseGeocode } from "../reversegeocoding"

const VehicleDetailsModal = ({ vehicle, onClose }: VehicleDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState<"details" | "registration">("details")
  const [dbData, setDbData] = useState<RegistrationDbResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasLoadedDb, setHasLoadedDb] = useState(false)
  const [address, setAddress] = useState<string>("")
  const [addressLoading, setAddressLoading] = useState(false)

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 },
    },
  }

  const modalVariants = {
    hidden: { scale: 0.9, opacity: 0, y: 20 },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
    exit: {
      scale: 0.9,
      opacity: 0,
      y: 20,
      transition: { duration: 0.2 },
    },
  }

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case "Active":
  //       return "text-green-600"
  //     case "Idle":
  //       return "text-amber-600"
  //     case "Stopped":
  //       return "text-red-600"
  //     case "No Data":
  //       return "text-gray-600"
  //     default:
  //       return "text-gray-600"
  //   }
  // }

  // Helper to check if a date string is valid and in the future
  const getDateStatus = (dateStr?: string) => {
    if (!dateStr) return { valid: false, color: "text-gray-500", icon: null }

    let date;

    // Handle different date formats
    if (dateStr.includes('-') && dateStr.split('-').length === 3) {
      // Handle formats like "30-Jan-2026" or "30-06-2026"
      const parts = dateStr.split('-');

      if (parts[1].length === 2) {
        // Format: "30-06-2026" (DD-MM-YYYY)
        const [day, month, year] = parts;
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        // Format: "30-Jan-2026" (DD-MMM-YYYY)
        const monthNames = {
          'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
          'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        };
        const [day, monthStr, year] = parts;
        const monthIndex = monthNames[monthStr as keyof typeof monthNames];
        if (monthIndex !== undefined) {
          date = new Date(parseInt(year), monthIndex, parseInt(day));
        } else {
          return { valid: false, color: "text-gray-500", icon: null };
        }
      }
    } else {
      // Try to parse as standard date string
      date = new Date(dateStr);
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
    date.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

    if (isNaN(date.getTime())) {
      return { valid: false, color: "text-gray-500", icon: null };
    }

    if (date >= now) {
      return {
        valid: true,
        color: "text-green-600",
        icon: <CheckCircle className="inline h-4 w-4 text-green-600 mb-0.5 mr-1" />
      };
    } else {
      return {
        valid: false,
        color: "text-red-600",
        icon: <XCircle className="inline h-4 w-4 text-red-600 mb-0.5 mr-1" />
      };
    }
  }

  // Load registration data from database when registration tab is first accessed
  const handleTabChange = async (tab: "details" | "registration") => {
    setActiveTab(tab)

    if (tab === "registration" && !hasLoadedDb) {
      setIsLoading(true)
      setError(null)

      try {
        console.log("Fetching registration data from database for:", vehicle.vehicleNumber)
        const data = await fetchRegistrationFromDb(vehicle.vehicleNumber)
        setDbData(data)
        setHasLoadedDb(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch registration data from database")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleRefreshRegistration = async () => {
    setIsRefreshing(true)
    setError(null)

    try {
      console.log("Refreshing registration details for:", vehicle.vehicleNumber)
      const data = await refreshRegistrationDetails(vehicle.vehicleNumber)
      setDbData(data)
      setHasLoadedDb(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh registration details")
    } finally {
      setIsRefreshing(false)
    }
  }

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

    console.log("Registration data loaded:", dbData)

    return (
      <div className="p-6 space-y-6">
        {/* Status Banner
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-700 dark:text-green-400">Registration Status</p>
            <p className="text-lg font-semibold text-green-800 dark:text-green-300">
              
              {dbData.stautsMessage
                ? dbData.stautsMessage
                : dbData.status_message
                  ? dbData.status_message
                  : "Active"}
            </p>
          </div>
        </div> */}

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
                <p className="text-sm text-gray-900 dark:text-white">
                  {dbData.rc_vch_catg_desc || "Not Available"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Vehicle Class</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {dbData.rc_vh_class_desc || "Not Available"}
                </p>
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
                <p className={`text-sm font-medium flex items-center ${getDateStatus(dbData.rc_permit_valid_upto).color}`}>
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

  // Fetch address when modal opens and lat/lng are present
  useEffect(() => {
    if (vehicle.lat && vehicle.lng) {
      setAddressLoading(true)
      reverseGeocode(vehicle.lat, vehicle.lng)
        .then(addr => setAddress(addr))
        .catch(() => setAddress("Error retrieving address"))
        .finally(() => setAddressLoading(false))
    } else {
      setAddress("")
    }
  }, [vehicle.lat, vehicle.lng])

  return (
    <motion.div
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 bg-opacity-50"
      onClick={onClose}
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-white ${vehicle.status === "Active"
                ? "bg-green-500"
                : vehicle.status === "No Update"
                  ? "bg-yellow-500"
                  : vehicle.status === "No Data"
                    ? "bg-red-500"
                    : "bg-gray-500"
                }`}
            >
              {vehicle.id.substring(0, 1)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{vehicle.vehicleNumber}</h3>
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
              onClick={onClose}
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
              onClick={() => handleTabChange("details")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "details"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
            >
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                Vehicle Details
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
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "registration" ? (
          renderRegistrationDetails()
        ) : (
          <>
            {/* Remove the API Response Section and keep only the vehicle details content */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                  GPS Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  {/* GPS Status */}
                  <div className="flex items-center">
                    <Wifi className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">GPS Status</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{vehicle.gpsStatus}</p>
                    </div>
                  </div>

                  {/* GPRS Status */}
                  <div className="flex items-center">
                    <Wifi className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">GPRS Status</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{vehicle.gprsStatus}</p>
                    </div>
                  </div>
                  {/* GPS Ping */}
                  <div className="flex items-center">
                    <Wifi className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">GPS Ping</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{vehicle.gpsPing || "0"}</p>
                    </div>
                  </div>
                  {/* GPS Time */}
                  <div className="flex items-center">
                    <Wifi className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">GPS Time</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{vehicle.gpsTime || "No Data"}</p>
                    </div>
                  </div>
                  {/* GPRS Time */}
                  <div className="flex items-center">
                    <Wifi className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">GPRS Time</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{vehicle.gprsTime || "No Data"}</p>
                    </div>
                  </div>
                  {/* Today Distance */}
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Today Distance</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{vehicle.todayDistance || "0"}</p>
                    </div>
                  </div>
                  {/* Lat, Lng */}
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Lat, Lng</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {vehicle.lat && vehicle.lng
                          ? `${vehicle.lat.toFixed(6)}, ${vehicle.lng.toFixed(6)}`
                          : "No location"}
                      </p>
                    </div>
                  </div>
                  {/* Address (third row, after Lat/Lng and Today Distance) */}
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                      <div className="relative group w-fit">
                        <div className="truncate max-w-[220px] text-sm font-medium text-gray-900 dark:text-white cursor-default">
                          {addressLoading
                            ? "Loading address..."
                            : address
                              ? address
                              : "No address"}
                        </div>
                        {address && !addressLoading && (
                          <div className="absolute left-0 bottom-full mb-2 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-md shadow-xl border border-slate-700 z-10 min-w-0 w-max max-w-[400px] break-words whitespace-normal opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out transform group-hover:-translate-y-1 translate-y-1">
                            <div className="font-medium text-slate-100 leading-snug break-words">
                              {address}
                            </div>
                            {/* Tooltip arrow pointing down */}
                            <div className="absolute -bottom-1 left-4 w-2 h-2 bg-slate-900 dark:bg-slate-800 border-r border-b border-slate-700 transform rotate-45"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                  Trip Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Domain Name</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {vehicle.domainName || "No Data"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Driver Name</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {vehicle.driverName || "No Data"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Driver Mobile</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {vehicle.driverMobile || "No Data"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Shipment ID</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {vehicle.shipmentId || "No Data"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Shipment Source</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {vehicle.shipmentSource || "No Data"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Building className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Vendor Name</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {vehicle.vendorName || "No Data"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                  Additional Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Power className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Power</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{vehicle.power || "No Data"}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Battery className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Battery</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {vehicle.battery || "No Data"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Thermometer className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">AC</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{vehicle.ac || "No Data"}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Lock className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Lock Status</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {vehicle.lockStatus || "No Data"}
                      </p>
                    </div>
                  </div>
                  {/* <div className="flex items-center">
                    <Bell className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Last Alarm</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {vehicle.lastAlarm || "No Data"}
                      </p>
                    </div>
                  </div> */}
                  <div className="flex items-center">
                    <Key className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Ignition Status</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {vehicle.ignitionStatus || "No Data"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Sensor</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{vehicle.sensor || "No Data"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

export default VehicleDetailsModal