import * as React from "react"
import { format, differenceInCalendarDays, isAfter, isSameDay } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { DatePickerWithRangeProps } from "../../../types/reports/report_type"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function DatePickerWithRange({ dateRange, onChange, className }: DatePickerWithRangeProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const { showErrorToast, Toaster } = useToast({ position: "top-right" })
  const now = new Date()

  // Helper to check if a date is after now
  const isFutureDate = (date: Date) => isAfter(date, now)

  // Helper to get max hour/minute for today
  const getMaxHour = (date: Date | undefined) => {
    if (!date) return 23
    if (isSameDay(date, now)) return now.getHours()
    return 23
  }
  const getMaxMinute = (date: Date | undefined, hour: number) => {
    if (!date) return 59
    if (isSameDay(date, now) && hour === now.getHours()) return now.getMinutes()
    return 59
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200",
              !dateRange && "text-muted-foreground dark:text-gray-400",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Select Date Range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 dark:bg-gray-800 dark:border-gray-700"
          align="start"
          sideOffset={5}
          style={{ zIndex: 9999 }}
        >
          <div className="flex flex-col sm:flex-row">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from || undefined}
              selected={dateRange}
              // Disable future dates
              disabled={(date) => isFutureDate(date)}
              onSelect={(range) => {
                if (range && range.from && range.to) {
                  const days = differenceInCalendarDays(range.to, range.from)
                  if (days > 6) {
                    showErrorToast("Maximum 7 days range allowed", "Please select a range of up to 7 days.")
                    return
                  }
                  onChange({ from: range.from ?? undefined, to: range.to ?? undefined })
                } else if (range) {
                  onChange({ from: range.from ?? undefined, to: range.to ?? undefined })
                }
              }}
              numberOfMonths={1}
              className="border-b sm:border-r sm:border-b-0 dark:border-gray-700"
            />

            <div className="p-3 space-y-4 dark:bg-gray-800">
              <div className="space-y-2">
                <div className="text-sm font-medium dark:text-gray-300">From</div>
                <div className="flex space-x-2">
                  <Select
                    value={dateRange.from ? dateRange.from.getHours().toString().padStart(2, "0") : ""}
                    onValueChange={(value) => {
                      if (!dateRange.from) return
                      const newFrom = new Date(dateRange.from)
                      newFrom.setHours(Number.parseInt(value))
                      onChange({ from: newFrom, to: dateRange.to })
                    }}
                  >
                    <SelectTrigger className="w-[70px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                      <SelectValue placeholder="HH" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      className="z-[9999] h-[120px] transition-all duration-300 dark:bg-gray-800 dark:border-gray-700"
                      style={{ zIndex: 9999 }}
                    >
                      {dateRange.from &&
                        Array.from({ length: getMaxHour(dateRange.from) + 1 }).map((_, i) => (
                          <SelectItem
                            key={i}
                            value={i.toString().padStart(2, "0")}
                            className="dark:text-gray-200 dark:focus:bg-gray-700 dark:hover:bg-gray-700"
                          >
                            {i.toString().padStart(2, "0")}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <span className="flex items-center dark:text-gray-300">:</span>
                  <Select
                    value={dateRange.from ? dateRange.from.getMinutes().toString().padStart(2, "0") : ""}
                    onValueChange={(value) => {
                      if (!dateRange.from) return
                      const newFrom = new Date(dateRange.from)
                      newFrom.setMinutes(Number.parseInt(value))
                      onChange({ from: newFrom, to: dateRange.to })
                    }}
                  >
                    <SelectTrigger className="w-[70px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      className="z-[9999] h-[120px] transition-all duration-300 dark:bg-gray-800 dark:border-gray-700"
                      style={{ zIndex: 9999 }}
                    >
                      {dateRange.from &&
                        Array.from({ length: getMaxMinute(dateRange.from, dateRange.from?.getHours() ?? 0) + 1 }).map(
                          (_, i) => (
                            <SelectItem
                              key={i}
                              value={i.toString().padStart(2, "0")}
                              className="dark:text-gray-200 dark:focus:bg-gray-700 dark:hover:bg-gray-700"
                            >
                              {i.toString().padStart(2, "0")}
                            </SelectItem>
                          ),
                        )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium dark:text-gray-300">To</div>
                <div className="flex space-x-2">
                  <Select
                    value={dateRange.to ? dateRange.to.getHours().toString().padStart(2, "0") : ""}
                    onValueChange={(value) => {
                      if (!dateRange.to) return
                      const newTo = new Date(dateRange.to)
                      newTo.setHours(Number.parseInt(value))
                      onChange({ from: dateRange.from, to: newTo })
                    }}
                  >
                    <SelectTrigger className="w-[70px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                      <SelectValue placeholder="HH" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      className="z-[9999] h-[120px] transition-all duration-300 dark:bg-gray-800 dark:border-gray-700"
                      style={{ zIndex: 9999 }}
                    >
                      {dateRange.to &&
                        Array.from({ length: getMaxHour(dateRange.to) + 1 }).map((_, i) => (
                          <SelectItem
                            key={i}
                            value={i.toString().padStart(2, "0")}
                            className="dark:text-gray-200 dark:focus:bg-gray-700 dark:hover:bg-gray-700"
                          >
                            {i.toString().padStart(2, "0")}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <span className="flex items-center dark:text-gray-300">:</span>
                  <Select
                    value={dateRange.to ? dateRange.to.getMinutes().toString().padStart(2, "0") : ""}
                    onValueChange={(value) => {
                      if (!dateRange.to) return
                      const newTo = new Date(dateRange.to)
                      newTo.setMinutes(Number.parseInt(value))
                      onChange({ from: dateRange.from, to: newTo })
                    }}
                  >
                    <SelectTrigger className="w-[70px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      className="z-[9999] h-[120px] transition-all duration-300 dark:bg-gray-800 dark:border-gray-700"
                      style={{ zIndex: 9999 }}
                    >
                      {dateRange.to &&
                        Array.from({ length: getMaxMinute(dateRange.to, dateRange.to?.getHours() ?? 0) + 1 }).map(
                          (_, i) => (
                            <SelectItem
                              key={i}
                              value={i.toString().padStart(2, "0")}
                              className="dark:text-gray-200 dark:focus:bg-gray-700 dark:hover:bg-gray-700"
                            >
                              {i.toString().padStart(2, "0")}
                            </SelectItem>
                          ),
                        )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={() => setIsOpen(false)}
                className="w-full mt-4 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
              >
                Apply
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  onChange({ from: undefined, to: undefined })
                }}
                className="w-full mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
              >
                Reset
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {Toaster}
    </div>
  )
}
