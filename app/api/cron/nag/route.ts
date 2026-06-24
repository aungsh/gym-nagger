import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { sendMessage } from '@/lib/telegram'

const NAG_MESSAGES = [
  "🏋️ GO TO THE GYM. Reply here with what you did.",
  "💪 No excuses today. Hit the gym and report back!",
  "🔥 Your streak is on the line. Get moving! Reply with your workout.",
  "😤 The gym is waiting. Reply here once you're done.",
  "🏃 Time to earn that streak. GO WORK OUT. Tell me what you do.",
]

export async function GET(req: NextRequest) {
  // Verify the cron secret
  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key') ?? req.headers.get('x-cron-secret')

  if (key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient()

  // Fetch all registered users
  const { data: users, error } = await supabase
    .from('users')
    .select('telegram_id, display_name, streak')

  if (error) {
    console.error('[cron/nag] fetch users error:', error)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  if (!users || users.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No users yet' })
  }

  const nagText = NAG_MESSAGES[Math.floor(Math.random() * NAG_MESSAGES.length)]

  let sent = 0
  for (const user of users) {
    try {
      const streakLine = user.streak > 0 ? `\n🔥 Current streak: *${user.streak} day${user.streak === 1 ? '' : 's'}*` : ''
      await sendMessage(user.telegram_id, `${nagText}${streakLine}`)
      sent++
    } catch (e) {
      console.error(`[cron/nag] failed to message ${user.telegram_id}:`, e)
    }
  }

  return NextResponse.json({ sent, total: users.length })
}
