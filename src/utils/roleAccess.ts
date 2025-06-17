export interface Responsibility {
  id: number
  role_name: string
  created_at: string
  updated_at: string
  tabs_access: Array<Record<string, number>>
  report_access: string[]
}

export type AccessLevel = "none" | "view" | "both"

export interface TabsAccess {
  dashboard: boolean
  tripDashboard: boolean
  listMapView: boolean
  trail: boolean
  reports: {
    allReports: AccessLevel
    scheduleReport: AccessLevel
  }
  alarm: AccessLevel
  geofence: {
    config: AccessLevel
    group: AccessLevel
    stats: AccessLevel
  }
  userManagement: {
    responsibilities: AccessLevel
    user: AccessLevel
  }
  manage: {
    entities: AccessLevel
    group: AccessLevel
    vendors: AccessLevel
    customer: AccessLevel
  }
}

export const convertBackendToFrontend = (responsibility: Responsibility): TabsAccess => {
  const tabsAccess: TabsAccess = {
    dashboard: false,
    tripDashboard: false,
    listMapView: false,
    trail: false,
    reports: {
      allReports: "none",
      scheduleReport: "none",
    },
    alarm: "none",
    geofence: {
      config: "none",
      group: "none",
      stats: "none",
    },
    userManagement: {
      responsibilities: "none",
      user: "none",
    },
    manage: {
      entities: "none",
      group: "none",
      vendors: "none",
      customer: "none",
    },
  }

  responsibility.tabs_access.forEach((tabObj) => {
    const [key, value] = Object.entries(tabObj)[0]

    switch (key) {
      case "dashboard":
        tabsAccess.dashboard = value === 1
        break
      case "trip_dashboard":
        tabsAccess.tripDashboard = value === 1
        break
      case "list_map":
        tabsAccess.listMapView = value === 1
        break
      case "trail":
        tabsAccess.trail = value === 1
        break
      case "report":
        tabsAccess.reports.allReports = value === 1 ? "view" : value === 2 ? "both" : "none"
        break
      case "schedule_report":
        tabsAccess.reports.scheduleReport = value === 1 ? "view" : value === 2 ? "both" : "none"
        break
      case "alarm":
        tabsAccess.alarm = value === 1 ? "view" : value === 2 ? "both" : "none"
        break
      case "geofence_config":
        tabsAccess.geofence.config = value === 1 ? "view" : value === 2 ? "both" : "none"
        break
      case "geofence_group":
        tabsAccess.geofence.group = value === 1 ? "view" : value === 2 ? "both" : "none"
        break
      case "geofence_stats":
        tabsAccess.geofence.stats = value === 1 ? "view" : value === 2 ? "both" : "none"
        break
      case "user_reponsibility":
        tabsAccess.userManagement.responsibilities = value === 1 ? "view" : value === 2 ? "both" : "none"
        break
      case "user_access":
        tabsAccess.userManagement.user = value === 1 ? "view" : value === 2 ? "both" : "none"
        break
      case "entities":
        tabsAccess.manage.entities = value === 1 ? "view" : value === 2 ? "both" : "none"
        break
      case "group":
        tabsAccess.manage.group = value === 1 ? "view" : value === 2 ? "both" : "none"
        break
      case "vendors":
        tabsAccess.manage.vendors = value === 1 ? "view" : value === 2 ? "both" : "none"
        break
      case "customer":
        tabsAccess.manage.customer = value === 1 ? "view" : value === 2 ? "both" : "none"
        break
    }
  })

  return tabsAccess
}

export const useRoleAccess = () => {
  // This would typically fetch the role data from your backend
  // For now, returning a function that you can call with role data

  const checkAccess = (responsibility: Responsibility, path: string): AccessLevel => {
    const tabsAccess = convertBackendToFrontend(responsibility)

    // Map routes to access levels
    const routeAccessMap: Record<string, AccessLevel> = {
      "/dashboard": tabsAccess.dashboard ? "view" : "none",
      "/trip-dashboard": tabsAccess.tripDashboard ? "view" : "none",
      "/live/list": tabsAccess.listMapView ? "view" : "none",
      "/trail": tabsAccess.trail ? "view" : "none",
      "/reports/report": tabsAccess.reports.allReports,
      "/reports/schedule": tabsAccess.reports.scheduleReport,
      "/alarm/Config": tabsAccess.alarm,
      "/alarm/Logs": tabsAccess.alarm,
      "/geofence/Config": tabsAccess.geofence.config,
      "/geofence/Group": tabsAccess.geofence.group,
      "/geofence/Stats": tabsAccess.geofence.stats,
      "/user-management/responsibility": tabsAccess.userManagement.responsibilities,
      "/user-management/user": tabsAccess.userManagement.user,
      "/manage/entities": tabsAccess.manage.entities,
      "/manage/group": tabsAccess.manage.group,
      "/manage/vendor": tabsAccess.manage.vendors,
      "/manage/customer": tabsAccess.manage.customer,
    }

    return routeAccessMap[path] || "none"
  }

  const hasReportAccess = (responsibility: Responsibility, reportName: string): boolean => {
    return responsibility.report_access.includes(reportName)
  }

  return { checkAccess, hasReportAccess, convertBackendToFrontend }
}
