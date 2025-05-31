import { motion } from "framer-motion"
import {
  X,
  Battery,
  Power,
  Thermometer,
  Truck,
  Activity,
  Cpu,
  MapPin,
  Clock,
  Wifi,
  User,
  Phone,
  Package,
  Building,
  Bell,
  Key,
  Tag,
  Globe,
  Lock,
} from "lucide-react"
import type { VehicleDetailsModalProps } from "../../types/live/list"


const VehicleDetailsModal = ({ vehicle, onClose }: VehicleDetailsModalProps) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "text-green-600"
      case "Idle":
        return "text-amber-600"
      case "Stopped":
        return "text-red-600"
      case "No Data":
        return "text-gray-600"
      default:
        return "text-gray-600"
    }
  }

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
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-white ${
                vehicle.status === "Active"
                  ? "bg-green-500"
                  : vehicle.status === "Idle"
                    ? "bg-amber-500"
                    : vehicle.status === "Stopped"
                      ? "bg-red-500"
                      : "bg-gray-500"
              }`}
            >
              {vehicle.id.substring(0, 1)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{vehicle.vehicleNumber}</h3>
              <p className="text-sm text-gray-500">{vehicle.deviceName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Basic Information</h4>
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Truck className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Vehicle Number</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle.vehicleNumber}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Cpu className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Device Name</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle.deviceName}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Truck className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle.type}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className={`text-sm font-medium ${getStatusColor(vehicle.status)}`}>{vehicle.status}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Speed</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle.speed} km/h</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Distance</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle.distance} KM</p>
                </div>
              </div>
              <div className="flex items-center">
                <Wifi className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">GPS Ping</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle.gpsPing}</p>
                </div>
              </div>
              <div className="flex items-center">
                <User className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Drivers</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle.drivers}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Tag className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">RFID</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle.rfid}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Tag className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Tag</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle.tag}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Location Information</h4>
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle.address}</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Altitude</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle.altitude}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">GPS Time</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle.gpsTime}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">GPRS Time</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle.gprsTime}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Wifi className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">GPS Status</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle.gpsStatus}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Wifi className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">GPRS Status</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle.gprsStatus}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Last Alarm</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle.lastAlarm}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Key className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Ignition Status</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle.ignitionStatus}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Sensor</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle.sensor}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h4 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Additional Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Power className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Power</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle.power}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Battery className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Battery</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle.battery}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Thermometer className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">AC</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle.ac}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Lock className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Lock Status</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle.lockStatus}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Globe className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Domain Name</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle.domainName}</p>
                </div>
              </div>
              <div className="flex items-center">
                <User className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Driver Name</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle.driverName}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Driver Mobile</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle.driverMobile}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Cpu className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">GPS Type</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle.gpsType}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Package className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Shipment ID</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle.shipmentId}</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Shipment Source</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle.shipmentSource}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Building className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Vendor Name</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle.vendorName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default VehicleDetailsModal
