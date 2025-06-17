import { motion } from "framer-motion"
import type { TrailTypeSelectorProps } from "@/types/trail/trail_type"

export default function TrailTypeSelector({ value, onChange }: TrailTypeSelectorProps) {
  return (
    <div className="flex flex-col space-y-2">
      {/* Toggle Switch for Vehicle/Trip */}
      <div className="bg-gray-200 dark:bg-gray-700 rounded-full px-1 py-1 flex items-center justify-center w-55 h-10">
        <div
          className="relative w-full h-full flex items-center justify-between px-2 cursor-pointer text-sm"
          onClick={() => onChange(value === "vehicle" ? "trip" : "vehicle")}
        >
          <span className={`z-10 font-medium ${value === "vehicle" ? "text-white" : "text-gray-700 dark:text-gray-300"}`}>
            Vehicle Based
          </span>
          <span className={`z-10 font-medium ${value === "trip" ? "text-white" : "text-gray-700 dark:text-gray-300"}`}>Trip Based</span>
          <motion.div
            className="absolute top-0 left-0 w-1/2 h-full bg-black dark:bg-gray-800 rounded-full"
            initial={false}
            animate={{ x: value === "vehicle" ? 0 : "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
        </div>
      </div>
    </div>
  )
}
  
