import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import Link from 'next/link'

export default function LoadingLeaderboard() {
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
          <Skeleton className="h-[60px] w-[250px] md:w-[350px] mb-4" />
          <Skeleton className="h-4 w-64" />
        </div>

        <Separator className="mb-12" />

        <section className="max-w-3xl pb-12">
          <div className="flex flex-col gap-6">
            {/* Header row */}
            <div className="flex items-center text-xs text-muted-foreground/50 font-mono uppercase tracking-widest px-4">
              <div className="w-12 flex-shrink-0">Rank</div>
              <div className="flex-1">Lifter</div>
              <div className="w-32 text-right flex-shrink-0">Streak</div>
              <div className="w-32 text-right flex-shrink-0 hidden sm:block">Sessions</div>
            </div>

            {/* List */}
            <div className="flex flex-col gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <div key={i} className="flex items-center px-4 py-4">
                  <div className="w-12 flex-shrink-0">
                    <Skeleton className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  
                  <div className="w-32 flex justify-end flex-shrink-0">
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  
                  <div className="w-32 flex justify-end flex-shrink-0 hidden sm:flex">
                    <Skeleton className="h-6 w-8" />
                  </div>
                </div>
              ))}
            </div>
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
