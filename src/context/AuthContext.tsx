import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import axios from "axios"
import { useNavigate, useLocation } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import Cookies from 'js-cookie'

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${Cookies.get("access_token") || ""}`,
  },
})

export interface User {
  id: number
  name: string
  username: string
  email: string
  phone: number
  active: boolean
  roles: string
  tag: string
  token: string
  usertypes: string[]
  vehiclegrp: string[]
  geofencegrp: string[]
  customergrp: string[]
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
  isLoggingOut: boolean // Add this flag
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}


const PUBLIC_ROUTES = ['/']

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false) // Add logout flag
  const navigate = useNavigate()
  const location = useLocation()
  const { showSuccessToast, showErrorToast, Toaster } = useToast({ position: "top-right" })


  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get("access_token")||"";
      const userData = Cookies.get("userData")
      
      // Store current path on initial load if not on public routes
      if(token){
        localStorage.setItem("access_token", token|| "");
      }
      // if (!PUBLIC_ROUTES.includes(location.pathname)) {
      //   sessionStorage.setItem('redirectPath', location.pathname);
      // }


      if(token&& !userData) {
        try {
          // console.log("Checking SSO token validity")
          // console.log("SSO URL:", import.meta.env.VITE_SSO_URL)
          const isok = await axios.post(
            `${import.meta.env.VITE_SSO_URL}/oauth/check_token`,
            new URLSearchParams({ token}), // x-www-form-urlencoded body
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
          );
          console.log("SSO token check response:", isok.data);
          const userDataResp = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user?searchTerm=${isok.data.user_name}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          Cookies.set("userData", userDataResp.data.data[0].id, { 
            expires: 1,
            secure: true,
            sameSite: 'strict'
          })
        } catch (error) {
          console.error("Error during SSO token check:", error)
        }
      }

      if (userData) {
        try {
          const parsedUser = Number(userData);
          

          apiClient.get(`/user/id/${parsedUser}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then((response) => {
            // User exists, set user data
            console.log(response.data.data);
            setUser(response.data.data);
            apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`
          })
          .catch((error) => {
            // User doesn't exist or token is invalid, clear cookies
            console.error("Error validating user session:", error)
            Cookies.remove("userData")
            localStorage.removeItem("rememberedEmail")
            localStorage.removeItem("rememberedPassword")
            localStorage.removeItem("rememberMe")
            localStorage.removeItem("access_token")
            
            // Only redirect to signin if user is on a protected route
            console.log("Redirecting to SSO login page due to invalid session")
            if (!PUBLIC_ROUTES.includes(location.pathname)) {
              window.location.href = `${import.meta.env.VITE_SSO_LOGIN_PAGE_URL}`;
            }
          })
          .finally(() => {
            setLoading(false)
          })
        } catch (error) {
          console.error("Error parsing stored user data:", error)
          Cookies.remove("userData")
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    };

    checkAuth();
  }, [navigate, location.pathname])


  useEffect(() => {
    // Only redirect if not loading, not authenticated, not already on a public route
    if (!loading && !user && !PUBLIC_ROUTES.includes(location.pathname)) {
      // We don't need to set redirectPath here since it's already set in the initial useEffect
     window.location.href = `${import.meta.env.VITE_SSO_LOGIN_PAGE_URL}`;
    }
  }, [user, location.pathname, navigate, loading])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      setIsLoggingOut(false) 

      const response = await apiClient.post("/login", {
        username,
        password,
      })

      if (response.data && response.data.data) {
        const userData = response.data.data
        setUser(userData)

        // Store token and user data in cookies with httpOnly and secure flags
        Cookies.set("authToken", userData.token, { 
          expires: 1, // 1 day
          secure: true, // Only sent over HTTPS
          sameSite: 'strict' // Prevents CSRF
        })

        Cookies.set("userData", JSON.stringify(userData), { 
          expires: 1,
          secure: true,
          sameSite: 'strict'
        })
        
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`
        
        showSuccessToast("Login Successful", `Welcome back! ${userData?.name}`)
        const redirectPath = sessionStorage.getItem('redirectPath') || '/dashboard';
        // console.log(redirectPath)
        sessionStorage.removeItem('redirectPath'); // Clear it after use
        navigate(redirectPath);
        
        return true
      }
      return false
    } catch (error: any) {
      console.error("Login error:", error)
      console.error("Request URL:", error.config?.url) // Debug log
      console.error("Full error response:", error.response) // Debug log

      if (error.response?.status === 401) {
        showErrorToast("Authentication Failed", "Invalid credentials")
      } else if (error.response?.status === 404) {
        showErrorToast("Configuration Error", "Login endpoint not found. Please check your API configuration.")
      }else if( error.response?.status === 409) {
        showErrorToast("Login Failed", "User is inactive. Please contact support.")
      }else if (error.code === "ECONNREFUSED" || error.code === "ERR_NETWORK") {
        showErrorToast("Connection Error", "Cannot connect to server. Please ensure the backend is running.")
      } else {
        showErrorToast("Login Failed", "Login failed. Please try again.")
      }
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setIsLoggingOut(true);
    const userName = user?.name;

    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/userlogout`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("access_token") || ""}`,
        },
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      Cookies.remove("userData");
      Cookies.remove("access_token");
      Cookies.remove("authToken");

      localStorage.removeItem("access_token");
      localStorage.removeItem("rememberedEmail");
      localStorage.removeItem("rememberedPassword");
      localStorage.removeItem("rememberMe");

      delete apiClient.defaults.headers.common["Authorization"];
      setUser(null);

      showSuccessToast("Logout Successful", `${userName} you have been logged out.`);
      
      setTimeout(() => {
        setIsLoggingOut(false);
        window.location.href = `${import.meta.env.VITE_SSO_LOGIN_PAGE_URL}`;
      }, 1000);
    }
  };


  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
    isLoggingOut, // Add to context value
  }

  return (
    <AuthContext.Provider value={value}>
      {Toaster}
      {children}
    </AuthContext.Provider>
  )
}