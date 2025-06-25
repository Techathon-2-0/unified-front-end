import axios from "axios"
import type {
  DashboardReportData,
  ReportFilters,
  Group,
  AllPositionsReportData,
  CustomerGroup,
  AlarmReportData,
  TripGpsStatusReportData,
  TripSummaryReportData,
} from "../../types/reports/report_type"

// Fetch groups by user ID (reusing from your existing code)
export const fetchGroupsbyuserId = async (userId: number): Promise<Group[]> => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/groups/user/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
      },
    })
    const groups = response.data.data || []

    return groups.map((group: any) => ({
      id: group.id,
      name: group.group_name,
      entityIds: group.entities ? group.entities.map((entity: any) => entity.id) : [],
      createdOn: group.created_at,
      updatedOn: group.updated_at,
    }))
  } catch (error) {
    console.error("Error fetching groups:", error)
    throw error
  }
}

// Fetch customer groups by user ID
export const fetchCustomerGroupsbyuser = async (userId: string): Promise<CustomerGroup[]> => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/customer-group-by-user/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
      },
    })
    return res.data.data?.data?.customer_groups || []
  } catch (error) {
    console.error("Error fetching customer groups:", error)
    return []
  }
}

// Helper function to get alarm type ID
// const getAlarmTypeId = (typeName: string): number => {
//   const types = [
//     "Stoppage", // 1
//     "Overspeeding", // 2
//     "Continuous Driving", // 3
//     "No GPS Feed", // 4
//     "Reached Stop", // 5
//     "Geofence", // 6
//     "Route Deviation", // 7
//   ]
//   const index = types.findIndex((type) => type.toLowerCase() === typeName.toLowerCase())
//   return index !== -1 ? index + 1 : 1 // Default to 1 (Stoppage) if not found
// }

// // Helper function to get alarm type name
// const getAlarmTypeName = (typeId: number): string => {
//   const types = [
//     "Stoppage", // 1
//     "Overspeeding", // 2
//     "Continuous Driving", // 3
//     "No GPS Feed", // 4
//     "Reached Stop", // 5
//     "Geofence", // 6
//     "Route Deviation", // 7
//   ]
//   return types[typeId - 1] || "Unknown"
// }

// Get all alarm types for dropdown
export const getAlarmTypes = () => {
  return [
    { id: 1, name: "Stoppage" },
    { id: 2, name: "Overspeeding" },
    { id: 3, name: "Continuous Driving" },
    { id: 4, name: "No GPS Feed" },
    { id: 5, name: "Reached Stop" },
    { id: 6, name: "Geofence" },
    { id: 7, name: "Route Deviation" },
  ]
}

// Generate dashboard report
export const generateDashboardReport = async (filters: ReportFilters): Promise<DashboardReportData[]> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/report/dashboard`,
      {
        vehicleGroups: filters.vehicleGroups,
        tripStatus: filters.tripStatus,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      },
    )

    return response.data.data || []
  } catch (error) {
    console.error("Error generating dashboard report:", error)
    throw error
  }
}

// Generate all positions report
export const generateAllPositionsReport = async (filters: ReportFilters): Promise<AllPositionsReportData[]> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/report/all-positions`,
      {
        vehicleGroups: filters.vehicleGroups,
        startDate: filters.startDate,
        endDate: filters.endDate,
        vehicleNumber: filters.vehicleNumber,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      },
    )

    // Reverse trailPoints for each vehicle so latest is last
    const data = (response.data.data || []).map((vehicle: AllPositionsReportData) => ({
      ...vehicle,
      trailPoints: Array.isArray(vehicle.trailPoints)
        ? [...vehicle.trailPoints].reverse()
        : vehicle.trailPoints,
    }));

    return data
  } catch (error) {
    console.error("Error generating all positions report:", error)
    throw error
  }
}

// Generate alarm report
export const generateAlarmReport = async (filters: ReportFilters): Promise<AlarmReportData[]> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/alarmreport`,
      {
        vehicleGroups: filters.vehicleGroups,
        customerGroups: filters.customerGroups,
        alarmTypes: filters.alarmTypes,
        startDate: filters.startDate,
        endDate: filters.endDate,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      },
    )

    return response.data.data || []
  } catch (error) {
    console.error("Error generating alarm report:", error)
    throw error
  }
}

// Generate trip GPS status report
export const generateTripGpsStatusReport = async (filters: ReportFilters): Promise<TripGpsStatusReportData[]> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/report/trip-gps-status`,
      {
        customer_group_ids: filters.customerGroups,
        start_date: filters.startDate,
        end_date: filters.endDate,
        trip_status: filters.tripStatus,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      },
    )

    // Transform the nested response to flat stop-wise data
    const trips = response.data.trips || []
    const flatData: TripGpsStatusReportData[] = []

    trips.forEach((trip: any) => {
      const commonInfo = trip.common_info
      const stopsInfo = trip.stops_info || []

      stopsInfo.forEach((stop: any) => {
        flatData.push({
          // Common info (repeated for each stop)
          shipmentId: commonInfo.shipment_id,
          tripStartTime: commonInfo.trip_start_time,
          tripEndTime: commonInfo.trip_end_time,
          vehicleNumber: commonInfo.vehicle_number,
          origin: commonInfo.origin,
          destination: commonInfo.destination,
          serviceProvider: commonInfo.service_provider,
          gpsVendor: commonInfo.gps_vendor,
          consentStatus: commonInfo.consent_status,
          lastUpdatedTime: commonInfo.last_updated_time,
          operator: commonInfo.operator,
          tripStatus: commonInfo.trip_status,
          // Stop specific info
          plannedSequence: stop.planned_sequence,
          actualSequence: stop.actual_sequence,
          stopType: stop.stop_type,
          lrNumber: stop.lr_number,
          customerName: stop.customer_name,
          entryTime: stop.entry_time,
          exitTime: stop.exit_time,
          gpsPingCount: stop.gps_ping_count,
          lastPingVendor: stop.last_ping_vendor,
          hasFasttagPing: stop.has_fasttag_ping,
        })
      })
    })

    return flatData
  } catch (error) {
    console.error("Error generating trip GPS status report:", error)
    throw error
  }
}

// Generate trip summary report
export const generateTripSummaryReport = async (filters: ReportFilters): Promise<TripSummaryReportData[]> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/report/trip-summary`,
      {
        customer_group_ids: filters.customerGroups,
        start_date: filters.startDate,
        end_date: filters.endDate,
        trip_status: filters.tripStatus,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      },
    )

    console.log("Trip Summary Report Response:", response.data)

    return response.data.data?.trips || []
  } catch (error) {
    console.error("Error generating trip summary report:", error)
    throw error
  }
}

// Export report as CSV
export const exportReportAsCSV = (
  data:
    | DashboardReportData[]
    | AllPositionsReportData[]
    | AlarmReportData[]
    | TripGpsStatusReportData[]
    | TripSummaryReportData[],
  reportType: string,
) => {
  if (!data || data.length === 0) {
    throw new Error("No data to export")
  }

  if (reportType === "dashboard") {
    const dashboardData = data as DashboardReportData[]
    // Define CSV headers for dashboard report
    const headers = [
      "Vehicle Number",
      "Location",
      "Latitude",
      "Longitude",
      "Last Vendor",
      "GPS Time",
      "GPRS Time",
      "Speed (km/h)",
      "Status",
      "GPS Ping Count",
      "Power",
      "Battery",
      "Ignition Status",
    ]

    // Convert data to CSV format
    const csvContent = [
      headers.join(","),
      ...dashboardData.map((row) =>
        [
          `"${row.vehicleNumber}"`,
          `"${row.location}"`,
          row.latitude || "",
          row.longitude || "",
          `"${row.lastVendor}"`,
          `"${row.gpsTime || ""}"`,
          `"${row.gprsTime || ""}"`,
          row.speed,
          `"${row.status}"`,
          row.gpsPingCount,
          `"${row.power}"`,
          `"${row.battery}"`,
          `"${row.ignitionStatus}"`,
        ].join(","),
      ),
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${reportType}_report_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else if (reportType === "all_positions") {
    const allPositionsData = data as AllPositionsReportData[]

    // Create CSV headers with Vehicle Number as first column
    const headers = [
      "S.No",
      "Vehicle Number",
      "Vendor",
      "Device ID",
      "GPS Time",
      "GPRS Time",
      "Latitude",
      "Longitude",
      "Speed (km/h)",
      "Address",
      "Power",
      "Battery",
      "Ignition Status",
      "Heading",
    ]

    let csvContent = headers.join(",") + "\n"
    let serialNumber = 1

    // Flatten all positions from all vehicles into single list
    allPositionsData.forEach((vehicle) => {
      vehicle.trailPoints.forEach((point) => {
        const row = [
          serialNumber++,
          `"${vehicle.vehicleNumber}"`,
          `"${point.vendor}"`,
          `"${point.deviceId}"`,
          `"${point.gpsTime || ""}"`,
          `"${point.gprsTime || ""}"`,
          point.latitude,
          point.longitude,
          point.speed,
          `"${point.address}"`,
          `"${point.power}"`,
          `"${point.battery}"`,
          `"${point.ignitionStatus}"`,
          point.heading,
        ]
        csvContent += row.join(",") + "\n"
      })
    })

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${reportType}_report_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else if (reportType === "alarm") {
    const alarmData = data as AlarmReportData[]
    // Define CSV headers for alarm report
    const headers = [
      "Vehicle Number",
      "Vendor Name",
      "Created At",
      "Start Latitude",
      "Start Longitude",
      "End Time",
      "End Latitude",
      "End Longitude",
      "Alert Name",
      "Description",
      "Duration (seconds)",
      "Severity Type",
      "Alarm Value",
      "Rest Duration",
      "Shipment ID",
      "Driver Name",
      "Driver Mobile",
      "Service Provider",
      "Customer Names",
      "Email Status",
    ]

    // Convert data to CSV format
    const csvContent = [
      headers.join(","),
      ...alarmData.map((row) =>
        [
          `"${row.vehicleNumber}"`,
          `"${row.vendorName}"`,
          `"${row.createdAt}"`,
          row.startLatitude || "",
          row.startLongitude || "",
          `"${row.endTime || ""}"`,
          row.endLatitude || "",
          row.endLongitude || "",
          `"${row.alertName}"`,
          `"${row.description}"`,
          row.duration || "",
          `"${row.severityType}"`,
          row.alarmValue || "",
          row.restDuration || "",
          `"${row.shipmentId || ""}"`,
          `"${row.driverName || ""}"`,
          `"${row.driverMobileNumber || ""}"`,
          `"${row.serviceProviderAliasValue || ""}"`,
          `"${row.customerNames.join(", ")}"`,
          `"${row.emailSentStatus}"`,
        ].join(","),
      ),
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${reportType}_report_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else if (reportType === "trip_gps_status") {
    const tripGpsData = data as TripGpsStatusReportData[]
    // Define CSV headers for trip GPS status report
    const headers = [
      "Shipment ID",
      "Trip Start Time",
      "Trip End Time",
      "Vehicle Number",
      "Origin",
      "Destination",
      "Service Provider",
      "GPS Vendor",
      "Consent Status",
      "Last Updated Time",
      "Operator",
      "Trip Status",
      "Planned Sequence",
      "Actual Sequence",
      "Stop Type",
      "LR Number",
      "Customer Name",
      "Entry Time",
      "Exit Time",
      "GPS Ping Count",
      "Last Ping Vendor",
      "Has Fasttag Ping",
    ]

    // Convert data to CSV format
    const csvContent = [
      headers.join(","),
      ...tripGpsData.map((row) =>
        [
          `"${row.shipmentId}"`,
          `"${row.tripStartTime}"`,
          `"${row.tripEndTime}"`,
          `"${row.vehicleNumber}"`,
          `"${row.origin}"`,
          `"${row.destination}"`,
          `"${row.serviceProvider}"`,
          `"${row.gpsVendor}"`,
          `"${row.consentStatus || ""}"`,
          `"${row.lastUpdatedTime || ""}"`,
          `"${row.operator || ""}"`,
          `"${row.tripStatus}"`,
          row.plannedSequence,
          row.actualSequence,
          `"${row.stopType}"`,
          `"${row.lrNumber}"`,
          `"${row.customerName}"`,
          `"${row.entryTime}"`,
          `"${row.exitTime}"`,
          row.gpsPingCount,
          `"${row.lastPingVendor}"`,
          row.hasFasttagPing ? "Yes" : "No",
        ].join(","),
      ),
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${reportType}_report_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else if (reportType === "trip_summary") {
    const tripSummaryData = data as TripSummaryReportData[]

    // Create CSV content with trip sections
    let csvContent = ""

    tripSummaryData.forEach((trip, tripIndex) => {
      // Add trip header
      if (tripIndex > 0) csvContent += "\n\n"
      csvContent += `Trip Summary - ${trip.shipment_id}\n`

      // Add comprehensive trip info
      const basicHeaders = [
        "Vehicle Number",
        "Shipment ID",
        "Trip Status",
        "Vehicle Status",
        "Current Location Address",
        "Current Location Latitude",
        "Current Location Longitude",
        "GPS Vendor Last",
        "GPRS Time",
        "GPS Time",
        "Vehicle Status Duration",
        "Route Name",
        "Domain Name",
        "Service Provider",
        "Start Time",
        "Start Location",
        "End Time",
        "End Location",
        "Total Distance (km)",
        "Total Time",
        "Covered Distance (km)",
        "Average In Day",
        "Total Stoppage Time",
        "Total Detention Time",
        "Total Drive Time",
        "Driver Name",
        "Driver Mobile",
        "GPS Type",
        "GPS Frequency",
        "GPS Unit ID",
        "GPS Vendor",
        "Shipment Source",
        "Intutrack Consent Status",
        "Intutrack Last Updated",
        "Intutrack Operator",
      ]
      csvContent += basicHeaders.join(",") + "\n"

      // Handle coordinates
      const lat = Array.isArray(trip.current_location_coordinates) ? trip.current_location_coordinates[0] : ""
      const lng = Array.isArray(trip.current_location_coordinates) ? trip.current_location_coordinates[1] : ""

      const basicRow = [
        `"${trip.vehicle_number}"`,
        `"${trip.shipment_id}"`,
        `"${trip.trip_status}"`,
        `"${trip.vehicle_status}"`,
        `"${trip.current_location_address}"`,
        lat,
        lng,
        `"${trip.gps_vendor_last}"`,
        `"${trip.gprs_time}"`,
        `"${trip.gps_time}"`,
        `"${trip.vehicle_status_duration}"`,
        `"${trip.route_name}"`,
        `"${trip.domain_name}"`,
        `"${trip.service_provider_alias_value}"`,
        `"${trip.start_time}"`,
        `"${trip.start_location}"`,
        `"${trip.end_time}"`,
        `"${trip.end_location}"`,
        trip.total_distance,
        `"${trip.total_time}"`,
        trip.covered_distance,
        trip.average_in_day,
        `"${trip.total_stoppage_time}"`,
        `"${trip.total_detention_time}"`,
        `"${trip.total_drive_time}"`,
        `"${trip.driver_name}"`,
        `"${trip.driver_mobile}"`,
        `"${trip.gps_type}"`,
        `"${trip.gps_frequency}"`,
        `"${trip.gps_unit_id}"`,
        `"${trip.gps_vendor}"`,
        `"${trip.shipment_source}"`,
        `"${trip.intutrack_data?.consent_status || ""}"`,
        `"${trip.intutrack_data?.last_updated_time || ""}"`,
        `"${trip.intutrack_data?.operator || ""}"`,
      ]
      csvContent += basicRow.join(",") + "\n\n"

      // Add stops section
      csvContent += "Stops Information:\n"
      const stopHeaders = [
        "S.No",
        "Planned Sequence",
        "Actual Sequence",
        "Stop Type",
        "LR Number",
        "Stop Location Address",
        "Location Name",
        "Customer Name",
        "Entry Time",
        "Exit Time",
        "Loading/Unloading Time",
        "Detention Time",
        "Status",
      ]
      csvContent += stopHeaders.join(",") + "\n"

      // Add stops data
      trip.stops.forEach((stop, index) => {
        const stopRow = [
          index + 1,
          stop.planned_sequence,
          stop.actual_sequence,
          `"${stop.stop_type}"`,
          `"${stop.lr_number}"`,
          `"${stop.stop_location_address}"`,
          `"${stop.location_name}"`,
          `"${stop.customer_name}"`,
          `"${stop.entry_time}"`,
          `"${stop.exit_time}"`,
          `"${stop.loading_unloading_time}"`,
          `"${stop.detention_time}"`,
          `"${stop.status}"`,
        ]
        csvContent += stopRow.join(",") + "\n"
      })
    })

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${reportType}_report_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// Search report data (client-side filtering)
const searchReportData = (
  data:
    | DashboardReportData[]
    | AllPositionsReportData[]
    | AlarmReportData[]
    | TripGpsStatusReportData[]
    | TripSummaryReportData[],
  query: string,
):
  | DashboardReportData[]
  | AllPositionsReportData[]
  | AlarmReportData[]
  | TripGpsStatusReportData[]
  | TripSummaryReportData[] => {
  if (!query.trim()) return data

  const lowercaseQuery = query.toLowerCase()

  if (data.length > 0) {
    // Check if it's dashboard data
    if ("location" in data[0]) {
      const dashboardData = data as DashboardReportData[]
      return dashboardData.filter(
        (item) =>
          item.vehicleNumber.toLowerCase().includes(lowercaseQuery) ||
          item.location.toLowerCase().includes(lowercaseQuery) ||
          item.lastVendor.toLowerCase().includes(lowercaseQuery) ||
          item.status.toLowerCase().includes(lowercaseQuery),
      )
    }
    // Check if it's alarm data
    else if ("alertName" in data[0]) {
      const alarmData = data as AlarmReportData[]
      return alarmData.filter(
        (item) =>
          item.vehicleNumber.toLowerCase().includes(lowercaseQuery) ||
          item.vendorName.toLowerCase().includes(lowercaseQuery) ||
          item.alertName.toLowerCase().includes(lowercaseQuery) ||
          item.severityType.toLowerCase().includes(lowercaseQuery) ||
          item.customerNames.some((name) => name.toLowerCase().includes(lowercaseQuery)),
      )
    }
    // Check if it's trip GPS status data
    else if ("shipmentId" in data[0] && "plannedSequence" in data[0]) {
      const tripGpsData = data as TripGpsStatusReportData[]
      return tripGpsData.filter(
        (item) =>
          item.shipmentId.toLowerCase().includes(lowercaseQuery) ||
          item.vehicleNumber.toLowerCase().includes(lowercaseQuery) ||
          item.customerName.toLowerCase().includes(lowercaseQuery) ||
          item.origin.toLowerCase().includes(lowercaseQuery) ||
          item.destination.toLowerCase().includes(lowercaseQuery) ||
          item.serviceProvider.toLowerCase().includes(lowercaseQuery),
      )
    }
    // Check if it's trip summary data
    else if ("vehicle_number" in data[0] && "stops" in data[0]) {
      const tripSummaryData = data as TripSummaryReportData[]
      return tripSummaryData.filter(
        (item) =>
          item.vehicle_number.toLowerCase().includes(lowercaseQuery) ||
          item.shipment_id.toLowerCase().includes(lowercaseQuery) ||
          item.route_name.toLowerCase().includes(lowercaseQuery) ||
          item.driver_name.toLowerCase().includes(lowercaseQuery) ||
          item.service_provider_alias_value.toLowerCase().includes(lowercaseQuery) ||
          item.stops.some((stop) => stop.customer_name.toLowerCase().includes(lowercaseQuery)),
      )
    }
    // All positions data
    else {
      const allPositionsData = data as AllPositionsReportData[]
      return allPositionsData.filter((item) => item.vehicleNumber.toLowerCase().includes(lowercaseQuery))
    }
  }

  return data
}

export { searchReportData }
