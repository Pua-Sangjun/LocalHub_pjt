<template>
  <header
    class="hero"
    role="banner"
    aria-label="서울 소개"
    :style="bgStyle"
  >
    <div class="hero-overlay" />

    <div class="hero-inner">
      <div class="hero-text">
        <h1 class="hero-title">서울</h1>
        <p class="hero-subtitle">다채로운 매력이 가득한 도시, 서울</p>
        <p class="hero-lead">역사와 문화, 자연과 현대가 공존하는 특별한 여행을 시작해보세요.</p>

        <div class="hero-actions">
          <router-link to="/map" class="btn primary" aria-label="지도 보기">지도 보기</router-link>
          <router-link to="/board" class="btn secondary" aria-label="게시판 보기">게시판 보기</router-link>
        </div>
      </div>

      <div class="hero-footer">
        <div class="indicators" aria-hidden="true">
          <span class="dot active"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>

        <button class="scroll-down" @click="onScrollDown" aria-label="아래로 스크롤">
          ▼
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
// HomeHero: hero 이미지를 import 하여 inline style로 적용합니다.
// 장점: Vite가 이미지 경로를 번들링/해석하므로 경로 오류가 줄어듭니다.

import { computed } from 'vue'
import heroImg from '@/assets/my_hero.jpg' // 사용하신 이미지 파일명 (src/assets에 위치)

// image를 추가하거나 동적으로 변경하고 싶으면 이 파일을 수정하거나
// 상위에서 :image prop 방식으로 바꾸면 됩니다.
const bgStyle = computed(() => ({
  backgroundImage: `linear-gradient(90deg, rgba(2,6,23,0.44) 0%, rgba(2,6,23,0.12) 60%), url(${heroImg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center right',
}))

const emit = defineEmits(['scrollToSection'])
function onScrollDown() {
  emit('scrollToSection', '#recommend')
}
</script>

<style scoped>
.hero {
  position: relative;
  height: 80vh;
  min-height: 520px;
  display: flex;
  align-items: flex-start;
  color: #fff;
  overflow: hidden;
}

/* overlay는 배경과 텍스트 대비를 돕습니다 (추가 안전 장치) */
.hero-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(90deg, rgba(2,6,23,0.72) 0%, rgba(2,6,23,0.44) 40%, rgba(2,6,23,0.12) 100%);
  mix-blend-mode: multiply;
}

.hero-inner {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 64px 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.hero-text { max-width: 560px; text-align: left; }

.hero-title { font-size: 3.2rem; margin: 0 0 12px; }
.hero-subtitle { font-size: 1.1rem; margin: 0 0 12px; color: rgba(255,255,255,0.95); }
.hero-lead { margin: 0 0 20px; color: rgba(255,255,255,0.9); }

.hero-actions { display: flex; gap: 12px; align-items: center; }

.btn {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  border: none;
  border-radius: 10px;
  padding: 12px 18px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
}

.btn.primary { background: #2563EB; color: #fff; }
.btn.secondary { background: rgba(255,255,255,0.12); color: #fff; border: 1px solid rgba(255,255,255,0.12); }

.indicators { display:flex; gap:8px; align-items:center; }
.dot { width:8px; height:8px; background: rgba(255,255,255,0.35); border-radius:50%; }
.dot.active { background:#fff; }

.scroll-down {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.18);
  padding: 10px 12px;
  border-radius: 999px;
  color: #fff;
  cursor: pointer;
}

/* 반응형 */
@media (max-width: 900px) {
  .hero-title { font-size: 2.6rem; }
  .hero-inner { padding: 48px 20px; }
}

@media (max-width: 600px) {
  .hero { align-items: center; text-align: center; }
  .hero-text { max-width: 92%; margin: 0 auto; }
  .hero-actions { flex-direction: column; align-items: center; }
  .hero-footer { flex-direction: column; gap: 12px; align-items: center; }
}
</style>