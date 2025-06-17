import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Search, Mail, Phone, Users, Check, X } from "lucide-react"
import type { NotificationSelectionProps } from "../../../types/alarm/aconfig_type"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

export const NotificationSelection = ({
  users,
  selectedEmails,
  selectedPhoneNumbers,
  onEmailsChange,
  onPhoneNumbersChange,
  customEmails,
  customPhoneNumbers,
  onCustomEmailsChange,
  onCustomPhoneNumbersChange,
}: NotificationSelectionProps) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [emailsExpanded, setEmailsExpanded] = useState(true)
  const [phonesExpanded, setPhonesExpanded] = useState(true)

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSelectAllEmails = () => {
    const allEmails = users.filter((user) => user.email && user.active).map((user) => user.email)
    if (selectedEmails.length === allEmails.length) {
      onEmailsChange([])
    } else {
      onEmailsChange(allEmails)
    }
  }

  const handleSelectAllPhones = () => {
    const allPhones = users.filter((user) => user.phone && user.active).map((user) => user.phone)
    if (selectedPhoneNumbers.length === allPhones.length) {
      onPhoneNumbersChange([])
    } else {
      onPhoneNumbersChange(allPhones)
    }
  }

  const toggleEmail = (email: string) => {
    if (selectedEmails.includes(email)) {
      onEmailsChange(selectedEmails.filter((e) => e !== email))
    } else {
      onEmailsChange([...selectedEmails, email])
    }
  }

  const togglePhone = (phone: string) => {
    if (selectedPhoneNumbers.includes(phone)) {
      onPhoneNumbersChange(selectedPhoneNumbers.filter((p) => p !== phone))
    } else {
      onPhoneNumbersChange([...selectedPhoneNumbers, phone])
    }
  }

  // Parse custom emails and phone numbers from comma-separated strings
  const parseCustomItems = (customString: string): string[] => {
    if (!customString) return []
    return customString
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  // Get all active users with emails
  const activeUsersWithEmail = users.filter((user) => user.email && user.active)
  const activeUsersWithPhone = users.filter((user) => user.phone && user.active)

  const sectionVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  }

  return (
    <div className="space-y-4">
      {/* Global Search */}
      <div className="px-3">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
          <Input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Email Notifications */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div
          className="bg-gray-50 dark:bg-gray-800 px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={() => setEmailsExpanded(!emailsExpanded)}
        >
          <div className="flex items-center">
            <div className="p-1 bg-blue-100 dark:bg-blue-900/40 rounded-lg mr-2">
              <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Email Notifications</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {selectedEmails.length + parseCustomItems(customEmails).length} recipients selected
              </p>
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
              emailsExpanded ? "transform rotate-180" : ""
            }`}
          />
        </div>

        <AnimatePresence>
          {emailsExpanded && (
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="overflow-hidden"
            >
              <div className="p-3 space-y-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleSelectAllEmails}
                    className="flex items-center px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-xs font-medium"
                  >
                    {selectedEmails.length === activeUsersWithEmail.length ? (
                      <>
                        <X className="h-3 w-3 mr-1" />
                        Deselect All
                      </>
                    ) : (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Select All
                      </>
                    )}
                  </button>
                  <div className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {selectedEmails.length} of {activeUsersWithEmail.length} selected
                    </span>
                  </div>
                </div>

                <ScrollArea className="h-40">
                  <div className="space-y-1 pr-1">
                    {filteredUsers.filter((user) => user.email && user.active).length === 0 ? (
                      <div className="text-center py-4">
                        <Users className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">No users found</p>
                      </div>
                    ) : (
                      filteredUsers
                        .filter((user) => user.email && user.active)
                        .map((user) => (
                          <div
                            key={`email-${user.id}`}
                            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-800"
                            onClick={() => toggleEmail(user.email)}
                          >
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={selectedEmails.includes(user.email)}
                                className="dark:border-gray-600"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                  {user.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </ScrollArea>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Additional Email Addresses
                  </Label>
                  <textarea
                    value={customEmails}
                    onChange={(e) => onCustomEmailsChange(e.target.value)}
                    placeholder="Enter comma-separated email addresses"
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
                    rows={2}
                  />

                  {parseCustomItems(customEmails).length > 0 && (
                    <div className="mt-2">
                      <Label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Custom Recipients ({parseCustomItems(customEmails).length})
                      </Label>
                      <div className="flex flex-wrap gap-1">
                        {parseCustomItems(customEmails).map((email, index) => (
                          <div
                            key={`custom-email-${index}`}
                            className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full text-[10px] border border-blue-200 dark:border-blue-800 flex items-center"
                          >
                            <Mail className="h-2 w-2 mr-1" />
                            {email}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Phone Notifications */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div
          className="bg-gray-50 dark:bg-gray-800 px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={() => setPhonesExpanded(!phonesExpanded)}
        >
          <div className="flex items-center">
            <div className="p-1 bg-green-100 dark:bg-green-900/40 rounded mr-2">
              <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Phone Notifications</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {selectedPhoneNumbers.length + parseCustomItems(customPhoneNumbers).length} recipients selected
              </p>
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
              phonesExpanded ? "transform rotate-180" : ""
            }`}
          />
        </div>

        <AnimatePresence>
          {phonesExpanded && (
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="overflow-hidden"
            >
              <div className="p-3 space-y-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleSelectAllPhones}
                    className="flex items-center px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors text-xs font-medium"
                  >
                    {selectedPhoneNumbers.length === activeUsersWithPhone.length ? (
                      <>
                        <X className="h-3 w-3 mr-1" />
                        Deselect All
                      </>
                    ) : (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Select All
                      </>
                    )}
                  </button>
                  <div className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {selectedPhoneNumbers.length} of {activeUsersWithPhone.length} selected
                    </span>
                  </div>
                </div>

                <ScrollArea className="h-40">
                  <div className="space-y-1 pr-1">
                    {filteredUsers.filter((user) => user.phone && user.active).length === 0 ? (
                      <div className="text-center py-4">
                        <Users className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">No users found</p>
                      </div>
                    ) : (
                      filteredUsers
                        .filter((user) => user.phone && user.active)
                        .map((user) => (
                          <div
                            key={`phone-${user.id}`}
                            className="p-2 rounded border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-800"
                            onClick={() => togglePhone(user.phone)}
                          >
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={selectedPhoneNumbers.includes(user.phone)}
                                // readOnly
                                className="dark:border-gray-600"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                  {user.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {user.phone}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </ScrollArea>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Additional Phone Numbers
                  </Label>
                  <textarea
                    value={customPhoneNumbers}
                    onChange={(e) => onCustomPhoneNumbersChange(e.target.value)}
                    placeholder="Enter comma-separated phone numbers"
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-green-500 dark:focus:ring-green-400 resize-none"
                    rows={2}
                  />

                  {parseCustomItems(customPhoneNumbers).length > 0 && (
                    <div className="mt-2">
                      <Label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Custom Recipients ({parseCustomItems(customPhoneNumbers).length})
                      </Label>
                      <div className="flex flex-wrap gap-1">
                        {parseCustomItems(customPhoneNumbers).map((phone, index) => (
                          <div
                            key={`custom-phone-${index}`}
                            className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full text-[10px] border border-green-200 dark:border-green-800 flex items-center"
                          >
                            <Phone className="h-2 w-2 mr-1" />
                            {phone}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Summary Footer */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 mb-2">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Notification Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <div className="p-1 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Email Recipients</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {selectedEmails.length + parseCustomItems(customEmails).length}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="p-1 bg-green-100 dark:bg-green-900/40 rounded-lg">
              <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Phone Recipients</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {selectedPhoneNumbers.length + parseCustomItems(customPhoneNumbers).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}