const CATEGORY_FILTERS = [
  { id: 'all', label: '전체' },
  { id: 'landmark', label: '랜드마크' },
  { id: 'palace', label: '고궁' },
  { id: 'history', label: '역사적 장소' },
  { id: 'nature', label: '자연&관광' },
  { id: 'culture', label: '문화·체험' },
]

const SORT_OPTIONS = [
  { id: 'recommended', label: '추천순' },
  { id: 'updated', label: '업데이트순' },
  { id: 'name', label: '가나다순' },
]

export function extractRegion(addr) {
  if (!addr) return '기타'
  const normalized = addr.replace(/\s+/g, ' ').trim()
  const match = normalized.match(/서울(?:특별시)?\s*([가-힣]{2,}구)/)
  return match ? match[1].replace(/\s+/g, '').trim() : '기타'
}

export function getAttractionCategory(item) {
  const title = item.title || ''
  const system1 = item.lclsSystm1 || ''
  const system2 = item.lclsSystm2 || ''

  if (title.includes('궁')) return 'palace'
  if (system1 === 'HS') return 'history'
  if (system1 === 'NA') return 'nature'
  if (system1 === 'EX') return 'culture'
  if (system1 === 'VE') {
    if (['VE01', 'VE02'].includes(system2)) return 'landmark'
    return 'nature'
  }
  return 'landmark'
}

export function normalizeAttraction(item) {
  const lat = Number(item.mapy)
  const lon = Number(item.mapx)

  return {
    ...item,
    id: String(item.contentid),
    region: extractRegion(item.addr1),
    category: getAttractionCategory(item),
    lat: Number.isFinite(lat) ? lat : null,
    lon: Number.isFinite(lon) ? lon : null,
    hasImage: Boolean(item.firstimage),
  }
}

export async function loadAttractions() {
  const response = await fetch('/data/서울_관광지.json')
  if (!response.ok) {
    throw new Error('관광지 데이터를 불러오지 못했습니다.')
  }

  const json = await response.json()
  const seen = new Set()

  return (json.items || [])
    .map(normalizeAttraction)
    .filter((item) => {
      if (!item.id || seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })
}

export function filterAttractions(items, { category, region, keyword }) {
  const query = keyword.trim().toLowerCase()

  return items.filter((item) => {
    if (category !== 'all' && item.category !== category) return false
    if (region && item.region !== region) return false
    if (!query) return true

    return (
      item.title?.toLowerCase().includes(query) ||
      item.addr1?.toLowerCase().includes(query)
    )
  })
}

export function sortAttractions(items, sortBy) {
  const list = [...items]

  if (sortBy === 'name') {
    return list.sort((a, b) => a.title.localeCompare(b.title, 'ko'))
  }

  if (sortBy === 'updated') {
    return list.sort((a, b) => Number(b.modifiedtime || 0) - Number(a.modifiedtime || 0))
  }

  return list.sort((a, b) => {
    if (a.hasImage !== b.hasImage) return a.hasImage ? -1 : 1
    return Number(b.modifiedtime || 0) - Number(a.modifiedtime || 0)
  })
}

export function paginateItems(items, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const currentPage = Math.min(Math.max(page, 1), totalPages)
  const start = (currentPage - 1) * pageSize

  return {
    items: items.slice(start, start + pageSize),
    currentPage,
    totalPages,
    totalCount: items.length,
  }
}

export function findPageForItem(items, itemId, pageSize) {
  const index = items.findIndex((item) => item.id === itemId)
  if (index === -1) return null
  return Math.floor(index / pageSize) + 1
}

export function getRegionOptions(items) {
  const regions = new Set(items.map((item) => item.region))
  return Array.from(regions).sort((a, b) => a.localeCompare(b, 'ko'))
}

export async function loadAttractionById(id) {
  const items = await loadAttractions()
  return items.find((item) => item.id === String(id)) || null
}

export { CATEGORY_FILTERS, SORT_OPTIONS }
