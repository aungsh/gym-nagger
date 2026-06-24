import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { handle } = await req.json()

    if (!handle || typeof handle !== 'string') {
      return NextResponse.json({ error: 'handle is required' }, { status: 400 })
    }

    // Normalise: strip leading @, lowercase
    const cleanHandle = handle.replace(/^@/, '').toLowerCase().trim()
    if (!cleanHandle) {
      return NextResponse.json({ error: 'Invalid handle' }, { status: 400 })
    }

    const shortCode = nanoid(8)
    const supabase = createServerClient()

    const { error } = await supabase.from('pending_signups').insert({
      short_code: shortCode,
      handle_input: cleanHandle,
    })

    if (error) {
      console.error('[signup] insert error:', error)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    const botUsername = process.env.BOT_USERNAME
    const deepLink = `https://t.me/${botUsername}?start=${shortCode}`

    return NextResponse.json({ shortCode, deepLink })
  } catch (e) {
    console.error('[signup] unexpected error:', e)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
