<template>
  <div class="home-container">
    <header class="gnb-seoul">
      <div class="logo-area">
        <h1 class="logo">LocalHub</h1>
        <span class="region-badge-seoul">서울</span>
      </div>

      <div class="search-bar">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input v-model="searchQuery" type="text" placeholder="장소나 게시글 검색..." @keyup.enter="handleSearch" />
      </div>
    </header>

    <section class="seoul-info-widget">
      <div class="widget-wrap">
        <div class="widget-badge">
          <span class="icon">🌤️</span> 서울 날씨
          <span class="val">
            <template v-if="weatherLoading">로딩...</template>
            <template v-else-if="weatherError">--</template>
            <template v-else-if="weather?.temperature !== undefined">
              {{ weather.temperature }}°C
            </template>
            <template v-else>정보 없음</template>
          </span>
        </div>
     
      </div>
    </section>

    <main class="main-content">
      <section class="card map-section">
        <div class="card-header">
          <div class="title-area">
            <span class="emoji-icon">📍</span>
            <h3>서울 지역 지도</h3>
          </div>
          <span class="info-text">공공데이터 플레이스</span>
        </div>
        
        <div ref="mapContainer" class="kakao-map">
          <div class="map-placeholder">
            <div class="spinner"></div>
            <p>카카오 지도 로딩 중...</p>
          </div>
        </div>
      </section>

      <section class="card board-section">
        <div class="card-header">
          <div class="title-area">
            <span class="emoji-icon">💬</span>
            <h3>서울 익명 피드</h3>
          </div>
          <button class="write-btn" @click="goToWrite">✏️ 글쓰기</button>
        </div>

        <div class="table-container">
          <table class="board-table">
            <thead>
              <tr>
                <th style="width: 15%; text-align: center;">번호</th>
                <th style="width: 65%; text-align: left;">제목</th>
                <th style="width: 20%; text-align: center;">작성일</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="post in posts" :key="post.id" @click="goToDetail(post.id)">
                <td class="post-id">{{ post.id }}</td>
                <td class="post-title">{{ post.title }}</td>
                <td class="post-date">{{ post.date }}</td>
              </tr>
              <tr v-if="posts.length === 0">
                <td colspan="3" class="empty-row">첫 피드를 남겨보세요!</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <footer class="footer">
      <p>&copy; LocalHub. All rights reserved.</p>
    </footer>

    <button class="chat-fab" @click="toggleChat">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      <span class="chat-tooltip">서울 챗봇 문의</span>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  fetchKmaShortTermTemperature,
  getLatestTmfc,
  getNearestFutureTmef,
} from '@/api/weather'

const searchQuery = ref('')
const posts = ref([
  { id: 3, title: '서울역 근처 뜨끈한 국밥집 리스트 공유 🍲', date: '오늘' },
  { id: 2, title: '이번 주말 반포한강공원 야시장 가시는 분?', date: '어제' },
  { id: 1, title: '남산타워 꿀주차 구역 조용히 풉니다.', date: '3일 전' },
])

const mapContainer = ref(null)
const weather = ref(null)
const weatherLoading = ref(false)
const weatherError = ref(null)

async function loadKmaWeather() {
  weatherLoading.value = true
  weatherError.value = null

  try {
    const now = new Date()
    const tmfc = getLatestTmfc(now)
    const tmef = getNearestFutureTmef(now, tmfc)
    const result = await fetchKmaShortTermTemperature({
      tmfc,
      tmef,
      nx: 60,
      ny: 127,
      vars: 'TMP',
    })
    weather.value = result
  } catch (err) {
    weatherError.value = err?.message || '날씨 정보를 불러오지 못했습니다.'
  } finally {
    weatherLoading.value = false
  }
}

onMounted(async () => {
  await loadKmaWeather()

  if (!window.kakao || !window.kakao.maps) {
    console.error('Kakao Maps SDK 로드 실패')
    return
  }

  const options = {
    center: new window.kakao.maps.LatLng(37.5665, 126.9780),
    level: 6,
  }

  const map = new window.kakao.maps.Map(mapContainer.value, options)
  const marker = new window.kakao.maps.Marker({
    position: new window.kakao.maps.LatLng(37.5665, 126.9780),
  })
  marker.setMap(map)
})

const handleSearch = () => {
  alert(`"${searchQuery.value}" 검색 기능 구현 예정`)
}

const goToWrite = () => {
  alert('글쓰기 화면으로 이동')
}

const goToDetail = (id) => {
  alert(`${id}번 게시글 상세 보기`)
}

const toggleChat = () => {
  alert('Netlify Functions 연동 챗봇 창 열기')
}
</script>

<style scoped>
/* 전역 폰트 강제 선언 및 기본 리셋 적용 */
.home-container {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans KR", sans-serif;
  color: #1e293b;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8fafc; /* 차분하고 밝은 그레이-블루 배경 */
  box-sizing: border-box;
}

.home-container * {
  box-sizing: border-box;
}

/* 1. GNB (헤더) - 핏한 모던 블랙 톤 */
.gnb-seoul {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 40px;
  background-color: #0f172a; /* 딥 차콜 */
  border-bottom: 1px solid #1e293b;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo {
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -1px;
  color: #ffffff;
  margin: 0;
}

.region-badge-seoul {
  background-color: #ef4444; /* 세련된 레드 */
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

/* 검색바 */
.search-bar {
  display: flex;
  align-items: center;
  background-color: #1e293b;
  border-radius: 8px;
  padding: 6px 14px;
  width: 260px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.search-bar:focus-within {
  background-color: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.search-bar:focus-within .search-icon {
  color: #3b82f6;
}

.search-icon {
  color: #64748b;
  margin-right: 8px;
  display: flex;
  align-items: center;
}

.search-bar input {
  border: none;
  background: none;
  outline: none;
  width: 100%;
  font-size: 0.85rem;
  color: #ffffff;
  font-weight: 500;
}

.search-bar:focus-within input {
  color: #1e293b;
}

.search-bar input::placeholder {
  color: #64748b;
}

/* 2. 서울 실시간 정보 위젯 - 라운드 배지 형태 */
.seoul-info-widget {
  background-color: #ffffff;
  padding: 12px 40px;
  border-bottom: 1px solid #e2e8f0;
}

.widget-wrap {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
}

.widget-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
  background-color: #f1f5f9;
  padding: 6px 12px;
  border-radius: 20px;
}

.widget-badge .val {
  color: #0f172a;
  font-weight: 700;
}

.widget-badge .val.positive {
  color: #10b981;
}

/* 3. 메인 레이아웃 */
.main-content {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 24px;
  padding: 32px 40px;
  flex: 1;
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
}

/* 카드 UI */
.card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.title-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

.emoji-icon {
  font-size: 1.1rem;
}

.card-header h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.info-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  background-color: #f1f5f9;
  padding: 3px 8px;
  border-radius: 6px;
}

/* 지도 영역 */
.kakao-map {
  flex: 1;
  min-height: 460px;
  background-color: #f1f5f9;
  border-radius: 12px;
  position: relative;
}

.map-placeholder {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 500;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 글쓰기 버튼 */
.write-btn {
  background-color: #0f172a;
  color: #ffffff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background-color 0.15s ease;
}

.write-btn:hover {
  background-color: #1e293b;
}

/* 게시판 테이블 모던 리셋 */
.table-container {
  flex: 1;
  overflow-y: auto;
}

.board-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.board-table th {
  padding: 10px;
  font-weight: 700;
  color: #64748b;
  border-bottom: 2px solid #f1f5f9;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.board-table td {
  padding: 14px 10px;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
}

.board-table tbody tr {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.board-table tbody tr:hover {
  background-color: #f8fafc;
}

.board-table tbody tr:hover .post-title {
  color: #3b82f6;
}

.post-id {
  color: #94a3b8;
  font-weight: 600;
  text-align: center;
}

.post-title {
  font-weight: 600;
  color: #1e293b;
  transition: color 0.15s ease;
}

.post-date {
  color: #64748b;
  text-align: center;
  font-size: 0.8rem;
}

.empty-row {
  color: #94a3b8;
  padding: 40px 0 !important;
  text-align: center;
}

/* 4. Footer */
.footer {
  text-align: center;
  padding: 20px;
  background-color: #ffffff;
  border-top: 1px solid #e2e8f0;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 500;
}

/* 5. 챗봇 FAB */
.chat-fab {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background-color: #3b82f6;
  color: #ffffff;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  cursor: pointer;
  z-index: 100;
  transition: all 0.2s ease;
}

.chat-fab:hover {
  transform: translateY(-2px);
  background-color: #2563eb;
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.chat-tooltip {
  position: absolute;
  right: 60px;
  background-color: #0f172a;
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  white-space: nowrap;
  opacity: 0;
  transform: translateX(5px);
  transition: all 0.15s ease;
  pointer-events: none;
}

.chat-fab:hover .chat-tooltip {
  opacity: 1;
  transform: translateX(0);
}
</style>
