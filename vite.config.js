import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    // Dev-time middleware to call KMA, parse the plaintext grid (149x253)
    // and return a single temperature value for Seoul.
    // Note: This runs only in Vite dev server. For production, replace with a proper backend.
    port: 5173,
  },
  plugins: [
    // keep the Vue plugin
    vue(),
    // custom plugin to handle /api/kma requests and return a single temperature
    {
      name: 'kma-dev-middleware',
      configureServer(server) {
        server.middlewares.use('/api/kma', async (req, res, next) => {
          try {
            // Reconstruct target KMA URL by rewriting the path
            const originalUrl = req.url || '' // path+query relative to the mounted /api/kma
            // req.url when middleware is mounted at '/api/kma' is the remainder (e.g. '/?authKey=...')
            // Ensure we don't introduce an extra trailing slash before the query string.
            let qs = originalUrl
            if (originalUrl.startsWith('/?')) qs = originalUrl.slice(1) // turn '/?a=b' -> '?a=b'
            const rewritePath = '/api/typ01/cgi-bin/url/nph-dfs_shrt_grd' + qs
            const targetBase = 'https://apihub.kma.go.kr'
            const url = targetBase + rewritePath

            // Forward the request to KMA
            console.log('[kma-dev-middleware] fetching', url, 'rewritePath=', rewritePath)
            let kmaResp
            try {
              kmaResp = await fetch(url, { method: 'GET' })
            } catch (fe) {
              console.error('[kma-dev-middleware] fetch failed', fe)
              res.statusCode = 502
              res.end('fetch failed')
              return
            }
            console.log('[kma-dev-middleware] upstream status', kmaResp.status)
            const text = await kmaResp.text()
            if (!kmaResp.ok) {
              console.error('[kma-dev-middleware] upstream returned non-ok, body snippet:', text.slice(0, 500))
              res.statusCode = 502
              res.end('upstream error')
              return
            }

            // Parse numbers by whitespace
            const nums = text.trim().split(/\s+/)

            const COLS = 149
            const ROWS = 253
            const NX = 60 // Seoul
            const NY = 127 // Seoul

            const idxA = (NY - 1) * COLS + (NX - 1)
            const idxB = (ROWS - NY) * COLS + (NX - 1) // flipped vertically

            const parseVal = (i) => {
              if (i < 0 || i >= nums.length) return NaN
              const v = parseFloat(nums[i])
              return Number.isFinite(v) ? v : NaN
            }

            const valA = parseVal(idxA)
            const valB = parseVal(idxB)

            let chosen = valA

            // Try to validate orientation by comparing with an external known Seoul temp (Open-Meteo)
            try {
              const om = await fetch('https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current_weather=true')
              const omj = await om.json()
              const ref = omj?.current_weather?.temperature
              if (typeof ref === 'number' && Number.isFinite(ref)) {
                const dA = Number.isFinite(valA) ? Math.abs(valA - ref) : Number.POSITIVE_INFINITY
                const dB = Number.isFinite(valB) ? Math.abs(valB - ref) : Number.POSITIVE_INFINITY
                chosen = dB < dA ? valB : valA
              } else if (!Number.isFinite(chosen) && Number.isFinite(valB)) {
                chosen = valB
              }
            } catch (e) {
              // If validation fails, fall back to a sensible value (prefer valA if valid)
              if (!Number.isFinite(chosen) && Number.isFinite(valB)) chosen = valB
            }

            // Final fallback: if chosen is still NaN, try any valid number near indexA
            if (!Number.isFinite(chosen)) {
              for (let delta = 0; delta < 10; delta++) {
                const a = parseVal(idxA + delta)
                const b = parseVal(idxA - delta)
                if (Number.isFinite(a)) { chosen = a; break }
                if (Number.isFinite(b)) { chosen = b; break }
              }
            }

            res.setHeader('Content-Type', 'text/plain; charset=utf-8')
            if (Number.isFinite(chosen)) {
              res.end(String(chosen))
            } else {
              res.statusCode = 502
              res.end('NaN')
            }
          } catch (err) {
            res.statusCode = 500
            res.end('error')
          }
        })
      },
    },
  ],
})
