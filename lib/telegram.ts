const API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

async function post(method: string, body: object) {
  const res = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) console.error(`[telegram] ${method} failed:`, await res.text())
  return res.json()
}

export function sendMessage(chat_id: number | string, text: string) {
  return post('sendMessage', { chat_id, text })
}

export function sendMessageWithKeyboard(
  chat_id: number | string,
  text: string,
  keyboard: object
) {
  return post('sendMessage', { chat_id, text, reply_markup: keyboard })
}

export function editMessageText(
  chat_id: number | string,
  message_id: number,
  text: string,
  keyboard?: object
) {
  const body: Record<string, unknown> = { chat_id, message_id, text }
  if (keyboard) body.reply_markup = keyboard
  return post('editMessageText', body)
}

export function answerCallbackQuery(callback_query_id: string, text?: string) {
  return post('answerCallbackQuery', { callback_query_id, ...(text ? { text } : {}) })
}

// ---- Day-selection keyboard ---------------------------------
const DAYS = [
  { label: 'Mon', val: '1' },
  { label: 'Tue', val: '2' },
  { label: 'Wed', val: '3' },
  { label: 'Thu', val: '4' },
  { label: 'Fri', val: '5' },
  { label: 'Sat', val: '6' },
  { label: 'Sun', val: '0' },
]

export function toggleDaySelection(current: string, day: string): string {
  const set = new Set(current ? current.split('') : [])
  set.has(day) ? set.delete(day) : set.add(day)
  return [...set].sort().join('')
}

export function buildDayKeyboard(selected: string) {
  const btn = (d: { label: string; val: string }) => ({
    text: selected.includes(d.val) ? `✅ ${d.label}` : d.label,
    callback_data: `dt:${d.val}:${selected}`,
  })
  const count = selected.length
  return {
    inline_keyboard: [
      [btn(DAYS[0]), btn(DAYS[1]), btn(DAYS[2])],
      [btn(DAYS[3]), btn(DAYS[4]), btn(DAYS[5])],
      [btn(DAYS[6])],
      [{
        text: count
          ? `Save (${count} day${count !== 1 ? 's' : ''}) ✓`
          : 'Select at least one day',
        callback_data: count ? `ds:${selected}` : 'noop',
      }],
    ],
  }
}

// ---- Nag keyboard -------------------------------------------
export const NAG_KEYBOARD = {
  inline_keyboard: [[
    { text: 'Skip 🚫', callback_data: 'skip' },
    { text: "Let's go 💪", callback_data: 'start' },
  ]],
}

// ---- Copy ---------------------------------------------------
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export function formatGymDays(days: number[]) {
  return days.map(d => DAY_NAMES[d]).join(', ')
}
