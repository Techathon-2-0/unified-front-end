import { motion } from "framer-motion"
import { Check } from "lucide-react"
import type { TrailTypeSelectorProps, TrailType } from "../../types/trail/trail"

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
            value === option.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
          }`}
        >
          <span className="text-sm font-medium">{option.label}</span>
          {value === option.value && <Check className="h-4 w-4 text-blue-500" />}
        </motion.div>
      ))}
    </div>
  )
}
