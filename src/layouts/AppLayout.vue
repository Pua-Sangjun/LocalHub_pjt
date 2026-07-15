<template>
  <div class="app-layout">
    <LocalHubHeader
      :temperature="weather?.temperature"
      :weather-loading="weatherLoading"
      :weather-error="weatherError"
      :solid="isSolidHeader"
    />

    <div class="layout-content" :class="{ 'has-header-offset': isSolidHeader }">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import LocalHubHeader from '@/components/LocalHubHeader.vue'
import { useKmaWeather } from '@/composables/useKmaWeather'

const route = useRoute()
const { weather, weatherLoading, weatherError } = useKmaWeather()

const isSolidHeader = computed(() => route.meta.header !== 'hero')
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  width: 100%;
}

.layout-content {
  width: 100%;
  overflow-x: hidden;
}

.layout-content.has-header-offset {
  padding-top: 80px;
}

@media (max-width: 600px) {
  .layout-content.has-header-offset {
    padding-top: 72px;
  }
}
</style>
