import React, { useEffect, useRef } from 'react';
import { Map } from 'lucide-react';

const Logo: React.FC<{ size?: 'small' | 'medium' | 'large' }> = ({ size = 'medium' }) => {
  const logoRef = useRef<HTMLDivElement>(null);

  // Size classes based on the size prop
  const sizeClasses = {
    small: "h-8 w-8",
    medium: "h-12 w-12",
    large: "h-16 w-16"
  };

  const textSizeClasses = {
    small: "text-xs ml-2",
    medium: "text-sm ml-3",
    large: "text-base ml-4"
  };

  // Animation effect
  useEffect(() => {
    const logo = logoRef.current;
    if (!logo) return;

    // Pulse animation every 3 seconds
    const interval = setInterval(() => {
      logo.classList.add('scale-110');
      setTimeout(() => {
        logo.classList.remove('scale-110');
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center">
      <div 
        ref={logoRef} 
        className={`relative bg-gradient-to-br from-red-600 to-red-800 rounded-lg ${sizeClasses[size]} flex items-center justify-center p-1 transition-transform duration-300 ease-in-out`}
      >
        {/* Animated ping effect */}
        <span className="absolute w-full h-full rounded-lg bg-red-600 opacity-75 animate-ping" style={{ animationDuration: '3s' }}></span>
        
        {/* Map icon */}
        <Map className="text-white z-10" size={size === 'small' ? 16 : size === 'medium' ? 24 : 32} />
        
        {/* GPS signal dots */}
        <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse"></span>
        <span className="absolute bottom-1 left-1 h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></span>
      </div>
      
      <div className={`flex flex-col ${textSizeClasses[size]}`}>
        <span className="font-bold text-gray-800">M-GPS</span>
        <span className="text-xs text-gray-600">Unified Platform</span>
      </div>
    </div>
  );
};

export default Logo;