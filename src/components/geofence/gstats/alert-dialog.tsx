import { useState, useEffect } from "react"
import { AlertTriangle, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { fetchGeofenceAlerts } from "../../../data/geofence/gstats"
import type { GeofenceAlert } from "../../../types/geofence/gstats_type"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "../../formatdate"
import type { AlertDialogProps } from "../../../types/geofence/gstats_type"

export function AlertDialog({ isOpen, onClose, vehicleNumber, geofenceId }: AlertDialogProps) {
  const [alerts, setAlerts] = useState<GeofenceAlert[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { showErrorToast, Toaster } = useToast({ position: "top-right" })

  useEffect(() => {
    if (isOpen) {
      if (!geofenceId) {
        showErrorToast("No geofence selected.", "Error")
        onClose?.()
        return
      }
      if (vehicleNumber && geofenceId) {
        setLoading(true)
        setError(null)

        fetchGeofenceAlerts(geofenceId, vehicleNumber)
          .then((response) => {
            setAlerts(response.alerts)
          })
          .catch((err) => {
            console.error("Error fetching alerts:", err)
            setError("Failed to load alerts. Please try again.")
          })
          .finally(() => {
            setLoading(false)
          })
      }
    }
  }, [isOpen, vehicleNumber, geofenceId])

  const getGeofenceStatusText = (status: number) => {
    switch (status) {
      case 0:
        return "Entry (In)"
      case 1:
        return "Exit (Out)"
      case 2:
        return "Entry/Exit (Both)"
      default:
        return String(status)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            Alerts for {vehicleNumber}
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="w-8 h-8 border-4 border-t-red-500 border-red-200 rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">{error}</div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
              <AlertTriangle className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
              <p>No alerts found for this vehicle.</p>
              <p className="text-sm mt-2">There are no geofence alerts for this vehicle in the last 24 hours.</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.alert_id}
                    className="border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-white dark:bg-gray-800"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">Alert #{alert.alert_id}</div>
                      <Badge
                        className={`${
                          alert.alert_status === 1
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {alert.alert_status_text}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-500 dark:text-gray-400">Geofence Event:</div>
                      <div>
                        <Badge
                          className={`${
                            alert.geofence_status === 0
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : alert.geofence_status === 1
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          }`}
                        >
                          {getGeofenceStatusText(alert.geofence_status)}
                        </Badge>
                      </div>

                      <div className="text-gray-500 dark:text-gray-400">Geofence:</div>
                      <div>{alert.geofence_name}</div>

                      <div className="text-gray-500 dark:text-gray-400">Category:</div>
                      <div>{alert.alarm_category}</div>

                      <div className="text-gray-500 dark:text-gray-400">Description:</div>
                      <div>{alert.alarm_description}</div>

                      <div className="text-gray-500 dark:text-gray-400">Created:</div>
                      <div>{formatDate(alert.created_at)}</div>

                      <div className="text-gray-500 dark:text-gray-400">Updated:</div>
                      <div>{formatDate(alert.updated_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
        {Toaster}
      </DialogContent>
    </Dialog>
  )
}