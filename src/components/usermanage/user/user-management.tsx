import { useState } from "react"
import { motion } from "framer-motion"
import { PlusCircle, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { UserTable } from "./user-table"
import { UserDrawer } from "./user-drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import type { User } from "../../../types/usermanage/user"
import { initialUsers } from "../../../data/usermanage/user"

export function UserManagementPage() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const { showSuccessToast, showErrorToast, Toaster } = useToast({ position: "top-right",});

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userTypes.some((type) => type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      user.tag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase()),
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

  const handleSave = (user: User) => {
    if (selectedUser) {
      // Update existing user
      setUsers(users.map((u) => (u.id === user.id ? user : u)))
      showSuccessToast("User updated", `${user.name} has been updated successfully.`)
    } else {
      // Create new user
      setUsers([...users, user])
      showSuccessToast("User created", `${user.name} has been created successfully.`)
    }
    setIsDrawerOpen(false)
  }

  const handleDelete = (id: string) => {
    setUsers(users.filter((u) => u.id !== id))
    showSuccessToast("User deleted", "The user has been deleted successfully.")
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-9 w-full sm:w-[300px] border-slate-300 rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Button
                  onClick={handleCreate}
                  className="bg-black hover:bg-gray-800 text-white border-0 rounded-md w-full sm:w-auto"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New User
                </Button>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="text-sm font-medium px-3 sm:px-4 py-1 sm:py-2 rounded-full sm:text-sm inline-block mb-4">
                <Badge variant="outline" className="bg-red-50 text-red-700 text-sm border-red-200">
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
