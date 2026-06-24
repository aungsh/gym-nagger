import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-start justify-center px-6 md:px-12">
      <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-6">404</p>
      <h1 className="text-4xl font-bold tracking-tight mb-3">Handle not found</h1>
      <p className="text-muted-foreground text-sm mb-10">
        This user has not registered yet, or the handle is wrong.
      </p>
      <Link
        href="/"
        className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
      >
        back to home
      </Link>
    </div>
  )
}
