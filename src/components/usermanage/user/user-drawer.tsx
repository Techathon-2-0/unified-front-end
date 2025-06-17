import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X, XCircle } from "lucide-react"
import type { User } from "../../../types/usermanage/user_type"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UserDrawerProps } from "../../../types/usermanage/user_type"
import { fetchRoles } from "../../../data/usermanage/responsibility"
import { fetchGroups } from "../../../data/manage/group"
import { userTypeOptions } from "../../../data/usermanage/user"
import { useToast } from "@/hooks/use-toast"
import { fetchGeofenceGroups } from "../../../data/geofence/ggroup"
import { fetchCustomerGroups } from "../../../data/manage/customergroup"

export function UserDrawer({ open, onClose, user, onSave }: UserDrawerProps) {
  const [name, setName] = useState(user?.name || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [email, setEmail] = useState(user?.email || "")
  const [username, setUsername] = useState(user?.username || "")
  const [password, setPassword] = useState(user?.password || "")
  const [showPassword, setShowPassword] = useState(false)
  const [active, setActive] = useState(user?.active || false)
  const [role, setRole] = useState(user?.role || "")
  const [selectedUserTypes, setSelectedUserTypes] = useState<string[]>(user?.userTypes || [])
  const [selectedVehicleGroups, setSelectedVehicleGroups] = useState<string[]>(user?.vehicleGroups || [])
  const [selectedGeofenceGroups, setSelectedGeofenceGroups] = useState<string[]>(user?.geofenceGroups || [])
  const [selectedCustomerGroups, setSelectedCustomerGroups] = useState<string[]>(user?.customerGroups || [])
  const [tag, setTag] = useState(user?.tag || "")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeSection, setActiveSection] = useState<string>("basic")
  const { showSuccessToast, showErrorToast, Toaster } = useToast({ position: "top-right" })

  const [userTypeSearch, setUserTypeSearch] = useState("")
  const [vehicleGroupSearch, setVehicleGroupSearch] = useState("")
  const [geofenceGroupSearch, setGeofenceGroupSearch] = useState("")
  const [customerGroupSearch, setCustomerGroupSearch] = useState("")

  const [roles, setRoles] = useState<string[]>([])
  const [vehicleGroups, setVehicleGroups] = useState<string[]>([])
  const [geofenceGroups, setGeofenceGroups] = useState<string[]>([])
  const [customerGroups, setCustomerGroups] = useState<string[]>([])
  // const [isLoading, setIsLoading] = useState(false)

  // Load all related data when drawer opens
  useEffect(() => {
    if (open) {
      loadRelatedData()
    }
  }, [open])

  const loadRelatedData = async () => {
    try {
      // setIsLoading(true)

      // Load roles
      const rolesData = await fetchRoles()
      setRoles(rolesData.map((r) => r.role_name))

      // Load vehicle groups
      const vehicleGroupsData = await fetchGroups()
      setVehicleGroups(vehicleGroupsData.map((g) => g.name))

      // Load geofence groups
      const geofenceGroupsData = await fetchGeofenceGroups()
      setGeofenceGroups(
        geofenceGroupsData
          .map((g) => g.geo_group || g.geo_group)
          .filter((name): name is string => name != null)
      );

      // Load customer groups
      const customerGroupsData = await fetchCustomerGroups()
      setCustomerGroups(customerGroupsData.map((g) => g.group_name))
    } catch (error) {
      showErrorToast("Error", "Failed to load data. Please try again.")
      console.error("Failed to load related data:", error)
    } finally {
      // setIsLoading(false)
    }
  }

  // Filtered arrays based on search
  const filteredUserTypes = userTypeOptions?.filter((type) => type.toLowerCase().includes(userTypeSearch?.toLowerCase()))

  const filteredVehicleGroups = vehicleGroups?.filter((group) =>
    group?.toLowerCase().includes(vehicleGroupSearch?.toLowerCase()),
  )

  const filteredGeofenceGroups = geofenceGroups?.filter((group) =>
    group?.toLowerCase().includes(geofenceGroupSearch?.toLowerCase()),
  )

  const filteredCustomerGroups = customerGroups?.filter((group) =>
    group?.toLowerCase().includes(customerGroupSearch?.toLowerCase()),
  )

  // Reset form when user changes
  useEffect(() => {
    if (open) {
      setName(user?.name || "")
      setPhone(user?.phone || "")
      setEmail(user?.email || "")
      setUsername(user?.username || "")
      setPassword(user?.password || "")
      setActive(user?.active || false)
      setRole(user?.role || "")
      setSelectedUserTypes(user?.userTypes || [])
      setSelectedVehicleGroups(user?.vehicleGroups || [])
      setSelectedGeofenceGroups(user?.geofenceGroups || [])
      setSelectedCustomerGroups(user?.customerGroups || [])
      setTag(user?.tag || "")
      setErrors({})
      setActiveSection("basic")
      setUserTypeSearch("")
      setVehicleGroupSearch("")
      setGeofenceGroupSearch("")
      setCustomerGroupSearch("")
      setShowPassword(false)
    }
  }, [user, open])

  const handleSave = () => {
    // Validate form
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = "Name is required"
    if (!phone.trim()) newErrors.phone = "Phone is required"
    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(email)) {
      newErrors.email = "Invalid email format"
      showErrorToast("Invalid Email", "Please enter a valid email address (e.g., user@example.com)")
      return
    }
    if (!username.trim()) newErrors.username = "Username is required"
    if (!user && !password.trim()) newErrors.password = "Password is required"
    if (!role) newErrors.role = "Role is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const updatedUser: User = {
      id: user?.id || 0, // Backend will generate ID
      name,
      phone,
      email,
      username,
      password,
      active,
      role,
      userTypes: selectedUserTypes,
      vehicleGroups: selectedVehicleGroups,
      geofenceGroups: selectedGeofenceGroups,
      customerGroups: selectedCustomerGroups,
      tag,
    }

    onSave(updatedUser)
  }

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleUserTypeChange = (userType: string, checked: boolean) => {
    if (checked) {
      setSelectedUserTypes([...selectedUserTypes, userType])
    } else {
      setSelectedUserTypes(selectedUserTypes.filter((t) => t !== userType))
    }
  }

  const handleVehicleGroupChange = (group: string, checked: boolean) => {
    if (checked) {
      setSelectedVehicleGroups([...selectedVehicleGroups, group])
    } else {
      setSelectedVehicleGroups(selectedVehicleGroups.filter((g) => g !== group))
    }
  }

  const handleGeofenceGroupChange = (group: string, checked: boolean) => {
    if (checked) {
      setSelectedGeofenceGroups([...selectedGeofenceGroups, group])
    } else {
      setSelectedGeofenceGroups(selectedGeofenceGroups.filter((g) => g !== group))
    }
  }

  const handleCustomerGroupChange = (group: string, checked: boolean) => {
    if (checked) {
      setSelectedCustomerGroups([...selectedCustomerGroups, group])
    } else {
      setSelectedCustomerGroups(selectedCustomerGroups.filter((g) => g !== group))
    }
  }

  const isFormValid = () => {
    return (
      name.trim() !== "" &&
      phone.trim() !== "" &&
      email.trim() !== "" &&
      //validateEmail(email) &&
      username.trim() !== "" &&
      (user || password.trim() !== "") &&
      role !== ""
    )
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
            className="fixed inset-0 bg-black/50 dark:bg-black/70 bg-opacity-50"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          <div className="flex items-center justify-center min-h-screen p-4">
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden relative"
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
                  <h2 className="text-2xl font-bold tracking-tight">{user ? "Edit User" : "Create New User"}</h2>
                  <p className="text-white text-sm mt-1 opacity-90">Configure user details and permissions</p>
                </div>

                <button
                  onClick={onClose}
                  className="relative text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeSection === "basic"
                    ? "text-black dark:text-white border-b-2 border-black dark:border-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  onClick={() => setActiveSection("basic")}
                >
                  Basic Details
                  {errors.name || errors.phone || errors.email || errors.username || errors.password || errors.role ? (
                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
                  ) : null}
                </button>
                <button
                  className={`px-6 py-3 text-sm font-medium transition-colors ${activeSection === "permissions"
                    ? "text-black dark:text-white border-b-2 border-black dark:border-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  onClick={() => setActiveSection("permissions")}
                >
                  Permissions & Groups
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)] pb-20 sm:pb-6 dark:text-gray-200">
                {activeSection === "basic" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                          Name <span className="text-red-500 ml-1">*</span>
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
                          placeholder="Enter full name"
                          className={`${errors.name ? "border-red-500 ring-1 ring-red-500" : ""} dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400`}
                        />
                        {errors.name && (
                          <p className="mt-1.5 text-sm text-red-500 flex items-center">
                            <X size={14} className="mr-1" /> {errors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                          Username <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                          id="username"
                          value={username}
                          onChange={(e) => {
                            setUsername(e.target.value)
                            if (errors.username) {
                              setErrors((prev) => {
                                const newErrors = { ...prev }
                                delete newErrors.username
                                return newErrors
                              })
                            }
                          }}
                          placeholder="Enter username"
                          className={`${errors.username ? "border-red-500 ring-1 ring-red-500" : ""} dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400`}
                        />
                        {errors.username && (
                          <p className="mt-1.5 text-sm text-red-500 flex items-center">
                            <X size={14} className="mr-1" /> {errors.username}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                          Password {!user && <span className="text-red-500 ml-1">*</span>}
                          {user && <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">(Restricted during update)</span>}
                        </Label>
                        <div className="relative group">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => {
                              if (!user) {
                                setPassword(e.target.value)
                                if (errors.password) {
                                  setErrors((prev) => {
                                    const newErrors = { ...prev }
                                    delete newErrors.password
                                    return newErrors
                                  })
                                }
                              }
                            }}
                            placeholder={user ? "Password updates are restricted" : "Enter password"}
                            className={`${errors.password ? "border-red-500 ring-1 ring-red-500 pr-10" : "pr-10"} ${user ? "cursor-not-allowed bg-gray-100 dark:bg-gray-700" : ""
                              } dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400`}
                            disabled={!!user}
                            style={{ cursor: user ? "not-allowed" : "text" }}
                          />
                          {!user && (
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              {showPassword ? (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                                  />
                                </svg>
                              ) : (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              )}
                            </button>
                          )}
                          {user && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                              <XCircle className="h-5 w-5 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            </div>
                          )}
                        </div>
                        {errors.password && (
                          <p className="mt-1.5 text-sm text-red-500 flex items-center">
                            <X size={14} className="mr-1" /> {errors.password}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="role" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                          Role <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Select
                          value={role}
                          onValueChange={(value) => {
                            setRole(value)
                            if (errors.role) {
                              setErrors((prev) => {
                                const newErrors = { ...prev }
                                delete newErrors.role
                                return newErrors
                              })
                            }
                          }}
                        >
                          <SelectTrigger
                            className={`w-full ${errors.role ? "border-red-500 ring-1 ring-red-500" : ""} dark:bg-gray-800 dark:border-gray-700 dark:text-white`}
                          >
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                            {roles.map((roleOption) => (
                              <SelectItem key={roleOption} value={roleOption}>
                                {roleOption}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.role && (
                          <p className="mt-1.5 text-sm text-red-500 flex items-center">
                            <X size={14} className="mr-1" /> {errors.role}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                          Phone <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value)
                            if (errors.phone) {
                              setErrors((prev) => {
                                const newErrors = { ...prev }
                                delete newErrors.phone
                                return newErrors
                              })
                            }
                          }}
                          placeholder="Enter phone number"
                          className={`${errors.phone ? "border-red-500 ring-1 ring-red-500" : ""} dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400`}
                        />
                        {errors.phone && (
                          <p className="mt-1.5 text-sm text-red-500 flex items-center">
                            <X size={14} className="mr-1" /> {errors.phone}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                          Email <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value)
                            if (errors.email) {
                              setErrors((prev) => {
                                const newErrors = { ...prev }
                                delete newErrors.email
                                return newErrors
                              })
                            }
                          }}
                          placeholder="Enter email address"
                          className={`${errors.email ? "border-red-500 ring-1 ring-red-500" : ""} dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400`}
                        />
                        {errors.email && (
                          <p className="mt-1.5 text-sm text-red-500 flex items-center">
                            <X size={14} className="mr-1" /> {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tag" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Tag
                        </Label>
                        <Input
                          id="tag"
                          value={tag}
                          onChange={(e) => setTag(e.target.value)}
                          placeholder="Enter tag (e.g. VIP, Priority)"
                          className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
                        />
                      </div>

                      <div>
                        <Label htmlFor="active" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Status
                        </Label>
                        <Select
                          value={active ? "activate" : "deactivate"}
                          onValueChange={(value) => setActive(value === "activate")}
                        >
                          <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                            <SelectItem value="activate">Activate</SelectItem>
                            <SelectItem value="deactivate">Deactivate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSection === "permissions" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Types</h3>
                      <div className="mb-3">
                        <Input
                          placeholder="Search user types..."
                          value={userTypeSearch}
                          onChange={(e) => setUserTypeSearch(e.target.value)}
                          className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
                        />
                      </div>
                      <ScrollArea className="h-32">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {filteredUserTypes.map((userType) => (
                            <div
                              key={userType}
                              className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer dark:bg-gray-800"
                              onClick={() => handleUserTypeChange(userType, !selectedUserTypes.includes(userType))}
                            >
                              <Checkbox
                                id={`userType-${userType}`}
                                checked={selectedUserTypes.includes(userType)}
                                onCheckedChange={(checked) => handleUserTypeChange(userType, checked === true)}
                                className="dark:border-gray-600"
                              />
                              <Label htmlFor={`userType-${userType}`} className="text-sm font-medium cursor-pointer dark:text-gray-300">
                                {userType}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Vehicle Groups</h3>
                        <button
                          onClick={() => {
                            if (selectedVehicleGroups.length === filteredVehicleGroups.length && filteredVehicleGroups.length > 0) {
                              setSelectedVehicleGroups([]);
                            } else {
                              setSelectedVehicleGroups(filteredVehicleGroups);
                            }
                          }}
                          className="px-3 py-1 bg-black dark:bg-gray-700 text-white text-xs rounded hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                        >
                          {selectedVehicleGroups.length === filteredVehicleGroups.length && filteredVehicleGroups.length > 0 ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      <div className="mb-3">
                        <Input
                          placeholder="Search vehicle groups..."
                          value={vehicleGroupSearch}
                          onChange={(e) => setVehicleGroupSearch(e.target.value)}
                          className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
                        />
                      </div>
                      <ScrollArea className="h-40">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {filteredVehicleGroups.map((group) => (
                            <div
                              key={group}
                              className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer dark:bg-gray-800"
                              onClick={() => handleVehicleGroupChange(group, !selectedVehicleGroups.includes(group))}
                            >
                              <Checkbox
                                id={`vehicleGroup-${group}`}
                                checked={selectedVehicleGroups.includes(group)}
                                // readOnly
                                className="dark:border-gray-600"
                              />
                              <Label htmlFor={`vehicleGroup-${group}`} className="text-sm font-medium pointer-events-none dark:text-gray-300">
                                {group}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Geofence Groups</h3>
                        <button
                          onClick={() => {
                            if (selectedGeofenceGroups.length === filteredGeofenceGroups.length && filteredGeofenceGroups.length > 0) {
                              setSelectedGeofenceGroups([]);
                            } else {
                              setSelectedGeofenceGroups(filteredGeofenceGroups);
                            }
                          }}
                          className="px-3 py-1 bg-black dark:bg-gray-700 text-white text-xs rounded hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                        >
                          {selectedGeofenceGroups.length === filteredGeofenceGroups.length && filteredGeofenceGroups.length > 0 ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      <div className="mb-3">
                        <Input
                          placeholder="Search geofence groups..."
                          value={geofenceGroupSearch}
                          onChange={(e) => setGeofenceGroupSearch(e.target.value)}
                          className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
                        />
                      </div>
                      <ScrollArea className="h-40">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {filteredGeofenceGroups.map((group) => (
                            <div
                              key={group}
                              className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer dark:bg-gray-800"
                              onClick={() => handleGeofenceGroupChange(group, !selectedGeofenceGroups.includes(group))}
                            >
                              <Checkbox
                                id={`geofenceGroup-${group}`}
                                checked={selectedGeofenceGroups.includes(group)}
                                // readOnly
                                className="dark:border-gray-600"
                              />
                              <Label htmlFor={`geofenceGroup-${group}`} className="text-sm font-medium pointer-events-none dark:text-gray-300">
                                {group}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customer Groups</h3>
                        <button
                          onClick={() => {
                            if (selectedCustomerGroups.length === filteredCustomerGroups.length && filteredCustomerGroups.length > 0) {
                              setSelectedCustomerGroups([]);
                            } else {
                              setSelectedCustomerGroups(filteredCustomerGroups);
                            }
                          }}
                          className="px-3 py-1 bg-black dark:bg-gray-700 text-white text-xs rounded hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                        >
                          {selectedCustomerGroups.length === filteredCustomerGroups.length && filteredCustomerGroups.length > 0 ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      <div className="mb-3">
                        <Input
                          placeholder="Search customer groups..."
                          value={customerGroupSearch}
                          onChange={(e) => setCustomerGroupSearch(e.target.value)}
                          className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
                        />
                      </div>
                      <ScrollArea className="h-40">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {filteredCustomerGroups.map((group) => (
                            <div
                              key={group}
                              className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer dark:bg-gray-800"
                              onClick={() => handleCustomerGroupChange(group, !selectedCustomerGroups.includes(group))}
                            >
                              <Checkbox
                                id={`customerGroup-${group}`}
                                checked={selectedCustomerGroups.includes(group)}
                                // readOnly
                                className="dark:border-gray-600"
                              />
                              <Label htmlFor={`customerGroup-${group}`} className="text-sm font-medium pointer-events-none dark:text-gray-300">
                                {group}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selection Summary</h3>
                      <div className="grid grid-cols-4 items-center gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">User Types:</span>
                          <span className="ml-2 font-medium text-black dark:text-white">{selectedUserTypes.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Vehicle Groups:</span>
                          <span className="ml-2 font-medium text-black dark:text-white">{selectedVehicleGroups.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Geofence Groups:</span>
                          <span className="ml-2 font-medium text-black dark:text-white">{selectedGeofenceGroups.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Customer Groups:</span>
                          <span className="ml-2 font-medium text-black dark:text-white">{selectedCustomerGroups.length}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 flex flex-row justify-between rounded-b-xl border-t border-gray-200 dark:border-gray-700 sticky bottom-0 space-y-0 space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setName(user?.name || "")
                    setPhone(user?.phone || "")
                    setEmail(user?.email || "")
                    setUsername(user?.username || "")
                    setPassword(user?.password || "")
                    setActive(user?.active || false)
                    setRole(user?.role || "")
                    setSelectedUserTypes(user?.userTypes || [])
                    setSelectedVehicleGroups(user?.vehicleGroups || [])
                    setSelectedGeofenceGroups(user?.geofenceGroups || [])
                    setSelectedCustomerGroups(user?.customerGroups || [])
                    setTag(user?.tag || "")
                    setErrors({})
                    setShowPassword(false)

                    showSuccessToast("Form Reset", "All form fields have been reset successfully")
                  }}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors"
                >
                  Reset
                </button>
                <div className="flex flex-row space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!isFormValid()}
                    className="px-4 py-1.5 sm:px-5 sm:py-2 border border-transparent rounded-lg shadow-sm sm:text-sm font-medium text-white bg-black dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {user ? "Update" : "Create"}
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


