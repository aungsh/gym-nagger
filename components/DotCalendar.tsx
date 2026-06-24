'use client'

interface LogEntry {
  logged_at: string
  status: 'completed' | 'skipped'
  raw_text: string | null
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY_LABELS = ['S','M','T','W','T','F','S']

export default function DotCalendar({ logs }: { logs: LogEntry[] }) {
  // Map date string → log entry
  const byDay: Record<string, LogEntry> = {}
  for (const log of logs) {
    const day = new Date(log.logged_at).toISOString().split('T')[0]
    if (!byDay[day]) byDay[day] = log // keep first entry if multiple
  }

  // Build 13 weeks ending today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const start = new Date(today)
  start.setDate(start.getDate() - start.getDay() - 12 * 7)

  const weeks: { date: Date; iso: string }[][] = []
  for (let w = 0; w < 13; w++) {
    const week: { date: Date; iso: string }[] = []
    for (let d = 0; d < 7; d++) {
      const day = new Date(start)
      day.setDate(start.getDate() + w * 7 + d)
      week.push({ date: day, iso: day.toISOString().split('T')[0] })
    }
    weeks.push(week)
  }

  // Month labels
  const monthLabels: { label: string; col: number }[] = []
  let lastMonth = -1
  weeks.forEach((week, col) => {
    const m = week[0].date.getMonth()
    if (m !== lastMonth) { monthLabels.push({ label: MONTHS[m], col }); lastMonth = m }
  })

  function dotColor(iso: string, isFuture: boolean) {
    if (isFuture) return 'bg-muted/20 cursor-default'
    const entry = byDay[iso]
    if (!entry) return 'bg-muted/30 cursor-default'
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
    <div className="overflow-x-auto">
      <div className="inline-block">
        {/* Month labels */}
        <div className="flex mb-2 ml-6">
          {weeks.map((_, col) => {
            const lbl = monthLabels.find(m => m.col === col)
            return (
              <div key={col} className="w-5 mr-0.5 text-[10px] text-muted-foreground font-mono shrink-0">
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
                className={`text-[10px] text-muted-foreground font-mono w-5 h-5 flex items-center ${i % 2 !== 0 ? 'opacity-0' : ''}`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Dot grid */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map(({ iso, date }) => {
                const isFuture = date > today
                return (
                  <div
                    key={iso}
                    title={dotTitle(iso)}
                    className={`w-5 h-5 rounded-full transition-opacity hover:opacity-70 ${dotColor(iso, isFuture)}`}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 ml-6 text-[11px] text-muted-foreground font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-accent inline-block" /> went
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-destructive/70 inline-block" /> skipped
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-muted/30 inline-block" /> no activity
          </span>
        </div>
      </div>
    </div>
  )
}
