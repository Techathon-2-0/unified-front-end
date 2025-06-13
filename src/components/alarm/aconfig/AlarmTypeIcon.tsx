import type {AlarmTypeIconProps} from "../../../types/alarm/aconfig_type"

import {
  AlertTriangle,
  MapPin,
  Pause,
  Truck,
  Satellite,
  PenToolIcon as Tool,
  Navigation,
} from "lucide-react"

export const AlarmTypeIcon = ({ type, className = "", size = 18 }: AlarmTypeIconProps) => {
  switch (type.toLowerCase()) {
    case "overspeeding":
      return <AlertTriangle size={size} className={`text-amber-500 ${className}`} />
    case "geofence":
      return <MapPin size={size} className={`text-purple-500 ${className}`} />
    case "stoppage":
      return <Pause size={size} className={`text-red-500 ${className}`} />
    case "continuous driving":
      return <Truck size={size} className={`text-orange-500 ${className}`} />
    case "no gps feed":
      return <Satellite size={size} className={`text-teal-500 ${className}`} />
    case "reached stop":
      return <Navigation size={18} className="text-blue-500" />
    case "route deviation":
      return <Tool size={18} className="text-pink-500" />
    default:
      return <AlertTriangle size={size} className={`text-gray-500 ${className}`} />
  }
}
