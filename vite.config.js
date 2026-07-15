import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath } from 'url'
import { handleChatRequest, corsHeaders } from './netlify/lib/chatHandler.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue(),
      {
        name: 'kma-dev-middleware',
        configureServer(server) {
          server.middlewares.use('/api/kma', async (req, res, next) => {
            try {
              const originalUrl = req.url || ''
              let qs = originalUrl
              if (originalUrl.startsWith('/?')) qs = originalUrl.slice(1)
              const rewritePath = '/api/typ01/cgi-bin/url/nph-dfs_shrt_grd' + qs
              const targetBase = 'https://apihub.kma.go.kr'
              const url = targetBase + rewritePath

              let kmaResp
              try {
                kmaResp = await fetch(url, { method: 'GET' })
              } catch {
                res.statusCode = 502
                res.end('fetch failed')
                return
              }

              const text = await kmaResp.text()
              if (!kmaResp.ok) {
                res.statusCode = 502
                res.end('upstream error')
                return
              }

              const nums = text.trim().split(/\s+/)
              const COLS = 149
              const ROWS = 253
              const NX = 60
              const NY = 127

              const idxA = (NY - 1) * COLS + (NX - 1)
              const idxB = (ROWS - NY) * COLS + (NX - 1)

              const parseVal = (i) => {
                if (i < 0 || i >= nums.length) return NaN
                const v = parseFloat(nums[i])
                return Number.isFinite(v) ? v : NaN
              }

              const valA = parseVal(idxA)
              const valB = parseVal(idxB)
              let chosen = valA

              try {
                const om = await fetch(
                  'https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current_weather=true'
                )
                const omj = await om.json()
                const ref = omj?.current_weather?.temperature
                if (typeof ref === 'number' && Number.isFinite(ref)) {
                  const dA = Number.isFinite(valA) ? Math.abs(valA - ref) : Number.POSITIVE_INFINITY
                  const dB = Number.isFinite(valB) ? Math.abs(valB - ref) : Number.POSITIVE_INFINITY
                  chosen = dB < dA ? valB : valA
                } else if (!Number.isFinite(chosen) && Number.isFinite(valB)) {
                  chosen = valB
                }
              } catch {
                if (!Number.isFinite(chosen) && Number.isFinite(valB)) chosen = valB
              }

              if (!Number.isFinite(chosen)) {
                for (let delta = 0; delta < 10; delta++) {
                  const a = parseVal(idxA + delta)
                  const b = parseVal(idxA - delta)
                  if (Number.isFinite(a)) {
                    chosen = a
                    break
                  }
                  if (Number.isFinite(b)) {
                    chosen = b
                    break
                  }
                }
              }

              res.setHeader('Content-Type', 'text/plain; charset=utf-8')
              if (Number.isFinite(chosen)) {
                res.end(String(chosen))
              } else {
                res.statusCode = 502
                res.end('NaN')
              }
            } catch {
              res.statusCode = 500
              res.end('error')
            }
          })

          server.middlewares.use('/api/chat', async (req, res) => {
            if (req.method === 'OPTIONS') {
              res.writeHead(204, corsHeaders)
              res.end()
              return
            }

            if (req.method !== 'POST') {
              res.writeHead(405, { ...corsHeaders, 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'POST만 허용됩니다.' }))
              return
            }

            let body = ''
            req.on('data', (chunk) => {
              body += chunk
            })

            req.on('end', async () => {
              try {
                const parsed = JSON.parse(body || '{}')
                const apiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY
                const result = await handleChatRequest(parsed, apiKey)

                res.writeHead(result.status, {
                  ...corsHeaders,
                  'Content-Type': 'application/json',
                })
                res.end(JSON.stringify(result.body))
              } catch {
                res.writeHead(400, { ...corsHeaders, 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ error: 'JSON 파싱에 실패했습니다.' }))
              }
            })
          })
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 5173,
    },
  }
})
