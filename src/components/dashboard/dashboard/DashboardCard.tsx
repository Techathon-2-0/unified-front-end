import type React from "react"
import { motion } from "framer-motion"
import type { DashboardCardProps } from "../../../types/dashboard/dashboard"

const DashboardCard: React.FC<DashboardCardProps> = ({ title, children, className = "", delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay,
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
      whileHover={{
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        y: -8,
        transition: { duration: 0.3, type: "spring", stiffness: 300 },
      }}
      className={`w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden backdrop-blur-sm hover:border-gray-200 transition-all duration-300 ${className}`}
    >
      <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
      </div>
      {children}
    </motion.div>
  )
}

export default DashboardCard
