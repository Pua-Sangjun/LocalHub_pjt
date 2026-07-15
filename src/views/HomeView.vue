<template>
  <div class="home-container">
    <header class="gnb-seoul">
      <div class="logo-area">
        <h1 class="logo">LocalHub</h1>
        <span class="region-badge-seoul">서울</span>
      </div>
      <div class="header-right">
        <div class="weather-badge">
          <div class="weather-badge-main">
            <span class="weather-icon">🌤️</span>
            <strong class="weather-temp">
              <template v-if="weatherLoading">--°C</template>
              <template v-else-if="weatherError">--°C</template>
              <template v-else-if="weather?.temperature !== undefined">{{ weather.temperature }}°C</template>
              <template v-else>--°C</template>
            </strong>
          </div>
        </div>
      </div>
    </header>

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
                <span class="eyebrow">{{ slide.label }}</span>
                <h1 class="hero-title">{{ slide.title }}</h1>
                <p class="hero-description">{{ slide.subtitle }}</p>
                <div class="hero-actions">
                  <button class="primary-btn" @click="goToWrite">여행지 둘러보기</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="carousel-controls">
          <button type="button" @click="prevSlide" aria-label="Previous slide">‹</button>
          <button type="button" @click="nextSlide" aria-label="Next slide">›</button>
        </div>
      </div>
    </section>

    <section class="quick-access-row">
      <div
        v-for="card in quickAccessCards"
        :key="card.title"
        :class="['info-card', { accent: card.accent }]"
      >
        <span class="card-title">{{ card.title }}</span>
        <p>{{ card.description }}</p>
      </div>
    </section>

    <main class="main-content">
      <section class="card map-section">
        <div class="card-header">
          <div class="title-area">
            <span class="emoji-icon">📍</span>
            <h3>서울 관광 지도</h3>
          </div>
          <span class="info-text">공공데이터 플레이스</span>
        </div>
        <MapWithPins />
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
  </div>
</template>

<script src="./HomeView.script.js"></script>

<style scoped src="./HomeView.style.css"></style>
