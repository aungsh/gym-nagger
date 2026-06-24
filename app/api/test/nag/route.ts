import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { sendMessageWithKeyboard, NAG_KEYBOARD } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  const { handle } = await req.json()
  if (!handle) return NextResponse.json({ error: 'handle required' }, { status: 400 })

  const supabase = createServerClient()
  const { data: user } = await supabase
    .from('users')
    .select('telegram_id, display_name, streak, bot_state')
    .eq('handle', handle.replace(/^@/, '').toLowerCase())
    .single()

  if (!user) return NextResponse.json({ error: 'User not found — have they registered via bot yet?' }, { status: 404 })
  if (user.bot_state === 'setup') return NextResponse.json({ error: 'User has not finished day-selection setup yet' }, { status: 400 })

  await sendMessageWithKeyboard(
    user.telegram_id,
    `[TEST NAG] Wake up, fatass. It's gym day. You going or what?\n\nStreak: ${user.streak} day${user.streak !== 1 ? 's' : ''}`,
    NAG_KEYBOARD
  )

  return NextResponse.json({ ok: true, sent_to: user.display_name ?? handle })
}
