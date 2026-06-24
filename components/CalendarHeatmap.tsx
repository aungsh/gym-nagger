'use client'

import { useMemo } from 'react'

interface HeatmapEntry {
  date: string
  count: number
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY_LABELS = ['S','M','T','W','T','F','S']

function cellClass(count: number, isFuture: boolean): string {
  if (isFuture) return 'bg-muted/30'
  if (count === 0) return 'bg-muted/50'
  if (count === 1) return 'bg-accent/40'
  if (count === 2) return 'bg-accent/65'
  return 'bg-accent'
}

export default function CalendarHeatmap({ data }: { data: HeatmapEntry[] }) {
  const { weeks, countByDay } = useMemo(() => {
    const countByDay: Record<string, number> = {}
    for (const { date, count } of data) countByDay[date] = count

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Start from the Sunday 25 weeks ago
    const start = new Date(today)
    start.setDate(start.getDate() - start.getDay() - 25 * 7)

    const weeks: { date: Date; iso: string }[][] = []
    for (let w = 0; w < 26; w++) {
      const week: { date: Date; iso: string }[] = []
      for (let d = 0; d < 7; d++) {
        const day = new Date(start)
        day.setDate(start.getDate() + w * 7 + d)
        week.push({ date: day, iso: day.toISOString().split('T')[0] })
      }
      weeks.push(week)
    }
    return { weeks, countByDay }
  }, [data])

  // Build month labels (show when month changes)
  const monthLabels: { label: string; col: number }[] = []
  let lastMonth = -1
  weeks.forEach((week, col) => {
    const m = week[0].date.getMonth()
    if (m !== lastMonth) {
      monthLabels.push({ label: MONTHS[m], col })
      lastMonth = m
    }
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-0">
        {/* Month row */}
        <div className="flex mb-1 ml-6">
          {weeks.map((_, col) => {
            const lbl = monthLabels.find(m => m.col === col)
            return (
              <div key={col} className="w-3.5 mr-0.5 text-[10px] text-muted-foreground leading-none font-mono">
                {lbl?.label ?? ''}
              </div>
            )
          })}
        </div>

        <div className="flex gap-0.5">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 mr-1.5">
            {DAY_LABELS.map((d, i) => (
              <div
                key={i}
                className={`text-[10px] text-muted-foreground w-5 h-3.5 leading-none font-mono flex items-center ${i % 2 !== 0 ? 'opacity-0' : ''}`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Cells */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map(({ iso, date }) => {
                const count = countByDay[iso] ?? 0
                const isFuture = date > today
                return (
                  <div
                    key={iso}
                    title={`${iso}: ${count} session${count !== 1 ? 's' : ''}`}
                    className={`w-3.5 h-3.5 rounded-[2px] transition-opacity cursor-default ${cellClass(count, isFuture)}`}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-3 ml-6">
          <span className="text-[10px] text-muted-foreground font-mono">less</span>
          {['bg-muted/50', 'bg-accent/40', 'bg-accent/65', 'bg-accent'].map(c => (
            <div key={c} className={`w-3.5 h-3.5 rounded-[2px] ${c}`} />
          ))}
          <span className="text-[10px] text-muted-foreground font-mono">more</span>
        </div>
      </div>
    </div>
  )
}
