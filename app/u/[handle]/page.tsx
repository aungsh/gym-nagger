import { createServerClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import CalendarHeatmap from '@/components/CalendarHeatmap'

interface Props {
  params: Promise<{ handle: string }>
}

export async function generateMetadata({ params }: Props) {
  const { handle } = await params
  return {
    title: `@${handle} — GymNag`,
    description: `${handle}'s workout log and streak.`,
  }
}

export default async function UserPage({ params }: Props) {
  const { handle } = await params
  const supabase = createServerClient()

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('handle', handle.toLowerCase())
    .single()

  if (!user) notFound()

  const { data: logs } = await supabase
    .from('logs')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })
    .limit(100)

  const allLogs = logs ?? []
  const totalSessions = allLogs.length

  const thisMonth = allLogs.filter(l => {
    const d = new Date(l.logged_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const countByDay: Record<string, number> = {}
  for (const log of allLogs) {
    const day = new Date(log.logged_at).toISOString().split('T')[0]
    countByDay[day] = (countByDay[day] ?? 0) + 1
  }
  const heatmapData = Object.entries(countByDay).map(([date, count]) => ({ date, count }))

  const joinedDate = new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          GymNag
        </Link>
        <span className="text-xs text-muted-foreground font-mono">@gym_nagger_bot</span>
      </header>

      <main className="flex-1 px-6 md:px-12 pb-24">

        {/* Back */}
        <div className="pt-8 pb-12">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
          >
            back
          </Link>
        </div>

        {/* Identity */}
        <section className="max-w-2xl pb-12">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-1">
                {user.display_name ?? `@${user.handle}`}
              </h1>
              <p className="text-muted-foreground text-sm font-mono">@{user.handle}</p>
            </div>
            {user.streak > 0 && (
              <Badge
                className="bg-accent text-accent-foreground text-xs font-mono mt-2 flex-shrink-0"
              >
                {user.streak} day streak
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-xs mt-4">Member since {joinedDate}</p>
        </section>

        <Separator className="mb-12" />

        {/* Stats */}
        <section className="max-w-2xl pb-12">
          <h2 className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-8">
            Stats
          </h2>
          <div className="grid grid-cols-3 gap-8">
            <Stat value={user.streak} label="Day streak" accent />
            <Stat value={thisMonth} label="This month" />
            <Stat value={totalSessions} label="Total" />
          </div>
        </section>

        <Separator className="mb-12" />

        {/* Heatmap */}
        <section className="max-w-3xl pb-12">
          <h2 className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-8">
            Activity
          </h2>
          <CalendarHeatmap data={heatmapData} />
        </section>

        <Separator className="mb-12" />

        {/* Log */}
        <section className="max-w-2xl">
          <h2 className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-8">
            Workout log
          </h2>

          {allLogs.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No workouts logged yet. The bot is watching.
            </p>
          ) : (
            <ul className="space-y-0">
              {allLogs.map((log, i) => (
                <li key={log.id}>
                  <div className="flex gap-8 py-4 items-baseline">
                    <span className="text-xs text-muted-foreground font-mono w-32 flex-shrink-0">
                      {new Date(log.logged_at).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="text-sm leading-relaxed">{log.raw_text}</span>
                  </div>
                  {i < allLogs.length - 1 && <Separator />}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="px-6 md:px-12 py-6 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Free. Runs on Telegram + Vercel. No account needed.
        </p>
      </footer>
    </div>
  )
}

function Stat({
  value,
  label,
  accent,
}: {
  value: number
  label: string
  accent?: boolean
}) {
  return (
    <div>
      <div className={`text-3xl md:text-4xl font-bold tabular-nums ${accent && value > 0 ? 'text-accent' : ''}`}>
        {value}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  )
}
