import type React from "react"

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-red-50 via-gray-50 to-stone-100 dark:from-gray-900 dark:via-gray-800 dark:to-stone-900 z-[9999]">
      <div className="relative flex flex-col items-center">
        {/* Animated Truck Container */}
        <div className="relative w-40 h-32 mb-6">
          {/* Road surface with animation */}
          <div className="absolute bottom-0 w-full h-2 bg-gray-600 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="absolute inset-0 animate-road">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute h-full w-4 bg-white opacity-70 dark:opacity-50"
                  style={{ left: `${i * 24}px` }}
                ></div>
              ))}
            </div>
          </div>

          {/* Truck with bouncing animation */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-truck-move">
            <div className="relative flex items-end">
              {/* Truck cab */}
              <div className="relative w-16 h-14 bg-gradient-to-b from-red-600 to-red-700 rounded-t-lg rounded-r-sm rounded-bl-sm border-b-2 border-r-2 border-red-800">
                {/* Windshield */}
                <div className="absolute top-1 right-1 w-6 h-6 bg-gray-300 dark:bg-gray-400 rounded-tl-lg"></div>
                
                {/* Headlights */}
                <div className="absolute bottom-1 left-1 w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
                
                {/* Front bumper */}
                <div className="absolute bottom-0 left-0 w-full h-2 bg-gray-700 dark:bg-gray-800 rounded-b"></div>
              </div>
              
              {/* Truck cargo area */}
              <div className="w-20 h-12 bg-gradient-to-b from-red-600 to-red-700 border-b-2 border-red-800 rounded-t-sm flex items-center justify-center">
                <div className="w-16 h-9 border-2 border-red-800 rounded">
                  {/* GPS icon */}
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-800 dark:text-red-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Wheels with rotation animation */}
            <div className="flex justify-between w-36 mt-1">
              <div className="w-8 h-8 bg-gray-800 dark:bg-gray-900 rounded-full border-2 border-gray-600 flex items-center justify-center animate-spin" style={{ animationDuration: "1s" }}>
                <div className="w-4 h-4 bg-gray-600 dark:bg-gray-700 rounded-full"></div>
              </div>
              <div className="w-8 h-8 bg-gray-800 dark:bg-gray-900 rounded-full border-2 border-gray-600 flex items-center justify-center animate-spin" style={{ animationDuration: "1s" }}>
                <div className="w-4 h-4 bg-gray-600 dark:bg-gray-700 rounded-full"></div>
              </div>
              <div className="w-8 h-8 bg-gray-800 dark:bg-gray-900 rounded-full border-2 border-gray-600 flex items-center justify-center animate-spin" style={{ animationDuration: "1s" }}>
                <div className="w-4 h-4 bg-gray-600 dark:bg-gray-700 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* GPS Signal Indicators */}
        <div className="relative w-32 h-4 mb-8">
          <div className="absolute inset-0 flex justify-around items-end">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className="bg-red-600 dark:bg-red-500 rounded-t-sm animate-signal" 
                style={{ 
                  height: `${(i+1) * 4 + 4}px`, 
                  width: '4px',
                  animationDelay: `${i * 0.15}s` 
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-500 to-red-700 rounded-full animate-progress"></div>
        </div>
      </div>

      <style>{`
        @keyframes truck-move {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-3px); }
        }
        
        @keyframes road {
          0% { transform: translateX(0); }
          100% { transform: translateX(-48px); }
        }
        
        @keyframes signal {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        
        @keyframes progress {
          0% { width: 10%; }
          50% { width: 70%; }
          100% { width: 90%; }
        }
        
        .animate-road {
          animation: road 1s linear infinite;
        }
        
        .animate-truck-move {
          animation: truck-move 0.6s ease-in-out infinite;
        }
        
        .animate-signal {
          animation: signal 1.5s ease-in-out infinite;
        }
        
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default Loader