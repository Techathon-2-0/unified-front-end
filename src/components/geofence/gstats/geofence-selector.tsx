import { useState, useMemo } from "react"
import { Search, X, MapPin, Circle, OctagonIcon as Polygon, ChevronDown, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { initialGeofenceData } from "../../../data/geofence/gconfig"
import type { GeofenceSelectorProps } from "../../../types/geofence/gstats"

export function GeofenceSelector({ selectedGeofence, onGeofenceChange }: GeofenceSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [locationFilter, setLocationFilter] = useState<string>("all")

  // Get unique locations for filter (extract from geofence names)
  const uniqueLocations = useMemo(() => {
    const locations = initialGeofenceData.map((geofence) => {
      // Extract location from name (e.g., "Mumbai Warehouse" -> "Mumbai")
      const parts = geofence.name.split(" ")
      return parts[0] // Take first word as location
    })
    return [...new Set(locations)].sort()
  }, [])

  // Filter and search geofences
  const filteredGeofences = useMemo(() => {
    let filtered = initialGeofenceData

    // Apply search filter - search in name, id, and type
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter((geofence) => {
        const nameMatch = geofence.name.toLowerCase().includes(searchLower)
        const idMatch = geofence.id.toLowerCase().includes(searchLower)
        const typeMatch = geofence.type.toLowerCase().includes(searchLower)
        const shapeMatch =
          (geofence.type === "circle" && ("circle".includes(searchLower) || "round".includes(searchLower))) ||
          (geofence.type === "polygon" && ("polygon".includes(searchLower) || "poly".includes(searchLower))) ||
          (geofence.type === "pointer" &&
            ("pointer".includes(searchLower) || "point".includes(searchLower) || "pin".includes(searchLower)))

        return nameMatch || idMatch || typeMatch || shapeMatch
      })
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((geofence) => geofence.type === typeFilter)
    }

    // Apply location filter
    if (locationFilter !== "all") {
      filtered = filtered.filter((geofence) => geofence.name.toLowerCase().startsWith(locationFilter.toLowerCase()))
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name))
  }, [searchTerm, typeFilter, locationFilter])

  const selectedGeofenceData = initialGeofenceData.find((g) => g.id === selectedGeofence)

  const getGeofenceIcon = (type: string) => {
    switch (type) {
      case "circle":
        return <Circle className="h-4 w-4 text-blue-500" />
      case "polygon":
        return <Polygon className="h-4 w-4 text-purple-500" />
      case "pointer":
        return <MapPin className="h-4 w-4 text-green-500" />
      default:
        return <Circle className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "circle":
        return "Circle"
      case "polygon":
        return "Polygon"
      case "pointer":
        return "Point"
      default:
        return type
    }
  }

  const clearFilter = (filterType: string) => {
    switch (filterType) {
      case "type":
        setTypeFilter("all")
        break
      case "location":
        setLocationFilter("all")
        break
      case "search":
        setSearchTerm("")
        break
    }
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setTypeFilter("all")
    setLocationFilter("all")
  }

  const activeFilters = [
    { type: "search", value: searchTerm, label: `Search: "${searchTerm}"` },
    { type: "type", value: typeFilter, label: `Type: ${getTypeLabel(typeFilter)}` },
    { type: "location", value: locationFilter, label: `Location: ${locationFilter}` },
  ].filter((filter) => filter.value && filter.value !== "all")

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 relative z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Select Geofence:</label>

          {/* Custom Geofence Selector with Search */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={open} className="w-80 justify-between">
                <div className="flex items-center">
                  {selectedGeofenceData && getGeofenceIcon(selectedGeofenceData.type)}
                  <span className="ml-2">
                    {selectedGeofenceData ? selectedGeofenceData.name : "Select geofence..."}
                  </span>
                </div>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <div className="flex flex-col">
                {/* Search Input */}
                <div className="flex items-center border-b px-3 py-2">
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <Input
                    placeholder="Search by name, ID, or shape..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-8"
                  />
                </div>

                {/* Geofence List */}
                <ScrollArea className="max-h-80 overflow-y-scroll">
                  {filteredGeofences.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">No geofence found.</div>
                  ) : (
                    <div className="p-1">
                      {filteredGeofences.map((geofence) => (
                        <div
                          key={geofence.id}
                          onClick={() => {
                            onGeofenceChange(geofence.id)
                            setOpen(false)
                          }}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 rounded-md p-2 transition-colors"
                        >
                          {getGeofenceIcon(geofence.type)}
                          <div className="flex-1">
                            <div className="font-medium text-sm">{geofence.name}</div>
                            <div className="text-xs text-gray-500 flex items-center space-x-2">
                              <span>ID: {geofence.id}</span>
                              <span>•</span>
                              <span>{getTypeLabel(geofence.type)}</span>
                            </div>
                            {geofence.description && (
                              <div className="text-xs text-gray-400 mt-1">{geofence.description}</div>
                            )}
                          </div>
                          {selectedGeofence === geofence.id && <Check className="h-4 w-4 text-blue-600" />}
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

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600">Active filters:</span>
          {activeFilters.map((filter) => (
            <Badge
              key={filter.type}
              variant="secondary"
              className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer text-xs px-2 py-1"
              onClick={() => clearFilter(filter.type)}
            >
              {filter.label}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs h-6 px-2">
            Clear All
          </Button>
        </div>
      )}
    </div>
  )
}
