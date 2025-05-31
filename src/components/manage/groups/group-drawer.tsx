import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { GroupDrawerProps, Group, Entity } from "../../../types/manage/group"
import { fetchEntities } from "../../../data/manage/groups"
import { useToast } from "@/hooks/use-toast"

export function GroupDrawer({ open, onClose, group, onSave }: GroupDrawerProps) {
  const [name, setName] = useState(group?.name || "")
  const [selectedEntityIds, setSelectedEntityIds] = useState<number[]>(group?.entityIds || [])
  const [entities, setEntities] = useState<Entity[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeSection, setActiveSection] = useState<string>("basic")
  const [isLoadingEntities, setIsLoadingEntities] = useState(false)
  const { showSuccessToast, Toaster } = useToast({ position: "top-right" })

  // Entity filtering states
  const [entitySearch, setEntitySearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  // Load entities when drawer opens
  useEffect(() => {
    if (open) {
      loadEntities()
    }
  }, [open])

  const loadEntities = async () => {
    try {
      setIsLoadingEntities(true)
      const entitiesData = await fetchEntities()
      setEntities(entitiesData)
    } catch (error) {
      console.error("Error loading entities:", error)
    } finally {
      setIsLoadingEntities(false)
    }
  }

  // Get unique values for filters from entities
  const uniqueStatuses = ["Active", "Inactive"]
  const uniqueTypes = ["Car", "Truck", "Excavator"]

  // Filtered entities based on search and filters
  const filteredEntities = entities.filter((entity) => {
    const matchesSearch =
      entity.vehicleNumber.toLowerCase().includes(entitySearch.toLowerCase()) ||
      entity.id.toString().includes(entitySearch.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "Active" && entity.status) ||
      (statusFilter === "Inactive" && !entity.status)

    const matchesType = typeFilter === "all" || entity.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // Reset form when group changes
  useEffect(() => {
    if (open) {
      setName(group?.name || "")
      setSelectedEntityIds(group?.entityIds || [])
      setErrors({})
      setActiveSection("basic")
      setEntitySearch("")
      setStatusFilter("all")
      setTypeFilter("all")
    }
  }, [group, open])

  const handleSave = () => {
    // Validate form
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = "Group name is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const updatedGroup: Group = {
      id: group?.id || 0, // Will be set by backend
      name,
      entityIds: selectedEntityIds,
      createdOn: group?.createdOn || new Date().toISOString(),
      updatedOn: new Date().toISOString(),
    }

    onSave(updatedGroup)
  }

  const handleEntityChange = (entityId: number, checked: boolean) => {
    if (checked) {
      setSelectedEntityIds([...selectedEntityIds, entityId])
    } else {
      setSelectedEntityIds(selectedEntityIds.filter((id) => id !== entityId))
    }
  }

  const handleSelectAll = () => {
    const allFilteredIds = filteredEntities.map((e) => e.id)
    setSelectedEntityIds([...new Set([...selectedEntityIds, ...allFilteredIds])])
  }

  const handleDeselectAll = () => {
    const filteredIds = filteredEntities.map((e) => e.id)
    setSelectedEntityIds(selectedEntityIds.filter((id) => !filteredIds.includes(id)))
  }

  const isFormValid = () => {
    return name.trim() !== ""
  }

  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      y: 50,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.2,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <motion.div
            className="fixed inset-0 bg-black/50 bg-opacity-50"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          <div className="flex items-center justify-center min-h-screen p-4">
            <motion.div
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-black via-gray-900 to-gray-800 text-white px-8 py-6 flex justify-between items-center rounded-t-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]"></div>
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-600 rounded-full opacity-20 blur-3xl"></div>

                <div className="relative">
                  <h2 className="text-2xl font-bold tracking-tight">{group ? "Edit Group" : "Create New Group"}</h2>
                  <p className="text-white text-sm mt-1 opacity-90">Configure group details and entity assignments</p>
                </div>

                <button
                  onClick={onClose}
                  className="relative text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex border-b border-gray-200">
                <button
                  className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                    activeSection === "basic"
                      ? "text-black border-b-2 border-black"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveSection("basic")}
                >
                  Basic Details
                  {errors.name ? (
                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
                  ) : null}
                </button>
                <button
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeSection === "entities"
                      ? "text-black border-b-2 border-black"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveSection("entities")}
                >
                  Entity Selection
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)] pb-20 sm:pb-6">
                {activeSection === "basic" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-5"
                  >
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                        Group Name <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value)
                          if (errors.name) {
                            setErrors((prev) => {
                              const newErrors = { ...prev }
                              delete newErrors.name
                              return newErrors
                            })
                          }
                        }}
                        placeholder="Enter group name"
                        className={errors.name ? "border-red-500 ring-1 ring-red-500" : ""}
                      />
                      {errors.name && (
                        <p className="mt-1.5 text-sm text-red-500 flex items-center">
                          <X size={14} className="mr-1" /> {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Selection Summary</h3>
                      <div className="text-sm">
                        <span className="text-gray-500">Selected Entities:</span>
                        <span className="ml-2 font-medium text-black">{selectedEntityIds.length}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSection === "entities" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Entity Selection</h3>

                      {/* Search and Filters */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            placeholder="Search entities..."
                            value={entitySearch}
                            onChange={(e) => setEntitySearch(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Filter by Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            {uniqueStatuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Filter by Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {uniqueTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Bulk Actions */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          {isLoadingEntities
                            ? "Loading entities..."
                            : `Showing ${filteredEntities.length} entities (${selectedEntityIds.length} selected)`}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSelectAll}
                            className="px-3 py-1 text-xs bg-black text-white rounded hover:bg-gray-800"
                            disabled={isLoadingEntities}
                          >
                            Select All
                          </button>
                          <button
                            onClick={handleDeselectAll}
                            className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            disabled={isLoadingEntities}
                          >
                            Deselect All
                          </button>
                        </div>
                      </div>

                      {/* Entity List */}
                      <ScrollArea className="h-96">
                        <div className="space-y-2">
                          {isLoadingEntities ? (
                            <div className="text-center py-8 text-gray-500">Loading entities...</div>
                          ) : filteredEntities.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No entities found</div>
                          ) : (
                            filteredEntities.map((entity) => (
                              <div
                                key={entity.id}
                                className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                              >
                                <Checkbox
                                  id={`entity-${entity.id}`}
                                  checked={selectedEntityIds.includes(entity.id)}
                                  onCheckedChange={(checked) => handleEntityChange(entity.id, checked === true)}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {entity.vehicleNumber}
                                      </p>
                                      <p className="text-xs text-gray-500">ID: {entity.id}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-gray-500">{entity.type}</p>
                                      <p
                                        className={`text-xs font-medium ${
                                          entity.status ? "text-green-600" : "text-red-600"
                                        }`}
                                      >
                                        {entity.status ? "Active" : "Inactive"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row justify-between rounded-b-xl border-t border-gray-200 sticky bottom-0">
                <button
                  type="button"
                  onClick={() => {
                    setName("")
                    setSelectedEntityIds([])
                    setErrors({})

                    showSuccessToast("Form Reset", "All form fields have been reset successfully")
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors mb-3 sm:mb-0"
                >
                  Reset
                </button>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!isFormValid()}
                    className="px-5 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-700 focus:outline-none transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {group ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
          {Toaster}
        </div>
      )}
    </AnimatePresence>
  )
}
