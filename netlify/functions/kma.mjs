import { handleKmaRequest } from '../lib/kmaHandler.mjs'

export default async (request) => {
  const url = new URL(request.url)
  const apiKey = process.env.KMA_APIHUB_KEY
  const result = await handleKmaRequest(url.search, apiKey)

  return new Response(result.body, {
    status: result.status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
