import React, { useEffect, useState } from "react";
import { CheckCircle, AlertTriangle, Clock, ExternalLink, Car, MapPin } from "lucide-react";
//import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { fetchVehicles } from "../../../data/live/list"; // Adjust path as needed
import { useAuth } from "../../../context/AuthContext"; // Adjust path as needed
import DashboardCard from "./DashboardCard"

type Vehicle = {
  id: string;
  vehicleNumber: string;
  deviceName: string;
  status: string;
  speed: number;
  driverName: string;
  driverMobile: string;
  lat: number;
  lng: number;
  vendorName?: string; // Add vendorName as optional
  // address?: string; // Remove address, not used anymore
};

const StatusIndicator: React.FC<{ status: string }> = ({ status }) => {
  const configs = {
    "Active": { 
      icon: CheckCircle, 
      color: "text-green-800 dark:text-green-300", 
      bg: "bg-green-100 dark:bg-green-900/50", 
      label: "Active" 
    },
    "No Update": { 
      icon: Clock, 
      color: "text-yellow-800 dark:text-yellow-300", 
      bg: "bg-yellow-100 dark:bg-yellow-900/50", 
      label: "No Update" 
    },
    "No Data": { 
      icon: AlertTriangle, 
      color: "text-red-800 dark:text-red-300", 
      bg: "bg-red-100  dark:bg-red-900/50", 
      label: "No Data" 
    },
  };

  const config = configs[status as keyof typeof configs] || configs["No Data"];
  const Icon = config.icon;

  return (
    <div className="flex items-center space-x-2 animate-in fade-in duration-300">
      <div className={`p-1.5 rounded-lg ${config.bg}`}>
        <Icon size={14} className={config.color} />
      </div>
      <span className={`text-sm font-medium ${config.color} whitespace-nowrap`}>{config.label}</span>
    </div>
  );
};

const VehicleStatus: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  //const [addresses, setAddresses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth()

  useEffect(() => {
    const loadVehicles = async () => {
      setLoading(true);
      const data = await fetchVehicles(String(user?.id));
      // Ensure vehicles is always an array
      const vehiclesArray = Array.isArray(data) ? data : [];
      setVehicles(vehiclesArray);

      setLoading(false);
    };

    loadVehicles();
  }, [user?.id]);

  // Defensive: ensure vehicles is always an array before using .filter and .length
  const activeCount = Array.isArray(vehicles) ? vehicles.filter((v) => v.status === "Active").length : 0;
  const totalCount = Array.isArray(vehicles) ? vehicles.length : 0;

  if (loading) {
    return (
      <DashboardCard title="Fleet Status" delay={0.3}>
        <div className="p-4 sm:p-6 h-[426px]">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading...</span>
          </div>
        </div>
      </DashboardCard>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden h-[500px] flex flex-col backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-600">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex-shrink-0">
              <Car className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">Fleet Status</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">Real-time vehicle monitoring</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 flex-shrink-0">
            <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 whitespace-nowrap">
              {activeCount}/{totalCount} Active
            </Badge>
            <Link to="/live/vehicles">
              <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md text-sm font-medium whitespace-nowrap">
                <span>View All</span>
                <ExternalLink size={14} />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scrollable Table Container */}
      <div className="flex-1 overflow-hidden">
        {/* Responsive overflow: horizontal scroll only on small screens */}
        <div className="h-full overflow-x-auto">
          <div className="w-full h-full">
            <table className="w-full min-w-[600px] lg:min-w-0">
                <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider min-w-[160px]">
                      Vehicle
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                      Status
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider min-w-[80px]">
                      Speed
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider min-w-[140px]">
                      Driver
                    </th>
                    <th className="px-3 sm:px-4 pr-0 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider min-w-[200px]">
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {vehicles.map((vehicle, index) => (
                    <tr
                      key={vehicle.id}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 animate-in fade-in slide-in-from-bottom-2"
                      style={{
                        animationDelay: `${index * 30}ms`
                      }}
                    >
                      <td className="px-3 sm:px-4 py-4 min-w-[160px]">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0">
                            <Car size={16} className="text-gray-600 dark:text-gray-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{vehicle.vehicleNumber}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{vehicle.deviceName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-4 min-w-[120px]">
                        <StatusIndicator status={vehicle.status} />
                      </td>
                      <td className="px-3 sm:px-4 py-4 min-w-[80px]">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{vehicle.speed || "0"}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">km/h</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-4 min-w-[140px]">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{vehicle.driverName || "-"}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{vehicle.driverMobile || "-"}</div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 pr-0 py-4 min-w-[200px]">
                        <div className="flex items-center space-x-1 min-w-0">
                          <MapPin size={12} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                          <div className="relative group max-w-xs">
                            <div className="truncate text-xs cursor-default max-w-[180px]">
                              {/* Show lat/lng */}
                              <span>
                                {vehicle.lat && vehicle.lng
                                  ? `${vehicle.lat.toFixed(6)}, ${vehicle.lng.toFixed(6)}`
                                  : "No location"}
                              </span>
                              {/* Vendor name on next line if present */}
                              {vehicle.vendorName && (
                                <div className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded w-fit">
                                  {vehicle.vendorName}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        
      </div>

      {/* Footer */}
      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">{totalCount} vehicles total</span>
          <Link to="/live/vehicles">
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:scale-105 active:scale-95 font-medium transition-all duration-200 whitespace-nowrap">
              View Details →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VehicleStatus;