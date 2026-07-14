<template>
  <section class="page-section">
    <div class="page-header">
      <div>
        <h1>지도 시각화</h1>
        <p>서울 지역 공공데이터 관광 정보를 지도에서 검색하고, 마커 팝업으로 자세히 확인하세요.</p>
      </div>
      <div class="field-row" style="align-items:center;">
        <div class="input-group" style="flex:1;">
          <label for="category">카테고리</label>
          <select id="category" v-model="selectedType">
            <option value="전체">전체</option>
            <option v-for="option in categoryOptions" :key="option" :value="option">{{ option }}</option>
          </select>
        </div>
        <button class="button" type="button" @click="resetMap">초기화</button>
      </div>
    </div>

    <div class="panel" style="display:grid; gap:1.25rem;">
      <div ref="mapWrapper" class="map-container"></div>
      <div class="map-sidebar">
        <div class="field-row" style="align-items:center; gap:0.75rem;">
          <span class="badge">전체 항목: {{ filteredItems.length }}</span>
          <span class="badge">현재 카테고리: {{ selectedType }}</span>
        </div>
        <div class="list-group">
          <article v-for="item in filteredItems.slice(0, 8)" :key="item.contentid" class="map-item">
            <h3>{{ item.title }}</h3>
            <small>{{ item.dataType }} · {{ item.addr1 || '주소 없음' }}</small>
          </article>
        </div>
      </div>
    </div>
  </section>
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
