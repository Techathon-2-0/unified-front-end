import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import type { TripExpandedDetailsProps } from "../../../types/dashboard/trip"

export function TripExpandedDetails({ trip }: TripExpandedDetailsProps) {
  return (
    <>
      {/* Stop Details Table */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Stop Details</h3>
        <div className="overflow-x-auto bg-white rounded border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-2 px-3 text-left font-medium text-gray-700">Point</th>
                <th className="py-2 px-3 text-left font-medium text-gray-700">Name</th>
                <th className="py-2 px-3 text-left font-medium text-gray-700">Status</th>
                <th className="py-2 px-3 text-left font-medium text-gray-700">Location ID</th>
                <th className="py-2 px-3 text-left font-medium text-gray-700">Stop Type</th>
                <th className="py-2 px-3 text-left font-medium text-gray-700">Planned Time</th>
                <th className="py-2 px-3 text-left font-medium text-gray-700">ETA</th>
                <th className="py-2 px-3 text-left font-medium text-gray-700">Actual Sequence</th>
                <th className="py-2 px-3 text-left font-medium text-gray-700">Entry Time</th>
                <th className="py-2 px-3 text-left font-medium text-gray-700">Exit Time</th>
                <th className="py-2 px-3 text-left font-medium text-gray-700">Detention Time</th>
              </tr>
            </thead>
            <tbody>
              {trip.stops.map((stop) => (
                <motion.tr
                  key={`${trip.id}-${stop.point}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: stop.point * 0.1 }}
                  className="border-b border-gray-200 last:border-b-0"
                >
                  <td className="py-2 px-3">{stop.point}</td>
                  <td className="py-2 px-3">{stop.name}</td>
                  <td className="py-2 px-3">
                    <Badge
                      variant="outline"
                      className={
                        stop.status === "Completed"
                          ? "bg-green-100 text-green-800 border-green-300"
                          : stop.status === "In Progress"
                            ? "bg-blue-100 text-blue-800 border-blue-300"
                            : "bg-gray-100 text-gray-800 border-gray-300"
                      }
                    >
                      {stop.status}
                    </Badge>
                  </td>
                  <td className="py-2 px-3">{stop.locationId}</td>
                  <td className="py-2 px-3">{stop.stopType}</td>
                  <td className="py-2 px-3">{stop.plannedTime}</td>
                  <td className="py-2 px-3">{stop.eta}</td>
                  <td className="py-2 px-3">{stop.actualSequence}</td>
                  <td className="py-2 px-3">{stop.entryTime}</td>
                  <td className="py-2 px-3">{stop.exitTime}</td>
                  <td className="py-2 px-3">{stop.detentionTime}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Trip Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Vehicle Information</h3>
          <div className="bg-white rounded border border-gray-200 p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Vehicle Name:</span>
              <span className="text-xs font-medium">{trip.equipmentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Vehicle Status:</span>
              <span className="text-xs font-medium">{trip.vehicleStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Status Duration:</span>
              <span className="text-xs font-medium">{trip.statusDuration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Equipment ID:</span>
              <span className="text-xs font-medium">{trip.equipmentId}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Time Information</h3>
          <div className="bg-white rounded border border-gray-200 p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Total Detention Time:</span>
              <span className="text-xs font-medium">{trip.totalDetentionTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Total Stoppage Time:</span>
              <span className="text-xs font-medium">{trip.totalStoppageTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Total Drive Time:</span>
              <span className="text-xs font-medium">{trip.totalDriveTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Location DateTime:</span>
              <span className="text-xs font-medium">{trip.locationDateTime}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Shipment Information</h3>
          <div className="bg-white rounded border border-gray-200 p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Shipment ID:</span>
              <span className="text-xs font-medium">{trip.shipmentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Domain Name:</span>
              <span className="text-xs font-medium">{trip.domainName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Current Location:</span>
              <span className="text-xs font-medium">{trip.location}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
