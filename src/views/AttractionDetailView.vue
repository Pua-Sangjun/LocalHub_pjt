<template>
  <div class="attraction-detail-page">
    <div v-if="loading" class="state-panel">관광지 정보를 불러오는 중...</div>

    <div v-else-if="!place" class="state-panel">
      <p>관광지를 찾을 수 없습니다.</p>
      <RouterLink to="/attractions" class="secondary-btn">목록으로</RouterLink>
    </div>

    <div v-else class="detail-shell">
      <header class="detail-hero">
        <p class="breadcrumb">
          <RouterLink to="/">홈</RouterLink>
          <span aria-hidden="true">/</span>
          <RouterLink to="/attractions">관광지 소개</RouterLink>
          <span aria-hidden="true">/</span>
          <span>{{ place.title }}</span>
        </p>

        <div class="detail-hero-row">
          <div class="detail-hero-copy">
            <span class="region-badge">{{ place.region }}</span>
            <h1>{{ place.title }}</h1>
            <p class="address">{{ place.addr1 || '주소 정보 없음' }}</p>
          </div>
          <ShareButton mode="attraction" :place="place" />
        </div>
      </header>

      <section class="detail-card">
        <div v-if="place.firstimage" class="hero-image-wrap">
          <img :src="place.firstimage" :alt="place.title" />
        </div>

        <div class="detail-meta-grid">
          <div v-if="place.tel" class="meta-item">
            <span class="meta-label">연락처</span>
            <span>{{ place.tel }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">지역</span>
            <span>{{ place.region }}</span>
          </div>
        </div>

        <div v-if="place.lat && place.lon" class="map-wrap">
          <MapWithPins
            :places="[place]"
            :active-id="place.id"
            :show-region-select="false"
            :fit-on-update="true"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import MapWithPins from '@/components/MapWithPins.vue'
import ShareButton from '@/components/ShareButton.vue'
import { loadAttractionById } from '@/utils/attractions'
import { buildAttractionSharePayload } from '@/utils/share'
import { setPageMeta, resetPageMeta } from '@/utils/pageMeta'

const route = useRoute()
const place = ref(null)
const loading = ref(true)

function applyMeta(target) {
  if (!target) return
  const payload = buildAttractionSharePayload(target)
  setPageMeta({
    title: payload.title,
    description: payload.description,
    image: payload.imageUrl,
    url: payload.url,
  })
}

async function loadPlace(id) {
  loading.value = true
  try {
    place.value = await loadAttractionById(id)
    applyMeta(place.value)
  } finally {
    loading.value = false
  }
}

onMounted(() => loadPlace(route.params.id))

watch(
  () => route.params.id,
  (id) => {
    if (id) loadPlace(id)
  }
)

onUnmounted(resetPageMeta)
</script>

<style scoped>
.attraction-detail-page {
  min-height: calc(100vh - 80px);
  background: #eaedf2;
  padding: 28px var(--page-inline-padding, 24px) 56px;
}

.detail-shell {
  max-width: 960px;
  margin: 0 auto;
  display: grid;
  gap: 16px;
}

.breadcrumb {
  display: flex;
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

.detail-hero-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}

.detail-hero h1 {
  margin: 8px 0;
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  color: #0f172a;
}

.region-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 5px 10px;
  border-radius: 999px;
  background: #e8f6ff;
  color: #1a5fa0;
}

.address {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}

.detail-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
  overflow: hidden;
}

.hero-image-wrap img {
  display: block;
  width: 100%;
  max-height: 420px;
  object-fit: cover;
}

.detail-meta-grid {
  display: grid;
  gap: 12px;
  padding: 20px 24px;
}

.meta-item {
  display: grid;
  gap: 4px;
}

.meta-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #64748b;
}

.map-wrap {
  min-height: 320px;
  border-top: 1px solid #e2e8f0;
}

.state-panel {
  max-width: 960px;
  margin: 48px auto;
  padding: 32px;
  text-align: center;
  background: #fff;
  border-radius: 20px;
  color: #64748b;
}

.secondary-btn {
  display: inline-block;
  margin-top: 12px;
  padding: 11px 18px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #334155;
  text-decoration: none;
  font-weight: 700;
}
</style>
