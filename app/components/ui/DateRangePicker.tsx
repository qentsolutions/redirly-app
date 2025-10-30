"use client"
import { useState } from "react"
import { RangeCalendar } from "./Calendar"
import { CalendarIcon } from "lucide-react"
import { parseDate, getLocalTimeZone, today } from "@internationalized/date"
import type { DateValue, DateRange } from "react-aria-components"
import { Button } from "@/components/ui/button"

interface DateRangePickerProps {
  onDateRangeChange?: (startDate: string, endDate: string) => void
  periodLabel?: string
}

export function DateRangePicker({ onDateRangeChange, periodLabel }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | null>(null)

  const handleDateChange = (range: DateRange | null) => {
    setDateRange(range)
    if (range?.start) {
      const startDate = `${range.start.year}-${String(range.start.month).padStart(2, '0')}-${String(range.start.day).padStart(2, '0')}`
      if (range?.end && range.start.compare(range.end) !== 0) {
        const endDate = `${range.end.year}-${String(range.end.month).padStart(2, '0')}-${String(range.end.day).padStart(2, '0')}`
        onDateRangeChange?.(startDate, endDate)
        setIsOpen(false)
      } else if (range?.end && range.start.compare(range.end) === 0) {
        onDateRangeChange?.(startDate, startDate)
        setIsOpen(false)
      }
    }
  }

  const formatDateRange = () => {
    if (!dateRange?.start) {
      return periodLabel || "Sélectionner une date"
    }
    const start = new Date(dateRange.start.year, dateRange.start.month - 1, dateRange.start.day)
    if (!dateRange?.end || (dateRange.start.compare(dateRange.end) === 0)) {
      return start.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    }
    const end = new Date(dateRange.end.year, dateRange.end.month - 1, dateRange.end.day)
    return `${start.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} - ${end.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}`
  }

  return (
    <div className="relative">
      <Button
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 border-gray-200 border"
      >
        <CalendarIcon size={16} />
        {formatDateRange()}
      </Button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 z-50 bg-white border border-zinc-200 rounded-lg shadow-lg p-3 right-0">
            <RangeCalendar
              value={dateRange}
              onChange={handleDateChange}
              maxValue={today(getLocalTimeZone())}
            />
          </div>
        </>
      )}
    </div>
  )
}
