import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { handle, text } = await req.json()
  if (!handle || !text) return NextResponse.json({ error: 'handle and text required' }, { status: 400 })

  const supabase = createServerClient()
  const { data: user } = await supabase
    .from('users')
    .select('id, streak, bot_state')
    .eq('handle', handle.replace(/^@/, '').toLowerCase())
    .single()

  if (!user) return NextResponse.json({ error: 'User not found — have they registered via bot yet?' }, { status: 404 })

  const newStreak = (user.streak ?? 0) + 1
  await supabase.from('logs').insert({ user_id: user.id, status: 'completed', raw_text: text })
  await supabase.from('users').update({ streak: newStreak }).eq('id', user.id)

  return NextResponse.json({ ok: true, streak: newStreak })
}
