import type { Trip } from "../../types/dashboard/trip"
import axios from "axios"


export async function generateMockTrips(){

  try{
    const res=await axios.get(`${import.meta.env.VITE_BACKEND_URL}/trip/v1`);
    if(res.data&&res.data.data){
      return res.data.data as Trip[]
    }else{
      throw new Error("Invalid response structure");
    }
  }catch(error){
    console.error("Error fetching trips:", error);
    return [];
  }
  
} 

