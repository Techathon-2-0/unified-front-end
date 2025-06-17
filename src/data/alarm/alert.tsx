import axios from 'axios';

export async function fetchAllAlerts(): Promise<any> {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/alerts`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all alerts:", error);
    throw error;
  }
}


// By USER ID

export async function fetchAlertsByUser(userId: string): Promise<any> {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/alerts/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching alerts by user:", error);
    throw error;
  }
}


