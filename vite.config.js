import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, loadEnv } from 'vite'
import { corsHeaders, handleChatRequest } from './netlify/lib/chatHandler.mjs'
import { handleKmaRequest } from './netlify/lib/kmaHandler.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue(),
      {
        name: 'kma-dev-middleware',
        configureServer(server) {
          server.middlewares.use('/api/kma', async (req, res) => {
            try {
              const apiKey = env.KMA_APIHUB_KEY || process.env.KMA_APIHUB_KEY
              const result = await handleKmaRequest(req.url || '', apiKey)

              res.statusCode = result.status
              res.setHeader('Content-Type', 'text/plain; charset=utf-8')
              res.end(result.body)
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
