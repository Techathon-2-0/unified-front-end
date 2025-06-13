import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { GroupSelectionProps } from "../../../types/alarm/aconfig_type"

export const GroupSelection = ({
  title,
  groups,
  selectedGroups,
  onChange,
  nameField = "name",
  idField = "id",
}: GroupSelectionProps) => {
  const [searchQuery, setSearchQuery] = useState("")
//   const [isExpanded, setIsExpanded] = useState(true)

  const filteredGroups = groups.filter((group) => 
    group[nameField].toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectAll = () => {
    if (selectedGroups.length === filteredGroups.length && filteredGroups.length > 0) {
      onChange([])
    } else {
      onChange(filteredGroups.map((group) => group[idField]))
    }
  }

  const toggleGroup = (id: number) => {
    if (selectedGroups.includes(id)) {
      onChange(selectedGroups.filter((groupId) => groupId !== id))
    } else {
      onChange([...selectedGroups, id])
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={handleSelectAll}
            className="px-3 py-1 bg-black dark:bg-gray-700 text-white text-xs rounded hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
          >
            {selectedGroups.length === filteredGroups.length && filteredGroups.length > 0 ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        
        <div className="mb-3">
          <Input
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
          />
        </div>
        
        <ScrollArea className="h-40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredGroups.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-sm text-gray-500 dark:text-gray-400">No groups found</p>
              </div>
            ) : (
              filteredGroups.map((group) => (
                <div
                  key={group[idField]}
                  className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer dark:bg-gray-800"
                  onClick={() => toggleGroup(group[idField])}
                >
                  <Checkbox
                    id={`group-${group[idField]}`}
                    checked={selectedGroups.includes(group[idField])}
                    onCheckedChange={() => toggleGroup(group[idField])}
                    className="dark:border-gray-600"
                  />
                  <Label 
                    htmlFor={`group-${group[idField]}`} 
                    className="text-sm font-medium cursor-pointer dark:text-gray-300"
                  >
                    {group[nameField]}
                  </Label>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4 ">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selection Summary</h3>
        <div className="text-sm">
          <span className="text-gray-500 dark:text-gray-400">{title}:</span>
          <span className="ml-2 font-medium text-black dark:text-white">
            {selectedGroups.length} of {groups.length} selected
          </span>
        </div>
      </div>
    </div>
  )
}