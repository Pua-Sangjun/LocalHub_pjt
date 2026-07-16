<template>
  <div class="home-container">
    <section class="hero-section">
      <div class="hero-carousel full-width-carousel">
        <div class="carousel-window">
          <div
            v-for="(slide, index) in heroSlides"
            :key="slide.id"
            class="hero-slide"
            :class="{ active: activeSlide === index, fading: fadingSlide === index }"
          >
            <div class="slide-bg" :style="{ backgroundImage: `url(${slide.image})` }" />
            <div class="slide-overlay">
              <div class="hero-banner-copy">
                <span class="eyebrow">{{ slide.label }} · 서울</span>
                <h1 class="hero-title">회원가입 없이, 서울 로컬을 탐색하세요</h1>
                <p class="hero-description">
                  공공데이터 기반 관광 정보, 익명 피드, AI 챗봇을 한곳에서 만나보세요.
                </p>
                <div class="hero-actions">
                  <button class="primary-btn" type="button" @click="goToAttractions">
                    관광지·지도 보기
                  </button>
                  <button class="secondary-btn" type="button" @click="goToBoard">
                    익명 피드 보기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="carousel-nav carousel-nav-prev"
          aria-label="이전 슬라이드"
          @click="prevSlide"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          class="carousel-nav carousel-nav-next"
          aria-label="다음 슬라이드"
          @click="nextSlide"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    </section>

    <div class="home-content-area">
      <main class="main-content">
        <section class="card map-section">
          <div class="card-header">
            <div class="title-area">
              <span class="emoji-icon">📍</span>
              <div>
                <h3>서울 관광 지도 미리보기</h3>
                <p class="card-subtitle">한국관광공사 Tour API 기반 783개 관광지</p>
              </div>
            </div>
            <button class="text-btn" type="button" @click="goToAttractions">지도에서 더 보기 →</button>
          </div>

          <div v-if="mapLoading" class="map-preview-skeleton">
            <div class="spinner"></div>
            <span>지도 데이터를 불러오는 중...</span>
          </div>
          <div v-else class="map-preview">
            <MapWithPins :places="previewPlaces" :show-region-select="false" />
          </div>
        </section>

        <section class="card board-section">
          <div class="card-header">
            <div class="title-area">
              <span class="emoji-icon">💬</span>
              <div>
                <h3>익명 로컬 피드</h3>
                <p class="card-subtitle">로그인 없이 글쓰기 · 비밀번호로 수정/삭제</p>
              </div>
            </div>
            <div class="header-actions">
              <button class="text-btn" type="button" @click="goToBoard">전체 보기 →</button>
              <button class="write-btn" type="button" @click="goToWrite">✏️ 글쓰기</button>
            </div>
          </div>

          <ul v-if="latestPosts.length" class="feed-preview-list">
            <li
              v-for="post in latestPosts"
              :key="post.id"
              class="feed-preview-item"
              @click="goToDetail(post.id)"
            >
              <span class="feed-badge">익명</span>
              <div class="feed-copy">
                <strong>{{ post.title }}</strong>
                <time>{{ formattedDate(post.createdAt) }}</time>
              </div>
            </li>
          </ul>
          <p v-else class="feed-empty">아직 글이 없습니다. 첫 로컬 팁을 남겨보세요!</p>
        </section>

        <section class="card data-trust-section">
          <div class="card-header data-trust-header">
            <div class="title-area">
              <span class="emoji-icon">📊</span>
              <div>
                <h3>공공데이터 기반 서비스</h3>
                <p class="card-subtitle">백엔드 없이 JSON 데이터로 동작하는 LocalHub MVP</p>
              </div>
            </div>
          </div>

          <div class="stats-grid">
            <div v-for="stat in dataStats" :key="stat.label" class="stat-item">
              <strong>{{ stat.count.toLocaleString() }}</strong>
              <span>{{ stat.label }}</span>
            </div>
          </div>

          <p class="source-note">
            이 서비스는 한국관광공사 Tour API(TourAPI 4.0) 데이터를 활용하였습니다.
            출처: 한국관광공사 · 라이선스: 공공누리 제3유형
          </p>
        </section>
      </main>
    </div>

    <footer class="footer">
      <p>&copy; LocalHub. All rights reserved.</p>
    </footer>
  </div>
</template>

<script src="./HomeView.script.js"></script>

<style scoped src="./HomeView.style.css"></style>
