import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { HeaderProps } from "../../../types/geofence/ggroup_type"
import { useEffect, useState } from "react"
import { fetchRolesByUserId } from "@/data/usermanage/responsibility"
import { useAuth } from "@/context/AuthContext"

export function Header({ totalCount, onAddGroup }: HeaderProps) {
  const { user } = useAuth()
  const [geofenceGroupAccess, setGeofenceGroupAccess] = useState<number | null>(null)

  useEffect(() => {
    const fetchAccess = async () => {
      if (user && user.id) {
        try {
          const roles = await fetchRolesByUserId(user.id)
          if (roles && roles.length > 0) {
            const tabsAccess = roles[0].tabs_access
            const groupTab = tabsAccess.find((tab: any) => tab.hasOwnProperty("geofence_group"))
            setGeofenceGroupAccess(groupTab ? groupTab.geofence_group : null)
          }
        } catch {
          setGeofenceGroupAccess(null)
        }
      }
    }
    fetchAccess()
  }, [user])

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 relative z-10 rounded-t-lg">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm border-red-200 dark:border-red-800">
            Total Count: <span className="font-bold ml-1">{totalCount}</span>
          </Badge>
        </div>
        {geofenceGroupAccess !== 1 && (
          <Button onClick={onAddGroup} className="flex items-center gap-2 bg-black dark:bg-gray-900 hover:bg-gray-800 dark:hover:bg-gray-800">
            <Plus className="h-4 w-4 text-white" />
            <span className="sm:inline hidden text-white">Create New Geofence Group</span>
            <span className="sm:hidden inline text-white">New Group</span>
          </Button>
        )}
      </div>
    </header>
  )
}
