import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { HeaderProps } from "../../../types/geofence/ggroup"

export function Header({ totalCount, onAddGroup }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 relative z-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="bg-red-50 text-red-700 text-sm border-red-200">
            Total Count: <span className="font-bold ml-1">{totalCount}</span>
          </Badge>
        </div>
        <Button onClick={onAddGroup} className="flex items-center gap-2 bg-black hover:bg-gray-800">
          <Plus className="h-4 w-4" />
          <span className="sm:inline hidden">Create New Geofence Group</span>
          <span className="sm:hidden inline">New Group</span>
        </Button>
      </div>
    </header>
  )
}
