<template>
  <div class="home-page">
    <HomeHero @scrollToSection="handleScrollTo" />

    <main class="page-content">
      <section id="recommend" class="section">
        <div class="section-header">
          <h2 class="section-title">추천 관광지</h2>
          <p class="section-sub">서울의 인기 관광지 목록입니다. (샘플)</p>
        </div>

        <div v-if="loadingPlaces" class="loading">로딩 중…</div>
        <div v-else-if="places.length === 0" class="muted">관광지 데이터가 없습니다.</div>
        <div v-else class="card-grid">
          <article v-for="place in topPlaces" :key="place.contentid" class="place-card">
            <img class="thumb" :src="place.firstimage || placeholder" :alt="place.title" />
            <div class="card-body">
              <h3 class="card-title">{{ place.title }}</h3>
              <p class="card-meta">{{ place.addr1 || '주소 정보 없음' }}</p>
              <div class="card-actions">
                <router-link to="/map" class="btn primary">지도에서 보기</router-link>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section id="festival" class="section">
        <div class="section-header">
          <h2 class="section-title">다가오는 축제</h2>
          <p class="section-sub">행사/축제 샘플 목록</p>
        </div>

        <div v-if="loadingFestivals" class="loading">로딩 중…</div>
        <div v-else-if="festivals.length === 0" class="muted">축제 데이터가 없습니다.</div>
        <div v-else class="card-grid festival-grid">
          <article v-for="fest in topFestivals" :key="fest.contentid" class="place-card">
            <img class="thumb" :src="fest.firstimage || placeholder" :alt="fest.title" />
            <div class="card-body">
              <h3 class="card-title">{{ fest.title }}</h3>
              <p class="card-meta">{{ fest.addr1 || '주소 정보 없음' }}</p>
              <div class="card-actions">
                <router-link to="/map" class="btn primary">지도에서 보기</router-link>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section id="chatbot" class="section chatbot-placeholder">
        <h2 class="section-title">AI 챗봇</h2>
        <p class="muted">오른쪽 하단 챗봇을 통해 지역 추천과 안내를 받으세요.</p>
      </section>
    </main>
  </div>
</template>

<script setup>
/*
  HomeView: public/data 내 JSON을 fetch하여 간단한 카드 리스트로 표시합니다.
  - 관광지: /data/서울_관광지.json
  - 축제:   /data/서울_축제공연행사.json
  설계: 향후 각 섹션을 컴포넌트로 분리하기 쉽게 단순 구조 유지.
*/

import { ref, onMounted, computed } from 'vue'
import HomeHero from '@/components/HomeHero.vue'
import placeholderImg from '@/assets/hero.png' // 로컬 플레이스홀더

const placeholder = placeholderImg

const places = ref([])
const festivals = ref([])
const loadingPlaces = ref(true)
const loadingFestivals = ref(true)
const error = ref(null)

// 상위 몇 개만 표시 (MVP)
const TOP_PLACES = 6
const TOP_FESTS = 4

const topPlaces = computed(() => places.value.slice(0, TOP_PLACES))
const topFestivals = computed(() => festivals.value.slice(0, TOP_FESTS))

// 데이터 로드
async function fetchJson(path) {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`${path} 로드 실패: ${res.status}`)
  return res.json()
}

onMounted(async () => {
  // 관광지
  try {
    loadingPlaces.value = true
    const data = await fetchJson('/data/서울_관광지.json')
    // API 스키마: { items: [ ... ] } 형태
    places.value = Array.isArray(data.items) ? data.items : []
  } catch (e) {
    error.value = e.message || String(e)
    places.value = []
  } finally {
    loadingPlaces.value = false
  }

  // 축제
  try {
    loadingFestivals.value = true
    const data = await fetchJson('/data/서울_축제공연행사.json')
    festivals.value = Array.isArray(data.items) ? data.items : []
  } catch (e) {
    error.value = e.message || String(e)
    festivals.value = []
  } finally {
    loadingFestivals.value = false
  }
})

// Hero의 Scroll Down 이벤트 처리 (HomeHero에서 emit)
function handleScrollTo(targetId) {
  const el = document.querySelector(targetId)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.page-content {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

/* 섹션 헤더 */
.section {
  margin-bottom: 56px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 1.4rem;
  margin: 0;
  color: #0f172a;
}

.section-sub {
  color: #6b7280;
  margin: 0;
  font-size: 0.95rem;
}

/* 카드 그리드 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

/* 축제는 카드가 조금 더 크도록 설정(선택) */
.festival-grid {
  grid-template-columns: repeat(2, 1fr);
}

/* 카드 */
.place-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 6px 18px rgba(15,23,42,0.06);
  transition: transform .12s ease, box-shadow .12s ease;
}

.place-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 28px rgba(15,23,42,0.12);
}

.thumb {
  width: 100%;
  height: 160px;
  object-fit: cover;
  background: #eef2ff;
}

.card-body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.card-title {
  margin: 0;
  font-size: 1.05rem;
  color: #0f172a;
}

.card-meta {
  margin: 0;
  font-size: 0.9rem;
  color: #6b7280;
  flex: 1;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: 10px;
  padding: 8px 12px;
  cursor: pointer;
  font-weight: 700;
  text-decoration: none;
}

.btn.primary {
  background: #2563EB;
  color: #fff;
}

/* 상태 텍스트 */
.loading { color: #2563EB; font-weight: 600; }
.muted { color: #6b7280; }

/* 반응형 */
@media (max-width: 900px) {
  .card-grid { grid-template-columns: repeat(2, 1fr); }
  .festival-grid { grid-template-columns: repeat(2, 1fr); }
  .thumb { height: 140px; }
}

@media (max-width: 600px) {
  .card-grid { grid-template-columns: 1fr; }
  .festival-grid { grid-template-columns: 1fr; }
  .page-content { padding: 28px 14px; }
  .thumb { height: 180px; }
}
</style>