import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { PlusCircle, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { UserTable } from "./user-table"
import { UserDrawer } from "./user-drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import type { User } from "../../../types/usermanage/user_type"
import { fetchUsers, createUser, updateUser, deleteUser, searchUsers } from "../../../data/usermanage/user"
import { fetchRolesByUserId } from "@/data/usermanage/responsibility"
import { useAuth } from "../../../context/AuthContext"

export function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const itemsPerPage = 5

  const { showSuccessToast, showErrorToast, Toaster } = useToast({ position: "top-right" })
  const { logout, user } = useAuth()
  const [userAccess, setUserAccess] = useState<number | null>(null)

  // Load users on component mount
  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    const fetchAccess = async () => {
      if (user && user.id) {
        try {
          const roles = await fetchRolesByUserId(user.id)
          if (roles && roles.length > 0) {
            const tabsAccess = roles[0].tabs_access
            const userTab = tabsAccess.find((tab: any) => tab.hasOwnProperty("user_access"))
            setUserAccess(userTab ? userTab.user_access : null)
          }
        } catch {
          setUserAccess(null)
        }
      }
    }
    fetchAccess()
  }, [user])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const usersData = await fetchUsers()
      setUsers(usersData)
    } catch (error) {
      showErrorToast("Error", "Failed to load users. Please try again.")
      console.error("Failed to load users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle search with debouncing
  useEffect(() => {
    const delayedSearch = setTimeout(async () => {
      if (searchQuery.trim()) {
        try {
          const searchResults = await searchUsers(searchQuery)
          setUsers(searchResults)
          setCurrentPage(1)
        } catch (error) {
          showErrorToast("Search Error", "Failed to search users. Please try again.")
          console.error("Search failed:", error)
        }
      } else {
        loadUsers()
      }
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [searchQuery])

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.toString().includes(searchQuery) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userTypes.some((type) => type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      user.tag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toString().includes(searchQuery),
  )

  const totalCount = filteredUsers.length
  const pageCount = Math.ceil(totalCount / itemsPerPage)
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsDrawerOpen(true)
  }

  const handleCreate = () => {
    setSelectedUser(null)
    setIsDrawerOpen(true)
  }

  const handleSave = async (user: User) => {
  try {
    if (selectedUser) {
      // Update existing user
      const updatedUser = await updateUser(user)
      // Update the user in the local state instead of reloading all users
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === user.id ? updatedUser : u)
      )
      showSuccessToast("User Updated", `${user.name} has been updated successfully.`)
    } else {
      // Create new user
      const newUser = await createUser(user)
      setUsers(prevUsers => [...prevUsers, newUser])
      showSuccessToast("User Created", `${user.name} has been created successfully.`)
    }
    setIsDrawerOpen(false)
  } catch (error: any) {
    console.error("Error saving user:", error)

    // Handle specific error cases
    if (error.response?.status === 400) {
      const errorMessage = error.response.data.message
      
      // Check for both username and email in the same message
      if (errorMessage.toLowerCase().includes("username") && errorMessage.toLowerCase().includes("email")) {
        showErrorToast("Duplicate Error", "Both username and email already exist in the system.")
      } 
      // Check for username only
      else if (errorMessage.toLowerCase().includes("username")) {
        showErrorToast("Username Exists", "This username is already taken. Please choose a different one.")
      } 
      // Check for email only
      else if (errorMessage.toLowerCase().includes("email")) {
        showErrorToast("Email Exists", "This email address is already registered. Please use a different email.")
      } 
      // Fallback for other validation errors
      else {
        showErrorToast("Validation Error", errorMessage)
      }
    } else {
      showErrorToast("Error", "Failed to save user. Please try again.")
    }
  }
}

  const handleDelete = async (id: number) => {
    try {
      const response = await deleteUser(id)
      
      // Check if the server indicates we should log out (we deleted our own account)
      if (response.logout === true) {
        showSuccessToast("Account Deleted", "Your account has been deleted. You will be logged out.")
        setTimeout(() => {
          if (logout) {
            logout()
          }
        }, 2000)
        return
      }
      
      setUsers(users.filter((u) => u.id !== id))
      showSuccessToast("User Deleted", "The user has been deleted successfully.")
    } catch (error) {
      showErrorToast("Error", "Failed to delete user. Please try again.")
      console.error("Failed to delete user:", error)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-gray-900">
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading users...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-gray-900">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative w-full sm:w-auto"
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-9 w-full sm:w-[300px] border-slate-300 dark:border-slate-700 rounded-full dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </motion.div>
              {/* Hide Create New User button if userAccess === 1 */}
              {userAccess !== 1 && (
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                  <Button
                    onClick={handleCreate}
                    className="bg-black hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 text-white border-0 rounded-md w-full sm:w-auto"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New User
                  </Button>
                </motion.div>
              )}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="text-sm font-medium px-3 sm:px-4 py-1 sm:py-2 rounded-full sm:text-sm inline-block mb-4">
                <Badge variant="outline" className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm border-red-200 dark:border-red-800">
                  Total Count: <span className="font-bold ml-1">{users.length}</span>
                </Badge>
              </div>

              <UserTable
                users={paginatedUsers}
                onEdit={handleEdit}
                onDelete={handleDelete}
                currentPage={currentPage}
                pageCount={pageCount}
                onPageChange={handlePageChange}
                totalCount={totalCount}
              />
            </motion.div>
          </div>
        </main>
      </div>

      <UserDrawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} user={selectedUser} onSave={handleSave} />
      {Toaster}
    </div>
  )
}