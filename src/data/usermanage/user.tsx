import type { User } from "../../types/usermanage/user"

export const initialUsers: User[] = [
  {
    id: "USR001",
    name: "John Doe",
    phone: "9582168055",
    email: "johndoe@example.com",
    username: "john.doe",
    password: "password123", // Add password
    active: true,
    role: "Control Tower",
    userTypes: ["Driver", "Customer"],
    vehicleGroups: ["Fleet A", "Fleet B"],
    geofenceGroups: ["Zone 1", "Zone 2"],
    tag: "VIP",
    avatar: "JD"
  },
  {
    id: "USR002",
    name: "Jane Smith",
    phone: "9582168056",
    email: "janesmith@example.com",
    username: "jane.smith",
    password: "securepass456", // Add password
    active: true,
    role: "Management",
    userTypes: ["Customer", "Consignee"],
    vehicleGroups: ["Fleet A"],
    geofenceGroups: ["Zone 1"],
    tag: "Priority",
  },
  {
    id: "USR003",
    name: "Robert Johnson",
    phone: "9582168057",
    email: "robertjohnson@example.com",
    username: "robert.johnson",
    password: "mypassword789", // Add password
    active: false,
    role: "Ecom Monitoring Team",
    userTypes: ["Consignor"],
    vehicleGroups: ["Fleet C"],
    geofenceGroups: ["Zone 3"],
    tag: "Standard",
  },
  {
    id: "USR004",
    name: "Emily Davis",
    phone: "9582168058",
    email: "emilydavis@example.com",
    username: "emily.davis",
    password: "emily2024", // Add password
    active: false,
    role: "CLT",
    userTypes: ["Attendant"],
    vehicleGroups: ["Fleet B", "Fleet C"],
    geofenceGroups: ["Zone 2", "Zone 3"],
    tag: "Standard",
  },
  {
    id: "USR005",
    name: "Michael Wilson",
    phone: "9582168059",
    email: "michaelwilson@example.com",
    username: "michael.wilson",
    password: "wilson123", // Add password
    active: false,
    role: "TEST Role",
    userTypes: ["Driver", "Attendant"],
    vehicleGroups: ["Fleet A", "Fleet B", "Fleet C"],
    geofenceGroups: ["Zone 1", "Zone 2", "Zone 3"],
    tag: "Test",
  },
  {
    id: "USR006",
    name: "Sarah Brown",
    phone: "9582168060",
    email: "sarahbrown@example.com",
    username: "sarah.brown",
    password: "sarah456", // Add password
    active: true,
    role: "Management",
    userTypes: ["Customer", "Consignee"],
    vehicleGroups: ["Fleet A"],
    geofenceGroups: ["Zone 1"],
    tag: "Priority",
  },
  {
    id: "USR007",
    name: "David Miller",
    phone: "9582168061",
    email: "davidmiller@example.com",
    username: "david.miller",
    password: "david789", // Add password
    active: true,
    role: "Control Tower",
    userTypes: ["Driver"],
    vehicleGroups: ["Fleet B"],
    geofenceGroups: ["Zone 2"],
    tag: "VIP",
  },
]


export const userTypeOptions = ["Driver", "Customer", "Consignee", "Consignor", "Attendant"]
export const tagOptions = ["VIP", "Priority", "Standard", "Test"]
