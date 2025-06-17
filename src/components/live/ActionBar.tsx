import { motion } from "framer-motion"
import { RefreshCw } from "lucide-react"
import type { ActionBarProps } from "../../types/live/list_type"

const ActionBar = ({ view, setView, onRefresh}: ActionBarProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 w-full">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        {/* <p className="text-lg text-gray-500 dark:text-gray-400">Total trips: {tripCount}</p> */}
      </div>

      {/* Right Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
        {/* Toggle Switch */}
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full px-1 py-1 flex items-center w-full sm:w-25 h-10">
          <div
            className="relative w-full h-full flex items-center justify-between px-2 cursor-pointer text-sm"
            onClick={() => setView(view === "list" ? "map" : "list")}
          >
            <span className={`z-10 font-medium ${view === "list" ? "text-white" : "text-gray-700 dark:text-gray-300"}`}>List</span>
            <span className={`z-10 font-medium ${view === "map" ? "text-white" : "text-gray-700 dark:text-gray-300"}`}>Map</span>
            <motion.div
              className="absolute top-0 left-0 w-1/2 h-full bg-black dark:bg-gray-900 rounded-full"
              initial={false}
              animate={{ x: view === "list" ? 0 : "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 w-full sm:w-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-black dark:bg-gray-800 text-white rounded-md shadow w-full sm:w-auto"
            onClick={onRefresh}
            aria-label="Refresh"
          >
            <RefreshCw className="h-4 w-4 mx-auto" />
          </motion.button>

          {/* <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-black dark:bg-gray-800 text-white rounded-md shadow font-medium text-sm w-full sm:w-auto"
          >
            Configuration
          </motion.button> */}
        </div>
      </div>
    </div>
  )
}

export default ActionBar
