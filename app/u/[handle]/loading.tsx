import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import Link from 'next/link'

export default function LoadingDashboard() {
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
        <div className="pt-8 pb-12">
          <div className="text-xs text-muted-foreground/50 font-mono">back</div>
        </div>

        {/* Identity Skeleton */}
        <section className="max-w-2xl pb-12">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-3">
              <Skeleton className="h-[48px] w-[250px] md:w-[350px]" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full mt-2" />
          </div>
          <Skeleton className="h-3 w-40 mt-6" />
        </section>

        <Separator className="mb-12" />

        {/* Stats Skeleton */}
        <section className="max-w-2xl pb-12">
          <div className="text-xs text-muted-foreground/50 font-mono uppercase tracking-widest mb-8">Stats</div>
          <div className="grid grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-10 w-12" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </section>

        <Separator className="mb-12" />

        {/* Calendar Skeleton */}
        <section className="max-w-3xl pb-12">
          <div className="text-xs text-muted-foreground/50 font-mono uppercase tracking-widest mb-8">Activity</div>
          <Skeleton className="h-[120px] w-full rounded-md" />
        </section>

        <Separator className="mb-12" />

        {/* Logs Skeleton */}
        <section className="max-w-2xl">
          <div className="text-xs text-muted-foreground/50 font-mono uppercase tracking-widest mb-8">Workout log</div>
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i}>
                <div className="flex gap-8 py-4 items-baseline">
                  <Skeleton className="h-4 w-24 flex-shrink-0" />
                  <div className="space-y-3 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
                {i < 3 && <Separator className="mt-2" />}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="px-6 md:px-12 py-6 max-w-5xl mx-auto w-full">
          <Skeleton className="h-3 w-64" />
        </div>
      </footer>
    </div>
  )
}
