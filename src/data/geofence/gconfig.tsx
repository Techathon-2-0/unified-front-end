export const initialGeofenceData = [
  {
    id: "GF001",
    name: "Mumbai Warehouse",
    type: "circle",
    radius: 500,
    locationId: "LOC001",
    coordinates: { lat: 19.076, lng: 72.8777 },
    createdAt: "2023-11-07T22:53:00",
    updatedAt: "2024-05-15T13:30:00",
    status: "active",
    tag: "Warehouse",
    stopType: "Pickup",
  },
  {
    id: "GF002",
    name: "Delhi Distribution Center",
    type: "polygon",
    radius: 0,
    locationId: "LOC002",
    coordinates: { lat: 28.7041, lng: 77.1025 },
    polygonPoints: [
      { lat: 28.7141, lng: 77.1125 },
      { lat: 28.7241, lng: 77.1025 },
      { lat: 28.7141, lng: 77.0925 },
      { lat: 28.7041, lng: 77.1025 },
    ],
    createdAt: "2023-11-07T22:55:00",
    updatedAt: "2024-05-15T13:29:00",
    status: "active",
    tag: "Distribution",
    stopType: "Delivery",
  }
]
