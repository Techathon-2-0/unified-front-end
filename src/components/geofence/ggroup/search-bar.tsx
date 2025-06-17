import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import type { SearchBarProps } from "../../../types/geofence/ggroup_type"

export function SearchBar({ searchQuery, onSearch, isLoading = false }: SearchBarProps) {
  return (
    <div className="bg-white dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 relative z-10 rounded-b-lg">
      <div className="max-w-md mx-auto">
        <div className="relative">
          {isLoading ? (
            <Loader2 className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400 animate-spin" />
          ) : (
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          )}
          <Input
            placeholder="Search by name or ID..."
            className="pl-8 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            //disabled={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
