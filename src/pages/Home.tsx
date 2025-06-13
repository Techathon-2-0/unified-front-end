import React from "react"
import { ArrowRight, BarChart3, Bell, Clock, Route, Shield, Truck } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import ill from '../assets/dashboard (4).png'
import Logo from "../assets/BigLogo.png"
import Logo1 from "../assets/Logo.png"
import Prism from "../assets/prism.png"
import DayNightToggleButton from "@/components/ui/dark-mode-button"

export default function LandingPage() {
  const navigate = useNavigate();
  const scrollToSection = (sectionId: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex min-h-screen flex-col w-full overflow-x-hidden bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-900/80">
        <div className="w-full flex h-16 lg:h-20 items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2">
            <img src={Logo} alt="Logo" className="w-full h-8" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex gap-8 xl:gap-12 flex-1 justify-center">
            <motion.a
              href="#features"
              onClick={scrollToSection('features')}
              className="text-sm xl:text-base font-medium text-gray-700 dark:text-gray-300 hover:text-[#d5233b] dark:hover:text-[#ff6b7d] relative group px-3 py-2 transition-colors duration-200"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              Features
              <motion.span
                className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#d5233b] origin-left"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.2 }}
              />
            </motion.a>
            <motion.a
              href="#benefits"
              onClick={scrollToSection('benefits')}
              className="text-sm xl:text-base font-medium text-gray-700 dark:text-gray-300 hover:text-[#d5233b] dark:hover:text-[#ff6b7d] relative group px-3 py-2 transition-colors duration-200"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              Benefits
              <motion.span
                className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#d5233b] origin-left"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.2 }}
              />
            </motion.a>
            <motion.a
              href="#how-it-works"
              onClick={scrollToSection('how-it-works')}
              className="text-sm xl:text-base font-medium text-gray-700 dark:text-gray-300 hover:text-[#d5233b] dark:hover:text-[#ff6b7d] relative group px-3 py-2 transition-colors duration-200"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              How It Works
              <motion.span
                className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#d5233b] origin-left"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.2 }}
              />
            </motion.a>
          </nav>

          <div className="flex items-center gap-2">
            <DayNightToggleButton />
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={() => navigate('/signin')}
                className="px-4 sm:px-6 lg:px-8 py-2 lg:py-2.5 text-sm lg:text-base bg-[#d5233b] hover:bg-red-700 text-white rounded-lg font-medium shadow-sm transition-all duration-200"
              >
                Get Started
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="w-full py-6 sm:h-150 sm:py-8 lg:py-18 bg-gradient-to-br from-gray-50 via-red-50/30 to-white dark:from-gray-900 dark:via-red-900/10 dark:to-gray-900">
          <div className="w-full px-4 lg:px-6">
            <div className="grid gap-6 lg:gap-12 lg:grid-cols-2 items-center max-w-7xl mx-auto">
              <motion.div
                className="flex flex-col space-y-4 lg:space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="space-y-3">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                    Unified GPS Platform for{" "}
                    <span className="text-[#d5233b] dark:text-[#ff6b7d]">Mahindra Logistics</span>
                  </h1>
                  <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    A single platform to integrate all GPS vendor data, manage vehicles, track trips, and optimize your
                    logistics operations with enterprise-grade reliability.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => navigate('/signin')}
                      size="lg"
                      className="px-6 py-2.5 text-base bg-[#d5233b] hover:bg-red-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
                    >
                      Get Started <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </motion.div>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={scrollToSection('features')}
                    className="px-6 py-2.5 text-base border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition-all duration-200 w-full sm:w-auto"
                  >
                    Learn More
                  </Button>
                </div>
              </motion.div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="relative aspect-[4/3] w-full max-w-xl mx-auto overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700">
                  <div className="w-full h-full bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/20 dark:to-gray-800 flex items-center justify-center">
                    <div className="text-center">
                      <img src={ill} alt="Dashboard Illustration" className="w-full h-110" />

                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full sm:h-200 py-12 lg:py-16 bg-white dark:bg-gray-900">
          <div className="w-full px-4 lg:px-6">
            <div className="max-w-7xl mx-auto">
              <motion.div
                className="text-center max-w-3xl mx-auto mb-10 lg:mb-14"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-medium mb-4">
                  <Shield className="h-3 w-3 mr-2" />
                  Key Features
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Everything You Need in One Platform
                </h2>
                <p className="text-base lg:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  Our M-GPS Platform integrates all your GPS vendor data into a single, powerful interface designed for enterprise logistics operations.
                </p>
              </motion.div>

              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    icon: Truck,
                    title: "Vehicle Management",
                    description: "Track and manage your entire fleet from a single dashboard, regardless of GPS vendor."
                  },
                  {
                    icon: Route,
                    title: "Trip Tracking",
                    description: "Monitor ongoing trips, view historical data, and analyze route efficiency in real-time."
                  },
                  {
                    icon: Bell,
                    title: "Alerts & Notifications",
                    description: "Set up custom alerts for delays, deviations, and other critical operational events."
                  },
                  {
                    icon: BarChart3,
                    title: "Advanced Analytics",
                    description: "Gain actionable insights from comprehensive dashboards and performance metrics."
                  },
                  {
                    icon: Clock,
                    title: "ETA Calculation",
                    description: "Accurate arrival time predictions based on real-time traffic and historical data patterns."
                  },
                  {
                    icon: Shield,
                    title: "GPS Performance",
                    description: "Monitor and optimize the performance of your GPS devices across all vendors."
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 lg:p-6 shadow-sm hover:shadow-xl transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -6 }}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center group-hover:bg-[#d5233b] transition-colors duration-300">
                        <feature.icon className="h-6 w-6 text-[#d5233b] dark:text-[#ff6b7d] group-hover:text-white transition-colors duration-300" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{feature.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="w-full py-12 lg:py-16 bg-gray-50 dark:bg-gray-800">
          <div className="w-full px-4 lg:px-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid gap-8 lg:gap-16 lg:grid-cols-2 items-center">
                <motion.div
                  className="space-y-4 lg:space-y-6"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <div className="space-y-3">
                    <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium">
                      <BarChart3 className="h-3 w-3 mr-2" />
                      Business Benefits
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                      Transform Your Logistics Operations
                    </h2>
                    <p className="text-base lg:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                      Our unified platform delivers measurable operational improvements and significant cost savings across your entire logistics network.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        title: "Reduced Integration Complexity",
                        description: "Eliminate the need for multiple integrations with different GPS vendors through our unified API."
                      },
                      {
                        title: "Improved Operational Efficiency",
                        description: "Streamline workflows with a single source of truth for all vehicle and logistics data."
                      },
                      {
                        title: "Enhanced Decision Making",
                        description: "Make data-driven decisions with comprehensive analytics and real-time operational insights."
                      },
                      {
                        title: "Significant Cost Reduction",
                        description: "Lower maintenance costs, improved resource allocation, and optimized fleet utilization."
                      }
                    ].map((benefit, index) => (
                      <motion.div
                        key={benefit.title}
                        className="flex gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ x: 6 }}
                      >
                        <div className="flex-shrink-0 w-5 h-5 mt-0.5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <ArrowRight className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">{benefit.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{benefit.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  className="relative"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <div className="relative aspect-[4/3] w-full max-w-xl mx-auto overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700">
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-gray-800 flex items-center justify-center">
                      <div className="text-center">
                        <img src={ill} alt="Benefits Illustration" className="w-full h-110" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-12 sm:h-150 lg:py-16 bg-white dark:bg-gray-900">
          <div className="w-full px-4 lg:px-6">
            <div className="max-w-7xl mx-auto">
              <motion.div
                className="text-center max-w-3xl mx-auto mb-10 lg:mb-14"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
                  <Route className="h-3 w-3 mr-2" />
                  How It Works
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Seamless Integration Process
                </h2>
                <p className="text-base lg:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  Our platform easily connects with all your existing GPS systems and TMS/FMS solutions through secure, enterprise-grade integrations.
                </p>
              </motion.div>

              <div className="grid gap-6 md:gap-8 md:grid-cols-3 relative">
                {/* Connection Lines */}
                <div className="hidden md:block absolute top-20 left-1/2 w-full h-0.5 bg-gradient-to-r from-red-200 via-red-300 to-red-200 dark:from-red-800/50 dark:via-red-700/50 dark:to-red-800/50 transform -translate-x-1/2 -translate-y-1/2" />

                {[
                  {
                    step: "1",
                    title: "Connect GPS Vendors",
                    description: "We integrate with all your existing GPS vendors through our secure, enterprise-grade API connections with real-time data synchronization."
                  },
                  {
                    step: "2",
                    title: "Normalize Data",
                    description: "Our platform standardizes data from all sources into a unified format, ensuring seamless access and consistent reporting across vendors."
                  },
                  {
                    step: "3",
                    title: "Access Unified Platform",
                    description: "Use our intuitive, enterprise-ready dashboard to manage vehicles, track trips, analyze performance, and optimize operations."
                  }
                ].map((step, index) => (
                  <motion.div
                    key={step.step}
                    className="relative flex flex-col items-center text-center space-y-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 lg:p-6 shadow-sm hover:shadow-xl transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.2 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -6 }}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-[#d5233b] text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg">
                        {step.step}
                      </div>
                      {index < 2 && (
                        <div className="hidden md:block absolute -right-16 top-1/2 transform -translate-y-1/2">
                          <ArrowRight className="h-6 w-6 text-red-300 dark:text-red-700" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">{step.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{step.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 py-6 lg:py-8 sm:py-12">
        <div className="w-full px-4 lg:px-6">
          <div className="grid gap-6 md:grid-cols-3 items-center mx-auto">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <img src={Logo1} alt="Logo" className="w-10 h-10" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">M-GPS</span>
            </div>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              &copy; {new Date().getFullYear()} M-GPS Platform. All rights reserved. A Mahindra Logistics Solution.
            </p>

            <div className="flex gap-4 justify-center md:justify-end">
              <a
                href="https://iprism.mahindralogistics.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#d5233b] transition-colors"
              >
                <img src={Prism} alt="iPrism" className="h-18 w-18 rounded bg-white p-1" />
                <span>Need help?</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
