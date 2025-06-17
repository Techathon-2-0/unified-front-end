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
  updatePassword: (oldPassword: string, newPassword: string) => Promise<boolean>
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

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/signin']

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false) // Add logout flag
  const navigate = useNavigate()
  const location = useLocation()
  const { showSuccessToast, showErrorToast, Toaster } = useToast({ position: "top-right" })

  // Check for existing token on app load and validate it
  useEffect(() => {
    const token = Cookies.get("authToken")
    const userData = Cookies.get("userData")
    
    // Store current path on initial load if not on public routes
    if (!PUBLIC_ROUTES.includes(location.pathname)) {
      sessionStorage.setItem('redirectPath', location.pathname);
    }

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        
        // Validate that the user still exists in the backend
        apiClient.get(`/user/id/${parsedUser.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        .then(() => {
          // User exists, set user data
          setUser(parsedUser)
          apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`
        })
        .catch((error) => {
          // User doesn't exist or token is invalid, clear cookies
          console.error("Error validating user session:", error)
          Cookies.remove("authToken")
          Cookies.remove("userData")
          localStorage.removeItem("rememberedEmail")
          localStorage.removeItem("rememberedPassword")
          localStorage.removeItem("rememberMe")
          
          // Only redirect to signin if user is on a protected route
          if (!PUBLIC_ROUTES.includes(location.pathname)) {
            navigate('/signin', { 
              replace: true,
              state: { showAccessDeniedToast: true }
            })
          }
        })
        .finally(() => {
          setLoading(false)
        })
      } catch (error) {
        console.error("Error parsing stored user data:", error)
        Cookies.remove("authToken")
        Cookies.remove("userData")
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [navigate, location.pathname])

  // Check for access denied toast flag when on signin page
  // useEffect(() => {
  //   const locationState = location.state as any
  //   if (locationState?.showAccessDeniedToast && location.pathname === "/signin") {
  //     showErrorToast("Access Denied", "You must be logged in to access this page.")
  //     // Clear the state to prevent showing toast again on refresh
  //     navigate(location.pathname, { replace: true, state: { ...locationState, showAccessDeniedToast: false } })
  //   }
  // }, [location, showErrorToast, navigate])

  // If user deleted themselves and tries to navigate back to a protected route
  useEffect(() => {
    // Only redirect if not loading, not authenticated, not already on a public route
    if (!loading && !user && !PUBLIC_ROUTES.includes(location.pathname)) {
      // We don't need to set redirectPath here since it's already set in the initial useEffect
      navigate('/signin', { 
        replace: true,
        state: { showAccessDeniedToast: true }
      })
    }
  }, [user, location.pathname, navigate, loading])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      setIsLoggingOut(false) // Reset logout flag on login

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
        
        // Set axios default header
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`
        
        showSuccessToast("Login Successful", `Welcome back! ${userData?.name}`)
        const redirectPath = sessionStorage.getItem('redirectPath') || '/dashboard';
        console.log(redirectPath)
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

  const logout = () => {
    setIsLoggingOut(true)
    setUser(null)
    Cookies.remove("authToken")
    Cookies.remove("userData")
    delete apiClient.defaults.headers.common["Authorization"]
    navigate("/signin")
    showSuccessToast("Logout Successful", `${user?.name} you have been logged out.`)

    setTimeout(() => {
      setIsLoggingOut(false)
    }, 100)
  }

  const updatePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    try {
      if (!user) return false

      await apiClient.put("/user/updatepass", {
        id: user.id,
        oldPassword,
        newPassword,
      })

      showSuccessToast("Password Updated", "Password updated successfully")
      return true
    } catch (error: any) {
      console.error("Password update error:", error)
      if (error.response?.status === 400) {
        showErrorToast("Update Failed", "Old password is incorrect")
      } else if (error.response?.status === 404) {
        showErrorToast("User Error", "User not found")
      } else {
        showErrorToast("Update Failed", "Failed to update password")
      }
      return false
    }
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
    updatePassword,
    isLoggingOut, // Add to context value
  }

  return (
    <AuthContext.Provider value={value}>
      {Toaster}
      {children}
    </AuthContext.Provider>
  )
}