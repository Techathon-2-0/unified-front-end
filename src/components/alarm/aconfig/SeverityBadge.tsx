import { motion } from "framer-motion"

import type { SeverityBadgeProps } from "../../../types/alarm/aconfig_type"

export const SeverityBadge = ({ severity }: SeverityBadgeProps) => {
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "warning":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "general":
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(
        severity,
      )}`}
    >
      {severity}
    </motion.span>
  )
}
