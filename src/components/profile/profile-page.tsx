import { useState } from "react"
import { motion } from "framer-motion"
import {
  User,
  Mail,
  Phone,
  Shield,
  Tag,
  Users,
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "../../context/AuthContext"

export function ProfilePage() {
  const { user, updatePassword } = useAuth()
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#d5233b]"></div>
      </div>
    )
  }

  const handlePasswordEdit = () => {
    setIsEditingPassword(true)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setErrors({})
  }

  const handlePasswordSave = async () => {
    const newErrors: Record<string, string> = {}

    if (!currentPassword) {
      newErrors.currentPassword = "Current password is required"
    }

    if (!newPassword) {
      newErrors.newPassword = "New password is required"
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters"
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password"
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    try {
      const success = await updatePassword(currentPassword, newPassword)
      if (success) {
        setIsEditingPassword(false)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setErrors({})
      }
    } catch (error) {
      console.error("Password update failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordCancel = () => {
    setIsEditingPassword(false)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setErrors({})
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  console.log("User data:", user)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="relative">
            <div className="h-32 bg-gradient-to-r from-[#d5233b] to-red-700 rounded-lg"></div>
            <div className="absolute -bottom-12 left-8">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#d5233b] to-red-700 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
          <div className="pt-16 px-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{user.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{user.email}</p>
            <div className="flex items-center gap-2 mt-3">
              <Badge
                variant={user.active ? "default" : "secondary"}
                className={
                  user.active
                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                    : "bg-red-100 text-red-800 hover:bg-red-100"
                }
              >
                {user.active ? "Active" : "Inactive"}
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {user.roles}
              </Badge>
              {user.tag ? (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  {user.tag}
                </Badge>
              ) : null}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Your account details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">{user.name}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">User ID</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900 font-mono">{user.id}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">{user.email}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">{user.phone}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Username Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Username</Label>
                      <p className="text-xs text-gray-500 mt-1">Used for login and system identification</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-900 font-mono">{user.username}</span>
                  </div>
                </div>

                <Separator />

                {/* Password Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Password</Label>
                      <p className="text-xs text-gray-500 mt-1">Keep your account secure with a strong password</p>
                    </div>
                    {!isEditingPassword && (
                      <Button variant="outline" size="sm" onClick={handlePasswordEdit}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Change
                      </Button>
                    )}
                  </div>

                  {isEditingPassword ? (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Current Password</Label>
                        <div className="relative">
                          <Input
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => {
                              setCurrentPassword(e.target.value)
                              if (errors.currentPassword) {
                                setErrors((prev) => {
                                  const newErrors = { ...prev }
                                  delete newErrors.currentPassword
                                  return newErrors
                                })
                              }
                            }}
                            placeholder="Enter current password"
                            className={errors.currentPassword ? "border-red-500 pr-10" : "pr-10"}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {errors.currentPassword && (
                          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.currentPassword}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700">New Password</Label>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => {
                              setNewPassword(e.target.value)
                              if (errors.newPassword) {
                                setErrors((prev) => {
                                  const newErrors = { ...prev }
                                  delete newErrors.newPassword
                                  return newErrors
                                })
                              }
                            }}
                            placeholder="Enter new password"
                            className={errors.newPassword ? "border-red-500 pr-10" : "pr-10"}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {errors.newPassword && (
                          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.newPassword}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700">Confirm New Password</Label>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value)
                              if (errors.confirmPassword) {
                                setErrors((prev) => {
                                  const newErrors = { ...prev }
                                  delete newErrors.confirmPassword
                                  return newErrors
                                })
                              }
                            }}
                            placeholder="Confirm new password"
                            className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.confirmPassword}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" onClick={handlePasswordSave} disabled={isLoading}>
                          {isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Update Password
                        </Button>
                        <Button variant="outline" size="sm" onClick={handlePasswordCancel} disabled={isLoading}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                      <span className="text-gray-900">••••••••••••</span>
                      {/* <span className="text-xs text-gray-500 ml-auto">Last updated recently</span> */}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Additional Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Role & Permissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Role & Permissions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Role</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {user.roles}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">User Types</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {user.usertypes.map((type) => (
                      <Badge key={type} variant="secondary" className="bg-gray-100 text-gray-700">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  {user.tag ? (
                    <>
                 <Label className="text-sm font-medium text-gray-700">Tag</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      <Tag className="h-3 w-3 mr-1" />
                      {user.tag}
                    </Badge>
                  </div>
                    </>
              ) : null}
                 
                </div>
              </CardContent>
            </Card>

            {/* Access Groups */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Access Groups
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Vehicle Groups</Label>
                  <div className="flex flex-wrap gap-2 mt-2 max-h-20 overflow-y-auto">
                    {user.vehiclegrp.map((group) => (
                      <Badge key={group} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {group}
                      </Badge>
                    ))}
                  </div>
                  {user.vehiclegrp.length > 3 && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                          View all ({user.vehiclegrp.length})
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Vehicle Groups</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="h-60">
                          <div className="flex flex-wrap gap-2">
                            {user.vehiclegrp.map((group) => (
                              <Badge
                                key={group}
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200"
                              >
                                {group}
                              </Badge>
                            ))}
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Geofence Groups</Label>
                  <div className="flex flex-wrap gap-2 mt-2 max-h-20 overflow-y-auto">
                    {user.geofencegrp.map((group) => (
                      <Badge key={group} variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        <MapPin className="h-3 w-3 mr-1" />
                        {group}
                      </Badge>
                    ))}
                  </div>
                  {user.geofencegrp.length > 3 && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                          View all ({user.geofencegrp.length})
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Geofence Groups</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="h-60">
                          <div className="flex flex-wrap gap-2">
                            {user.geofencegrp.map((group) => (
                              <Badge
                                key={group}
                                variant="outline"
                                className="bg-orange-50 text-orange-700 border-orange-200"
                              >
                                <MapPin className="h-3 w-3 mr-1" />
                                {group}
                              </Badge>
                            ))}
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Customer Groups</Label>
                  <div className="flex flex-wrap gap-2 mt-2 max-h-20 overflow-y-auto">
                    {user.customergrp.map((group) => (
                      <Badge key={group} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {group}
                      </Badge>
                    ))}
                  </div>
                  {user.customergrp.length > 3 && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                          View all ({user.customergrp.length})
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Customer Groups</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="h-60">
                          <div className="flex flex-wrap gap-2">
                            {user.customergrp.map((group) => (
                              <Badge key={group} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {group}
                              </Badge>
                            ))}
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Status</span>
                  <div className="flex items-center gap-2">
                    {user.active ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <Badge
                      variant={user.active ? "default" : "secondary"}
                      className={
                        user.active
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-red-100 text-red-800 hover:bg-red-100"
                      }
                    >
                      {user.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                {/* <div className="text-center pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Account created on <span className="font-medium">{formatDate(new Date().toISOString())}</span>
                  </p>
                </div> */}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
