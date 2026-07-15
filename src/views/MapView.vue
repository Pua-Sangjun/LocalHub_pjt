<template>
  <div class="map-page">
    <div class="map-shell">
      <header class="map-hero">
        <p class="breadcrumb">
          <RouterLink to="/">홈</RouterLink>
          <span aria-hidden="true">/</span>
          <span>지도 시각화</span>
        </p>
        <h1>지도 시각화</h1>
        <p class="map-description">
          서울 지역 공공데이터 관광 정보를 지도에서 검색하고, 마커 팝업으로 자세히 확인하세요.
        </p>
      </header>

      <section class="map-toolbar card">
        <label class="toolbar-field" for="category">
          <span>카테고리</span>
          <select id="category" v-model="selectedType">
            <option value="전체">전체</option>
            <option v-for="option in categoryOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </label>
        <button class="secondary-btn" type="button" @click="resetMap">초기화</button>
      </section>

      <section class="map-content card">
        <div ref="mapWrapper" class="map-container"></div>

        <aside class="map-sidebar">
          <div class="badge-row">
            <span class="badge">전체 항목: {{ filteredItems.length }}</span>
            <span class="badge">현재 카테고리: {{ selectedType }}</span>
          </div>
          <div class="list-group">
            <article v-for="item in filteredItems.slice(0, 8)" :key="item.contentid" class="map-item">
              <h3>{{ item.title }}</h3>
              <small>{{ item.dataType }} · {{ item.addr1 || '주소 없음' }}</small>
            </article>
          </div>
        </aside>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { loadTourData, getTypeOptions } from '@/utils/dataService'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const mapWrapper = ref(null)
const map = ref(null)
const markerLayer = ref(null)
const selectedType = ref('전체')
const loadedItems = ref([])
const categoryOptions = getTypeOptions()

const filteredItems = computed(() => {
  if (selectedType.value === '전체') return loadedItems.value
  return loadedItems.value.filter((item) => item.dataType === selectedType.value)
})

const defaultCenter = [37.5665, 126.978]

function createIcon() {
  return L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  })
}

function initMap() {
  if (!mapWrapper.value || map.value) return
  map.value = L.map(mapWrapper.value, {
    center: defaultCenter,
    zoom: 11,
    zoomControl: true,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map.value)

  markerLayer.value = L.layerGroup().addTo(map.value)
  updateMarkers()
}

function updateMarkers() {
  if (!markerLayer.value) return
  markerLayer.value.clearLayers()

  filteredItems.value.forEach((item) => {
    const longitude = parseFloat(item.mapx)
    const latitude = parseFloat(item.mapy)
    if (Number.isNaN(longitude) || Number.isNaN(latitude)) return

    const marker = L.marker([latitude, longitude], { icon: createIcon() })
    marker.bindPopup(`
      <strong>${item.title}</strong><br />
      ${item.dataType}<br />
      ${item.addr1 || '주소 없음'}
    `)
    marker.addTo(markerLayer.value)
  })
}

function resetMap() {
  selectedType.value = '전체'
  if (map.value) {
    map.value.setView(defaultCenter, 11)
  }
}

watch(filteredItems, () => {
  updateMarkers()
})

onMounted(async () => {
  loadedItems.value = await loadTourData()
  initMap()
})
</script>

<style scoped>
.map-page {
  width: 100%;
  max-width: 100%;
  min-height: calc(100vh - 80px);
  overflow-x: hidden;
  background: #eaedf2;
  padding: 28px var(--page-inline-padding, 24px) 56px;
}

.map-shell {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 16px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 12px;
  color: #64748b;
  font-size: 0.9rem;
}

.breadcrumb a {
  color: inherit;
  text-decoration: none;
}

.breadcrumb a:hover {
  color: #1a5fa0;
}

.map-hero h1 {
  margin: 0 0 8px;
  font-size: clamp(1.7rem, 3vw, 2.2rem);
  color: #0f172a;
}

.map-description {
  margin: 0;
  color: #475569;
  line-height: 1.6;
  max-width: 640px;
}

.card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
}

.map-toolbar {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  padding: 18px 20px;
}

.toolbar-field {
  display: grid;
  gap: 6px;
  flex: 1;
  min-width: 200px;
}

.toolbar-field span {
  font-size: 0.78rem;
  font-weight: 700;
  color: #64748b;
}

.toolbar-field select {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 11px 14px;
  background: #f8fafc;
  color: #0f172a;
}

.map-content {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.8fr);
  gap: 0;
  overflow: hidden;
}

.map-container {
  min-height: 480px;
  height: 100%;
  width: 100%;
}

.map-sidebar {
  border-left: 1px solid #e2e8f0;
  padding: 18px;
  display: grid;
  gap: 14px;
  align-content: start;
  max-height: 560px;
  overflow-y: auto;
}

.badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.badge {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 6px 10px;
  border-radius: 999px;
  background: #e8f6ff;
  color: #1a5fa0;
}

.list-group {
  display: grid;
  gap: 10px;
}

.map-item {
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}

.map-item h3 {
  margin: 0 0 6px;
  font-size: 0.92rem;
  color: #0f172a;
  word-break: break-word;
}

.map-item small {
  color: #64748b;
  line-height: 1.5;
}

.secondary-btn {
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 11px 18px;
  font-weight: 700;
  background: #fff;
  color: #334155;
  cursor: pointer;
  white-space: nowrap;
}

@media (max-width: 960px) {
  .map-content {
    grid-template-columns: 1fr;
  }

  .map-container {
    min-height: 360px;
  }

  .map-sidebar {
    border-left: none;
    border-top: 1px solid #e2e8f0;
    max-height: none;
  }
}

@media (max-width: 640px) {
  .map-page {
    padding-bottom: 40px;
  }

  .map-toolbar {
    align-items: stretch;
  }

  .toolbar-field {
    min-width: 0;
    width: 100%;
  }

  .secondary-btn {
    width: 100%;
  }

  .map-container {
    min-height: 300px;
  }
}
</style>
