<template>
  <div class="attractions-page">
    <HomeAttractionsSection />
  </div>
</template>

<script setup>
import HomeAttractionsSection from '@/components/home/HomeAttractionsSection.vue'
</script>

<style scoped>
.attractions-page {
  width: 100%;
  max-width: 100%;
  min-height: calc(100vh - 80px);
  background: #eaedf2;
}
</style>
