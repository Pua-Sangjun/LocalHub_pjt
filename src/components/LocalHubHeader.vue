<template>
  <header
    class="localhub-header"
    :class="{
      'is-scrolled': isSolid,
      'is-solid': isSolid,
      'menu-open': isMobileMenuOpen,
    }"
  >
    <div class="header-inner">
      <RouterLink to="/" class="logo-link" aria-label="LocalHub 홈" @click="closeMobileMenu">
        <LocalHubLogo :light="!isSolid" :compact="isCompact" />
      </RouterLink>

      <nav class="header-nav" aria-label="주요 메뉴">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          :class="{ active: isNavActive(item) }"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <nav class="header-utils" aria-label="유틸리티 메뉴">
        <span class="region-badge">서울</span>

        <button type="button" class="util-item util-weather" aria-label="서울 날씨">
          <svg class="util-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="3.5" stroke="currentColor" stroke-width="1.5" />
            <path
              d="M6 17h11a4 4 0 0 0 0-8 5 5 0 0 0-9.8 1.2"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          <span class="util-label weather-temp">
            <template v-if="weatherLoading">--°C</template>
            <template v-else-if="weatherError">--°C</template>
            <template v-else-if="temperature !== undefined">{{ formattedTemp }}°C</template>
            <template v-else>--°C</template>
          </span>
        </button>

        <button
          type="button"
          class="mobile-menu-btn"
          :aria-expanded="isMobileMenuOpen"
          aria-controls="mobile-nav-panel"
          :aria-label="isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'"
          @click="toggleMobileMenu"
        >
          <span class="menu-bar" :class="{ open: isMobileMenuOpen }"></span>
          <span class="menu-bar" :class="{ open: isMobileMenuOpen }"></span>
          <span class="menu-bar" :class="{ open: isMobileMenuOpen }"></span>
        </button>
      </nav>
    </div>

    <div
      v-if="isMobileMenuOpen"
      class="mobile-menu-backdrop"
      aria-hidden="true"
      @click="closeMobileMenu"
    />

    <nav
      id="mobile-nav-panel"
      class="mobile-nav-panel"
      :class="{ open: isMobileMenuOpen }"
      aria-label="모바일 메뉴"
    >
      <RouterLink
        v-for="item in navItems"
        :key="`mobile-${item.to}`"
        :to="item.to"
        class="mobile-nav-link"
        :class="{ active: isNavActive(item) }"
        @click="closeMobileMenu"
      >
        {{ item.label }}
      </RouterLink>
    </nav>
  </header>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import LocalHubLogo from '@/components/LocalHubLogo.vue'

const props = defineProps({
  temperature: { type: Number, default: undefined },
  weatherLoading: { type: Boolean, default: false },
  weatherError: { type: [String, Boolean, null], default: null },
  scrollThreshold: { type: Number, default: 60 },
  solid: { type: Boolean, default: false },
})

const route = useRoute()
const isScrolled = ref(false)
const isCompact = ref(false)
const isMobileMenuOpen = ref(false)

const navItems = [
  { label: '홈', to: '/' },
  { label: '관광지 소개', to: '/attractions' },
  { label: '로컬 이야기', to: '/board' },
]

const isSolid = computed(() => props.solid || isScrolled.value || isMobileMenuOpen.value)

const formattedTemp = computed(() => {
  if (props.temperature === undefined || props.temperature === null) return '--'
  return Number(props.temperature).toFixed(1)
})

function isNavActive(item) {
  if (item.to === '/') {
    return route.path === '/'
  }
  return route.path === item.to || route.path.startsWith(`${item.to}/`)
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

function handleScroll() {
  if (props.solid) return
  isScrolled.value = window.scrollY > props.scrollThreshold
}

function handleResize() {
  isCompact.value = window.innerWidth <= 600
  if (window.innerWidth > 600) {
    closeMobileMenu()
  }
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    closeMobileMenu()
  }
}

watch(
  () => route.path,
  () => {
    closeMobileMenu()
  },
)

watch(isMobileMenuOpen, (open) => {
  document.documentElement.style.overflow = open ? 'hidden' : ''
})

onMounted(() => {
  handleScroll()
  handleResize()
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', handleResize, { passive: true })
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeydown)
  document.documentElement.style.overflow = ''
})
</script>

<style scoped>
.localhub-header {
  --header-height: 80px;
  --text-dark: #1e293b;

  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: var(--header-height);
  background: transparent;
  transition: background 0.35s ease, box-shadow 0.35s ease;
}

.localhub-header:not(.is-scrolled) {
  background: linear-gradient(
    180deg,
    rgba(15, 23, 42, 0.48) 0%,
    rgba(15, 23, 42, 0.22) 55%,
    transparent 100%
  );
}

.localhub-header.is-scrolled,
.localhub-header.is-solid,
.localhub-header.menu-open {
  background: #fff;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  height: 100%;
  padding: 0 48px;
}

.logo-link {
  text-decoration: none;
  flex-shrink: 0;
}

.header-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
}

.nav-link {
  padding: 8px 14px;
  border-radius: 999px;
  text-decoration: none;
  font-size: 0.92rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.92);
  transition: background 0.25s ease, color 0.25s ease;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.14);
}

.nav-link.active {
  background: rgba(143, 211, 255, 0.28);
  color: #fff;
}

.localhub-header.is-scrolled .nav-link,
.localhub-header.is-solid .nav-link,
.localhub-header.menu-open .nav-link {
  color: #334155;
}

.localhub-header.is-scrolled .nav-link:hover,
.localhub-header.is-solid .nav-link:hover,
.localhub-header.menu-open .nav-link:hover {
  background: #f1f5f9;
}

.localhub-header.is-scrolled .nav-link.active,
.localhub-header.is-solid .nav-link.active,
.localhub-header.menu-open .nav-link.active {
  background: #e8f6ff;
  color: #1a5fa0;
}

.header-utils {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.region-badge {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(143, 211, 255, 0.25);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.35);
  transition: background 0.35s ease, color 0.35s ease, border-color 0.35s ease;
}

.localhub-header.is-scrolled .region-badge,
.localhub-header.is-solid .region-badge,
.localhub-header.menu-open .region-badge {
  background: #e8f6ff;
  color: #1a5fa0;
  border-color: #b8dff7;
}

.util-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  border: none;
  background: none;
  color: #fff;
  font-family: inherit;
  cursor: pointer;
  transition: color 0.35s ease, opacity 0.2s ease;
}

.util-item:hover {
  opacity: 0.75;
}

.localhub-header.is-scrolled .util-item,
.localhub-header.is-solid .util-item,
.localhub-header.menu-open .util-item {
  color: var(--text-dark);
}

.util-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.weather-temp {
  font-size: 0.85rem;
  font-weight: 400;
}

.mobile-menu-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
}

.menu-bar {
  display: block;
  width: 20px;
  height: 2px;
  margin: 0 auto;
  border-radius: 999px;
  background: #fff;
  transition: transform 0.25s ease, opacity 0.25s ease, background 0.25s ease;
}

.localhub-header.is-scrolled .menu-bar,
.localhub-header.is-solid .menu-bar,
.localhub-header.menu-open .menu-bar {
  background: var(--text-dark);
}

.menu-bar:nth-child(1).open {
  transform: translateY(7px) rotate(45deg);
}

.menu-bar:nth-child(2).open {
  opacity: 0;
}

.menu-bar:nth-child(3).open {
  transform: translateY(-7px) rotate(-45deg);
}

.mobile-menu-backdrop {
  position: fixed;
  inset: var(--header-height) 0 0;
  background: rgba(15, 23, 42, 0.42);
  z-index: -1;
}

.mobile-nav-panel {
  display: none;
  position: fixed;
  top: var(--header-height);
  left: 0;
  right: 0;
  padding: 12px 16px 20px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.12);
  transform: translateY(-8px);
  opacity: 0;
  pointer-events: none;
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.mobile-nav-panel.open {
  transform: translateY(0);
  opacity: 1;
  pointer-events: auto;
}

.mobile-nav-link {
  display: block;
  padding: 14px 12px;
  border-radius: 12px;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  color: #334155;
  transition: background 0.2s ease, color 0.2s ease;
}

.mobile-nav-link:hover {
  background: #f8fafc;
}

.mobile-nav-link.active {
  background: #e8f6ff;
  color: #1a5fa0;
}

@media (max-width: 900px) {
  .header-inner {
    padding: 0 24px;
    gap: 12px;
  }

  .header-nav {
    gap: 4px;
  }

  .nav-link {
    padding: 6px 10px;
    font-size: 0.82rem;
  }
}

@media (max-width: 600px) {
  .localhub-header {
    --header-height: 72px;
    height: var(--header-height);
  }

  .header-inner {
    padding: 0 16px;
    gap: 8px;
  }

  .header-nav {
    display: none;
  }

  .header-utils {
    gap: 8px;
  }

  .region-badge {
    display: none;
  }

  .util-icon {
    width: 20px;
    height: 20px;
  }

  .mobile-menu-btn {
    display: inline-flex;
  }

  .mobile-nav-panel {
    display: block;
    top: var(--header-height);
  }

  .mobile-menu-backdrop {
    inset: var(--header-height) 0 0;
  }
}
</style>
