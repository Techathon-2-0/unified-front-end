import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import type { SearchBarProps } from "../../../types/geofence/ggroup"

export function SearchBar({ searchQuery, onSearch }: SearchBarProps) {
  return (
    <div className="bg-white px-4 py-2 border-b border-gray-200 relative z-10">
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by name, ID, or person in charge..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
