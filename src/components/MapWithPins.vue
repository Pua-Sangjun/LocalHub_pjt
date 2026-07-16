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
    <div ref="mapEl" class="kakao-map-inner" :class="{ hidden: mapError }"></div>
    <div v-if="mapError" class="map-error">
      <p>{{ mapError }}</p>
      <small>Netlify 환경변수에 VITE_KAKAO_JAVASCRIPT_KEY를 등록하고, 카카오 개발자 콘솔에 배포 도메인을 추가한 뒤 재배포해 주세요.</small>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { extractRegion } from '@/utils/attractions'
import { loadKakaoMapsSdk } from '@/utils/kakaoMaps'

const props = defineProps({
  places: { type: Array, default: null },
  activeId: { type: String, default: '' },
  region: { type: String, default: '' },
  showRegionSelect: { type: Boolean, default: true },
  tall: { type: Boolean, default: false },
  fitOnUpdate: { type: Boolean, default: false },
})

const emit = defineEmits(['select', 'marker-select', 'update:region'])

const mapEl = ref(null)
const mapError = ref('')
const map = ref(null)
const markerEntries = ref([])
const markerMap = ref({})
const infoWindow = ref(null)
const loadedPlaces = ref([])
const regions = ref([])
const selectedRegion = ref('')
let pendingIdleHandler = null
let resizeObserver = null
let lastFittedKey = ''
let focusSequence = 0

function clearPendingIdle() {
  if (pendingIdleHandler && map.value) {
    window.kakao.maps.event.removeListener(map.value, 'idle', pendingIdleHandler)
    pendingIdleHandler = null
  }
}

function getPlacesKey() {
  return sourcePlaces.value
    .map((item) => normalizePlace(item).id)
    .filter(Boolean)
    .join(',')
}

function ensureMapInteraction() {
  if (!map.value) return
  map.value.setDraggable(true)
  map.value.setZoomable(true)
}

function relayoutMap() {
  if (!map.value) return
  ensureMapInteraction()
  map.value.relayout()
}

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

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function truncateLabel(title, maxLength = 9) {
  const text = String(title || '').trim()
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}…`
}

function clearMarkers() {
  markerEntries.value.forEach((entry) => entry.overlay.setMap(null))
  markerEntries.value = []
  markerMap.value = {}
}

function bindBadgeEvents(element, placeId) {
  element.addEventListener('click', (event) => {
    event.stopPropagation()
    emit('marker-select', placeId)
  })
}

function createBadgeMarker(place, { isActive = false } = {}) {
  const position = new window.kakao.maps.LatLng(place.lat, place.lon)
  const element = document.createElement('button')

  element.type = 'button'
  element.className = `lh-map-badge${isActive ? ' is-active' : ''}`
  element.title = place.title
  element.innerHTML = `
    <span class="lh-map-badge__label">${escapeHtml(truncateLabel(place.title))}</span>
    <span class="lh-map-badge__point" aria-hidden="true"></span>
  `

  bindBadgeEvents(element, place.id)

  const overlay = new window.kakao.maps.CustomOverlay({
    position,
    content: element,
    xAnchor: 0.5,
    yAnchor: 1,
    zIndex: isActive ? 12 : 2,
  })

  return { overlay, element, placeId: place.id, position }
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

  const sequence = ++focusSequence
  const position = new window.kakao.maps.LatLng(place.lat, place.lon)

  if (infoWindow.value) {
    infoWindow.value.close()
  }

  clearPendingIdle()

  map.value.setCenter(map.value.getCenter())

  pendingIdleHandler = () => {
    if (sequence !== focusSequence) return
    clearPendingIdle()
    map.value.relayout()
    if (sequence === focusSequence) {
      onComplete?.()
    }
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

function updateMarkerHighlight(activeId = props.activeId) {
  Object.entries(markerMap.value).forEach(([placeId, entry]) => {
    const isActive = placeId === activeId
    entry.element.classList.toggle('is-active', isActive)
    entry.overlay.setZIndex(isActive ? 12 : 2)
  })
}

function renderMarkers({ preserveView = false, fitBounds = !preserveView } = {}) {
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

    const entry = createBadgeMarker(place, { isActive: place.id === props.activeId })
    entry.overlay.setMap(map.value)

    markerEntries.value.push(entry)
    markerMap.value[place.id] = entry
    bounds.extend(entry.position)
    hasBounds = true
  })

  if (fitBounds) {
    if (hasBounds) {
      map.value.setBounds(bounds, 48, 48, 48, 48)
      lastFittedKey = getPlacesKey()
    } else {
      map.value.setCenter(new window.kakao.maps.LatLng(37.5665, 126.978))
      map.value.setLevel(4)
      lastFittedKey = ''
    }
  }

  updateMarkerHighlight()
  ensureMapInteraction()
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
  () => [getPlacesKey(), regionModel.value],
  () => {
    const shouldFit = props.fitOnUpdate && getPlacesKey() !== lastFittedKey
    renderMarkers({ fitBounds: shouldFit || !lastFittedKey })
  },
)

watch(
  () => props.activeId,
  (id) => {
    updateMarkerHighlight(id)
    if (id) {
      focusById(id)
    }
  },
)

onMounted(async () => {
  try {
    await loadKakaoMapsSdk()

    map.value = new window.kakao.maps.Map(mapEl.value, {
      center: new window.kakao.maps.LatLng(37.5665, 126.978),
      level: 4,
      draggable: true,
      scrollwheel: true,
    })

    if (mapEl.value && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        relayoutMap()
      })
      resizeObserver.observe(mapEl.value)
    }

    await loadPlaces()
    renderMarkers({ fitBounds: true })

    if (props.activeId) {
      focusById(props.activeId)
    }
  } catch (error) {
    mapError.value = error?.message || '지도를 불러오지 못했습니다.'
    console.error('Kakao Maps init failed:', error)
  }
})

onUnmounted(() => {
  clearPendingIdle()
  resizeObserver?.disconnect()
  resizeObserver = null
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

.kakao-map-inner.hidden {
  visibility: hidden;
}

.map-error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  text-align: center;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  color: #475569;
}

.map-error p {
  margin: 0;
  font-weight: 700;
  color: #0f172a;
}

.map-error small {
  max-width: 320px;
  line-height: 1.5;
  color: #64748b;
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

.lh-map-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  pointer-events: auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', sans-serif;
  transform: translateY(-2px);
  transition: transform 0.15s ease;
}

.lh-map-badge__label {
  display: block;
  max-width: 124px;
  padding: 6px 12px;
  border-radius: 999px;
  background: #fff;
  border: 1.5px solid #8fd3ff;
  color: #1a5fa0;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.14);
}

.lh-map-badge__point {
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #3b82f6;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.22);
}

.lh-map-badge.is-active {
  transform: translateY(-4px) scale(1.04);
}

.lh-map-badge.is-active .lh-map-badge__label {
  background: #0f172a;
  border-color: #0f172a;
  color: #fff;
}

.lh-map-badge.is-active .lh-map-badge__point {
  width: 12px;
  height: 12px;
  background: #0f172a;
}
</style>
