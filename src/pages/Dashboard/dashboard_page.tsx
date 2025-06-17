import type React from "react"
import { motion } from "framer-motion"
import VehicleSummary from "../../components/dashboard/dashboard/VehicleSummary"
import AlertSummary from "../../components/dashboard/dashboard/AlertSummary"
import PerformanceMetrics from "../../components/dashboard/dashboard/PerformanceMetrics"
import AlertsList from "../../components/dashboard/dashboard/AlertsList"
import VehicleStatus from "../../components/dashboard/dashboard/VehicleStatus"
import VendorAnalytics from "../../components/dashboard/dashboard/VendorAnalytics"

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen">
      <div className="p-3 sm:p-4 lg:p-6 max-w-[1600px] mx-auto">
        {/* Top Row - Summary Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          <VehicleSummary />
          <AlertSummary />
          <PerformanceMetrics />
        </motion.div>

        {/* Middle Row - Detailed Views */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="xl:col-span-2"
          >
            <VehicleStatus />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <AlertsList userId="user-id" />
          </motion.div>
        </div>

        {/* Bottom Row - Vendor Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <VendorAnalytics />
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard