import { useState, useEffect } from "react"
import { Check, ChevronDown, Search, Truck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { fetchVehicles } from "../../data/trail/traildata"

import type { VehicleSelectorProps } from "../../types/trail/trail"
import type { Vehicle } from "../../types/live/list"

export default function VehicleSelector({ selectedVehicle, onChange }: VehicleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadVehicles = async () => {
      setIsLoading(true)
      try {
        const data = await fetchVehicles()
        setVehicles(data)

        // Auto-select first vehicle if none selected
        if (!selectedVehicle && data.length > 0) {
          onChange(data[0].id)
        }
      } catch (error) {
        console.error("Error loading vehicles:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadVehicles()
  }, [])

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const selectedVehicleData = vehicles.find((v) => v.id === selectedVehicle)

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-2 border rounded-md cursor-pointer hover:bg-gray-50"
      >
        <div className="flex items-center">
          <Truck className="h-5 w-5 text-gray-500 mr-2" />
          <span className="text-sm">
            {selectedVehicleData
              ? `${selectedVehicleData.deviceName} (${selectedVehicleData.vehicleNumber})`
              : "Select Vehicle"}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg"
          >
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vehicles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto p-1">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-gray-500">Loading vehicles...</div>
              ) : filteredVehicles.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">No vehicles found</div>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <motion.div
                    key={vehicle.id}
                    whileHover={{ backgroundColor: "rgba(243, 244, 246, 1)" }}
                    onClick={() => {
                      onChange(vehicle.id)
                      setIsOpen(false)
                    }}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                      selectedVehicle === vehicle.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-center">
                      <Truck className="h-4 w-4 text-gray-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium">{vehicle.deviceName}</p>
                        <p className="text-xs text-gray-500">{vehicle.vehicleNumber}</p>
                      </div>
                    </div>
                    {selectedVehicle === vehicle.id && <Check className="h-4 w-4 text-blue-500" />}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
