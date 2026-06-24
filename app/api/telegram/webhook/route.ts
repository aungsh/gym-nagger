import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { sendMessage } from '@/lib/telegram'

// Telegram Update types (minimal)
interface TelegramMessage {
  message_id: number
  from?: {
    id: number
    username?: string
    first_name?: string
  }
  chat: { id: number }
  text?: string
  date: number
}

interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
}

export async function POST(req: NextRequest) {
  try {
    const update: TelegramUpdate = await req.json()
    const message = update.message

    if (!message || !message.text) {
      return NextResponse.json({ ok: true })
    }

    const chatId = message.chat.id
    const text = message.text.trim()
    const fromUser = message.from
    const supabase = createServerClient()

    // ── /start <short_code> ──────────────────────────────────────
    if (text.startsWith('/start')) {
      const parts = text.split(' ')
      const shortCode = parts[1]?.trim()

      if (!shortCode) {
        await sendMessage(chatId, "Hey! 👋 Share this bot link with anyone you want to nag about the gym.")
        return NextResponse.json({ ok: true })
      }

      // Look up pending signup
      const { data: pending, error: pendingErr } = await supabase
        .from('pending_signups')
        .select('*')
        .eq('short_code', shortCode)
        .is('consumed_at', null)
        .single()

      if (pendingErr || !pending) {
        await sendMessage(chatId, "❌ This link is invalid or already used. Go generate a new one at the website!")
        return NextResponse.json({ ok: true })
      }

      // Upsert user
      const handle = fromUser?.username?.toLowerCase() ?? pending.handle_input
      const displayName = fromUser?.first_name ?? handle

      const { error: userErr } = await supabase.from('users').upsert(
        {
          telegram_id: chatId,
          handle,
          display_name: displayName,
        },
        { onConflict: 'telegram_id' }
      )

      if (userErr) {
        console.error('[webhook] upsert user error:', userErr)
        await sendMessage(chatId, "Something went wrong on our end. Try again!")
        return NextResponse.json({ ok: true })
      }

      // Mark signup as consumed
      await supabase
        .from('pending_signups')
        .update({ consumed_at: new Date().toISOString() })
        .eq('short_code', shortCode)

      await sendMessage(
        chatId,
        `Got it, ${displayName}! 💪 I'll nag you every day.\n\nWhen you work out, just reply here with what you did — I'll log it and keep your streak going. 🔥`
      )
      return NextResponse.json({ ok: true })
    }

    // ── Regular message → log it ─────────────────────────────────
    const { data: user } = await supabase
      .from('users')
      .select('id, streak, handle')
      .eq('telegram_id', chatId)
      .single()

    if (!user) {
      await sendMessage(chatId, "I don't know who you are yet! Go to the website and register first 👀")
      return NextResponse.json({ ok: true })
    }

    // Insert log entry
    await supabase.from('logs').insert({
      user_id: user.id,
      raw_text: text,
    })

    // Update streak (simple: increment by 1 — proper streak logic can be added later)
    const newStreak = (user.streak ?? 0) + 1
    await supabase.from('users').update({ streak: newStreak }).eq('id', user.id)

    await sendMessage(
      chatId,
      `Logged ✅\n🔥 Streak: *${newStreak} day${newStreak === 1 ? '' : 's'}*\n\nKeep it up!`
    )

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[webhook] unexpected error:', e)
    return NextResponse.json({ ok: true }) // Always return 200 to Telegram
  }
}
