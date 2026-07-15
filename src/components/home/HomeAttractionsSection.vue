<template>
  <section class="home-attractions">
    <div class="section-head">
      <h2>놓칠 수 없는 서울의 명소</h2>
      <p>공공데이터 기반 서울 관광지를 지도와 함께 탐색해 보세요.</p>
    </div>

    <div class="filters-block">
      <div class="filters-primary">
        <div class="category-tabs" role="tablist" aria-label="관광지 카테고리">
          <button
            v-for="category in CATEGORY_FILTERS"
            :key="category.id"
            type="button"
            class="category-tab"
            :class="{ active: selectedCategory === category.id }"
            @click="selectedCategory = category.id"
          >
            {{ category.label }}
          </button>
        </div>

        <button
          type="button"
          class="filter-toggle"
          :class="{ open: filtersExpanded, active: hasActiveFilters }"
          :aria-expanded="filtersExpanded"
          @click="filtersExpanded = !filtersExpanded"
        >
          {{ filtersExpanded ? '필터 접기' : '필터 더보기' }}
          <span v-if="hasActiveFilters && !filtersExpanded" class="filter-dot" aria-hidden="true"></span>
        </button>
      </div>

      <div v-show="filtersExpanded" class="filter-tools">
        <div class="sort-tabs" role="tablist" aria-label="정렬">
          <button
            v-for="option in SORT_OPTIONS"
            :key="option.id"
            type="button"
            class="sort-tab"
            :class="{ active: selectedSort === option.id }"
            @click="selectedSort = option.id"
          >
            {{ option.label }}
          </button>
        </div>

        <div class="tool-row">
          <label class="tool-field">
            <span class="tool-label">지역필터</span>
            <select v-model="selectedRegion">
              <option value="">전체</option>
              <option v-for="region in regionOptions" :key="region" :value="region">
                {{ region }}
              </option>
            </select>
          </label>

          <label class="tool-field search-field">
            <span class="tool-label">키워드검색</span>
            <input v-model="keyword" type="search" placeholder="관광지명, 주소 검색" />
          </label>
        </div>
      </div>
    </div>

    <div v-if="loading" class="explore-panel explore-panel-skeleton">
      <div class="explore-head">
        <span>명소 불러오는 중...</span>
      </div>
      <div class="explore-body">
        <div class="explore-map">
          <div class="skeleton-block skeleton-map"></div>
        </div>
        <div class="explore-divider" aria-hidden="true"></div>
        <div class="explore-list">
          <div class="skeleton-block skeleton-meta"></div>
          <div class="attraction-grid" aria-busy="true">
            <div
              v-for="index in PAGE_SIZE"
              :key="`initial-skeleton-${index}`"
              class="attraction-card skeleton-card"
            >
              <div class="skeleton-block skeleton-image"></div>
              <div class="card-body">
                <div class="skeleton-block skeleton-title"></div>
                <div class="skeleton-block skeleton-text"></div>
                <div class="skeleton-block skeleton-badge"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="error" class="state-panel error">{{ error }}</div>

    <div v-else class="explore-panel">
      <div class="explore-head">
        <div class="explore-head-main">
          <strong>{{ totalCount }}개</strong>
          <span>명소 · {{ currentPage }} / {{ totalPages }} 페이지</span>
        </div>
        <span class="explore-hint">카드를 누르면 지도가 해당 위치로 이동해요</span>
      </div>

      <div class="explore-body">
        <div class="explore-map">
          <MapWithPins
            v-if="pageItems.length"
            ref="mapRef"
            :places="mapPlaces"
            :active-id="activeId"
            :region="selectedRegion"
            :show-region-select="false"
            :fit-on-update="true"
            @marker-select="selectPlaceFromMarker"
          />
          <div v-else class="state-panel compact map-empty">표시할 명소가 없습니다.</div>

          <div v-if="!gridLoading && pageItems.length" class="place-strip">
            <button
              v-for="place in pageItems"
              :key="`strip-${place.id}`"
              type="button"
              class="place-chip"
              :class="{ active: activeId === place.id }"
              @click="selectPlaceFromStrip(place.id)"
            >
              {{ place.title }}
            </button>
          </div>
        </div>

        <div class="explore-divider" aria-hidden="true"></div>

        <div class="explore-list">
          <div v-if="!pageItems.length" class="state-panel compact">
            조건에 맞는 관광지가 없습니다.
          </div>

          <div v-if="gridLoading" class="attraction-grid" aria-hidden="true">
            <div
              v-for="index in PAGE_SIZE"
              :key="`skeleton-${index}`"
              class="attraction-card skeleton-card"
            >
              <div class="skeleton-block skeleton-image"></div>
              <div class="card-body">
                <div class="skeleton-block skeleton-title"></div>
                <div class="skeleton-block skeleton-text"></div>
                <div class="skeleton-block skeleton-badge"></div>
              </div>
            </div>
          </div>

          <div v-else class="attraction-grid">
            <button
              v-for="place in pageItems"
              :key="place.id"
              :id="`attraction-${place.id}`"
              type="button"
              class="attraction-card"
              :class="{
                active: activeId === place.id,
              }"
              @click="selectPlaceFromCard(place.id)"
            >
              <div class="card-image-wrap">
                <div
                  v-if="shouldShowImageSkeleton(place)"
                  class="skeleton-block skeleton-image-fill"
                ></div>
                <img
                  v-if="place.firstimage && !isImageFailed(place.id)"
                  :ref="(el) => registerImage(el, place.id)"
                  :src="place.firstimage"
                  :alt="place.title"
                  :class="{ 'is-loaded': shouldShowImage(place) }"
                  @load="markImageLoaded(place.id)"
                  @error="onImageError(place.id)"
                />
                <div
                  v-else-if="shouldShowImageEmpty(place)"
                  class="image-fallback image-empty"
                >
                  <span class="image-empty-icon" aria-hidden="true">📷</span>
                  <span class="image-empty-text">이미지 없음</span>
                </div>
              </div>
              <div class="card-body">
                <h3>{{ place.title }}</h3>
                <p>{{ place.addr1 }}</p>
                <span class="card-region">{{ place.region }}</span>
              </div>
            </button>
          </div>

          <nav v-if="totalPages > 1" class="pagination" aria-label="페이지네이션">
            <button type="button" :disabled="currentPage === 1" @click="goToPage(1)">처음</button>
            <button type="button" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
              이전
            </button>
            <button
              v-for="page in visiblePages"
              :key="page"
              type="button"
              class="page-number"
              :class="{ active: page === currentPage }"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
            <button
              type="button"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
            >
              다음
            </button>
            <button
              type="button"
              :disabled="currentPage === totalPages"
              @click="goToPage(totalPages)"
            >
              마지막
            </button>
          </nav>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import MapWithPins from '@/components/MapWithPins.vue'
import {
  CATEGORY_FILTERS,
  SORT_OPTIONS,
  loadAttractions,
  filterAttractions,
  sortAttractions,
  paginateItems,
  getRegionOptions,
} from '@/utils/attractions'

const PAGE_SIZE = 4

const mapRef = ref(null)
const attractions = ref([])
const loading = ref(true)
const error = ref(null)
const selectedCategory = ref('all')
const selectedSort = ref('recommended')
const selectedRegion = ref('')
const keyword = ref('')
const currentPage = ref(1)
const activeId = ref('')
const filtersExpanded = ref(false)
const gridLoading = ref(false)
const loadedImageIds = ref(new Set())
const failedImageIds = ref(new Set())

const regionOptions = computed(() => getRegionOptions(attractions.value))

const filteredPlaces = computed(() =>
  sortAttractions(
    filterAttractions(attractions.value, {
      category: selectedCategory.value,
      region: selectedRegion.value,
      keyword: keyword.value,
    }),
    selectedSort.value,
  ),
)

const paginated = computed(() =>
  paginateItems(filteredPlaces.value, currentPage.value, PAGE_SIZE),
)

const pageItems = computed(() => paginated.value.items)
const totalPages = computed(() => paginated.value.totalPages)
const totalCount = computed(() => paginated.value.totalCount)
const mapPlaces = computed(() => pageItems.value)

const hasActiveFilters = computed(
  () =>
    selectedSort.value !== 'recommended' ||
    selectedRegion.value !== '' ||
    keyword.value.trim() !== '',
)

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const start = Math.max(1, current - 2)
  const end = Math.min(total, start + 4)
  const adjustedStart = Math.max(1, end - 4)

  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index)
})

watch([selectedCategory, selectedRegion, keyword, selectedSort], async () => {
  currentPage.value = 1
  activeId.value = ''
  if (!loading.value) {
    await changePage(1)
  }
})

function isImageLoaded(id) {
  return loadedImageIds.value.has(id)
}

function isImageFailed(id) {
  return failedImageIds.value.has(id)
}

function shouldShowImage(place) {
  return place.firstimage && isImageLoaded(place.id) && !isImageFailed(place.id)
}

function shouldShowImageSkeleton(place) {
  return place.firstimage && !isImageLoaded(place.id) && !isImageFailed(place.id)
}

function shouldShowImageEmpty(place) {
  return !place.firstimage || isImageFailed(place.id)
}

function markImageLoaded(id) {
  if (loadedImageIds.value.has(id)) return
  const next = new Set(loadedImageIds.value)
  next.add(id)
  loadedImageIds.value = next
}

function registerImage(el, id) {
  if (!el || loadedImageIds.value.has(id) || failedImageIds.value.has(id)) return

  if (el.complete && el.naturalWidth > 0) {
    markImageLoaded(id)
  }
}

function onImageError(id) {
  if (failedImageIds.value.has(id)) return
  const nextFailed = new Set(failedImageIds.value)
  nextFailed.add(id)
  failedImageIds.value = nextFailed
}

function preloadPageImages(items) {
  const loaders = items
    .filter((place) => place.firstimage && !loadedImageIds.value.has(place.id))
    .map(
      (place) =>
        new Promise((resolve) => {
          const image = new Image()
          image.onload = () => resolve()
          image.onerror = () => resolve()
          image.src = place.firstimage
        }),
    )

  return Promise.all(loaders)
}

async function waitForPageReady(items) {
  const start = Date.now()
  gridLoading.value = true
  await preloadPageImages(items)

  const elapsed = Date.now() - start
  if (elapsed < 320) {
    await new Promise((resolve) => setTimeout(resolve, 320 - elapsed))
  }

  gridLoading.value = false
}

async function changePage(page, options = {}) {
  currentPage.value = page
  activeId.value = options.activeId ?? ''

  await nextTick()
  await waitForPageReady(pageItems.value)
}

function selectPlaceFromCard(id) {
  activeId.value = id
  mapRef.value?.focusById(id)
}

function selectPlaceFromStrip(id) {
  activeId.value = id
  mapRef.value?.focusById(id)
}

function selectPlaceFromMarker(id) {
  activeId.value = id
}

async function goToPage(page) {
  activeId.value = ''
  await changePage(page)
}

onMounted(async () => {
  try {
    attractions.value = await loadAttractions()
    await nextTick()
    await waitForPageReady(pageItems.value)
  } catch (err) {
    error.value = err?.message || '관광지 데이터를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped src="./HomeAttractionsSection.style.css"></style>
