import type {AlarmTypeIconProps} from "../../../types/alarm/aconfig"

import {
  AlertTriangle,
  MapPin,
  Clock,
  Pause,
  Anchor,
  Wifi,
  Truck,
  Navigation,
  Satellite,
  PenToolIcon as Tool,
} from "lucide-react"

export const AlarmTypeIcon = ({ type, className = "", size = 18 }: AlarmTypeIconProps) => {
  switch (type.toLowerCase()) {
    case "overspeeding":
      return <AlertTriangle size={size} className={`text-amber-500 ${className}`} />
    case "geofence":
      return <MapPin size={size} className={`text-purple-500 ${className}`} />
    case "stoppage":
      return <Pause size={size} className={`text-red-500 ${className}`} />
    case "idle":
      return <Clock size={size} className={`text-blue-500 ${className}`} />
    case "long halt":
      return <Anchor size={size} className={`text-indigo-500 ${className}`} />
    case "gprs connectivity":
      return <Wifi size={size} className={`text-green-500 ${className}`} />
    case "continuous driving":
      return <Truck size={size} className={`text-orange-500 ${className}`} />
    case "driving":
      return <Navigation size={size} className={`text-cyan-500 ${className}`} />
    case "gps connectivity":
      return <Satellite size={size} className={`text-teal-500 ${className}`} />
    case "tampered device":
      return <Tool size={size} className={`text-rose-500 ${className}`} />
    case "route start":
      return <Navigation size={size} className={`text-emerald-500 ${className}`} />
    case "route end":
      return <MapPin size={size} className={`text-violet-500 ${className}`} />
    case "stop point":
      return <Pause size={size} className={`text-pink-500 ${className}`} />
    default:
      return <AlertTriangle size={size} className={`text-gray-500 ${className}`} />
  }
}
