<template>
  <header class="site-header">
    <div class="logo">
      <router-link to="/">LocalHub</router-link>
    </div>

    <nav class="nav-links">
      <router-link to="/" exact-active-class="active">홈</router-link>
      <router-link to="/map" active-class="active">지도</router-link>
      <router-link to="/board" active-class="active">게시판</router-link>
    </nav>

    <div class="region-select">
      <label for="region">권역</label>
      <select id="region" v-model="region">
        <option value="seoul">서울</option>
        <option value="daejeon">대전/충청</option>
        <option value="gumi">구미/경북</option>
        <option value="gwangju">광주/전라</option>
        <option value="busan">부산</option>
      </select>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
const region = ref('seoul')
</script>

<style scoped>
.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: white;
  padding: 1rem 1.2rem;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 20;
}

.logo a {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-links a {
  color: #475569;
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
}

.nav-links a.active,
.nav-links a:hover {
  background: #eef2ff;
  color: #312e81;
}

.region-select {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
}

.region-select select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  background: #fff;
}
</style>