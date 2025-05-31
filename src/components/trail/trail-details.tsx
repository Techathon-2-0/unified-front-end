import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown, ChevronUp, Clock, MapPin } from "lucide-react"
import { format } from "date-fns"
import type { TrailDetailsProps } from "../../types/trail/trail"

export default function TrailDetails({ trail, trip, trailType }: TrailDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const data = trailType === "vehicle" ? trail : trip

  if (!data) return null

  return (
    <motion.div
      initial={{ height: 80 }}
      animate={{ height: isExpanded ? "auto" : 80 }}
      transition={{ duration: 0.3 }}
      className="bg-white border-t border-gray-200 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="text-gray-500" size={20} />
            <div>
              <p className="text-sm font-medium">{data.location || "Unknown Location"}</p>
              <p className="text-xs text-gray-500">
                {data.timestamp ? format(new Date(data.timestamp), "dd MMM yyyy") : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-center">
              <p className="text-xs text-gray-500">Distance</p>
              <p className="text-lg font-bold">
                {data.distance?.toFixed(2) || "0.00"} <span className="text-xs font-normal">km</span>
              </p>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">Duration</p>
              <p className="text-lg font-bold">{data.duration || "00:00"}</p>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">Avg. Speed</p>
              <p className="text-lg font-bold">
                {data.averageSpeed?.toFixed(1) || "0.0"} <span className="text-xs font-normal">km/h</span>
              </p>
            </div>

            <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 rounded-full hover:bg-gray-100">
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Trip Details</h3>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <div className="flex flex-col items-center mr-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      </div>
                      <div className="w-0.5 h-10 bg-gray-200"></div>
                      <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-black"></div>
                      </div>
                    </div>
                    <div>
                      <div className="mb-2">
                        <p className="text-sm font-medium">{data.startLocation || "Start Location"}</p>
                        <p className="text-xs text-gray-500">
                          {data.startTime ? format(new Date(data.startTime), "dd MMM yyyy HH:mm") : ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{data.endLocation || "End Location"}</p>
                        <p className="text-xs text-gray-500">
                          {data.endTime ? format(new Date(data.endTime), "dd MMM yyyy HH:mm") : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Additional Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-xs text-gray-500">Max Speed</p>
                    <p className="text-sm font-medium">{data.maxSpeed || "0"} km/h</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-xs text-gray-500">Idle Time</p>
                    <p className="text-sm font-medium">{data.idleTime || "00:00"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-xs text-gray-500">Stop Count</p>
                    <p className="text-sm font-medium">{data.stopCount || "0"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-xs text-gray-500">Fuel Consumed</p>
                    <p className="text-sm font-medium">{data.fuelConsumed || "0"} L</p>
                  </div>
                </div>
              </div>
            </div>

            {trailType === "trip" && trip?.stops && trip.stops.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-medium mb-2">Stops ({trip.stops.length})</h3>
                <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                  {trip.stops.map((stop, index) => (
                    <div key={index} className="flex items-start p-2 bg-gray-50 rounded-md">
                      <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                        <Clock className="w-3 h-3 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{stop.location || "Unknown Location"}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <span>{stop.timestamp ? format(new Date(stop.timestamp), "dd MMM yyyy HH:mm") : ""}</span>
                          <span className="mx-1">•</span>
                          <span>Duration: {stop.duration || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
