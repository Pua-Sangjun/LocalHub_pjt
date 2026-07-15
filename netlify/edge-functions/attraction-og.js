const BOT_UA = /kakaotalk|facebookexternalhit|twitterbot|slackbot|linkedinbot|whatsapp|telegrambot/i

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
}

export default async (request, context) => {
  const url = new URL(request.url)
  const match = url.pathname.match(/^\/attractions\/(\d+)\/?$/)

  if (!match) {
    return context.next()
  }

  const userAgent = request.headers.get('user-agent') || ''
  if (!BOT_UA.test(userAgent)) {
    return context.next()
  }

  const id = match[1]
  const dataUrl = `${url.origin}/data/${encodeURIComponent('서울_관광지.json')}`

  try {
    const response = await fetch(dataUrl)
    if (!response.ok) return context.next()

    const json = await response.json()
    const item = (json.items || []).find((entry) => String(entry.contentid) === id)
    if (!item) return context.next()

    const title = `${item.title} | LocalHub`
    const description = item.addr1 || '서울 관광지 — LocalHub'
    const image = item.firstimage || `${url.origin}/localhub-logo.svg`
    const pageUrl = `${url.origin}/attractions/${id}`

    const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:url" content="${escapeHtml(pageUrl)}" />
  <meta property="og:type" content="website" />
  <meta http-equiv="refresh" content="0;url=${escapeHtml(pageUrl)}" />
</head>
<body>
  <p><a href="${escapeHtml(pageUrl)}">${escapeHtml(item.title)}</a></p>
</body>
</html>`

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch {
    return context.next()
  }
}
