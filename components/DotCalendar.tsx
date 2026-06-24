'use client'

import { useRef, useEffect } from 'react'

interface LogEntry {
  logged_at: string
  status: 'completed' | 'skipped'
  raw_text: string | null
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function DotCalendar({ logs }: { logs: LogEntry[] }) {
  // Map date string → log entry
  const byDay: Record<string, LogEntry> = {}
  for (const log of logs) {
    const d = new Date(log.logged_at)
    const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (!byDay[day]) byDay[day] = log // keep first entry if multiple
  }

  // Build 52 weeks ending today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const start = new Date(today)
  start.setDate(start.getDate() - start.getDay() - 51 * 7)

  const weeks: { date: Date; iso: string }[][] = []
  for (let w = 0; w < 52; w++) {
    const week: { date: Date; iso: string }[] = []
    for (let d = 0; d < 7; d++) {
      const day = new Date(start)
      day.setDate(start.getDate() + w * 7 + d)
      const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
      week.push({ date: day, iso })
    }
    weeks.push(week)
  }

  // Month labels
  const monthLabels: { label: string; col: number }[] = []
  let lastMonth = -1
  weeks.forEach((week, col) => {
    const m = week[0].date.getMonth()
    if (m !== lastMonth) { 
      if (monthLabels.length === 0 || col - monthLabels[monthLabels.length - 1].col >= 3) {
        monthLabels.push({ label: MONTHS[m], col })
      }
      lastMonth = m 
    }
  })

  function dotColor(iso: string, isFuture: boolean) {
    if (isFuture) return 'bg-muted/30 cursor-default'
    const entry = byDay[iso]
    if (!entry) return 'bg-muted cursor-default'
    if (entry.status === 'completed') return 'bg-accent cursor-help'
    return 'bg-destructive/70 cursor-help'
  }

  function dotTitle(iso: string) {
    const entry = byDay[iso]
    if (!entry) return iso
    if (entry.status === 'skipped') return `${iso}: Skipped`
    return `${iso}: ${entry.raw_text ?? ''}`
  }

  return (
    <div className="overflow-hidden flex-col justify-end pb-4">
      <div className="inline-block min-w-max flex-shrink-0">
        {/* Month labels */}
        <div className="flex mb-2" style={{ marginLeft: '14px' }}>
          {weeks.map((_, col) => {
            const lbl = monthLabels.find(m => m.col === col)
            return (
              <div key={col} className="w-[12px] mr-1 text-[10px] text-muted-foreground font-mono shrink-0">
                {lbl?.label ?? ''}
              </div>
            )
          })}
        </div>

        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-1">
            {['', 'M', '', 'W', '', 'F', ''].map((d, i) => (
              <div
                key={i}
                className="text-[10px] text-muted-foreground font-mono w-[12px] h-[12px] flex items-center justify-center leading-none"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Dot grid */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map(({ iso, date }) => {
                const isFuture = date > today
                return (
                  <div
                    key={iso}
                    title={dotTitle(iso)}
                    className={`w-[12px] h-[12px] rounded-[2px] transition-opacity hover:opacity-70 ${dotColor(iso, isFuture)}`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-4 mt-4 text-[11px] text-muted-foreground font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-[12px] h-[12px] rounded-[2px] bg-accent inline-block" /> went
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-[12px] h-[12px] rounded-[2px] bg-destructive/70 inline-block" /> skipped
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-[12px] h-[12px] rounded-[2px] bg-muted inline-block" /> no activity
        </span>
      </div>
    </div>
  )
}
