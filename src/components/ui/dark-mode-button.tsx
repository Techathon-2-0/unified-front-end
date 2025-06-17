import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useIsMobile } from "@/hooks/useIsMobile";

interface DayNightToggleButtonProps {
  className?: string;
  size?: number;
}

export default function DayNightToggleButton({ className }: DayNightToggleButtonProps) {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <motion.div
      onClick={toggleDarkMode}
      className={`
    relative flex items-center justify-between
    w-10 h-5 p-[2px]             // base size for mobile (width: 40px, height: 20px)
    sm:w-14 sm:h-7 sm:p-1        // larger size on tablet and up
    rounded-full cursor-pointer
    ${className || ''}
  `}
      animate={isDarkMode ? "night" : "day"}
      initial="day"
      variants={{
        day: { background: "linear-gradient(135deg, #87CEEB, #00BFFF)" },
        night: { background: "linear-gradient(135deg, #4e54c8, #8f94fb)" },
      }}
      style={{ transition: "background 0.3s ease-in-out" }}
    >
      <MoonSun dark={isDarkMode} />
      {isDarkMode ? <Star /> : <Clouds />}
    </motion.div>

  );
}

function MoonSun({ dark }: { dark: boolean }) {
  const isMobile = useIsMobile();
  return (
    <motion.div
      className={`rounded-full relative ${
        dark ? "bg-gray-200" : "bg-yellow-400"
      } w-3.5 h-3.5 sm:w-5 sm:h-5`}
      animate={dark ? { x: "0px" } : { x: isMobile ? "22px" : "29px" }}
      transition={{ type: "spring", stiffness: 100 }}
      style={{
        boxShadow: dark
          ? "0px 0px 0px rgba(0, 0, 0, 0.3)"
          : `0px 0px 5px 1px rgba(255, 204, 0, 0.6), 0px 0px 8px 2px rgba(255, 204, 0, 0.4)`,
      }}
    />
  );
}

function Clouds() {
  return (
    <motion.div
      className="absolute top-[2px] left-[2px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {[70, 50, 40].map((size, i) => (
        <motion.svg
          key={i}
          className="absolute"
          transition={{ repeat: Infinity, duration: 2 + i * 0.4, ease: "easeInOut" }}
          animate={{ x: [0, 3, 0], y: [0, -1.5, 0] }}
          style={{
            width: `${size / 3.5}px`,
            height: `${size / 3.5}px`,
            top: `${3 * i}px`,
            left: `${-5 * i}px`,
          }}
          viewBox="0 0 50 200"
          fill="#FFF"
          stroke="#FFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
        </motion.svg>
      ))}
    </motion.div>
  );
}

function Star() {
  const starStyles = [
    { width: 5, top: 3, right: 24, opacity: 0.6 },
    { width: 8, top: 6, right: 6, rotate: -45, opacity: 0.3 },
    { width: 10, top: 10, right: 14, rotate: 45, opacity: 0.7 },
  ];

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {starStyles.map((style, index) => (
        <motion.svg
          key={index}
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute"
          style={{
            width: `${style.width}px`,
            height: `${style.width}px`,
            top: `${style.top}px`,
            right: `${style.right}px`,
            rotate: `${style.rotate || 0}deg`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [style.opacity, style.opacity + 0.2, style.opacity],
          }}
          transition={{
            repeat: Infinity,
            duration: 1 + index * 0.5,
            ease: "easeInOut",
          }}
        >
          <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
        </motion.svg>
      ))}
    </motion.div>
  );
}
