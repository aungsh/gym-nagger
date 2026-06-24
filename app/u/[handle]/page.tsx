import { createServerClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import DotCalendar from '@/components/DotCalendar'

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
    .select('id, status, raw_text, logged_at')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })
    .limit(200)

  const allLogs = logs ?? []

  const completedLogs = allLogs.filter(l => l.status === 'completed')
  const skippedLogs = allLogs.filter(l => l.status === 'skipped')

  const thisMonth = completedLogs.filter(l => {
    const d = new Date(l.logged_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const joinedDate = new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  })

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <Link href="/" className="text-sm font-semibold tracking-tight">GymNag</Link>
        <span className="text-xs text-muted-foreground font-mono">@gym_nagger_bot</span>
      </header>

      <main className="flex-1 px-6 md:px-12 pb-24">
        <div className="pt-8 pb-12">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono">
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
              <Badge className="bg-accent text-accent-foreground text-xs font-mono mt-2 flex-shrink-0">
                {user.streak} day streak
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-xs mt-4">Member since {joinedDate}</p>
        </section>

        <Separator className="mb-12" />

        {/* Stats */}
        <section className="max-w-2xl pb-12">
          <h2 className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-8">Stats</h2>
          <div className="grid grid-cols-4 gap-8">
            <Stat value={user.streak} label="Day streak" accent={user.streak > 0} />
            <Stat value={completedLogs.length} label="Total sessions" />
            <Stat value={thisMonth} label="This month" />
            <Stat value={skippedLogs.length} label="Times skipped" dim />
          </div>
        </section>

        <Separator className="mb-12" />

        {/* Dot calendar */}
        <section className="max-w-3xl pb-12">
          <h2 className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-8">
            Activity
          </h2>
          <DotCalendar logs={allLogs as { logged_at: string; status: 'completed' | 'skipped'; raw_text: string | null }[]} />
        </section>

        <Separator className="mb-12" />

        {/* Log */}
        <section className="max-w-2xl">
          <h2 className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-8">Workout log</h2>

          {completedLogs.length === 0 ? (
            <p className="text-muted-foreground text-sm">No workouts logged yet. The bot is watching.</p>
          ) : (
            <ul>
              {completedLogs.map((log, i) => (
                <li key={log.id}>
                  <div className="flex gap-8 py-4 items-baseline">
                    <span className="text-xs text-muted-foreground font-mono w-32 flex-shrink-0">
                      {new Date(log.logged_at).toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric',
                      })}
                    </span>
                    <span className="text-sm leading-relaxed">{log.raw_text}</span>
                  </div>
                  {i < completedLogs.length - 1 && <Separator />}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="px-6 md:px-12 py-6 border-t border-border">
        <p className="text-xs text-muted-foreground">Free. Runs on Telegram + Vercel. No account needed.</p>
      </footer>
    </div>
  )
}

function Stat({ value, label, accent, dim }: { value: number; label: string; accent?: boolean; dim?: boolean }) {
  return (
    <div>
      <div className={`text-3xl md:text-4xl font-bold tabular-nums ${accent ? 'text-accent' : dim ? 'text-muted-foreground' : ''}`}>
        {value}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  )
}
