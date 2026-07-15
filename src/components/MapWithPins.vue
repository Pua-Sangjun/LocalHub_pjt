<template>
  <div class="map-wrap" :class="{ tall }">
    <select
      v-if="showRegionSelect"
      class="map-controls"
      :value="regionModel"
      @change="onRegionChange"
    >
      <option value="">전체</option>
      <option v-for="r in regionList" :key="r" :value="r">{{ r }}</option>
    </select>
    <div ref="mapEl" class="kakao-map-inner"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { extractRegion } from '@/utils/attractions'

const props = defineProps({
  places: { type: Array, default: null },
  activeId: { type: String, default: '' },
  region: { type: String, default: '' },
  showRegionSelect: { type: Boolean, default: true },
  tall: { type: Boolean, default: false },
})

const emit = defineEmits(['select', 'marker-select', 'update:region'])

const mapEl = ref(null)
const map = ref(null)
const markers = ref([])
const markerMap = ref({})
const infoWindow = ref(null)
const loadedPlaces = ref([])
const regions = ref([])
const selectedRegion = ref('')
let pendingIdleHandler = null

const regionModel = computed({
  get: () => (props.showRegionSelect ? selectedRegion.value : props.region),
  set: (value) => {
    if (props.showRegionSelect) {
      selectedRegion.value = value
    }
    emit('update:region', value)
  },
})

const sourcePlaces = computed(() => props.places ?? loadedPlaces.value)

const regionList = computed(() => {
  if (props.places) {
    return getRegionOptions(props.places)
  }
  return regions.value
})

function getRegionOptions(items) {
  const set = new Set(items.map((item) => item.region || extractRegion(item.addr1)))
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'ko'))
}

function normalizePlace(item) {
  const lat = Number(item.lat ?? item.mapy)
  const lon = Number(item.lon ?? item.mapx)

  return {
    ...item,
    id: String(item.id ?? item.contentid),
    region: item.region || extractRegion(item.addr1),
    lat: Number.isFinite(lat) ? lat : null,
    lon: Number.isFinite(lon) ? lon : null,
  }
}

function clearMarkers() {
  markers.value.forEach((marker) => marker.setMap(null))
  markers.value = []
  markerMap.value = {}
}

function createMarker(place) {
  const position = new window.kakao.maps.LatLng(place.lat, place.lon)
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

function buildInfoContent(place) {
  const image = place.firstimage
    ? `<img src="${place.firstimage}" alt="" class="map-info-image" />`
    : ''

  return `
    <div class="map-info-window">
      ${image}
      <strong>${place.title}</strong>
      <p>${place.addr1 || ''}</p>
    </div>
  `
}

function openInfoWindow(place) {
  if (!map.value || !place?.lat || !place?.lon) return

  const position = new window.kakao.maps.LatLng(place.lat, place.lon)

  if (!infoWindow.value) {
    infoWindow.value = new window.kakao.maps.InfoWindow({ removable: true })
  }

  infoWindow.value.setContent(buildInfoContent(place))
  infoWindow.value.setPosition(position)
  infoWindow.value.open(map.value)
}

const FOCUS_LEVEL = 3
const FOCUS_DURATION = 800

function moveMapToPlace(place, onComplete) {
  if (!map.value || !place?.lat || !place?.lon) return

  const position = new window.kakao.maps.LatLng(place.lat, place.lon)

  if (infoWindow.value) {
    infoWindow.value.close()
  }

  if (pendingIdleHandler) {
    window.kakao.maps.event.removeListener(map.value, 'idle', pendingIdleHandler)
    pendingIdleHandler = null
  }

  pendingIdleHandler = () => {
    window.kakao.maps.event.removeListener(map.value, 'idle', pendingIdleHandler)
    pendingIdleHandler = null
    map.value.relayout()
    onComplete?.()
  }

  window.kakao.maps.event.addListener(map.value, 'idle', pendingIdleHandler)

  if (typeof map.value.jump === 'function') {
    map.value.jump(position, FOCUS_LEVEL, {
      animate: { duration: FOCUS_DURATION },
    })
    return
  }

  map.value.panTo(position, {
    animate: { duration: FOCUS_DURATION },
  })
  map.value.setLevel(FOCUS_LEVEL, { animate: true })
}

async function loadPlaces() {
  if (props.places) return

  try {
    const res = await fetch('/data/서울_관광지.json')
    const json = await res.json()
    loadedPlaces.value = (json.items || [])
      .map(normalizePlace)
      .filter((place) => place.id)

    const set = new Set()
    loadedPlaces.value.forEach((place) => set.add(place.region))
    regions.value = Array.from(set).sort((a, b) => a.localeCompare(b, 'ko'))
  } catch (error) {
    console.error('failed to load places', error)
  }
}

function renderMarkers({ preserveView = false } = {}) {
  if (!map.value) return

  clearMarkers()
  if (infoWindow.value) infoWindow.value.close()

  const activeRegion = regionModel.value
  const isExternallyFiltered = props.places != null
  const uniquePlaces = []
  const seenIds = new Set()

  sourcePlaces.value.forEach((item) => {
    const place = normalizePlace(item)
    if (!place.id || seenIds.has(place.id)) return
    seenIds.add(place.id)
    uniquePlaces.push(place)
  })

  const bounds = new window.kakao.maps.LatLngBounds()
  let hasBounds = false

  uniquePlaces.forEach((place) => {
    if (!Number.isFinite(place.lat) || !Number.isFinite(place.lon)) return

    const region = activeRegion || place.region
    if (!isExternallyFiltered && activeRegion && place.region !== activeRegion) return
    if (!isValidCoords(place.lat, place.lon, region)) return

    const marker = createMarker(place)
    marker.setMap(map.value)
    window.kakao.maps.event.addListener(marker, 'click', () => {
      emit('marker-select', place.id)
    })

    markers.value.push(marker)
    markerMap.value[place.id] = marker
    bounds.extend(marker.getPosition())
    hasBounds = true
  })

  if (!preserveView) {
    if (hasBounds) {
      map.value.setBounds(bounds)
    } else {
      map.value.setCenter(new window.kakao.maps.LatLng(37.5665, 126.978))
      map.value.setLevel(4)
    }
  }
}

function focusPlace(place, { showInfo = false } = {}) {
  const normalized = normalizePlace(place)
  if (!normalized.lat || !normalized.lon) return

  moveMapToPlace(normalized, () => {
    if (showInfo) openInfoWindow(normalized)
  })
}

function focusById(id, options = {}) {
  const place = sourcePlaces.value
    .map(normalizePlace)
    .find((item) => item.id === id)

  if (place) focusPlace(place, options)
}

function onRegionChange(event) {
  regionModel.value = event.target.value
}

watch(
  () => [sourcePlaces.value, regionModel.value],
  () => {
    renderMarkers({ preserveView: Boolean(props.activeId) })
  },
  { deep: true },
)

onMounted(async () => {
  if (!window.kakao?.maps) {
    console.error('Kakao Maps SDK not available')
    return
  }

  map.value = new window.kakao.maps.Map(mapEl.value, {
    center: new window.kakao.maps.LatLng(37.5665, 126.978),
    level: 4,
  })

  await loadPlaces()
  renderMarkers()

  if (props.activeId) {
    focusById(props.activeId)
  }
})

defineExpose({ focusPlace, focusById })
</script>

<style scoped>
.map-wrap {
  position: relative;
  height: 460px;
}

.map-wrap.tall {
  height: 640px;
  min-height: 640px;
}

.map-controls {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 50;
  background: rgba(255, 255, 255, 0.9);
  padding: 6px 8px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  font-size: 14px;
}

.kakao-map-inner {
  width: 100%;
  height: 100%;
  border-radius: 12px;
}

@media (max-width: 900px) {
  .map-wrap {
    height: 380px;
  }

  .map-wrap.tall {
    height: 420px;
    min-height: 420px;
  }
}

@media (max-width: 640px) {
  .map-wrap {
    height: 300px;
  }

  .map-wrap.tall {
    height: 320px;
    min-height: 320px;
  }

  .map-controls {
    top: 8px;
    left: 8px;
    max-width: calc(100% - 16px);
    font-size: 12px;
  }
}
</style>

<style>
.map-info-window {
  width: 220px;
  padding: 4px 2px 2px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', sans-serif;
}

.map-info-window strong {
  display: block;
  margin-bottom: 6px;
  color: #0f172a;
  font-size: 0.95rem;
}

.map-info-window p {
  margin: 0;
  color: #64748b;
  font-size: 0.78rem;
  line-height: 1.5;
}

.map-info-image {
  width: 100%;
  height: 110px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 8px;
}
</style>
