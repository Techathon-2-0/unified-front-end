import type { Group } from "../../types/manage/group"

// Sample data for groups - updated to use vehicle IDs instead of count
export const initialGroupData: Group[] = [
  {
    id: 1,
    name: 'Logistics Team A',
    entityIds: [101, 102, 103],
    createdOn: '2025-05-01T08:30:00Z',
    updatedOn: '2025-05-10T14:45:00Z',
  },
  {
    id: 2,
    name: 'Maintenance Crew',
    entityIds: [201, 202],
    createdOn: '2025-04-20T09:00:00Z',
    updatedOn: '2025-05-15T10:20:00Z',
  },
  {
    id: 3,
    name: 'Field Ops North Zone',
    entityIds: [301, 302, 303, 304],
    createdOn: '2025-03-15T12:00:00Z',
    updatedOn: '2025-04-01T16:10:00Z',
  },
  {
    id: 4,
    name: 'Warehouse Supervisors',
    entityIds: [],
    createdOn: '2025-01-10T11:25:00Z',
    updatedOn: '2025-01-12T13:00:00Z',
  },
  {
    id: 5,
    name: 'Night Shift Team',
    entityIds: [401, 402],
    createdOn: '2025-02-28T18:30:00Z',
    updatedOn: '2025-05-01T19:45:00Z',
  },
]


export const vehicleGroups = initialGroupData.map((group) => group.name)