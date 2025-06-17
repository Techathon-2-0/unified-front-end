import { useAuth } from "../context/AuthContext"
import { useRoleAccess, type AccessLevel, type Responsibility } from "../utils/roleAccess"
import { useState, useEffect } from "react"

export const useUserAccess = () => {
  const { user } = useAuth()
  const { checkAccess, hasReportAccess } = useRoleAccess()
  const [userRole, setUserRole] = useState<Responsibility | null>(null)
  const [loading, setLoading] = useState(false)

  // Fetch user role data when user changes
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user || !user.roles) return

      setLoading(true)
      try {
        // You'll need to create an endpoint to fetch role details by role name
        // For now, I'm creating a mock based on your user's role
        const mockResponsibility: Responsibility = {
          id: 1,
          role_name: user.roles,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tabs_access: [
            { dashboard: 1 },
            { trip_dashboard: 1 },
            { list_map: 1 },
            { trail: 1 },
            { report: 2 },
            { schedule_report: 2 },
            { alarm: 2 },
            { geofence_config: 2 },
            { geofence_group: 2 },
            { geofence_stats: 2 },
            { user_reponsibility: 2 },
            { user_access: 2 },
            { entities: 2 },
            { group: 2 },
            { vendors: 2 },
            { customer: 2 },
          ],
          report_access: [
            "fleet_analytics",
            "vehicle_status",
            "daily_operations",
            "alert_summary",
            "velocity_insights",
            "fleet_overview",
            "location_tracking",
            "connection_health",
            "boundary_complinace",
            "trip_analytics",
            "alert_pattern_analytics",
            "evening_operations",
            "immobolity_detection",
            "journey_details",
            "rest_period_analysis",
          ],
        }
        setUserRole(mockResponsibility)
      } catch (error) {
        console.error("Error fetching user role:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserRole()
  }, [user])

  const getUserAccess = () => {
    return user
  }

  const checkRouteAccess = (path: string): AccessLevel => {
    if (!user || !userRole) return "none"
    return checkAccess(userRole, path)
  }

  const checkReportAccess = (reportName: string): boolean => {
    if (!user || !userRole) return false
    return hasReportAccess(userRole, reportName)
  }

  const hasEditAccess = (path: string): boolean => {
    const access = checkRouteAccess(path)
    return access === "both"
  }

  const hasViewAccess = (path: string): boolean => {
    const access = checkRouteAccess(path)
    return access === "view" || access === "both"
  }

  return {
    user: getUserAccess(),
    userRole,
    loading,
    checkRouteAccess,
    checkReportAccess,
    hasEditAccess,
    hasViewAccess,
  }
}
