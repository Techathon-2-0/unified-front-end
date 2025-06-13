
import { useState, useEffect } from 'react';

export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check on mount
    checkIfMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  return isMobile;
};

export const useIsSmall = (): boolean => {
  const [isSmall, setIsSmall] = useState(false);
  
  useEffect(() => {
    const checkIfSmall = () => {
      setIsSmall(window.innerWidth < 640);
    };
    
    // Check on mount
    checkIfSmall();
    
    // Add event listener
    window.addEventListener('resize', checkIfSmall);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', checkIfSmall);
    };
  }, []);
  
  return isSmall;
};