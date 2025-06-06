import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { DatePickerWithRangeProps } from "../../types/trail/trail"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function DatePickerWithRange({ dateRange, onChange, className }: DatePickerWithRangeProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
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
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" sideOffset={5} style={{ zIndex: 9999 }}>
          <div className="flex flex-col sm:flex-row">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={onChange}
              numberOfMonths={1}
              className="border-b sm:border-r sm:border-b-0"
            />

            <div className="p-3 space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">From</div>
                <div className="flex space-x-2">
                  <Select
                    value={dateRange.from?.getHours().toString().padStart(2, "0")}
                    onValueChange={(value) => {
                      const newFrom = new Date(dateRange.from || new Date())
                      newFrom.setHours(Number.parseInt(value))
                      onChange({ from: newFrom, to: dateRange.to })
                    }}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue placeholder="HH" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="z-[9999] h-[120px] transition-all duration-300">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <SelectItem key={i} value={i.toString().padStart(2, "0")}>
                          {i.toString().padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="flex items-center">:</span>
                  <Select
                    value={dateRange.from?.getMinutes().toString().padStart(2, "0")}
                    onValueChange={(value) => {
                      const newFrom = new Date(dateRange.from || new Date())
                      newFrom.setMinutes(Number.parseInt(value))
                      onChange({ from: newFrom, to: dateRange.to })
                    }}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="z-[9999] h-[120px] transition-all duration-300">
                      {Array.from({ length: 60 }).map((_, i) => (
                        <SelectItem key={i} value={i.toString().padStart(2, "0")}>
                          {i.toString().padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">To</div>
                <div className="flex space-x-2">
                  <Select
                    value={dateRange.to?.getHours().toString().padStart(2, "0")}
                    onValueChange={(value) => {
                      const newTo = new Date(dateRange.to || new Date())
                      newTo.setHours(Number.parseInt(value))
                      onChange({ from: dateRange.from, to: newTo })
                    }}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue placeholder="HH" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="z-[9999] h-[120px] transition-all duration-300">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <SelectItem key={i} value={i.toString().padStart(2, "0")}>
                          {i.toString().padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="flex items-center">:</span>
                  <Select
                    value={dateRange.to?.getMinutes().toString().padStart(2, "0")}
                    onValueChange={(value) => {
                      const newTo = new Date(dateRange.to || new Date())
                      newTo.setMinutes(Number.parseInt(value))
                      onChange({ from: dateRange.from, to: newTo })
                    }}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="z-[9999] h-[120px] transition-all duration-300">
                      {Array.from({ length: 60 }).map((_, i) => (
                        <SelectItem key={i} value={i.toString().padStart(2, "0")}>
                          {i.toString().padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={() => setIsOpen(false)} className="w-full mt-4">
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
