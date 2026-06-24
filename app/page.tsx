'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

export default function HomePage() {
  const [handle, setHandle] = useState('')
  const [deepLink, setDeepLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchHandle, setSearchHandle] = useState('')

  // Test panel state
  const [testHandle, setTestHandle] = useState('')
  const [testLogText, setTestLogText] = useState('')
  const [testStatus, setTestStatus] = useState('')
  const [testLoading, setTestLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setDeepLink('')
    setLoading(true)
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: handle.replace(/^@/, '') }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
      } else {
        setDeepLink(data.deepLink)
      }
    } catch {
      setError('Network error, try again')
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const clean = searchHandle.replace(/^@/, '').toLowerCase().trim()
    if (clean) window.location.href = `/u/${clean}`
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="px-6 py-5 md:px-12 max-w-5xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-semibold tracking-tight">GymNag</Link>
          <Link href="/leaderboard" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Leaderboard</Link>
        </div>
        <span className="text-xs text-muted-foreground font-mono">@gym_nagger_bot</span>
      </header>

      <main className="flex-1 px-6 md:px-12 pb-24 max-w-5xl mx-auto w-full">

        {/* Hero */}
        <section className="pt-20 pb-16 max-w-2xl">
          <p className="text-xs text-accent font-mono uppercase tracking-widest mb-6">
            Telegram accountability bot
          </p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            Stop skipping.<br />Get nagged.
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
            A bot that messages you every day until you log a workout.
            No app. No subscriptions. Just Telegram and shame.
          </p>
        </section>

        <Separator className="mb-16" />

        {/* Signup */}
        <section className="max-w-2xl pb-16">
          <h2 className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-6">
            Get your link
          </h2>

          {!deepLink ? (
            <div className="space-y-4">
              <form onSubmit={handleSignup} className="flex gap-3 max-w-sm">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">@</span>
                  <Input
                    id="handle-input"
                    type="text"
                    value={handle}
                    onChange={e => setHandle(e.target.value)}
                    placeholder="yourtelegramhandle"
                    className="pl-7 bg-muted border-border h-10 text-sm"
                    required
                  />
                </div>
                <button
                  id="signup-btn"
                  type="submit"
                  disabled={loading}
                  className="px-4 h-10 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-50 cursor-pointer"
                  style={{ background: 'oklch(0.87 0.22 130)', color: 'oklch(0.08 0 0)' }}
                >
                  {loading ? '...' : 'Get link'}
                </button>
              </form>
              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your link is ready. Open it in Telegram and tap Start.
              </p>
              <div className="flex gap-3 max-w-sm flex-wrap items-center">
                <a
                  id="open-telegram-btn"
                  href={deepLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 h-10 inline-flex items-center rounded-lg text-sm font-semibold transition-opacity cursor-pointer"
                  style={{ background: 'oklch(0.87 0.22 130)', color: 'oklch(0.08 0 0)' }}
                >
                  Open in Telegram
                </a>
                <button
                  onClick={() => { setDeepLink(''); setHandle('') }}
                  className="text-muted-foreground text-sm hover:text-foreground transition-colors cursor-pointer"
                >
                  Add another
                </button>
              </div>
              <p className="font-mono text-xs text-muted-foreground break-all">{deepLink}</p>
            </div>
          )}
        </section>

        <Separator className="mb-16" />

        {/* Dashboard lookup */}
        <section className="max-w-2xl pb-16">
          <h2 className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-6">
            Look up someone
          </h2>
          <form onSubmit={handleSearch} className="flex gap-3 max-w-sm">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">@</span>
              <Input
                id="search-handle-input"
                type="text"
                value={searchHandle}
                onChange={e => setSearchHandle(e.target.value)}
                placeholder="theirhandle"
                className="pl-7 bg-muted border-border h-10 text-sm"
                required
              />
            </div>
            <button
              id="search-btn"
              type="submit"
              className="px-4 h-10 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              View
            </button>
          </form>
        </section>

        <Separator className="mb-16" />

        {/* How it works */}
        <section className="max-w-2xl pb-16">
          <h2 className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-8">
            How it works
          </h2>
          <ol className="space-y-6">
            {[
              { n: '01', text: 'Enter your Telegram handle and get a personal bot link.' },
              { n: '02', text: 'Open the link and tap Start to activate the bot.' },
              { n: '03', text: 'Every day, the bot messages you. Reply with what you did.' },
              { n: '04', text: 'Your log is public at gymNag/u/yourhandle.' },
            ].map(step => (
              <li key={step.n} className="flex gap-6 items-start">
                <span className="text-xs font-mono text-accent pt-0.5 w-6 flex-shrink-0">{step.n}</span>
                <span className="text-sm text-muted-foreground leading-relaxed">{step.text}</span>
              </li>
            ))}
          </ol>
        </section>

        <Separator className="mb-16" />

        {/* Dev test panel */}
        <section className="max-w-2xl pb-4">
          <h2 className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-2">
            Test panel
          </h2>
          <p className="text-xs text-muted-foreground mb-8">
            Only works while the bot is registered and the user has completed setup.
          </p>

          <div className="space-y-6">
            {/* Send test nag */}
            <div>
              <p className="text-xs text-muted-foreground font-mono mb-3">Send a nag (fires Skip/Start buttons in Telegram)</p>
              <form
                onSubmit={async e => {
                  e.preventDefault()
                  setTestLoading(true)
                  setTestStatus('')
                  const res = await fetch('/api/test/nag', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ handle: testHandle }),
                  })
                  const data = await res.json()
                  setTestStatus(res.ok ? `Sent to ${data.sent_to}` : data.error)
                  setTestLoading(false)
                }}
                className="flex gap-3 max-w-sm"
              >
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">@</span>
                  <Input
                    id="test-nag-handle"
                    type="text"
                    value={testHandle}
                    onChange={e => setTestHandle(e.target.value)}
                    placeholder="yourhandle"
                    className="pl-7 bg-muted border-border h-10 text-sm"
                    required
                  />
                </div>
                <button
                  id="test-nag-btn"
                  type="submit"
                  disabled={testLoading}
                  className="px-4 h-10 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
                >
                  {testLoading ? '...' : 'Send nag'}
                </button>
              </form>
            </div>

            {/* Log activity */}
            <div>
              <p className="text-xs text-muted-foreground font-mono mb-3">Manually log a gym activity (skips the bot)</p>
              <form
                onSubmit={async e => {
                  e.preventDefault()
                  setTestLoading(true)
                  setTestStatus('')
                  const res = await fetch('/api/test/log', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ handle: testHandle, text: testLogText }),
                  })
                  const data = await res.json()
                  setTestStatus(res.ok ? `Logged. New streak: ${data.streak}` : data.error)
                  setTestLogText('')
                  setTestLoading(false)
                }}
                className="space-y-3"
              >
                <div className="flex gap-3 max-w-sm">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">@</span>
                    <Input
                      id="test-log-handle"
                      type="text"
                      value={testHandle}
                      onChange={e => setTestHandle(e.target.value)}
                      placeholder="yourhandle"
                      className="pl-7 bg-muted border-border h-10 text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3 max-w-sm">
                  <Input
                    id="test-log-text"
                    type="text"
                    value={testLogText}
                    onChange={e => setTestLogText(e.target.value)}
                    placeholder="e.g. chest day, 3 sets bench press"
                    className="bg-muted border-border h-10 text-sm flex-1"
                    required
                  />
                  <button
                    id="test-log-btn"
                    type="submit"
                    disabled={testLoading}
                    className="px-4 h-10 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                  >
                    {testLoading ? '...' : 'Log it'}
                  </button>
                </div>
              </form>
            </div>

            {testStatus && (
              <p className={`text-xs font-mono ${testStatus.startsWith('Sent') || testStatus.startsWith('Logged') ? 'text-accent' : 'text-destructive'}`}>
                {testStatus}
              </p>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="px-6 md:px-12 py-6 max-w-5xl mx-auto w-full">
          <p className="text-xs text-muted-foreground">
            Free. Runs on Telegram + Vercel. No account needed.
          </p>
        </div>
      </footer>
    </div>
  )
}
