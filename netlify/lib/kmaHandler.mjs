const COLS = 149
const ROWS = 253

function parseTemperatureFromGrid(text, nx = 60, ny = 127) {
  const nums = text.trim().split(/\s+/)
  const idxA = (ny - 1) * COLS + (nx - 1)
  const idxB = (ROWS - ny) * COLS + (nx - 1)

  const parseVal = (i) => {
    if (i < 0 || i >= nums.length) return NaN
    const v = parseFloat(nums[i])
    return Number.isFinite(v) ? v : NaN
  }

  const valA = parseVal(idxA)
  const valB = parseVal(idxB)
  let chosen = valA

  for (let delta = 0; delta < 10 && !Number.isFinite(chosen); delta++) {
    const a = parseVal(idxA + delta)
    const b = parseVal(idxA - delta)
    if (Number.isFinite(a)) chosen = a
    else if (Number.isFinite(b)) chosen = b
  }

  if (!Number.isFinite(chosen) && Number.isFinite(valB)) chosen = valB
  return chosen
}

export async function fetchOpenMeteoTemperature() {
  const response = await fetch(
    'https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current_weather=true'
  )
  if (!response.ok) throw new Error('Open-Meteo 요청 실패')

  const data = await response.json()
  const temperature = data?.current_weather?.temperature
  if (!Number.isFinite(temperature)) throw new Error('Open-Meteo 파싱 실패')
  return temperature
}

export async function fetchKmaGridTemperature({ tmfc, tmef, nx = 60, ny = 127, vars = 'TMP' }, apiKey) {
  if (!apiKey) return NaN

  const params = new URLSearchParams({
    authKey: apiKey,
    tmfc,
    tmef,
    nx: String(nx),
    ny: String(ny),
    vars,
  })

  const url = `https://apihub.kma.go.kr/api/typ01/cgi-bin/url/nph-dfs_shrt_grd?${params}`
  const response = await fetch(url)
  if (!response.ok) return NaN

  const text = await response.text()
  let chosen = parseTemperatureFromGrid(text, nx, ny)

  try {
    const ref = await fetchOpenMeteoTemperature()
    const valA = parseTemperatureFromGrid(text, nx, ny)
    const idxA = (ny - 1) * COLS + (nx - 1)
    const idxB = (ROWS - ny) * COLS + (nx - 1)
    const nums = text.trim().split(/\s+/)
    const parseVal = (i) => {
      if (i < 0 || i >= nums.length) return NaN
      const v = parseFloat(nums[i])
      return Number.isFinite(v) ? v : NaN
    }
    const valB = parseVal(idxB)
    const dA = Number.isFinite(valA) ? Math.abs(valA - ref) : Number.POSITIVE_INFINITY
    const dB = Number.isFinite(valB) ? Math.abs(valB - ref) : Number.POSITIVE_INFINITY
    chosen = dB < dA ? valB : valA
  } catch {
    // Open-Meteo 보정 실패 시 KMA 파싱값 사용
  }

  return chosen
}

export function parseKmaQuery(urlSearch) {
  const url = new URL(urlSearch || '/', 'http://localhost')

  return {
    tmfc: url.searchParams.get('tmfc') || '',
    tmef: url.searchParams.get('tmef') || '',
    nx: Number(url.searchParams.get('nx') || 60),
    ny: Number(url.searchParams.get('ny') || 127),
    vars: url.searchParams.get('vars') || 'TMP',
  }
}

export async function handleKmaRequest(urlSearch, apiKey) {
  const query = parseKmaQuery(urlSearch)

  if (!query.tmfc || !query.tmef) {
    return { status: 400, body: 'tmfc, tmef 파라미터가 필요합니다.' }
  }

  try {
    const temperature = await fetchKmaGridTemperature(query, apiKey)
    if (Number.isFinite(temperature)) {
      return { status: 200, body: String(temperature) }
    }

    const fallback = await fetchOpenMeteoTemperature()
    return { status: 200, body: String(fallback) }
  } catch {
    try {
      const fallback = await fetchOpenMeteoTemperature()
      return { status: 200, body: String(fallback) }
    } catch {
      return { status: 502, body: '날씨 정보를 불러오지 못했습니다.' }
    }
  }
}
