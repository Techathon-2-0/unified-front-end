import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ChevronDown, Download, Check, X, Filter } from "lucide-react"

import type { AlarmFilterBarProps } from "../../../types/alarm/aconfig"

export const AlarmFilterBar = ({
  totalCount,
  onSearch,
  onExport,
  onGroupsChange,
  availableGroups,
}: AlarmFilterBarProps) => {
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [showGroupOptions, setShowGroupOptions] = useState(false)
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const exportRef = useRef<HTMLDivElement>(null)
  const groupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Update the handleClickOutside function to close popups
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setShowExportOptions(false)
      }
      if (groupRef.current && !groupRef.current.contains(event.target as Node)) {
        setShowGroupOptions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    onGroupsChange(selectedGroups)
  }, [selectedGroups, onGroupsChange])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    onSearch(e.target.value)
  }

  // Update the toggleGroup function to close the popup after selection
  const toggleGroup = (group: string) => {
    setSelectedGroups((prev) => {
      const newSelection = prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
      return newSelection
    })
    // Close the popup after selection
    setShowGroupOptions(false)
  }

  const clearGroups = () => {
    setSelectedGroups([])
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="h-9 bg-gradient-to-r from-red-400 to-[#d5233b] text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm"
          >
            Alarm Count: {totalCount}
          </motion.div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative" ref={exportRef}>
            {/* <button
              className="h-9 flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              onClick={() => setShowExportOptions(!showExportOptions)}
            >
              <Download className="h-4 w-4" />
              Export <ChevronDown className="h-4 w-4" />
            </button> */}
            <AnimatePresence>
              {showExportOptions && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                >
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => {
                      onExport("csv")
                      setShowExportOptions(false)
                    }}
                  >
                    Export as CSV
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => {
                      onExport("pdf")
                      setShowExportOptions(false)
                    }}
                  >
                    Export as PDF
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative" ref={groupRef}>
            <button
              className={`h-9 flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-gray-50 ${
                selectedGroups.length > 0
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "bg-white border-gray-300 text-gray-700"
              }`}
              onClick={() => setShowGroupOptions(!showGroupOptions)}
            >
              <Filter className="h-4 w-4" />
              {selectedGroups.length === 0
                ? "Group"
                : selectedGroups.length === 1
                  ? selectedGroups[0]
                  : `${selectedGroups.length} Groups`}
              {selectedGroups.length > 0 && (
                <span
                  className="ml-1 cursor-pointer hover:bg-blue-100 rounded-full p-0.5"
                  onClick={(e) => {
                    e.stopPropagation()
                    clearGroups()
                  }}
                >
                  <X className="h-3 w-3" />
                </span>
              )}
              <ChevronDown className="h-4 w-4" />
            </button>
            <AnimatePresence>
              {showGroupOptions && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-1 w-55 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                >
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
                    onClick={() => clearGroups()}
                  >
                    <span>All Groups</span>
                    {selectedGroups.length === 0 && <Check className="h-4 w-4 text-blue-500" />}
                  </button>
                  {availableGroups.map((group) => (
                    <button
                      key={group}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
                      onClick={() => toggleGroup(group)}
                    >
                      <span>{group}</span>
                      {selectedGroups.includes(group) && <Check className="h-4 w-4 text-blue-500" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative flex-1 min-w-[240px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="h-9 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search alarms..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
