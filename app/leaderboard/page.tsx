import { createServerClient } from '@/lib/supabase'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Leaderboard — GymNag',
}

export default async function LeaderboardPage() {
  const supabase = createServerClient()

  // Fetch top 50 users by streak
  const { data: users } = await supabase
    .from('users')
    .select('id, handle, display_name, streak')
    .order('streak', { ascending: false })
    .limit(50)

  const activeUsers = users ?? []
  const userIds = activeUsers.map(u => u.id)

  // Fetch completed log counts
  let sessionCounts: Record<string, number> = {}
  if (userIds.length > 0) {
    const { data: logs } = await supabase
      .from('logs')
      .select('user_id')
      .in('user_id', userIds)
      .eq('status', 'completed')
      
    sessionCounts = (logs ?? []).reduce((acc, log) => {
      acc[log.user_id] = (acc[log.user_id] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-5 md:px-12 max-w-5xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-semibold tracking-tight">GymNag</Link>
          <Link href="/leaderboard" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Leaderboard</Link>
        </div>
        <span className="text-xs text-muted-foreground font-mono">@gym_nagger_bot</span>
      </header>

      <main className="flex-1 px-6 md:px-12 pb-24 max-w-5xl mx-auto w-full">
        <div className="pt-20 pb-12">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-4">
            Leaderboard
          </h1>
          <p className="text-muted-foreground">The most relentless lifters.</p>
        </div>

        <Separator className="mb-12" />

        <section className="max-w-3xl pb-12">
          <div className="flex flex-col gap-6">
            {/* Header row */}
            <div className="flex items-center text-xs text-muted-foreground font-mono uppercase tracking-widest px-4">
              <div className="w-12 flex-shrink-0">Rank</div>
              <div className="flex-1">Lifter</div>
              <div className="w-32 text-right flex-shrink-0">Streak</div>
              <div className="w-32 text-right flex-shrink-0 hidden sm:block">Sessions</div>
            </div>

            {/* List */}
            {activeUsers.length === 0 ? (
              <p className="text-muted-foreground text-sm px-4">No users yet.</p>
            ) : (
              <div className="flex flex-col">
                {activeUsers.map((user, i) => {
                  const sessions = sessionCounts[user.id] || 0
                  const isTop3 = i < 3

                  return (
                    <Link 
                      key={user.id} 
                      href={`/u/${user.handle}`}
                      className="group flex items-center px-4 py-4 hover:bg-muted/30 rounded-xl transition-colors"
                    >
                      <div className="w-12 flex-shrink-0">
                        <span className={`text-xl font-bold tabular-nums ${isTop3 ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {i + 1}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-semibold text-lg">{user.display_name ?? `@${user.handle}`}</div>
                        <div className="text-muted-foreground text-sm font-mono">@{user.handle}</div>
                      </div>
                      
                      <div className="w-32 text-right flex-shrink-0">
                        <Badge className={`text-xs font-mono tabular-nums ${user.streak > 0 ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                          {user.streak} day
                        </Badge>
                      </div>
                      
                      <div className="w-32 text-right flex-shrink-0 hidden sm:block">
                        <span className="text-lg font-bold tabular-nums">{sessions}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="px-6 md:px-12 py-6 max-w-5xl mx-auto w-full">
          <p className="text-xs text-muted-foreground">Free. Runs on Telegram + Vercel. No account needed.</p>
        </div>
      </footer>
    </div>
  )
}
