import { useState, useMemo, useEffect } from "react"
import { Search, X, MapPin, Circle, OctagonIcon as Polygon, ChevronDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { fetchGeofencesbyuserid } from "../../../data/geofence/gconfig"
import type { GeofenceSelectorProps, Geofence } from "../../../types/geofence/gstats_type"
import { useAuth } from "@/context/AuthContext"

export function GeofenceSelector({ selectedGeofence, onGeofenceChange }: GeofenceSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [geofences, setGeofences] = useState<Geofence[]>([])
  const { user } = useAuth()

  useEffect(() => {
    if (user?.id) {
      fetchGeofencesbyuserid(String(user.id))
        .then(setGeofences)
        .catch((error) => {
          console.error("Error fetching geofences:", error)
          setGeofences([])
        })
    }
  }, [user?.id])

  // Filter and search geofences
  const filteredGeofences = useMemo(() => {
    let filtered = geofences

    // Apply search filter - search in name, location_id, and type
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter((geofence) => {
        const nameMatch = geofence.geofence_name.toLowerCase().includes(searchLower)
        const idMatch = geofence.location_id.toLowerCase().includes(searchLower)
        const typeMatch = geofence.geofence_type.toString().includes(searchLower)

        return nameMatch || idMatch || typeMatch
      })
    }

    return filtered.sort((a, b) => a.geofence_name.localeCompare(b.geofence_name))
  }, [searchTerm, geofences])

  const selectedGeofenceData = geofences.find((g) => g.id.toString() === selectedGeofence)

  const getGeofenceIcon = (type: number) => {
    switch (type) {
      case 0: // circle
        return <Circle className="h-4 w-4 text-blue-500" />
      case 2: // polygon
        return <Polygon className="h-4 w-4 text-purple-500" />
      case 1: // pointer
        return <MapPin className="h-4 w-4 text-green-500" />
      default:
        return <Circle className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeLabel = (type: number) => {
    switch (type) {
      case 0:
        return "Circle"
      case 2:
        return "Polygon"
      case 1:
        return "Point"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3 relative z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Select Geofence:</label>

          {/* Custom Geofence Selector with Search */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-80 justify-between dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              >
                <div className="flex items-center">
                  {selectedGeofenceData && getGeofenceIcon(selectedGeofenceData.geofence_type)}
                  <span className="ml-2">
                    {selectedGeofenceData ? selectedGeofenceData.geofence_name : "Select geofence..."}
                  </span>
                </div>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 dark:bg-gray-900 dark:border-gray-700" align="start">
              <div className="flex flex-col">
                {/* Search Input */}
                <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-3 py-2">
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 dark:text-gray-400" />
                  <Input
                    placeholder="Search by name, ID, or type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-8 dark:bg-gray-800 dark:text-gray-100"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                      className="h-6 w-6 p-0 rounded-full"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Clear search</span>
                    </Button>
                  )}
                </div>

                {/* Geofence List */}
                <ScrollArea className="max-h-80 overflow-y-scroll">
                  {filteredGeofences.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">No geofence found.</div>
                  ) : (
                    <div className="p-1">
                      {filteredGeofences.map((geofence) => (
                        <div
                          key={geofence.id}
                          onClick={() => {
                            onGeofenceChange(geofence.id.toString())
                            setOpen(false)
                          }}
                          className={`flex items-center space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md p-2 transition-colors ${
                            selectedGeofence === geofence.id.toString() ? "bg-gray-100 dark:bg-gray-800" : ""
                          }`}
                        >
                          {getGeofenceIcon(geofence.geofence_type)}
                          <div className="flex-1">
                            <div className="font-medium text-sm dark:text-gray-100">{geofence.geofence_name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                              <span>ID: {geofence.location_id}</span>
                              <span>•</span>
                              <span>{getTypeLabel(geofence.geofence_type)}</span>
                            </div>
                          </div>
                          {selectedGeofence === geofence.id.toString() && (
                            <div className="h-4 w-4 text-blue-600 dark:text-blue-400">✓</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}