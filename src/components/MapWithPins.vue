<template>
  <div class="map-wrap">
    <select class="map-controls" v-model="selectedRegion">
        <option value="">전체</option>
        <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
    </select>
    <div ref="mapEl" class="kakao-map-inner"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const mapEl = ref(null)
const map = ref(null)
const markers = ref([])
const places = ref([])
const regions = ref([])
const selectedRegion = ref('')

function extractRegion(addr) {
  if (!addr) return '기타'
  const normalized = addr.replace(/\s+/g, ' ').trim()
  const m = normalized.match(/서울(?:특별시)?\s*([가-힣]{2,}구)/)
  return m ? m[1].replace(/\s+/g, '').trim() : '기타'
}

function clearMarkers() {
  markers.value.forEach((mk) => {
    mk.setMap(null)
  })
  markers.value = []
}

function createMarker(place) {
  const position = new window.kakao.maps.LatLng(Number(place.mapy), Number(place.mapx))
  return new window.kakao.maps.Marker({ position, title: place.title })
}

function getRegionBounds(region) {
  return {
    종로구: { latMin: 37.55, latMax: 37.60, lonMin: 126.96, lonMax: 127.01 },
    중구: { latMin: 37.55, latMax: 37.57, lonMin: 126.97, lonMax: 127.01 },
    용산구: { latMin: 37.52, latMax: 37.55, lonMin: 126.95, lonMax: 127.01 },
    성동구: { latMin: 37.54, latMax: 37.58, lonMin: 127.02, lonMax: 127.06 },
    광진구: { latMin: 37.52, latMax: 37.56, lonMin: 127.05, lonMax: 127.12 },
    동대문구: { latMin: 37.57, latMax: 37.61, lonMin: 127.01, lonMax: 127.08 },
    중랑구: { latMin: 37.58, latMax: 37.63, lonMin: 127.05, lonMax: 127.12 },
    성북구: { latMin: 37.56, latMax: 37.63, lonMin: 127.00, lonMax: 127.08 },
    강북구: { latMin: 37.60, latMax: 37.70, lonMin: 127.00, lonMax: 127.06 },
    도봉구: { latMin: 37.64, latMax: 37.72, lonMin: 127.01, lonMax: 127.08 },
    노원구: { latMin: 37.60, latMax: 37.70, lonMin: 127.01, lonMax: 127.12 },
    은평구: { latMin: 37.56, latMax: 37.66, lonMin: 126.88, lonMax: 127.00 },
    서대문구: { latMin: 37.55, latMax: 37.58, lonMin: 126.92, lonMax: 126.98 },
    마포구: { latMin: 37.53, latMax: 37.58, lonMin: 126.90, lonMax: 126.98 },
    양천구: { latMin: 37.49, latMax: 37.55, lonMin: 126.81, lonMax: 126.90 },
    강서구: { latMin: 37.48, latMax: 37.57, lonMin: 126.73, lonMax: 126.86 },
    구로구: { latMin: 37.46, latMax: 37.50, lonMin: 126.82, lonMax: 126.90 },
    금천구: { latMin: 37.45, latMax: 37.49, lonMin: 126.88, lonMax: 126.93 },
    영등포구: { latMin: 37.50, latMax: 37.54, lonMin: 126.88, lonMax: 126.95 },
    동작구: { latMin: 37.48, latMax: 37.52, lonMin: 126.92, lonMax: 126.99 },
    관악구: { latMin: 37.43, latMax: 37.49, lonMin: 126.92, lonMax: 126.99 },
    서초구: { latMin: 37.47, latMax: 37.52, lonMin: 127.00, lonMax: 127.08 },
    강남구: { latMin: 37.43, latMax: 37.55, lonMin: 127.00, lonMax: 127.16 },
    송파구: { latMin: 37.45, latMax: 37.56, lonMin: 127.05, lonMax: 127.20 },
    강동구: { latMin: 37.52, latMax: 37.60, lonMin: 127.10, lonMax: 127.20 },
  }[region] || null
}

function isWithinSeoul(lat, lon) {
  return lat >= 33 && lat <= 38 && lon >= 125 && lon <= 129
}

function isValidCoords(lat, lon, region) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return false
  if (!isWithinSeoul(lat, lon)) return false

  const bounds = getRegionBounds(region)
  if (!bounds) return true

  const margin = 0.02
  return (
    lat >= bounds.latMin - margin &&
    lat <= bounds.latMax + margin &&
    lon >= bounds.lonMin - margin &&
    lon <= bounds.lonMax + margin
  )
}

async function loadPlaces() {
  try {
    const res = await fetch('/data/서울_관광지.json')
    const json = await res.json()
    places.value = (json.items || [])
      .map((it) => {
        const region = extractRegion(it.addr1)
        const lat = Number(it.mapy)
        const lon = Number(it.mapx)
        return {
          ...it,
          region,
          lat,
          lon,
        }
      })
      .filter((p) => p.contentid)

    const set = new Set()
    places.value.forEach((p) => set.add(p.region))
    regions.value = Array.from(set).sort()

    console.log('[MapWithPins] loaded places', places.value.length, 'regions', regions.value.length)
  } catch (e) {
    console.error('failed to load places', e)
  }
}

function renderMarkers() {
  clearMarkers()

  const filtered = selectedRegion.value
    ? places.value.filter((p) => p.region === selectedRegion.value)
    : places.value

  const uniqueFilter = []
  const seenIds = new Set()
  filtered.forEach((p) => {
    if (!p.contentid) return
    if (seenIds.has(p.contentid)) return
    seenIds.add(p.contentid)
    uniqueFilter.push(p)
  })

  console.log(
    '[MapWithPins] renderMarkers selectedRegion=',
    selectedRegion.value,
    'filteredCount=',
    filtered.length,
    'uniqueCount=',
    uniqueFilter.length,
  )

  const bounds = new window.kakao.maps.LatLngBounds()
  const validPlaces = uniqueFilter.filter((p) => {
    if (!Number.isFinite(p.lat) || !Number.isFinite(p.lon)) {
      console.warn('[MapWithPins] skipped invalid coord', {
        title: p.title,
        addr1: p.addr1,
        region: p.region,
        lat: p.lat,
        lon: p.lon,
      })
      return false
    }
    const region = selectedRegion.value || p.region
    if (!isValidCoords(p.lat, p.lon, region)) {
      console.warn('[MapWithPins] skipped out-of-region coord', {
        title: p.title,
        addr1: p.addr1,
        region,
        lat: p.lat,
        lon: p.lon,
      })
      return false
    }
    return true
  })

  validPlaces.forEach((p) => {
    const mk = createMarker(p)
    mk.setMap(map.value)
    markers.value.push(mk)
    bounds.extend(mk.getPosition())
  })

  if (markers.value.length) {
    map.value.setBounds(bounds)
  } else {
    map.value.setCenter(new window.kakao.maps.LatLng(37.5665, 126.9780))
    map.value.setLevel(4)
  }

  const visibleTitles = markers.value.map((m) => m.getTitle())
  if (visibleTitles.includes('백범광장(백범 김구선생 동상)') || visibleTitles.includes('신사공원')) {
    console.warn('[MapWithPins] currently visible markers include special items', {
      selectedRegion: selectedRegion.value,
      visibleTitles,
    })
  }
}

onMounted(async () => {
  if (!window.kakao || !window.kakao.maps) {
    console.error('Kakao Maps SDK not available')
    return
  }
  map.value = new window.kakao.maps.Map(mapEl.value, {
    center: new window.kakao.maps.LatLng(37.5665, 126.9780),
    level: 4,
  })

  await loadPlaces()
  renderMarkers()
})

watch(selectedRegion, () => {
  renderMarkers()
})
</script>

<style scoped>
.map-wrap { position: relative; height: 460px; }
.map-controls { position: absolute; top: 12px; left: 12px; z-index: 50; background: rgba(255,255,255,0.9); padding:6px 8px; border-radius:6px; box-shadow:0 2px 8px rgba(0,0,0,0.08); font-size:14px }
.kakao-map-inner { width: 100%; height: 100%; border-radius:12px; }
</style>
