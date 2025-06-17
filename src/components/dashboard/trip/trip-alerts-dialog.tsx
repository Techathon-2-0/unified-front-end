import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import type { AlertDetail } from "../../../types/dashboard/trip_type"
import { formatDate } from "../../formatdate"
import type { TripAlertsDialogProps } from "../../../types/dashboard/trip_type"

// Helper to group and count alerts by type and status
function getAlertTypeStats(alerts: AlertDetail[]) {
  const stats: Record<string, { inactive: number; active: number; manuallyClosed: number }> = {}
  alerts.forEach(alert => {
    const type = alert.alert_type_name
    if (!stats[type]) {
      stats[type] = { inactive: 0, active: 0, manuallyClosed: 0 }
    }
    if (alert.status === 0) stats[type].inactive += 1
    else if (alert.status === 1) stats[type].active += 1
    else if (alert.status === 2) stats[type].manuallyClosed += 1
  })
  return stats
}

export function TripAlertsDialog({
  open,
  onOpenChange,
  loadingAlerts,
  alerts,
  selectedTrip,
  handleToggleAlert,
}: TripAlertsDialogProps) {
  const alertTypeStats = getAlertTypeStats(alerts)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl p-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 px-6 pt-6 pb-2 text-2xl font-bold text-gray-900 dark:text-white">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            Alerts for{" "}
            <span className="ml-1 text-blue-600 dark:text-blue-400">{selectedTrip?.id}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-6">
          {loadingAlerts ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <div>
              <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 mt-2">
                Alert Details
              </h4>
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <AlertTriangle className="h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-base text-gray-500">No alerts found for this trip</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {alerts.map((alert) => {
                    const stats = alertTypeStats[alert.alert_type_name] || { inactive: 0, active: 0, manuallyClosed: 0 }
                    return (
                      <Card
                        key={alert.alert_id}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 shadow-sm"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                                {alert.alert_type_name}
                              </CardTitle>
                              <Badge
                                variant={alert.status === 1 ? "destructive" : alert.status === 2 ? "secondary" : "outline"}
                                className={`ml-2 px-2 py-1 text-xs font-semibold ${
                                  alert.status === 1
                                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                    : alert.status === 2
                                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                                    : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
                                }`}
                              >
                                {alert.status_text}
                              </Badge>
                              {alert.can_manually_close && alert.status === 1 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="ml-2"
                                  onClick={() => handleToggleAlert(alert.alert_id)}
                                >
                                  Close Manually
                                </Button>
                              )}
                            </div>
                            {/* Status counts */}
                            <div className="flex gap-3 mt-2 md:mt-0 text-xs font-medium">
                              <span className="px-2 py-1 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                Active: {stats.active}
                              </span>
                              <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                                Manually Closed: {stats.manuallyClosed}
                              </span>
                              <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300">
                                Inactive: {stats.inactive}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-700 dark:text-gray-200 mb-2 font-medium">
                                {alert.alert_description}
                              </p>
                              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                <p>
                                  <span className="font-semibold">Category:</span> {alert.alert_category}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <p>
                                <span className="font-semibold">Created:</span> {formatDate(alert.created_at)}
                              </p>
                              <p>
                                <span className="font-semibold">Updated:</span> {formatDate(alert.updated_at)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
