import { motion } from "framer-motion"
import { Truck, RefreshCw } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { TripHeaderProps } from "../../../types/dashboard/trip"

export function TripHeader({ totalTrips, timeRange, setTimeRange }: TripHeaderProps) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-10 shadow-sm"
    >
      <div className="flex flex-wrap justify-between items-center gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          className="flex items-center bg-gray-100 rounded-full px-4 py-2"
        >
          <Truck className="h-5 w-5 mr-2 text-gray-700" />
          <span className="text-base font-semibold text-gray-800">{totalTrips} Trips</span>
        </motion.div>

        <div className="flex items-center gap-2 ml-auto overflow-x-auto pb-1 max-w-full">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0 bg-gray-100 p-2 rounded-full text-gray-700 hover:bg-gray-200 transition-colors"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-5 w-5" />
          </motion.button>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
            className="bg-gray-100 rounded-lg p-1 overflow-x-auto max-w-full"
          >
            <Tabs defaultValue={timeRange} onValueChange={setTimeRange} className="border-0">
              <TabsList className="bg-transparent flex whitespace-nowrap">
                <TabsTrigger
                  value="today"
                  className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm rounded-md px-2 sm:px-3 py-1.5 text-xs sm:text-sm"
                >
                  Today
                </TabsTrigger>
                <TabsTrigger
                  value="yesterday"
                  className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm rounded-md px-2 sm:px-3 py-1.5 text-xs sm:text-sm"
                >
                  Yesterday
                </TabsTrigger>
                <TabsTrigger
                  value="7days"
                  className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm rounded-md px-2 sm:px-3 py-1.5 text-xs sm:text-sm"
                >
                  7 days
                </TabsTrigger>
                <TabsTrigger
                  value="15days"
                  className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm rounded-md px-2 sm:px-3 py-1.5 text-xs sm:text-sm"
                >
                  15 days
                </TabsTrigger>
                <TabsTrigger
                  value="30days"
                  className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm rounded-md px-2 sm:px-3 py-1.5 text-xs sm:text-sm"
                >
                  30 days
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
