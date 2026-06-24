const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

export async function sendMessage(chat_id: number | string, text: string) {
  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id, text, parse_mode: 'Markdown' }),
  })
  if (!res.ok) {
    const err = await res.text()
    console.error('[telegram] sendMessage failed:', err)
  }
  return res.json()
}

export async function setWebhook(webhookUrl: string) {
  const res = await fetch(
    `${TELEGRAM_API}/setWebhook?url=${encodeURIComponent(webhookUrl)}`
  )
  return res.json()
}
