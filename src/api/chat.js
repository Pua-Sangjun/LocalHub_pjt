const CHAT_API_URL = '/api/chat'

export async function sendChatMessage({ message, history = [], context = '' }) {
  const response = await fetch(CHAT_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, context }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || `요청 실패 (${response.status})`)
  }

  return data.reply
}
