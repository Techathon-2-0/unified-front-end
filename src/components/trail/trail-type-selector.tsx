import { motion } from "framer-motion"
import { Check } from "lucide-react"
import type { TrailTypeSelectorProps, TrailType } from "../../types/trail/trail_type"

export default function TrailTypeSelector({ value, onChange }: TrailTypeSelectorProps) {
  const options: { value: TrailType; label: string }[] = [
    { value: "vehicle", label: "Vehicle Based" },
    { value: "trip", label: "Trip Based" },
  ]

  return (
    <div className="flex flex-col space-y-2">
      {options.map((option) => (
        <motion.div
          key={option.value}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange(option.value)}
          className={`flex items-center justify-between p-3 rounded-md cursor-pointer border ${
            value === option.value
              ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20 dark:text-white"
              : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200"
          }`}
        >
          <span className="text-sm font-medium">{option.label}</span>
          {value === option.value && <Check className="h-4 w-4 text-blue-500 dark:text-blue-400" />}
        </motion.div>
      ))}
    </div>
  )
}
