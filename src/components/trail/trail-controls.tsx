import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Play, Pause, SkipBack, SkipForward, MapPin } from "lucide-react"
import type { TrailControlsProps } from "../../types/trail/trail"
import { format } from "date-fns"


export default function TrailControls({
  trail,
  trip,
  isPlaying,
  playbackSpeed,
  onPlayPause,
  onSpeedChange,
  trailType,
}: TrailControlsProps) {
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState("")
  const [totalTime, setTotalTime] = useState("")
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const [currentDistance, setCurrentDistance] = useState(0)
  const [location, setLocation] = useState("")

  const data = trailType === "vehicle" ? trail : trip

  useEffect(() => {
    if (!data) return

    const points = data.points || []
    if (points.length === 0) return

    const startTime = new Date(points[0].timestamp).getTime()
    const endTime = new Date(points[points.length - 1].timestamp).getTime()
    const totalDuration = endTime - startTime

    setTotalTime(formatDuration(totalDuration))

    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + (100 / (totalDuration / 1000)) * playbackSpeed
        })

        const currentIndex = Math.floor((points.length - 1) * (progress / 100))
        if (currentIndex >= 0 && currentIndex < points.length) {
          const point = points[currentIndex]
          const currentTimestamp = new Date(point.timestamp).getTime()
          const elapsedTime = currentTimestamp - startTime

          setCurrentTime(formatDuration(elapsedTime))
          setCurrentSpeed(point.speed || 0)
          setCurrentDistance(point.distance || 0)
          setLocation(point.location || "")
        }
      }, 1000 / playbackSpeed)

      return () => clearInterval(interval)
    } else {
      // When paused, just update the display based on current progress
      const currentIndex = Math.floor((points.length - 1) * (progress / 100))
      if (currentIndex >= 0 && currentIndex < points.length) {
        const point = points[currentIndex]
        const currentTimestamp = new Date(point.timestamp).getTime()
        const elapsedTime = currentTimestamp - startTime

        setCurrentTime(formatDuration(elapsedTime))
        setCurrentSpeed(point.speed || 0)
        setCurrentDistance(point.distance || 0)
        setLocation(point.location || "")
      }
    }
  }, [data, isPlaying, progress, playbackSpeed])

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgress(Number(e.target.value))
  }

  const handleSkipBack = () => {
    setProgress(Math.max(0, progress - 10))
  }

  const handleSkipForward = () => {
    setProgress(Math.min(100, progress + 10))
  }

  if (!data) return null

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white border-t border-gray-200 p-4"
    >
      <div className="flex items-start">
        <div className="flex items-center space-x-2 w-1/3">
          <MapPin className="text-gray-500" size={20} />
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-gray-800 truncate">{location || "Unknown Location"}</p>
            <p className="text-xs text-gray-500">
              {data.points && data.points.length > 0
                ? format(new Date(data.points[0].timestamp), "HH:mm:ss | MMM dd yyyy")
                : ""}
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center">
          <div className="flex items-center space-x-4 mb-2">
            <button onClick={handleSkipBack} className="p-1 rounded-full hover:bg-gray-100">
              <SkipBack size={20} />
            </button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onPlayPause}
              className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </motion.button>

            <button onClick={handleSkipForward} className="p-1 rounded-full hover:bg-gray-100">
              <SkipForward size={20} />
            </button>

            <select
              value={playbackSpeed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              className="bg-gray-100 text-sm rounded-md px-2 py-1"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={4}>4x</option>
            </select>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSliderChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="w-1/3 flex justify-end">
          <div className="grid grid-cols-2 gap-4 text-right">
            <div>
              <p className="text-xs text-gray-500">Distance (Kms)</p>
              <p className="text-xl font-bold">{currentDistance.toFixed(2)}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Time (Hrs : Mins)</p>
              <div className="flex items-center justify-end">
                <p className="text-xl font-bold">{currentTime}</p>
              </div>
            </div>

            <div className="col-span-2">
              <p className="text-xs text-gray-500">Speed</p>
              <p className="text-3xl font-bold">
                {currentSpeed} <span className="text-sm font-normal">Km/h</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
