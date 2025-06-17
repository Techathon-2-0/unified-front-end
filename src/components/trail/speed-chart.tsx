import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SpeedChartProps } from "@/types/trail/trail_type"

export default function SpeedChart({ trailPoints, currentPointIndex }: SpeedChartProps) {
  const chartData = trailPoints.map((point, index) => ({
    index,
    time: new Date(point.time).toLocaleTimeString(),
    speed: point.speed,
    isCurrent: index === currentPointIndex,
  }))

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="">
        <CardTitle className="text-sm dark:text-white">Speed Profile</CardTitle>
      </CardHeader>
      <CardContent className="">
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="index" tick={false} axisLine={false} />
              <YAxis 
                tick={{ fontSize: 10, fill: "#6B7280" }} 
                axisLine={false} 
                tickLine={false}
                width={25}
              />
              <Tooltip
                labelFormatter={(value) => `Point ${value}`}
                formatter={(value: number) => [`${value} km/h`, "Speed"]}
                contentStyle={{
                  backgroundColor: "var(--tooltip-bg, #fff)",
                  border: "1px solid var(--tooltip-border, #e5e7eb)",
                  borderRadius: "6px",
                  fontSize: "12px",
                  color: "var(--tooltip-text, #111827)",
                }}
                wrapperStyle={{
                  // Use CSS variables for dark/light mode
                  "--tooltip-bg": "#fff",
                  "--tooltip-border": "#e5e7eb",
                  "--tooltip-text": "#111827",
                  // Override in dark mode
                  ...(typeof window !== "undefined" && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? {
                        "--tooltip-bg": "#1F2937",
                        "--tooltip-border": "#374151",
                        "--tooltip-text": "#fff",
                      }
                    : {}),
                } as React.CSSProperties}
              />
              <Line
                type="monotone"
                dataKey="speed"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#ef4444" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}