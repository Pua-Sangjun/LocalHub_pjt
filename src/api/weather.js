import axios from 'axios'

const RELEASE_HOURS = [2, 5, 8, 11, 14, 17, 20, 23]

function pad2(value) {
  return String(value).padStart(2, '0')
}

function formatYYYYMMDDHH(date) {
  const year = date.getFullYear()
  const month = pad2(date.getMonth() + 1)
  const day = pad2(date.getDate())
  const hour = pad2(date.getHours())
  return `${year}${month}${day}${hour}`
}

export function getLatestTmfc(now = new Date()) {
  const delayMinutes = 40
  const target = new Date(now)
  target.setMinutes(target.getMinutes() - delayMinutes)

  const hour = target.getHours()
  let selected = RELEASE_HOURS.slice().reverse().find((h) => hour >= h)

  if (selected === undefined) {
    target.setDate(target.getDate() - 1)
    selected = 23
  }

  target.setHours(selected, 0, 0, 0)
  return formatYYYYMMDDHH(target)
}

export function getNearestFutureTmef(now = new Date(), tmfcString) {
  const nextHour = new Date(now)
  nextHour.setMinutes(0, 0, 0, 0)
  if (now.getMinutes() > 0 || now.getSeconds() > 0 || now.getMilliseconds() > 0) {
    nextHour.setHours(nextHour.getHours() + 1)
  }

  const tmfcDate = new Date(
    `${tmfcString.slice(0, 4)}-${tmfcString.slice(4, 6)}-${tmfcString.slice(6, 8)}T${tmfcString.slice(8, 10)}:00:00`
  )

  if (nextHour <= tmfcDate) {
    nextHour.setHours(tmfcDate.getHours() + 1)
    nextHour.setDate(tmfcDate.getDate())
  }

  return formatYYYYMMDDHH(nextHour)
}

function parseKmaTextResponse(text, nx = 60, ny = 127) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))

  for (const line of lines) {
    const parts = line.split(/\s+/)
    const xIndex = parts.findIndex((part) => part === String(nx))
    const yIndex = parts.findIndex((part) => part === String(ny))
    const tmpIndex = parts.findIndex((part) => part.toUpperCase() === 'TMP')

    if (tmpIndex >= 0 && xIndex >= 0 && yIndex >= 0) {
      const value = Number(parts[tmpIndex + 1])
      if (!Number.isNaN(value)) {
        return {
          temperature: value,
          raw: text,
          parsedLine: line,
        }
      }
    }
  }

  return null
}

function parseKmaJsonResponse(json, nx = 60, ny = 127) {
  const items = json?.items || json?.data || json?.response?.body?.items || []
  const list = Array.isArray(items) ? items : [items]

  for (const item of list) {
    if (
      Number(item.nx) === nx &&
      Number(item.ny) === ny &&
      String(item.var ?? item.VAR ?? item.element ?? item.category).toUpperCase() === 'TMP'
    ) {
      return {
        temperature: Number(item.value ?? item.tmp ?? item.TMP),
        raw: json,
        parsedItem: item,
      }
    }
  }

  return null
}

export async function fetchKmaShortTermTemperature({ tmfc, tmef, nx = 60, ny = 127, vars = 'TMP' }) {
  const authKey = import.meta.env.VITE_KMA_APIHUB_KEY
  if (!authKey) {
    throw new Error('KMA API key is missing. Please set VITE_KMA_APIHUB_KEY in .env.')
  }

  const response = await axios.get('/api/kma', {
    params: {
      authKey,
      tmfc,
      tmef,
      nx,
      ny,
      vars,
    },
    responseType: 'text',
  })

  const data = response.data

  if (typeof data === 'string') {
    const trimmed = data.trim()
    // If the dev middleware returned a single numeric value (e.g. "26"), accept it.
    if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) {
      return {
        temperature: Number(trimmed),
        raw: data,
      }
    }
    const parsedText = parseKmaTextResponse(data, nx, ny)
    if (parsedText) {
      return parsedText
    }

    try {
      const json = JSON.parse(data)
      const parsedJson = parseKmaJsonResponse(json, nx, ny)
      return parsedJson || { raw: json }
    } catch {
      return { raw: data }
    }
  }

  if (typeof data === 'object') {
    return parseKmaJsonResponse(data, nx, ny) || { raw: data }
  }

  return { raw: data }
}
