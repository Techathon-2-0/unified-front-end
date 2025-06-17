import type React from "react"
import type { DashboardCardProps } from "../../../types/dashboard/dashboard_type"

const DashboardCard: React.FC<DashboardCardProps> = ({ title, children, className = "" }) => {
  return (
    <div
      className={`w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ${className}`}
    >
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export default DashboardCard