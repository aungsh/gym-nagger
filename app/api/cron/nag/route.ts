import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { sendMessageWithKeyboard, NAG_KEYBOARD } from '@/lib/telegram'

const MORNING_NAGS = [
  "Wake up, fatass. It's gym day. You going or what?",
  "Rise and grind, tubby. The gym isn't going to itself.",
  "Good morning. Your only job today: get to the gym. Don't be a little bitch about it.",
  "Morning. You fat? Fix it. Gym. Today.",
]

const AFTERNOON_NAGS = [
  "Still haven't gone? Absolute clown behavior.",
  "Afternoon check-in: you're still a lazy sack. Move.",
  "Sitting on your ass all day? Embarrassing. Gym. Now.",
  "You really gonna waste today? Get up and go, skinny bitch.",
]

const EVENING_NAGS = [
  "Last chance. Tonight or you're a certified quitter.",
  "Day's almost over and you still haven't moved. Pathetic.",
  "Final warning. Gym or stay a disappointment forever.",
  "Night nag. If you skip tonight, I will not respect you tomorrow.",
]

const PERIOD_COPY: Record<string, string[]> = {
  morning: MORNING_NAGS,
  afternoon: AFTERNOON_NAGS,
  evening: EVENING_NAGS,
}

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key') ?? req.headers.get('x-cron-secret')

  if (key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const period = searchParams.get('period') ?? 'morning'
  const messages = PERIOD_COPY[period] ?? MORNING_NAGS

  const supabase = createServerClient()

  // Only nag users whose gym_days include today (UTC day-of-week)
  const todayUTC = new Date()
  const dayOfWeek = todayUTC.getUTCDay() // 0=Sun 1=Mon ... 6=Sat
  const todayStr = todayUTC.toISOString().split('T')[0]

  const { data: users } = await supabase
    .from('users')
    .select('id, telegram_id, display_name, streak, gym_days, bot_state')
    .neq('bot_state', 'setup') // skip users who haven't finished setup

  if (!users?.length) return NextResponse.json({ sent: 0 })

  let sent = 0
  for (const user of users) {
    // Check gym day
    if (!user.gym_days?.includes(dayOfWeek)) continue

    // Check if already logged or skipped today
    const { data: todayLog } = await supabase
      .from('logs')
      .select('id')
      .eq('user_id', user.id)
      .gte('logged_at', `${todayStr}T00:00:00Z`)
      .lt('logged_at', `${todayStr}T23:59:59Z`)
      .limit(1)
      .maybeSingle()

    if (todayLog) continue // already handled today

    try {
      const nagText = rand(messages)
      const streakLine = user.streak > 0
        ? `\nStreak: ${user.streak} day${user.streak !== 1 ? 's' : ''} — don't blow it.`
        : ''

      await sendMessageWithKeyboard(
        user.telegram_id,
        `${nagText}${streakLine}`,
        NAG_KEYBOARD
      )
      sent++
    } catch (e) {
      console.error(`[cron] failed for ${user.telegram_id}:`, e)
    }
  }

  return NextResponse.json({ sent, period, day: dayOfWeek })
}
