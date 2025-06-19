import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Gauge, Route } from "lucide-react"
import { format } from "date-fns"
import type { VehicleDetailsProps } from "@/types/trail/trail_type"

export default function VehicleDetails({ data, type, onPlayTrail }: VehicleDetailsProps) {
  if (!data) return null

  const isVehicleData = type === "vehicle" && "vehicleNumber" in data
  const isTripData = type === "trip" && "shipmentId" in data

  return (
    <Card className="mt-4 dark:bg-gray-800 dark:border-gray-700">
      <CardContent className="">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold dark:text-white">
                {isVehicleData ? data.vehicleNumber : isTripData ? data.shipmentId : ""}
              </h3>
              {isTripData && <p className="text-sm text-gray-600 dark:text-gray-400">Vehicle: {data.vehicleNumber}</p>}
            </div>
            <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
              {data.trailPoints.length} Points
            </Badge>
          </div>

          {/* Location Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5"></div>
                <div>
                  <p className="text-sm font-medium dark:text-white">Start Location</p>
                  <div className="relative group max-w-xs">
                    <div className="truncate cursor-default text-xs max-w-[100px]">
                      {data.trailPoints[0]?.address || "Unknown"}
                    </div>
                    {data.trailPoints[0]?.address && (
                      <div className="absolute left-0 bottom-full mb-2 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-md shadow-xl border border-slate-700 z-10 min-w-0 w-max max-w-[100px] break-words whitespace-normal opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out transform group-hover:-translate-y-1 translate-y-1">
                        <div className="font-medium text-slate-100 leading-snug break-words">
                          {data.trailPoints[0].address}
                        </div>
                        <div className="absolute -bottom-1 left-4 w-2 h-2 bg-slate-900 dark:bg-slate-800 border-r border-b border-slate-700 transform rotate-45"></div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {data.trailPoints[0]?.time ? format(new Date(data.trailPoints[0].time), "dd MMM yyyy, HH:mm") : ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5"></div>
                <div>
                  <p className="text-sm font-medium dark:text-white">End Location</p>
                  <div className="relative group max-w-xs">
                    <div className="truncate cursor-default text-xs max-w-[100px]">
                      {data.trailPoints[data.trailPoints.length - 1]?.address || "Unknown"}
                    </div>
                    {data.trailPoints[data.trailPoints.length - 1]?.address && (
                      <div className="absolute left-0 bottom-full mb-2 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-md shadow-xl border border-slate-700 z-10 min-w-0 w-max max-w-[100px] break-words whitespace-normal opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out transform group-hover:-translate-y-1 translate-y-1">
                        <div className="font-medium text-slate-100 leading-snug break-words">
                          {data.trailPoints[data.trailPoints.length - 1].address}
                        </div>
                        <div className="absolute -bottom-1 left-4 w-2 h-2 bg-slate-900 dark:bg-slate-800 border-r border-b border-slate-700 transform rotate-45"></div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {data.trailPoints[data.trailPoints.length - 1]?.time
                      ? format(new Date(data.trailPoints[data.trailPoints.length - 1].time), "dd MMM yyyy, HH:mm")
                      : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t dark:border-gray-700">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Time</p>
              <p className="text-xs font-semibold dark:text-white">{data.metrics?.totalTimeFormatted ?? "-"}</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Route className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Distance</p>
              <p className="text-xs font-semibold dark:text-white">
                {data.metrics?.totalDistance !== undefined ? data.metrics.totalDistance.toFixed(1) : "-"} km
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Gauge className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg Speed</p>
              <p className="text-xs font-semibold dark:text-white">
                {data.metrics?.avgSpeed !== undefined ? data.metrics.avgSpeed.toFixed(1) : "-"} km/h
              </p>
            </div>
          </div>

          {/* Play Trail Button */}
          <Button
            onClick={onPlayTrail}
            className="w-full bg-black hover:bg-gray-800 dark:bg-gray-900 dark:hover:bg-gray-700 text-white"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Play Trail
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
