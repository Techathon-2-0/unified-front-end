export const getVehicle3DSVG = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'car':
      // 3D Car with better Google Maps style
      return (
        <svg width="40" height="40" viewBox="0 0 80 80" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
          {/* Car shadow */}
          <ellipse cx="40" cy="70" rx="24" ry="8" fill="rgba(0,0,0,0.15)" />
          
          {/* Car body main */}
          <path d="M16 48 L16 58 L64 58 L64 48 L60 38 L20 38 Z" fill="#4285F4" stroke="#1A73E8" strokeWidth="1"/>
          
          {/* Car hood */}
          <path d="M20 38 L24 28 L56 28 L60 38 Z" fill="#5A9BF5" stroke="#1A73E8" strokeWidth="1"/>
          
          {/* Car roof */}
          <path d="M24 28 L28 20 L52 20 L56 28 Z" fill="#6FA8F6" stroke="#1A73E8" strokeWidth="1"/>
          
          {/* Windshield */}
          <path d="M26 28 L30 22 L50 22 L54 28 Z" fill="#87CEEB" opacity="0.9" stroke="#5A9BF5" strokeWidth="0.5"/>
          
          {/* Side windows */}
          <path d="M18 42 L22 32 L26 32 L22 42 Z" fill="#87CEEB" opacity="0.7"/>
          <path d="M58 42 L54 32 L58 32 L62 42 Z" fill="#87CEEB" opacity="0.7"/>
          
          {/* Wheels with 3D effect */}
          <circle cx="26" cy="58" r="8" fill="#2C2C2C" stroke="#1A1A1A" strokeWidth="1"/>
          <circle cx="54" cy="58" r="8" fill="#2C2C2C" stroke="#1A1A1A" strokeWidth="1"/>
          <circle cx="26" cy="58" r="5" fill="#404040" stroke="#333" strokeWidth="0.5"/>
          <circle cx="54" cy="58" r="5" fill="#404040" stroke="#333" strokeWidth="0.5"/>
          <circle cx="26" cy="58" r="2" fill="#666"/>
          <circle cx="54" cy="58" r="2" fill="#666"/>
          
          {/* Headlights */}
          <ellipse cx="18" cy="44" rx="3" ry="4" fill="#FFF" opacity="0.9"/>
          <ellipse cx="62" cy="44" rx="3" ry="4" fill="#FF6B6B" opacity="0.8"/>
          
          {/* Grille */}
          <rect x="16" y="46" width="4" height="8" fill="#333" opacity="0.6" rx="1"/>
          
          {/* Door lines */}
          <line x1="30" y1="38" x2="28" y2="58" stroke="#1A73E8" strokeWidth="1" opacity="0.5"/>
          <line x1="50" y1="38" x2="52" y2="58" stroke="#1A73E8" strokeWidth="1" opacity="0.5"/>
        </svg>
      );
    
    case 'truck':
      // 3D Truck with enhanced Google Maps style
      return (
        <svg width="40" height="40" viewBox="0 0 80 80" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
          {/* Truck shadow */}
          <ellipse cx="40" cy="70" rx="28" ry="8" fill="rgba(0,0,0,0.15)" />
          
          {/* Truck cab */}
          <path d="M12 42 L12 58 L32 58 L32 42 L30 30 L14 30 Z" fill="#34A853" stroke="#137333" strokeWidth="1"/>
          <path d="M14 30 L18 20 L28 20 L30 30 Z" fill="#4BB366" stroke="#137333" strokeWidth="1"/>
          
          {/* Truck bed */}
          <path d="M32 42 L32 58 L68 58 L68 38 L64 28 L36 28 L36 38 Z" fill="#2D7D32" stroke="#137333" strokeWidth="1"/>
          <path d="M36 28 L36 38 L64 38 L62 28 Z" fill="#34A853" stroke="#137333" strokeWidth="1"/>
          
          {/* Cab windshield */}
          <path d="M16 30 L20 22 L26 22 L28 30 Z" fill="#87CEEB" opacity="0.9" stroke="#4BB366" strokeWidth="0.5"/>
          
          {/* Cab side window */}
          <path d="M14 36 L18 28 L22 28 L18 36 Z" fill="#87CEEB" opacity="0.7"/>
          
          {/* Truck bed rails */}
          <rect x="36" y="30" width="28" height="2" fill="#137333" opacity="0.8"/>
          <rect x="36" y="36" width="28" height="2" fill="#137333" opacity="0.8"/>
          
          {/* Wheels with 3D effect */}
          <circle cx="22" cy="58" r="8" fill="#2C2C2C" stroke="#1A1A1A" strokeWidth="1"/>
          <circle cx="50" cy="58" r="8" fill="#2C2C2C" stroke="#1A1A1A" strokeWidth="1"/>
          <circle cx="22" cy="58" r="5" fill="#404040" stroke="#333" strokeWidth="0.5"/>
          <circle cx="50" cy="58" r="5" fill="#404040" stroke="#333" strokeWidth="0.5"/>
          <circle cx="22" cy="58" r="2" fill="#666"/>
          <circle cx="50" cy="58" r="2" fill="#666"/>
          
          {/* Headlights */}
          <ellipse cx="14" cy="46" rx="2" ry="3" fill="#FFF" opacity="0.9"/>
          
          {/* Grille */}
          <rect x="12" y="44" width="3" height="8" fill="#333" opacity="0.6" rx="1"/>
        </svg>
      );
      
    case 'excavator':
      // 3D Excavator with construction vehicle style
      return (
        <svg width="40" height="40" viewBox="0 0 80 80" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
          {/* Excavator shadow */}
          <ellipse cx="40" cy="70" rx="30" ry="8" fill="rgba(0,0,0,0.15)" />
          
          {/* Track base */}
          <rect x="16" y="52" width="48" height="12" fill="#FF9800" stroke="#F57C00" strokeWidth="1" rx="6"/>
          
          {/* Track treads */}
          <rect x="18" y="54" width="44" height="8" fill="#333" rx="4"/>
          <circle cx="22" cy="58" r="3" fill="#666"/>
          <circle cx="30" cy="58" r="3" fill="#666"/>
          <circle cx="38" cy="58" r="3" fill="#666"/>
          <circle cx="46" cy="58" r="3" fill="#666"/>
          <circle cx="54" cy="58" r="3" fill="#666"/>
          <circle cx="58" cy="58" r="3" fill="#666"/>
          
          {/* Main body */}
          <path d="M24 36 L24 52 L56 52 L56 36 L52 30 L28 30 Z" fill="#FFA726" stroke="#F57C00" strokeWidth="1"/>
          
          {/* Cab */}
          <path d="M34 20 L34 36 L50 36 L50 20 L48 16 L36 16 Z" fill="#FFB74D" stroke="#F57C00" strokeWidth="1"/>
          
          {/* Cab windows */}
          <rect x="36" y="18" width="12" height="16" fill="#87CEEB" opacity="0.8" stroke="#FFB74D" strokeWidth="0.5" rx="1"/>
          <rect x="38" y="20" width="3" height="6" fill="#B8E0FF" opacity="0.6"/>
          <rect x="43" y="20" width="3" height="6" fill="#B8E0FF" opacity="0.6"/>
          
          {/* Boom arm */}
          <rect x="12" y="32" width="20" height="6" fill="#FF8F00" stroke="#E65100" strokeWidth="1" rx="3"/>
          
          {/* Stick arm */}
          <rect x="8" y="24" width="16" height="4" fill="#FF8F00" stroke="#E65100" strokeWidth="1" rx="2"/>
          
          {/* Bucket */}
          <path d="M6 20 L6 28 L14 28 L16 24 L14 20 Z" fill="#795548" stroke="#5D4037" strokeWidth="1"/>
          
          {/* Hydraulic cylinders */}
          <rect x="20" y="28" width="3" height="8" fill="#9E9E9E" stroke="#757575" strokeWidth="0.5" rx="1.5"/>
          <rect x="14" y="20" width="3" height="6" fill="#9E9E9E" stroke="#757575" strokeWidth="0.5" rx="1.5"/>
          
          {/* Counterweight */}
          <rect x="50" y="38" width="8" height="14" fill="#E65100" stroke="#BF360C" strokeWidth="1" rx="2"/>
          
          {/* Details */}
          <circle cx="40" cy="44" r="2" fill="#333" opacity="0.6"/>
          <rect x="26" y="46" width="28" height="2" fill="#F57C00" opacity="0.7"/>
        </svg>
      );
    
    case 'van':
    case 'bus':
      // 3D Van/Bus with enhanced style
      return (
        <svg width="40" height="40" viewBox="0 0 80 80" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
          {/* Van shadow */}
          <ellipse cx="40" cy="70" rx="26" ry="8" fill="rgba(0,0,0,0.15)" />
          
          {/* Van body */}
          <path d="M14 32 L14 58 L66 58 L66 32 L64 22 L16 22 Z" fill="#FFEB3B" stroke="#F57F17" strokeWidth="1"/>
          <path d="M16 22 L20 16 L60 16 L64 22 Z" fill="#FFF176" stroke="#F57F17" strokeWidth="1"/>
          
          {/* Main windows */}
          <rect x="18" y="26" width="44" height="14" fill="#87CEEB" opacity="0.9" stroke="#FFF176" strokeWidth="0.5" rx="2"/>
          
          {/* Individual window sections */}
          <rect x="20" y="28" width="8" height="10" fill="#B8E0FF" opacity="0.7" stroke="#87CEEB" strokeWidth="0.5"/>
          <rect x="30" y="28" width="8" height="10" fill="#B8E0FF" opacity="0.7" stroke="#87CEEB" strokeWidth="0.5"/>
          <rect x="42" y="28" width="8" height="10" fill="#B8E0FF" opacity="0.7" stroke="#87CEEB" strokeWidth="0.5"/>
          <rect x="52" y="28" width="8" height="10" fill="#B8E0FF" opacity="0.7" stroke="#87CEEB" strokeWidth="0.5"/>
          
          {/* Wheels with 3D effect */}
          <circle cx="24" cy="58" r="8" fill="#2C2C2C" stroke="#1A1A1A" strokeWidth="1"/>
          <circle cx="56" cy="58" r="8" fill="#2C2C2C" stroke="#1A1A1A" strokeWidth="1"/>
          <circle cx="24" cy="58" r="5" fill="#404040" stroke="#333" strokeWidth="0.5"/>
          <circle cx="56" cy="58" r="5" fill="#404040" stroke="#333" strokeWidth="0.5"/>
          <circle cx="24" cy="58" r="2" fill="#666"/>
          <circle cx="56" cy="58" r="2" fill="#666"/>
          
          {/* Front details */}
          <rect x="14" y="44" width="3" height="8" fill="#FFF" opacity="0.9" rx="1"/>
          <rect x="14" y="48" width="4" height="2" fill="#333" opacity="0.6"/>
          
          {/* Door lines */}
          <line x1="38" y1="22" x2="38" y2="58" stroke="#F57F17" strokeWidth="1" opacity="0.7"/>
          <line x1="28" y1="32" x2="28" y2="58" stroke="#F57F17" strokeWidth="1" opacity="0.5"/>
          <line x1="52" y1="32" x2="52" y2="58" stroke="#F57F17" strokeWidth="1" opacity="0.5"/>
        </svg>
      );
    
    default:
      // Default to enhanced car
      return (
        <svg width="40" height="40" viewBox="0 0 80 80" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
          <ellipse cx="40" cy="70" rx="24" ry="8" fill="rgba(0,0,0,0.15)" />
          <path d="M16 48 L16 58 L64 58 L64 48 L60 38 L20 38 Z" fill="#4285F4" stroke="#1A73E8" strokeWidth="1"/>
          <path d="M20 38 L24 28 L56 28 L60 38 Z" fill="#5A9BF5" stroke="#1A73E8" strokeWidth="1"/>
          <path d="M24 28 L28 20 L52 20 L56 28 Z" fill="#6FA8F6" stroke="#1A73E8" strokeWidth="1"/>
          <path d="M26 28 L30 22 L50 22 L54 28 Z" fill="#87CEEB" opacity="0.9" stroke="#5A9BF5" strokeWidth="0.5"/>
          <path d="M18 42 L22 32 L26 32 L22 42 Z" fill="#87CEEB" opacity="0.7"/>
          <path d="M58 42 L54 32 L58 32 L62 42 Z" fill="#87CEEB" opacity="0.7"/>
          <circle cx="26" cy="58" r="8" fill="#2C2C2C" stroke="#1A1A1A" strokeWidth="1"/>
          <circle cx="54" cy="58" r="8" fill="#2C2C2C" stroke="#1A1A1A" strokeWidth="1"/>
          <circle cx="26" cy="58" r="5" fill="#404040" stroke="#333" strokeWidth="0.5"/>
          <circle cx="54" cy="58" r="5" fill="#404040" stroke="#333" strokeWidth="0.5"/>
          <circle cx="26" cy="58" r="2" fill="#666"/>
          <circle cx="54" cy="58" r="2" fill="#666"/>
          <ellipse cx="18" cy="44" rx="3" ry="4" fill="#FFF" opacity="0.9"/>
          <ellipse cx="62" cy="44" rx="3" ry="4" fill="#FF6B6B" opacity="0.8"/>
          <rect x="16" y="46" width="4" height="8" fill="#333" opacity="0.6" rx="1"/>
          <line x1="30" y1="38" x2="28" y2="58" stroke="#1A73E8" strokeWidth="1" opacity="0.5"/>
          <line x1="50" y1="38" x2="52" y2="58" stroke="#1A73E8" strokeWidth="1" opacity="0.5"/>
        </svg>
      );
  }
}

export default getVehicle3DSVG;