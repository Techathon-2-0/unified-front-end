import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock, MapPin, Users, Shield, TrendingUp } from "lucide-react"
import { useAuth } from "../context/AuthContext"

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard")
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await login(email, password)

      if (success) {
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email)
          localStorage.setItem("rememberedPassword", password)
          localStorage.setItem("rememberMe", "true")
        } else {
          localStorage.removeItem("rememberedEmail")
          localStorage.removeItem("rememberedPassword")
          localStorage.setItem("rememberMe", "false")
        }

        navigate("/dashboard")
      }
    } catch (error) {
      console.error("Login failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: MapPin,
      title: "Real-time GPS Tracking",
      description: "Monitor precise location data with advanced GPS technology and live updates.",
    },
    {
      icon: Users,
      title: "Multi-Device Management",
      description: "Manage multiple GPS devices and users from a single unified platform.",
    },
    {
      icon: Shield,
      title: "Geofence Alerts",
      description: "Set up virtual boundaries and receive instant notifications for security.",
    },
    {
      icon: TrendingUp,
      title: "GPS Analytics",
      description: "Detailed location analytics and movement patterns for optimization.",
    },
  ]

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail")
    const rememberedPassword = localStorage.getItem("rememberedPassword")
    const remember = localStorage.getItem("rememberMe") === "true"

    if (remember) {
      setEmail(rememberedEmail || "")
      setPassword(rememberedPassword || "")
      setRememberMe(true)
    }
  }, [])

  return (
    <div className="min-h-screen xl:h-screen xl:flex bg-gray-50 xl:overflow-hidden">
      {/* Left side with enhanced content - Hidden on mobile and tablets, visible only on xl+ screens */}
      <div className="hidden xl:flex xl:w-3/5 relative overflow-hidden">
        {/* Background with subtle red overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-[#d5233b]/10 to-[#d5233b]/5"></div>
          <div className="absolute inset-0 backdrop-blur-sm"></div>

          {/* Animated background elements */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#d5233b]/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#d5233b]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 py-8 text-white">
          {/* Header */}
          <div className="mb-12">
            <h2 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
              Track, Monitor &
              <span className="bg-gradient-to-r from-[#d5233b] to-red-400 bg-clip-text text-transparent">
                {" "}
                Navigate
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-lg leading-relaxed">
              Advanced GPS tracking and location management platform with real-time monitoring and analytics.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 mb-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#d5233b] to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side form - Full width on mobile/tablet, partial width on xl+ */}
      <div className="flex flex-1 xl:w-2/5 flex-col justify-center items-center px-6 md:px-12 lg:px-16 xl:px-16 py-12 xl:py-8 bg-white min-h-screen xl:min-h-0">
        {/* Container for centering on medium devices */}
        <div className="w-full max-w-md mx-auto md:max-w-lg lg:max-w-xl xl:max-w-md">
          {/* Form Header */}
          <div className="mb-8 text-center xl:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-4xl xl:text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600 text-base md:text-lg xl:text-base">
              Sign in to access your GPS tracking portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="text"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 md:py-4 lg:py-4 xl:py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#d5233b] focus:border-transparent transition-all duration-200 text-base md:text-lg xl:text-base"
                  placeholder="you@example.com or username"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 md:py-4 lg:py-4 xl:py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#d5233b] focus:border-transparent transition-all duration-200 text-base md:text-lg xl:text-base"
                  placeholder="Your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 md:w-5 md:h-5 xl:w-4 xl:h-4 text-[#d5233b] border-gray-300 rounded focus:ring-[#d5233b]"
                disabled={isLoading}
              />
              <label htmlFor="remember-me" className="ml-2 text-sm md:text-base xl:text-sm text-gray-700">
                Remember me
              </label>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 md:py-4 lg:py-4 xl:py-3 bg-gradient-to-r from-[#d5233b] to-red-600 hover:from-red-700 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center text-base md:text-lg xl:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <MapPin className="w-5 h-5 mr-2" />
              )}
              {isLoading ? "Signing In..." : "Sign In to Portal"}
            </button>
          </form>

          {/* Help Section */}
          <div className="mt-8 p-4 md:p-6 xl:p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 text-[#d5233b] mt-0.5">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-sm md:text-base xl:text-sm font-medium text-red-900 mb-1">Need Help?</h4>
                <p className="text-sm md:text-base xl:text-sm text-red-700 leading-relaxed">
                  Contact your GPS administrator or our support team for assistance with access.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs md:text-sm xl:text-xs text-gray-500 text-center leading-relaxed">
              By signing in, you agree to our{" "}
              <a href="#" className="text-[#d5233b] hover:text-red-600 font-medium">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-[#d5233b] hover:text-red-600 font-medium">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignIn
